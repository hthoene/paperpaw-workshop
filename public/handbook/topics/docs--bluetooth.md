### Bluetooth

Where the device has a Bluetooth Low Energy radio the kernel uses
(`env.caps().bluetooth`; `env.bluetooth()` shows the radio's state and
the bonded devices given to the plugin), a plugin that says so in its
manifest (`.uses(Uses::BLUETOOTH)`) sends commands written with
`paperpaw_sdk::bluetooth` and hears everything about them as its own
events, each a `BtEvent` (ADR 0027). Every command is answered: by its
result, or by a `BtEvent::Failed(BtFailure)` that says which command
(`BtOp`) failed for which device and why (`BtError`: `Off`,
`NotAllowed`, `NotFound`, `Busy`, `Timeout`, `Declined`, `Lost`,
`Att(code)`, `Held(refusal)`, `Unsupported`).

Bluetooth costs battery, so everything is cheap unless asked otherwise.
The kernel switches the radio on for the first request and off a little
after the last; scans and advertising always end after a while; links
run at long intervals; and scans, links and advertising end with the
screen that asked for them (or with declared work, `Work::bluetooth`),
and all of them before the device sleeps. Where plugins ask for
different powers, the radio runs at the cheapest one that serves them
all, and the time it was on is counted (`Usage::bluetooth_ms`).

- **Scanning**: `bluetooth::scan(&FOUND).service(Uuid::sig(0x180D))
  .command()` finds devices in reach (`BtEvent::Found` with a `Device`:
  its id, name, signal, services, advertised data and kind), then
  `BtEvent::ScanEnded`. A scan lasts 10 seconds unless
  `.lasting(duration)` says otherwise (a minute at most), listens
  passively and seldom (`ScanPower::Low`; `.power(ScanPower::Balanced)`,
  `.active()` to ask devices for their names), and `.first()` ends it
  with the first device. `ScanPower::Fast` is only for the reader's own
  doing, and a plugin scans again only a minute after its last scan
  ended, unless the reader asked. A plugin hears only what passes its
  own filters.
- **A GATT client**: `connect(device, &LINK).command()` (`.power(...)`
  for shorter intervals, `.idle(duration)` to let go of the link when
  nothing was asked for that long), then `discover(device).command()`
  lists the services and their characteristics (`BtEvent::Discovered`;
  `bluetooth::characteristic(&services, service, characteristic)` finds
  one), `read`, `write(device, handle, bytes)` (`.without_response()`),
  `subscribe` to notifications (`BtEvent::Value`), or
  `subscribe_to(device, service, characteristic)`, the handle found by
  the kernel; `disconnect`.
- **Pairing**: `pair(device)` asks the reader, in the kernel's own
  question, never the plugin's; the device is then bonded and given to
  the plugin (`BtEvent::Paired`). A plugin sees only devices its scans
  found and bonded devices the reader gave it; anything else fails with
  `BtError::NotFound`. Devices are known by a `DeviceId`, never by their
  address. The Bluetooth manager, the plugin whose screen is bound to
  `slots::BLUETOOTH`, sees every bond; `forget`, `give` and `take_back`
  count otherwise only as the reader's own doing.
- **Keys of a remote or a keyboard** need no plugin: once the reader lets
  a bonded device type (`remote_keys(device, &DONE)`), its keys are
  buttons of the key maps, `button.hid.right`, `button.hid.page-down`,
  `button.hid.volume-up` and so on, bound like the device's own. Its
  link slows down a minute after the last key. A plugin the device is
  given to may ask for the reports themselves with
  `hid_reports(device, &REPORTS)`.
- **Being seen**: `advertise(&SEEN).name("…").service(uuid).command()`,
  for a minute unless `.lasting(…)` says otherwise (ten minutes at
  most), and services of the device's own GATT server declared with
  `Registrar::add_gatt_service(ServiceSpec::new(uuid, &EVENTS)
  .characteristic(CharacteristicSpec::new(uuid).read().notify()))`:
  centrals' reads (`BtEvent::ReadRequest`, answered with `respond` or
  `refuse`), writes and subscriptions come as events, and
  `notify_centrals` sends to those subscribed. Characteristics need an
  encrypted link unless `.access(Access::Open)` says otherwise.

Events written out for others (observers, rules) carry no payloads:
neither readings nor keys nor what a phone sent. A heart-rate reader:

```rust
const FOUND: Event<BtEvent> = Event::new("pulse.found");
const LINK: Event<BtEvent> = Event::new("pulse.link");
const HEART_RATE: Uuid = Uuid::sig(0x180D);
const MEASUREMENT: Uuid = Uuid::sig(0x2A37);

r.add_action(ActionSpec::new(START, "pulse.start").handler(|_, _, out| {
    out.push(bluetooth::scan(&FOUND).service(HEART_RATE).first().command());
}))?;
r.on(FOUND, |_, event: &BtEvent, out| {
    if let BtEvent::Found(device) = event {
        out.push(bluetooth::connect(device.id, &LINK).command());
    }
})?;
r.on(LINK, |_, event: &BtEvent, out| match event {
    BtEvent::Connected { device, .. } => {
        out.push(bluetooth::subscribe_to(*device, HEART_RATE, MEASUREMENT));
    }
    BtEvent::Value { bytes, .. } => {
        // Flags first; the rate is one byte, or two where flag 0 is set.
        let bpm = match bytes.as_slice() {
            [flags, low, high, ..] if flags & 1 == 1 => u16::from_le_bytes([*low, *high]),
            [_, rate, ..] => u16::from(*rate),
            _ => return,
        };
        out.push(Command::set(&BPM, i64::from(bpm)));
    }
    _ => {}
})?;
```

The emulator pretends to have Bluetooth for the X4 Pro's profile, with
made-up devices in reach: `PaperPaw Remote`, a page-turner whose keys a
script presses with `ble-key:right` (or `left`, `page-down`,
`volume-up` …) once they go to the key maps, and `Pulse HR`, a
heart-rate belt that answers the example above, notifying a rate each
second.
