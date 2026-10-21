| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] developer` | Developer options | `true`, `false` | `false` | Settings and numbers for developers: measuring what uses the battery, trying things out, finding faults. |
| `[core] language` | Language | language | `en` | Language of menus and messages. |
| `[core] night-mode` | Night mode | `true`, `false` | `false` | White text on black. |
| `[core] night-pictures` | Pictures in night mode inverted | `true`, `false` | `false` | Off: covers and photos as they are, not as negatives. |
| `[core] mono-text` | Text darkness | `core.mono-text.light`, `core.mono-text.normal`, `core.mono-text.full` | `core.mono-text.normal` | How full letters are drawn without grays; full helps on pale screens. |
| `[core] speak-focus` | Say what is chosen | `true`, `false` | `false` | Says the row or button the buttons move to, for using PaperPaw without looking. |
| `[core] voice` | Voice | `core.voice.system` | `core.voice.system` | What reads aloud. Automatic: the system's voice, or where the device has none, a plugin's that speaks the language; or a plugin's for the languages it speaks. |
| `[core] edge-ends` | Edges for swipes: top and bottom | 0 to 25 | `10` | How far in from the edge a swipe still counts as one in from the edge (home, quick panel, back); 0: none there. On Android the outermost strip is the system's. |
| `[core] edge-sides` | Edges for swipes: left and right | 0 to 25 | `5` | How far in from the edge a swipe still counts as one in from the edge (home, quick panel, back); 0: none there. On Android the outermost strip is the system's. |
| `[core] library-folder` | Library folder | text | `books` | The folder with your books. |
| `[core] ui-size` | Menu text size | 7 to 24 | `9` | Size of menus, lists and the status line. |
| `[core] ui-contrast` | Contrast | `core.contrast.normal`, `core.contrast.strong` | `core.contrast.normal` | Strong draws gray hints and notes in black, easier to read on screens with few grays. |
| `[core] ui-header` | Headers | `core.header.plain`, `core.header.light`, `core.header.dark` | `core.header.plain` | The top of menus and lists: the title on the page, black on white with a line below, or white on black. |
| `[core] ui-corners` | Corners | `core.corners.square`, `core.corners.small`, `core.corners.round`, `core.corners.soft` | `core.corners.soft` | Of highlighted rows, buttons and boxes; round and soft ones make buttons and switches pills. |
| `[core] ui-focus` | Highlight | `core.focus.fill`, `core.focus.ring`, `core.focus.soft` | `core.focus.fill` | How the chosen row is shown: a dark bar, a frame, or a light bar (a frame on screens of black and white alone). |
| `[core] ui-separators` | Lines between rows | `core.separators.inset`, `core.separators.line`, `core.separators.none` | `core.separators.inset` | Light lines, fainter lines from where the text starts, or none. |
| `[core] ui-groups` | Groups | `core.groups.plain`, `core.groups.cards` | `core.groups.plain` | The sections of lists as they are or on rounded cards. |
| `[core] ui-title` | Title size | 100 to 200 | `130` | Size of the titles at the top of menus and lists, in percent of the text's. |
| `[core] ui-margin` | Margins of menus | 0 to 15 | `4` | Space at the left and right of menus and lists. |
| `[core] ui-row` | Row height | 120 to 300 | `160` | Height of the rows of menus and lists, relative to their text. |
| `[core] ui-lines` | Lines | 1 to 10 | `3` | How thick lines and frames are drawn. |
| `[core] logo` | Logo picture | text | `` | A picture (JPEG, PNG) shown in place of PaperPaw's logo, e.g. plugins/mine/logo.png. Empty for PaperPaw's own. |
| `[core] ui-palette` | Grays | text | `` | The grays of the interface by what they are for, e.g. muted=60 line=170 (0 black, 255 white). Empty for the usual ones. |
| `[core] keymap-preset` | Button layout | `core.standard`, `core.two-buttons`, `core.left-handed` | `core.standard` | What the device's buttons do. |
| `[core] full-refresh-interval` | Full refresh | 0 to 1000 | `6` | A flashing refresh after this many page turns removes ghosting; 0 never flashes. |
| `[core] flash-screens` | Flash when screens change | `true`, `false` | `false` | A full refresh when another screen opens leaves no trace of the last one, but takes longer: three and a half seconds on the X4. |
| `[core] sleep-after` | Sleep after | 0 to 120 | `10` | Minutes without use after which the device goes to sleep by itself; 0: never. Not while reading aloud or downloading. |
| `[core] rotation` | Turn the screen | `core.rotation.upright`, `core.rotation.landscape`, `core.rotation.upside-down`, `core.rotation.landscape-flipped` | `core.rotation.upright` | Upright or on its side, e.g. for pictures and comics. Turned while reading with “Only this book” on, it is turned for that book alone. |
| `[core] button-hints` | Show what the buttons do | `true`, `false` | `true` | A row at the bottom of the screen names what each button below it does. Not while reading. |
| `[core] swap-page-buttons` | Swap the page buttons | `true`, `false` | `false` | While reading, the page buttons turn the other way: the one that went forward goes back, and the other way round. Menus and lists keep them as they are. |
| `[core] notice-seconds` | Messages show for | 1 to 60 | `4` | How long short messages such as “Sync done” stay on the screen. |
| `[core] long-press-ms` | Long press | 200 to 3000 | `500` | How long to hold a button or finger for a long press. |
| `[core] double-tap-ms` | Double tap | 150 to 1000 | `300` | How quickly a second tap or press must follow the first to count as a double tap, where something is bound to one. |
| `[core] tap-slop` | Tap tolerance | 1 to 20 | `3` | How far a finger may move and still tap. |
| `[core] swipe-distance` | Swipe distance | 2 to 50 | `8` | How far a finger must move to swipe. |
| `[core] frontlight` | Front light | 0 to 100 | `0` | How bright the front light is; 0 switches it off. |
| `[core] frontlight-warmth` | Front light warmth | 0 to 100 | `50` | How warm the front light is: 0 cold, 100 warm. |
| `[core] space.size` | Size | `core.space.small`, `core.space.medium`, `core.space.large` | `core.space.medium` | The height of every space. |
| `[core] text-color` | Text colour | `core.color.black`, `core.color.dark-gray`, `core.color.gray`, `core.color.brown`, `core.color.dark-blue`, `core.color.dark-green`, `core.color.burgundy`, `core.color.violet`, `core.color.own` | `core.color.black` | Softer than black on white, easier on the eyes on bright screens. Pictures take the colours too; night mode swaps them. |
| `[core] text-color-own` | Own text colour | text | `#5b4636` | A colour code such as #5b4636 (red, green, blue), used when the colour above is "Own colour". |
| `[core] paper-color` | Paper colour | `core.paper.white`, `core.paper.cream`, `core.paper.sepia`, `core.paper.sand`, `core.paper.light-gray`, `core.paper.mint`, `core.paper.light-blue`, `core.paper.rose`, `core.paper.own` | `core.paper.white` | Softer than black on white, easier on the eyes on bright screens. Pictures take the colours too; night mode swaps them. |
| `[core] paper-color-own` | Own paper colour | text | `#f4ecd8` | A colour code such as #5b4636 (red, green, blue), used when the colour above is "Own colour". |
| `[core] status-font` | Font | `core.status-font.ui`, `core.status-font.book`, `Literata`, `Source Sans 3` | `core.status-font.ui` | The font of the status lines while reading: as the menus', as the book's, or one of its own. |
| `[core] reading-font` | Font | `core.font.default`, `Literata`, `Source Sans 3` | `core.font.default` | The book's font uses the fonts a book brings (else Literata); any other font is used for all text. Add your own: put .ttf or .otf files into the fonts folder. |
| `[core] font-size` | Font size | 6 to 40 | `9` | Size of the book text. |
| `[core] line-spacing` | Line spacing | 80 to 250 | `135` | Distance between lines, relative to the font size. Below 100 % lines come closer than the font sets them, for fonts with much room between lines. |
| `[core] font-weight` | Font weight | 0 to 4 | `0` | Darker, bolder text with any font; helps on light screens. |
| `[core] word-spacing` | Word spacing | 50 to 200 | `100` | Space between words; at 100 % as the font has it. |
| `[core] margin` | Margins | 0 to 30 | `4` | Space between the text and the edges of the screen; at the top and bottom too, unless those have margins of their own. |
| `[core] margin-ends` | Margins at the top and bottom | 0 to 30 | `4` | Space above and below the text. As the margins at the sides until it is changed. |
| `[core] justify` | Justify text | `true`, `false` | `true` | Align paragraphs on both sides. |
| `[core] hyphenate` | Hyphenate words | `true`, `false` | `true` | Break long words at the end of lines, in the book's language. |
| `[core] publisher-styles` | Publisher's formatting | `true`, `false` | `true` | Use the book's own layout (alignment, emphasis set in styles). Off shows the text plainly; emphasis in the text and headings stay. |
| `[core] indent` | Indent paragraphs | `true`, `false` | `true` | Indent the first line of each paragraph. |
| `[core] paragraph-spacing` | Space between paragraphs | `true`, `false` | `false` | Leave some space between paragraphs, with or without indented first lines. |
| `[core] widows` | Lines kept at the top | 1 to 4 | `1` | The fewest lines of a paragraph alone at the top of a page: more go on with them. |
| `[core] orphans` | Lines kept at the bottom | 1 to 4 | `1` | The fewest lines of a paragraph alone at the bottom of a page: with fewer, the paragraph begins on the next page. |
| `[core] reading-app` | Reading app | `core.reading-app.default` | `core.reading-app.default` | The app books open in; each format may have its own, and a book or a folder too (Open with). |
| `[core] footnotes` | Footnotes | `core.footnotes.popup`, `core.footnotes.jump` | `core.footnotes.popup` | A tapped note mark (1, [2], *) shows its note over the page, or goes to it. |
| `[core] page-frame` | Page frame | `core.page-frame.single` | `core.page-frame.single` | How the text is set on the page: in one column, or as a plugin frames it (two columns, two pages side by side). |
| `[core] scope-only` | Only this book | `true`, `false` | `false` | Changes to font and layout apply to this book only (marked •). Off: the book uses the general settings again. |
| `[core] highlight.background` | Background | `core.tone.none`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.light-gray` | A colour behind the marked words; shown as a gray where there is no colour. |
| `[core] highlight.ink` | Text | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the marked words themselves; as it is, or a tone of its own. |
| `[core] highlight.line` | Line under the text | `core.tone.none`, `core.line.solid`, `core.line.dotted`, `core.line.dashed`, `core.line.wavy`, `core.line.double` | `core.tone.none` | A line under the marked words: solid, dotted, dashed, wavy or double. |
| `[core] highlight.line-tone` | Line and frame | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the line and the frame. |
| `[core] highlight.thickness` | Thickness | 1 to 20 | `4` | How thick the line and the frame are. |
| `[core] highlight.frame` | Frame | `true`, `false` | `false` | A box around the marked words. |
| `[core] highlight.struck` | Struck through | `true`, `false` | `false` | A line through the marked words. |
| `[core] link.background` | Background | `core.tone.none`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.none` | A colour behind the marked words; shown as a gray where there is no colour. |
| `[core] link.ink` | Text | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the marked words themselves; as it is, or a tone of its own. |
| `[core] link.line` | Line under the text | `core.tone.none`, `core.line.solid`, `core.line.dotted`, `core.line.dashed`, `core.line.wavy`, `core.line.double` | `core.line.solid` | A line under the marked words: solid, dotted, dashed, wavy or double. |
| `[core] link.line-tone` | Line and frame | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.dark-gray` | The colour of the line and the frame. |
| `[core] link.thickness` | Thickness | 1 to 20 | `1` | How thick the line and the frame are. |
| `[core] link.frame` | Frame | `true`, `false` | `false` | A box around the marked words. |
| `[core] link.struck` | Struck through | `true`, `false` | `false` | A line through the marked words. |
| `[core] search-hit.background` | Background | `core.tone.none`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.none` | A colour behind the marked words; shown as a gray where there is no colour. |
| `[core] search-hit.ink` | Text | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the marked words themselves; as it is, or a tone of its own. |
| `[core] search-hit.line` | Line under the text | `core.tone.none`, `core.line.solid`, `core.line.dotted`, `core.line.dashed`, `core.line.wavy`, `core.line.double` | `core.line.solid` | A line under the marked words: solid, dotted, dashed, wavy or double. |
| `[core] search-hit.line-tone` | Line and frame | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the line and the frame. |
| `[core] search-hit.thickness` | Thickness | 1 to 20 | `5` | How thick the line and the frame are. |
| `[core] search-hit.frame` | Frame | `true`, `false` | `false` | A box around the marked words. |
| `[core] search-hit.struck` | Struck through | `true`, `false` | `false` | A line through the marked words. |
| `[core] aloud.background` | Background | `core.tone.none`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.none` | A colour behind the marked words; shown as a gray where there is no colour. |
| `[core] aloud.ink` | Text | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the marked words themselves; as it is, or a tone of its own. |
| `[core] aloud.line` | Line under the text | `core.tone.none`, `core.line.solid`, `core.line.dotted`, `core.line.dashed`, `core.line.wavy`, `core.line.double` | `core.line.solid` | A line under the marked words: solid, dotted, dashed, wavy or double. |
| `[core] aloud.line-tone` | Line and frame | `core.tone.as-is`, `core.tone.light-gray`, `core.tone.gray`, `core.tone.dark-gray`, `core.tone.black`, `core.tone.white`, `core.tone.yellow`, `core.tone.green`, `core.tone.blue`, `core.tone.pink`, `core.tone.orange`, `core.tone.red` | `core.tone.as-is` | The colour of the line and the frame. |
| `[core] aloud.thickness` | Thickness | 1 to 20 | `5` | How thick the line and the frame are. |
| `[core] aloud.frame` | Frame | `true`, `false` | `false` | A box around the marked words. |
| `[core] aloud.struck` | Struck through | `true`, `false` | `false` | A line through the marked words. |
| `[core] clock-format` | Clock | `core.clock.24h`, `core.clock.12h` | `core.clock.24h` | How the time shows: 14:30 or 2:30 PM. |
| `[core] week-start` | First day of the week | `core.week.auto`, `core.week.monday`, `core.week.sunday` | `core.week.auto` | Where weeks begin in calendars and the reading statistics. |
| `[core] time-zone` | Time zone | `core.tz.auto`, `core.tz.utc`, `core.tz.honolulu`, `core.tz.anchorage`, `core.tz.los-angeles`, `core.tz.phoenix`, `core.tz.denver`, `core.tz.chicago`, `core.tz.new-york`, `core.tz.sao-paulo`, `core.tz.london`, `core.tz.lisbon`, `core.tz.berlin`, `core.tz.helsinki`, `core.tz.istanbul`, `core.tz.moscow`, `core.tz.dubai`, `core.tz.india`, `core.tz.bangkok`, `core.tz.china`, `core.tz.tokyo`, `core.tz.sydney`, `core.tz.auckland` | `core.tz.auto` | Automatic uses the system's time zone, with summer time; devices without one need a zone here. |
| `[core] time-zone-rule` | Time zone rule | text | `` | For zones not in the list: a POSIX TZ rule, e.g. CET-1CEST,M3.5.0,M10.5.0/3. Overrides the time zone. |
| `[core] battery-low` | Battery low at | 5 to 50 | `20` | The charge at which "Battery when low" shows in a status line. |
| `[core] network.kosync` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.kosync` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.calibre` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.calibre` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.stats` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.stats` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.wifi` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.wifi` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.transfer` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.transfer` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.opds` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.opds` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.fonts-browser` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.fonts-browser` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.store` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.store` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.wikipedia` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.wikipedia` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.translate` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.translate` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.news` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.news` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.weather` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.weather` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.browser` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.browser` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.readwise` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.readwise` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.joplin` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.joplin` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.wallabag` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.wallabag` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
| `[core] network.update` | Network | `true`, `false` | `true` | Off, this plugin uses no network at all, not even when you ask it to. |
| `[core] saving.update` | In saving modes | `core.saving.follow`, `core.saving.normal`, `core.saving.manual` | `core.saving.follow` | Follow the mode, or keep this plugin's background work as in Normal while saving, or let it use the network only when you ask. |
