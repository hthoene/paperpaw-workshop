### Trying it on a device

A code plugin is a folder like a data plugin's, with its code beside its
`plugin.ini`:

```text
plugins/my-plugin/
  plugin.ini     [plugin] id, name, description, version
  code.ppn       its code, for this device and this firmware
  i18n/*.ini     translations, settings.ini, … as for data plugins
```

Copy the folder onto the card (over USB: `python tools/x4-remote.py
--push my-plugin plugins/my-plugin`) and restart. The plugin manager
lists it as one with code, and says why one does not run (built for
another PaperPaw, damaged, no room). Over USB, `native` (and `--info`)
says where each plugin lies and what loading it took.

A panic's calls inside a plugin are kept with its name and the offset
into its file, e.g. `4261a402 (my-plugin+0x452)`: its function lies at
`0x42000000 + offset - 80` in the plugin's ELF. A plugin that crashes
before PaperPaw shows its first frame is switched off: after two such
starts PaperPaw starts without plugins with code and says so (holding
*Back* on the X4, *Home* on the X4 Pro, while switching it on does the
same). The plugins it switched off are switched on again in the plugin
manager, one at a time.
