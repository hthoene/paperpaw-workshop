### Examples

A format: files with these extensions open as a `Document`.

```rust
r.add_format(FormatSpec::new(
    Id::new_static("notes.format"),
    "notes.format",
    vec![Cow::Borrowed("note")],
    Box::new(|storage, path, _options| Notes::open(storage, path)),
))?;
```

A status item: what a status line shows, `None` to hide it. A tap on
it runs an action of its own plugin, here one that opens the notes.
Where a line is full, items of a low priority give way first.

```rust
r.add_status_item(
    StatusItemSpec::new(
        Id::new_static("notes.count"),
        "notes.count",
        Box::new(|env, _| Some(StatusValue::Text(count(env).to_string()))),
    )
    .tap(Id::new_static("notes.open"))
    .priority(96),
)?;
```

An input filter: it sees every button and finger first.

```rust
r.add_input_filter(InputFilterSpec::new(
    Id::new_static("lock.filter"),
    "lock.filter",
    Box::new(|env, _input| if locked(env) { InputVerdict::Take } else { InputVerdict::Pass }),
))?;
```

A request and its answer: the reply event brings the `HttpReply`.

```rust
const FETCHED: Event<HttpReply> = Event::new("news.fetched");
// In an action or a screen:
out.push(Command::http(HttpRequest::get("https://example.org/feed", &FETCHED)));
// When registering:
r.on(FETCHED, |_env, reply, out| {
    if reply.status == 200 {
        out.push(Command::Notify(headline(&reply.body)));
    }
})?;
```

A timer: the work's event comes at that time, here each hour.

```rust
const TICK: Event<()> = Event::new("weather.tick");
out.push(Command::work(
    Work::at(&TICK, env.now().add_millis(60 * 60 * 1000)).every(Duration::from_secs(3600)),
));
r.on(TICK, |_env, _, out| out.push(Command::http(HttpRequest::get(FORECAST, &FETCHED))))?;
```
