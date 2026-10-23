| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] reading-font` | Font | `core.font.default`, `Literata`, `Source Sans 3` | `core.font.default` | The book's font is Literata, or the fonts a book brings on devices that draw them (not the X4 and X4 Pro). Any other font is used for all text. |
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
| `[dictionary] folder` | Dictionary folder | text | `dictionaries` | Where your StarDict dictionaries are (also in subfolders). |
| `[reader] smooth-text` | Smooth text | `true`, `false` | `false` | Letters with soft gray edges on screens without grays; pages turn slower and use more battery. |
| `[reader] open-last` | Reopen the last book at start | `true`, `false` | `true` | Start with the last book instead of the home screen. |
| `[reader] auto-turn-seconds` | Turn pages automatically every | 5 to 600 | `30` | For “Turn pages automatically” in the reader’s menu. |
| `[reader] aloud-speed` | Speed | 50 to 300 | `100` | How fast books are read aloud. |
| `[reader] aloud-highlight` | Underline the sentence | `true`, `false` | `true` | Shows which sentence is being read. |
| `[reader] aloud-turn-pages` | Turn pages | `true`, `false` | `true` | Reads on over the pages; else it stops at the end of the page. |
| `[reader] aloud-timer` | Stop after | `reader.aloud-timer.off`, `reader.aloud-timer.15`, `reader.aloud-timer.30`, `reader.aloud-timer.60`, `reader.aloud-timer.90` | `reader.aloud-timer.off` | Reading aloud stops by itself after this long, e.g. at bedtime. |
| `[reading-goal] content` | Content from | 5 to 95 | `50` | From which share of the goal the cat is content rather than meh. |
| `[reading-goal] happy` | Happy from | 50 to 200 | `100` | From which share of the goal the cat is happy. 100 % is the goal itself. |
| `[reading-goal] pictures` | Own pictures | text | `` | A folder with pictures named sad, meh, content and happy (PNG or JPEG) to show instead of the cats. Empty: the cats. |
| `[aids] bold-beginnings` | Bold word beginnings | `true`, `false` | `false` | The first half of every word in bold, which some find easier to follow. |
| `[aids] replace` | Replace words | text | `` | Pairs like “colour = color; Mr. = Mister”, for whole words in every book. |
| `[vocabulary] collect` | Keep words looked up | `true`, `false` | `true` | Each word you look up goes into Vocabulary in the tools, with its sentence. |
| `[vocabulary] mark` | Mark vocabulary | `true`, `false` | `false` | The words in Vocabulary are marked where they occur in books of their language; choosing one looks it up again. |
| `[vocabulary] new-per-day` | New cards a day | 0 to 200 | `20` | How many cards not seen before a review shows each day at most, besides those due again. |
| `[vocabulary] retention` | Retention wanted | 70 to 97 | `90` | How likely you should still remember a card when it comes again. Higher means more reviews. |
| `[vocabulary] cards-from-lookups` | Words looked up become cards | `true`, `false` | `false` | Each word you look up becomes a flash card in the deck Looked up, its sentence as the example. Add its meaning with your phone. |
| `[vocabulary] review-on-wake` | Review on waking | `true`, `false` | `false` | The review opens as the device wakes, where flash cards are due. |
| `[translate] to` | Translate into | `translate.to.auto`, `translate.to.ar`, `translate.to.bg`, `translate.to.cs`, `translate.to.da`, `translate.to.de`, `translate.to.el`, `translate.to.en-gb`, `translate.to.en-us`, `translate.to.es`, `translate.to.et`, `translate.to.fi`, `translate.to.fr`, `translate.to.hu`, `translate.to.id`, `translate.to.it`, `translate.to.ja`, `translate.to.ko`, `translate.to.lt`, `translate.to.lv`, `translate.to.nb`, `translate.to.nl`, `translate.to.pl`, `translate.to.pt-br`, `translate.to.pt-pt`, `translate.to.ro`, `translate.to.ru`, `translate.to.sk`, `translate.to.sl`, `translate.to.sv`, `translate.to.tr`, `translate.to.uk`, `translate.to.zh-hans` | `translate.to.auto` | The language selected text is translated into. |
