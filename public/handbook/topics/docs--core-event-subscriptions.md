### Core event subscriptions

`native::declare::EventKind` includes setting changes, book opened/closed/finished,
book moves/removals, plugin changes, Wi-Fi, power mode, status and charge changes.
Subscribe with `Declarations::subscribe_event(kind, token)`. A host returns
`Error::Unsupported` until the relevant producer is implemented; these declarations
never start a stopped plugin.

The matching `native::events::Event` variants borrow callback bytes. Book session
edges use `Event::Book { kind, reason, reading, .. }`; page turns and book edges share
`ReadingView`, whose accessors expose the complete path, reading position, titles
and optional page counters. Reason 1 denotes a restored open or a sleep/shutdown
close; reserved reasons become 0. Book-finished reason is always 0.

`Event::SettingChanged` provides an optional typed previous value. A missing or
unreadable previous value is `None`; malformed nonempty settings values are refused.
An empty key is an overflow signal: reread settings retained by the plugin. Read
new values with `native::settings::read_setting`.

Wi-Fi state 4 becomes `WifiLinkState::AccessPoint`; reserved states become `On`
without a connection. `PowerChange` describes the power mode and energy level,
including automatic selection and work stretch. It borrows the mode id and
normalizes reserved energy levels to Normal. `ChargeFlags` separately describes
charging, external power and low battery; unknown flag bits are ignored.

Unknown appended optional fields are accepted, while malformed framing, strings,
reading counters and setting values are refused. `event_dropped` is a host-shell
reporting path, logged by the host; it is not an event delivered to plugin code.
