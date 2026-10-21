```ini
# Default key bindings of the PaperPaw kernel.
#
# Layers: [keymap.global] applies everywhere; [keymap.<screen-or-slot-id>]
# applies only there and takes precedence. Users override any binding in
# their paperpaw.ini; `none` removes a binding.
#
# Inputs: button.<name>, long.<name> (long press), double.<name> (pressed
# twice), tap.<zone>, long-tap.<zone>, double-tap.<zone>, tap2 (two
# fingers), swipe.<left|right|up|down>, edge.<top|bottom|left|right> (a
# swipe in from that edge, before the screen sees it), pinch.<out|in>,
# and plugins' input.<id> and gesture.<id>. Zones form a 3x3 grid:
# top-left, top, top-right, left, center, right, bottom-left, bottom,
# bottom-right; a layer may add its own, [zones.<layer>] with
# <name> = <left> <top> <width> <height> in percent of the screen, tapped
# as tap.<name> and long-tap.<name>. `gestures.policy` says how a screen
# takes gestures: core.gestures.standard, core.gestures.own (the screen's
# own; edges need a second swipe) or core.gestures.off.

[keymap.global]
button.page-forward = core.next-page
button.page-back = core.prev-page
button.up = core.up
button.down = core.down
button.left = core.left
button.right = core.right
button.confirm = core.confirm
button.back = core.back
button.menu = core.menu
button.home = core.home
button.power = core.sleep
long.back = core.home
long.confirm = core.menu
long.menu = core.toggle-night-mode

tap.top-left = core.prev-page
tap.left = core.prev-page
tap.bottom-left = core.prev-page
tap.top = core.menu
tap.center = core.menu
tap.bottom = core.menu
tap.top-right = core.next-page
tap.right = core.next-page
tap.bottom-right = core.next-page
long-tap.center = core.toggle-night-mode
swipe.left = core.next-page
swipe.right = core.prev-page
# Lists scroll like pages: swipe up for the next one.
swipe.up = core.next-page
swipe.down = core.prev-page
# As on phones: up from the bottom edge goes home, down from the top
# opens the quick panel, in from a side goes back.
edge.bottom = core.home
edge.top = core.quick-panel
edge.left = core.back
edge.right = core.back
```
