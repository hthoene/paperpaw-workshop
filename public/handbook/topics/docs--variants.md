### Variants

A plugin is looked at in every combination of device profile
(`--profile <id>|all`; `paperpaw-dev --list` lists them), language
(`--language <code>`, by default every language the app has; `pseudo`
for the pseudo-language), light and dark (`--light`, `--dark`) and look
(`--theme <name>|all`: the default, square corners, round corners with
strong contrast). `--quick` takes one variant a device: English, light,
the default look. `--set <id>=<value>` sets a setting for every run.

Plugins' requests go to the network, unless `--network fixtures`: then
the emulator answers them offline, alike everywhere, from its own
answers for PaperPaw's plugins (a plugin library, an OPDS catalog, the
weather and others; `shells/desktop/src/offline.rs`), and every other
request fails. The screens that show what those answers give are drawn
with it, and `reach` takes a screen that stays out of reach while its
requests went unanswered for an error: it waits for data, it is no dead
end. PaperPaw's CI checks its screens so.
