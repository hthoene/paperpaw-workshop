### Events

```rust
r.on(events::BOOK_OPENED, move |env, reading, out| {
    opened.set(opened.get() + 1);
    // reading.path, reading.title, reading.progress, reading.at() …
})?;
```

The kernel and plugins emit events; any plugin can listen. An `Event<P>`
names an event and what it carries, a struct made with `event_data!`,
so emitting (`EVENT.emit(data)`) and hearing (`r.on`) are checked as
the plugin is built; screens get every event too and read one with
`EVENT.read(event, params)` in `Screen::on_event`. Standard ones are in
`builtin::events`: started, a setting changed, a book opened, a page
turned, a book moved, books came into the library or left it, its
bookmarks or highlights changed, a word looked up, a place in the open
book to show, text chosen, notes exported, the device suspends or
resumes, PaperPaw stops (a restart: save as at suspending, but it is no
sleep). Plugins define their own the same way (in their namespace),
and `EVENT.schedule(data, at)` emits one at a time (work at a time,
below). Underneath, what events carry travels as named
strings (`Params`): events known only at run time are heard by id with
`r.subscribe`.

Answers come as events too, typed in `replies`: a plugin names the
event it wants, e.g. `const FETCHED: Event<HttpReply> =
Event::new("news.fetched")`, and passes it with the request. To ask
the reader, `ask::text("Server", &ENTERED).initial(url).command()`
opens the keyboard and brings back a `Typed`, `ask::folder` a
`Chosen`, and `choice::open` a `Picked`. What the plugin added
(`.with(key, value)`) comes back as the answer's `context`, to tell
its questions apart.

What is known of books is a service, not a screen's: `library` has a
book's details (title, author, series, tags, cover, progress, and
fields plugins add with `library::set_field`), the books read last and
the favourites, so any plugin can show or use them. Views of many books
read the catalog rather than each book (below, "What every library
offers"), show covers made small and kept on the storage
(`library::cover_variant`, a few kilobytes each, not the picture, one
for each size a view shows) and take a book's details with the size a
listing told (`library::listing`, `library::book_sized`): on a card,
each file looked up again is a search through its folder.

The bookmarks and highlights of books are shared: `annotations` reads
and keeps them, and whoever changes them emits
`annotations::changed(book)`, so the reader shows them anew and syncs
pass them on (the `koreader` plugin, for example).

State a plugin keeps between events lives in an `Rc` it hands to its
handlers when it registers.
