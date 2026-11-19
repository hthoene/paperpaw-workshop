### Secrets and device randomness

Open `native::secrets::Secrets` once with the metadata-declared `core.secrets`
service, use the current callback's `Host` for each operation and call `release`
when finished. The handle retains no callback binding. `get` accepts an own
unprefixed name; it cannot request another plugin's value. Names and labels
preserve SSID tab, LF and CR characters while refusing other controls.

`SecretWrite::new(SecretName::new(name)?, value)` saves a complete value, including
an empty value. `.label(text)` replaces a label; an empty label preserves an
existing one. `.changeable()` permits editing by the user. `keep` clears the
encoded input buffer before returning, including after a refusal; its borrowed
source value remains the caller's responsibility. `remove` accepts a `SecretName`.

The settings editor declares `uses.secrets`. It lists `SecretList::all()`;
ordinary plugins use `SecretList::own()`. A list page contains borrowed names,
labels and changeable flags, never values. Continue from `page.end().next()`
using the same query's `.from(cursor)`. Concurrent edits may change row order
or totals between pages. `entry.target()` names an owner for removal, and
`entry.replacement(value)` preserves its changeable flag for replacement.
Other owners' values cannot be read, even by the editor.

`random(host, len, input, out)` draws exactly 1-256 bytes. Inspect `bytes()` and
`strong()` on the returned borrowed view. A host without a source refuses the
call; the facade supplies no substitute source. Lock may use a weak draw as a
salt under its contract; callers needing a strong key check the flag. Secret
values and random bytes are redacted in Debug output.

Input buffers of 1,280 bytes cover all calls. Output needs 4,096 bytes for list
or 1,280 bytes for get, keep, remove and random. Views cannot outlive or reuse
their output buffer while borrowed; a caller clears its value output after use.
