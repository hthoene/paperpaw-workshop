### Services and points of your own

A plugin can offer others more than the kernel knows of. A service is
a value provided under an id in its namespace, in a version, usually a
struct holding a trait object whose trait the plugin's crate exports.
Its type names its contract in a key, such as `"weather.forecast/1"`,
written with `service_type!`; the key changes (`/2`) when the type's
fields do. Others use the service when it is there and do without it
when not:

```rust
// In the providing plugin's crate.
pub struct Weather(pub Box<dyn Forecast>);
paperpaw_sdk::service_type!(Weather, "weather.forecast/1");

// The providing plugin's `register`.
r.provide(WEATHER, Weather(Box::new(Today::new())), Version::new(1, 0, 0))?;

// Any other plugin, wherever it has an `Env`: version 1.0 or later.
if let Some(weather) = env.services().get::<Weather>(WEATHER.as_str(), Version::new(1, 0, 0)) {
    let today = weather.0.today();
}
```

A service is found by its key, so native code plugins built apart from
the firmware find it too (see *Plugins as files* below); its size and
alignment are checked.

A point is an id a plugin names, with what a contribution there is in
its documentation (for example one line per entry); others add to it
with `r.contribute(point, text)`, and the plugin reads
`env.services().contributions(point)`, each with the plugin it came from.
