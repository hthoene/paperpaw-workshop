| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] edge-ends` | Edges for swipes: top and bottom | 0 to 25 | `10` | How far in from the edge a swipe still counts as one in from the edge (home, quick panel, back); 0: none there. On Android the outermost strip is the system's. |
| `[core] edge-sides` | Edges for swipes: left and right | 0 to 25 | `5` | How far in from the edge a swipe still counts as one in from the edge (home, quick panel, back); 0: none there. On Android the outermost strip is the system's. |
| `[core] keymap-preset` | Button layout | `core.standard`, `core.two-buttons`, `core.left-handed` | `core.standard` | What the device's buttons do. |
| `[core] button-hints` | Show what the buttons do | `true`, `false` | `true` | A row at the bottom of the screen names what each button below it does. Not while reading. |
| `[core] swap-page-buttons` | Swap the page buttons | `true`, `false` | `false` | While reading, the page buttons turn the other way: the one that went forward goes back, and the other way round. Menus and lists keep them as they are. |
| `[core] long-press-ms` | Long press | 200 to 3000 | `500` | How long to hold a button or finger for a long press. |
| `[core] double-tap-ms` | Double tap | 150 to 1000 | `300` | How quickly a second tap or press must follow the first to count as a double tap, where something is bound to one. |
| `[core] tap-slop` | Tap tolerance | 1 to 20 | `3` | How far a finger may move and still tap. |
| `[core] swipe-distance` | Swipe distance | 2 to 50 | `8` | How far a finger must move to swipe. |
| `[reader] corner-bookmark` | Bookmark by tapping the corner | `true`, `false` | `true` | A tap on the top right corner of a page sets or removes its bookmark. |
| `[reader] hold-chapters` | Hold a page button for the next chapter | `true`, `false` | `true` | While reading, holding a page button goes a chapter on or back. Off, a page turns as soon as its button goes down, instead of when it is let go. |
