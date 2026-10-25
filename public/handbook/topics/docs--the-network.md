### The network

`Command::http(HttpRequest::get(url, &FETCHED))` makes a request where
the device has a network (`env.caps().network`); the answer comes as the
request's reply event, an `HttpReply` with the status and the body, or
saved to a file (`.save_to(path)`) for large ones. A request may set a
`timeout`, the answer's headers it wants back (`want_headers`) and the
longest body kept in memory (`max_body`, by default 64 KiB on small
devices). Every request is answered once, also when it is refused
(its `refused` says why and when to try again). The manifest says
that the plugin uses the network (`.uses(Uses::NETWORK)` in its manifest); without it,
requests are refused. In Offline (`env.power()`), only what the reader went
online for goes out: a screen that needs the network says so on itself
and offers *Go online*, which sends `Command::GoOnline` (the network for
that screen until it closes); anything else is refused with
`Reason::Offline` and may try again on `events::WORK_ALLOWED`.
`Command::CancelHttp` takes requests back. A download that may take a
while says how far it came with `.progress(&PROGRESS)`, an
`Event<HttpProgress>`: the bytes received, the size where the server
said (`permille()` for a bar), and the request's parameters, at most
every 5 % or every 2 seconds and never after the reply, so a screen
redraws its bar no more often (only the bar's area, with a partial
refresh). Downloaded into a file of the plugin's own and moved into the
library once whole, a download taken back leaves nothing there (as the
OPDS plugin does). Where a server or a computer
is told which device this is (a sync service, Calibre), the name is
`env.device_name()`: the one the reader set under *Device name*, else
the model's; a plugin never makes one of its own.
