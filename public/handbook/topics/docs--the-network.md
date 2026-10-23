### The network

`Command::Http(HttpRequest::get(url, &FETCHED))` makes a request where
the device has a network (`env.caps.network`); the answer comes as the
request's reply event, an `HttpReply` with the status and the body, or
saved to a file (`.save_to(path)`) for large ones. A request may set a
`timeout`, the answer's headers it wants back (`want_headers`) and the
longest body kept in memory (`max_body`, by default 64 KiB on small
devices). Every request is answered once, also when it is refused
(`HttpReply::refused` says why and when to try again). The manifest says
that the plugin uses the network (`uses: Uses::NETWORK`); without it,
requests are refused. In Offline (`env.power`), only what the reader went
online for goes out: a screen that needs the network says so on itself
and offers *Go online*, which sends `Command::GoOnline` (the network for
that screen until it closes); anything else is refused with
`Reason::Offline` and may try again on `events::WORK_ALLOWED`.
`Command::CancelHttp` takes requests back. Where a server or a computer
is told which device this is (a sync service, Calibre), the name is
`env.device_name()`: the one the reader set under *Device name*, else
the model's; a plugin never makes one of its own.
