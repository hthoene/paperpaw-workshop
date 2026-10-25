### Publishing from GitHub

A plugin can also reach the library from its own repository, without the
form. Give a public repository the topic `paperpaw-plugin` and publish a
GitHub release: paperpaw.org looks through such repositories every hour,
takes each one's newest release, checks it as it checks an upload, keeps
its files and lists the plugin as "Community, unreviewed", with the
GitHub owner as author, a link to the repository and the key's
fingerprint. Readers never download from GitHub; the site serves the kept
files.

The release's tag is `v` and the version of `plugin.ini`. Its assets are
`<id>-<version>.zip`, the plugin's folder as the form takes it (with
`store/`), and for a code plugin one signed build per reader,
`<id>-<version>-<device>.ppn` with the device `x4`, `x4-pro` or
`x4-classic` (the X3 runs the X4's). A release must not be a draft or a
pre-release. The source of a code plugin is `[source]` in
`store/store.ini`, or else the repository at the release's tag.

Start such a repository with `paperpaw-dev new --github <id>` (`--code`
for a plugin with code): it lays out the plugin's folder, `store.ini`
with a valid group, the release workflow and a README. Before every tag,
`paperpaw-dev check-publish` (or the smaller `paperpaw-sign
check-publish .`) checks the repository by the rules the site checks by,
`tools/publish/store-rules.json`, the same file the site serves at
`/api/v1/store-rules.json`, and says what to change.

[`paperpaw-release.yml`](../tools/dev/templates/README.md#publish-by-tagging)
in `tools/dev/templates/.github/workflows` does it all on pushing the
tag: it checks the tag against `plugin.ini`, runs `check-publish`, zips
the folder, builds and signs a code plugin with the key in the
repository's secret `PAPERPAW_PLUGIN_KEY`, checks the files it made, and
creates the release only where every check passed.

The site refuses most often: a group that is none of the twelve, more
than five tags, a screenshot without its line in `[screenshots]`, a
summary longer than one sentence, files in the plugin's folder that are
no plugin's (a README or LICENSE where `PLUGIN_DIR` is the repository's
top), a tag that is not `v` + the version, a build not signed or signed
by another key, and for code a missing `Cargo.lock` or the SDK named by
path. `check-publish` names each with its fix.

Unreviewed means the moderators did not read it; the checks are the same.
An id belongs to whoever it first appeared with, reviewed or from
GitHub: its key, as in [The author's key](#the-authors-key), or for a
data plugin its account or GitHub owner. A release with another's id or
key is not offered; the ids and names of PaperPaw's own plugins are
reserved. Readers refuse an update signed by another key. The admins can
block a repository, an owner or a key, which takes its plugins down at
once. To have it reviewed later, name the repository in the store's form
(*From GitHub*): from then on each new release waits for the moderators
as an update. The skill's
[`publishing.md`](../.claude/skills/paperpaw-plugin-development/publishing.md)
has the steps.

[`Plugin`]: ../crates/paperpaw-sdk/src/plugin.rs
[`Registrar`]: ../crates/paperpaw-sdk/src/contribution.rs
[`Env`]: ../crates/paperpaw-sdk/src/env.rs
[`Command`]: ../crates/paperpaw-sdk/src/command.rs
[`Screen`]: ../crates/paperpaw-sdk/src/screen.rs
[`Widget`]: ../crates/paperpaw-sdk/src/widgets.rs
