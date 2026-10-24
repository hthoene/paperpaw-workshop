### Publishing a code plugin

The plugin library (paperpaw.org) lists a code plugin with its folder
and a build per reader (`x4`, `x4-pro`), each a signed
`.ppn` with the fingerprint it was built for, the author's key, and its
source, which the library rebuilds to compare. The sample's `build.sh`
builds, packs and signs both files, and its CI job
(`samples/hello-native/.github/workflows/build.yml`, for a plugin's own
repository) runs it on every tag, with the author's key kept as a
secret of the repository. [Publishing](#publishing) says how.
