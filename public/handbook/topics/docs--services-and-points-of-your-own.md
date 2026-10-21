### Services and points of your own

A plugin can offer others more than the kernel knows of. A service is
any value published under an id in its namespace, usually a trait
object whose trait the plugin's crate exports; others use it when it is
there and do without it when not:

```rust
// The publishing plugin.
r.publish(WEATHER, Box::new(Forecast::new()) as Box<dyn Weather>)?;

// Any other plugin, wherever it has an `Env`.
if let Some(weather) = env.services.get::<Box<dyn Weather>>(WEATHER.as_str()) {
    let today = weather.today();
}
```

A service is found by its type's name too, so native code plugins built
apart from the firmware find it (see *Plugins as files* below). When
the type of a service changes, give it a new id (`weather.forecast-2`):
its name alone would not tell.

A point is an id a plugin names, with what a contribution there is in
its documentation (for example one line per entry); others add to it
with `r.contribute(point, text)`, and the plugin reads
`env.services.contributions(point)`, each with the plugin it came from.
