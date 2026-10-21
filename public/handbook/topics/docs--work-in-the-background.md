### Work in the background

What a plugin does on its own, not because the reader just asked for
it, it declares as work (`paperpaw_sdk::work`, ADR 0025), and the
kernel runs it at the moment that costs least: waking, a book opened or
closed, going to sleep, the radio on anyway, charging, idle.
`Command::Work(Work::network(PUSH).within(Duration::from_secs(1800))
.at_moments(Moments::BOOK_CLOSED | Moments::SLEEP))` sends the reading
position when the book is closed or the device sleeps, at the latest
after half an hour; the kernel then emits the work's event and the
plugin makes its request. `optional()` work (weather, headlines) runs
only while that is cheap, and never brings the radio on by itself.
`Work::at(event, time)` is a timer, `every` repeats, `key` tells
several works of one event apart, `Command::CancelWork` takes one back.
`env.reader` says whether what is handled is the reader's own doing: an
action the reader ran acts at once, the same action run by a rule
declares `Work::when_cheap(id, within)` instead and waits for a good
moment.
Long work in steps (an install, a catalog walked) registers its step
function (`r.add_work(WorkSpec::new(id, title, step))`) and is stepped
between frames. `env.work` says where a work stands, for the plugin's
own page; background work never shows a notice over reading. The power
mode (`env.power`) makes deadlines longer or holds network work back;
most plugins need not read it.
Read large JSON answers as they stream with `paperpaw_json::stream`
(the crate `paperpaw-json`), so they
need little memory. `Command::Serve` serves HTTP to the local network,
e.g. for transfers from a computer or typing on a phone; what happens
to it comes as `ServerNotice`s, and to sockets (`Command::Connect`,
`Command::Broadcast`) as `SocketNotice`s.
