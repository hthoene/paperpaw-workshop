| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[weather] place` | Place | text | `` | Search by name. Only its coordinates are sent to Open-Meteo. |
| `[weather] temperature` | Temperature in | `weather.unit.celsius`, `weather.unit.fahrenheit` | `weather.unit.celsius` | Degrees Celsius or Fahrenheit. |
| `[weather] wind` | Wind speed in | `weather.unit.kmh`, `weather.unit.mph`, `weather.unit.ms`, `weather.unit.knots` | `weather.unit.kmh` | How wind speeds are given. |
| `[weather] every` | Update at most every | `weather.every.1`, `weather.every.2`, `weather.every.3`, `weather.every.6` | `weather.every.1` | Only while there is a network: the weather never switches Wi-Fi on by itself. |
| `[weather] coordinates` | Coordinates | text | `` | Latitude and longitude, e.g. 52.52,13.41; set with the place. |
| `[weather] now.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in; a dark card has light text. |
| `[weather] now.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | Space between the widget's content and its edges or frame. |
| `[weather] now.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large`, `core.size.fit` | `core.size.fit` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[weather] now.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.center` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[weather] now.symbol` | Weather symbol | `weather.symbol.large`, `weather.symbol.small`, `weather.symbol.none` | `weather.symbol.large` | Whether the weather symbol is large, small or left out. |
| `[weather] now.placing` | Large symbol placed | `weather.placing.auto`, `weather.placing.beside`, `weather.placing.above` | `weather.placing.auto` | Where a large symbol goes next to the text. |
| `[weather] now.style` | Symbols drawn | `weather.style.line`, `weather.style.solid` | `weather.style.line` | Weather symbols as outlines or filled. |
| `[weather] now.place` | Place | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.condition` | Condition (e.g. cloudy) | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.range` | Today's highest and lowest | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.feels` | How warm it feels | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.wind` | Wind | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.rain` | Chance of rain | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.humidity` | Humidity | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.sun` | Sunrise and sunset | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.unit` | °C or °F after the temperature | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] now.age` | When it is old, since when | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in; a dark card has light text. |
| `[weather] forecast.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | Space between the widget's content and its edges or frame. |
| `[weather] forecast.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large`, `core.size.fit` | `core.size.fit` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[weather] forecast.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.center` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[weather] forecast.days` | Days | 3 to 7 | `5` | How many days the forecast shows. |
| `[weather] forecast.start` | First day | `weather.start.today`, `weather.start.tomorrow` | `weather.start.today` | Whether the first day is today or tomorrow. |
| `[weather] forecast.layout` | Days placed | `weather.layout.auto`, `weather.layout.row`, `weather.layout.list` | `weather.layout.auto` | Days side by side, or one below the other. |
| `[weather] forecast.names` | Weekdays named | `weather.names.short`, `weather.names.initial`, `weather.names.long` | `weather.names.short` | How the weekdays are written. |
| `[weather] forecast.style` | Symbols drawn | `weather.style.line`, `weather.style.solid` | `weather.style.line` | Weather symbols as outlines or filled. |
| `[weather] forecast.symbol` | Weather symbols | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.low` | Lowest temperatures | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.rain` | Chance of rain | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.bars` | Bars of the temperatures (in a list) | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.today` | “Today” for today | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.place` | Place | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[weather] forecast.lines` | Lines between the days | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
