| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[weather] place` | Place | text | `` | Found by its name. Only its coordinates are sent to Open-Meteo, and only while a weather widget is shown. |
| `[weather] temperature` | Temperature in | `weather.unit.celsius`, `weather.unit.fahrenheit` | `weather.unit.celsius` | Degrees Celsius or Fahrenheit. |
| `[weather] wind` | Wind speed in | `weather.unit.kmh`, `weather.unit.mph`, `weather.unit.ms`, `weather.unit.knots` | `weather.unit.kmh` | How wind speeds are given. |
| `[weather] every` | Update at most every | `weather.every.1`, `weather.every.2`, `weather.every.3`, `weather.every.6` | `weather.every.1` | Only while there is a network: the weather never switches Wi-Fi on by itself. |
| `[weather] coordinates` | Coordinates | text | `` | Latitude and longitude, e.g. 52.52,13.41; set with the place. |
