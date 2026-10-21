### Keeping it small

On the X4 every plugin's file takes room in flash. A plugin carries its
own copy of the SDK code it uses, which is most of a small plugin: of
the sample's 63 KB on the X4, its own code is some 9 KB.

- Build with `opt-level = "s"` (as PaperPaw) or `"z"` (some 5 % smaller
  on the X4, a little slower), `lto = "fat"`, `codegen-units = 1`,
  `panic = "abort"`, as the sample does.
- Leave out what pulls in large parts of `core`: parsing floats from
  text (`str::parse::<f32>()`, 16 KB of tables), `{:?}` of strings.
- Keep translations and other text in the folder's files rather than in
  the code, where they are needed once.

Services between plugins are found by their type's name too, so a plugin
built apart finds those of the firmware's plugins (see [Services and
points of your own](#services-and-points-of-your-own)).
