### Which devices your plugin is for

A plugin does not have to be for every device. Publish it for the devices
it works on and nothing else: the store, on the site and on each reader,
shows it only to those. Nobody sees a plugin that is not for their device,
and nobody is offered one that would not run.

- **A data plugin** is files, so it works anywhere PaperPaw does. Left
  alone it is offered on every device. To limit it, name the devices in
  `[store]` of `store/store.ini`, separated by commas, of `android`,
  `x4`, `x4-pro` and `x4-classic`:

  ```ini
  [store]
  devices = x4, x4-pro
  ```

  The upload form has the same as the boxes "Runs on". A device not named
  does not see it, also one of the same family: name `x4-classic` too if
  the plugin is for it. The X3 asks the store as an `x4`, so it sees what
  is for the `x4`; there is no `x3` to name.
- **A code plugin** is a build for one chip, so it is for the readers you
  give a build. Upload (or release on GitHub) one signed `.ppn` per reader
  (`x4` is the ESP32-C3 of the X4 and X3, `x4-pro` the ESP32-S3 of the X4
  Pro and the X4 Classic): its devices are those, whatever `devices` says,
  and a build for only the X4 is a plugin for the X4 only. A reader
  needs the build made for its own fingerprint; one that has none for it
  (an older release, a chip you did not build for) does not list the
  plugin, and the site shows it as waiting for a build. Android takes no
  plugin with code from the store, so a code plugin never shows there.
- **Where it shows.** The plugin's page and the library's lists on
  paperpaw.org say "X4 and X4 Pro only" for a plugin that is not for all,
  and the library can be filtered by device. The reader's store (*More
  plugins*) asks for its own device and lists only what fits it. A
  catalogue entry (`catalogue/<id>.toml`) names `devices` the same way,
  and every build it lists must be for one of them.
- **Later.** A new version may add a device: add its build (or name it in
  `devices`) and publish the version.
