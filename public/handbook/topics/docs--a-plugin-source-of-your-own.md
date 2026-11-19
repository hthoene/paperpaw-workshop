### A plugin source of your own

Plugins can also be offered without the library at paperpaw.org: a
**community plugin source** is a plugin list of your own on any `https://`
web server, which readers add on their device by its address (*Plugin
store*, *Sources*). PaperPaw does not check a source or its plugins, and
says so before one is added. The source signs its list with an Ed25519 key;
a device keeps the key of the first list it reads and from then on takes
only lists, and code plugins, signed with it.

[`templates/plugin-source`](../templates/plugin-source) is a repository to
copy: an example plugin with code and a GitHub Actions workflow that builds
it for every device, signs it with your key (a repository secret) and
publishes the source with GitHub Pages; its README has the steps.
`paperpaw-sign pack-source <folder> <out>` makes a source by hand, from
the folders of its plugins and their signed builds
(`<id>-<version>-<device>.ppn` beside each folder), and `paperpaw-sign
check-source <out>/plugins.json` checks the signature as a device does.
