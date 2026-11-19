### Document-scoped storage

`native::storage::Root::Install` (root 2) reads the plugin's own install folder,
read only, in any callback. During a permitted format callback, `Book` selects
root 3, `UserCss` root 4 and `DocumentCache` root 6. An empty path names the book
file on root 3 or the CSS file on root 4. Folder and siblings formats may read
relative paths inside root 3. Root 3 is read only; root 4 is read only and
available during `core.format` ops 2 and 3 only. The host enforces the callback scope,
cache quota and reserved `.complete`/`.host/` cache paths. The host writes
`.complete`; a format never writes it. Use the current callback's `Host`
for storage calls and never retain it across callbacks.
