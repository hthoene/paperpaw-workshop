### Native Bluetooth

Declare `uses.bluetooth` in the metadata for the commands; reads of the radio and the bonded devices
(`Device::bluetooth`, `Device::bonded`) need none. `CommandSender::bt_scan(ms)`, `bt_stop_scan`,
`bt_pair(device)`, `bt_connect`, `bt_disconnect`, `bt_forget`, `bt_give(device, plugin)`,
`bt_take_back` and `bt_keys(device, on)` queue one command each and do not wait; the answers come as
`Event::Bluetooth` to the plugin bound to the host slot `core.bluetooth` (offer a screen for the slot
with `SlotOfferDecl`; no event subscription exists for it). Device ids are those of the reads. The
event carries `kind` (`Changed`, `Found`, `ScanEnded`, `Connected`, `Disconnected`, `Paired`, `Done`,
`Failed`), the device and its kind, the signal in dBm (`None` where not known) and a `reason` (`None`
where none is said); unknown values read as `Other`. Its name borrows the event.
