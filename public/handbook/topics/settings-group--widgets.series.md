| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[widgets] series.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.center` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[widgets] series.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in; a dark card has light text. |
| `[widgets] series.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | Space between the widget's content and its edges or frame. |
| `[widgets] series.paper` | Colours | `core.plate.normal`, `core.plate.inverted`, `core.plate.light-gray`, `core.plate.dark-gray`, `core.plate.none` | `core.plate.normal` | Normal, inverted, a gray or transparent. Over a dark picture, pick light text. |
| `[widgets] series.ink` | Text | `core.ink.auto`, `core.tone.black`, `core.tone.white` | `core.ink.auto` | The colour of the widget's text; automatic is black or white, whichever reads. |
| `[widgets] series.corners` | Corners | `core.corners.auto`, `core.corners.square`, `core.corners.small`, `core.corners.round`, `core.corners.soft` | `core.corners.auto` | How round the widget's corners are; automatic follows the rest of the interface. |
| `[widgets] series.frame-line` | Frame line | `core.lines.auto`, `core.lines.thin`, `core.lines.medium`, `core.lines.thick` | `core.lines.auto` | How thick the line of the widget's frame is; automatic follows the interface's lines. |
| `[widgets] series.drop-shadow` | Shadow | `core.shadow.none`, `core.shadow.hard` | `core.shadow.none` | A solid shadow below and to the right of the widget's card or colour. |
| `[widgets] series.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large` | `core.size.medium` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[widgets] series.name` | Series | text | `` | The name of a series to show; empty for the series of the book being read. |
| `[widgets] series.count` | Books at most | 2 to 12 | `6` | How many books show at most; fewer where the place is small. |
| `[widgets] series.start` | Long series | `widgets.series.around`, `widgets.series.first` | `widgets.series.around` | When not all fit: the books round the one you read, or the first ones. |
| `[widgets] series.caption` | Heading | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[widgets] series.numbers` | Numbers in the series | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[widgets] series.titles` | Titles | `true`, `false` | `false` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[widgets] series.read` | Books read marked | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[widgets] series.current` | Book being read marked | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[widgets] series.font` | Font | `core.widgets.font.all`, `core.widgets.font.menus`, `core.widgets.font.book`, `PaperPaw Sans` | `core.widgets.font.all` | The font of this widget. Text too large for a font from the card stays in the menus' font. |
