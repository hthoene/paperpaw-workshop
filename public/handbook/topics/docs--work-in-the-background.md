### Work in the background

What a plugin does on its own, not because the reader just asked for
it, it declares as work (`paperpaw_sdk::work`, ADR 0025), and the
kernel runs it at the moment that costs least: waking, a book opened or
closed, going to sleep, the radio on anyway, charging, idle.
`Command::work(Work::network(PUSH).within(Duration::from_secs(1800))
.at_moments(Moments::BOOK_CLOSED | Moments::SLEEP))` sends the reading
position when the book is closed or the device sleeps, at the latest
after half an hour; the kernel then emits the work's event and the
plugin makes its request. `optional()` work (weather, headlines) runs
only while that is cheap, and never brings the radio on by itself.
`Work::at(event, time)` is a timer, `every` repeats, `key` tells
several works of one event apart, `Command::CancelWork` takes one back.
`env.reader()` says whether what is handled is the reader's own doing: an
action the reader ran acts at once, the same action run by a rule
declares `Work::when_cheap(id, within)` instead and waits for a good
moment.
Long work in steps (an install, a catalog walked) registers its step
function (`r.add_work(WorkSpec::new(id, title, step))`) and is stepped
between frames. `env.work()` says where a work stands, for the plugin's
own page; background work never shows a notice over reading. The power
mode (`env.power()`) makes deadlines longer or holds network work back;
most plugins need not read it.
Read large JSON answers as they stream with
`paperpaw_sdk::json::stream`, so they need little memory.
`Command::Serve` serves HTTP to the local network, e.g. for transfers
from a computer or typing on a phone; what happens to it comes as
`ServerNotice`s. A plugin answers each request with `Command::Respond`.
A server stops when the screen that started it closes. Serve only while the screen showing the
address is open, and guard it as `paperpaw_sdk::served` does: a key
drawn anew each time in the address (`served::key`), checked by a
`served::Guard`, which turns requests away for a while after a few
wrong keys. Where PaperPaw runs Wi-Fi itself (the X4s),
`paperpaw_sdk::wifi` says the radio's state, and
`WifiCommand::Host` opens a network of the device's own for a phone to
join, as the Wi-Fi transfer does without a router. In the emulator
the X4s start with the radio off, as a device does; with `--wifi
online` (over `--stdio`, `start` with `"wifi": "online"`) they start on
USB, in a network `Workshop Wi-Fi` joined before, and a plugin's
requests go out at once.

Other protocols go over sockets ([ADR 0014](adr/0014-sockets-for-plugins.md)):
`Command::Connect` opens a TCP connection, `Command::SocketSend` sends,
and `Command::SocketRead` asks for what comes next, as text
(`SocketRead::Text`) or as a file of a known length written to storage as
it comes (`SocketRead::File`), so files of any size never need to fit in
memory. `Command::Broadcast` finds services in the local network by a
UDP datagram and their answers. Everything comes back as events
(`SocketNotice`s); a socket closes when the screen
that was open as it opened closes.
