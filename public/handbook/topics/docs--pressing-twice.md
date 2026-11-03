### Pressing twice

A button, or a tap zone, can do one thing when pressed once and another
when pressed twice: bind the second as `double.<button>` (or
`double-tap.<zone>`) in a key map, in `paperpaw.ini` or on the device
(*Buttons and gestures*, "Buttons pressed twice"):

```ini
[keymap.global]
double.confirm = core.home
```

How quickly the second press must follow the first is the setting
*Double tap* (`core.double-tap-ms`, 300 ms; advanced). A button waits for
a second press only if something is bound to its double press, so the
buttons that have none respond at once. Where one is bound, the single
press is answered after that time instead of at once, as the second press
might still come. Chords (two buttons at once) are not built.
