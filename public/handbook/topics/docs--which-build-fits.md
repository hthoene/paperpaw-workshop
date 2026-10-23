### Which build fits

Until PaperPaw 1.0 a plugin file runs only on the PaperPaw it was built
for: the same compiler for the same chip from the same SDK with the same
features (but `kernel` and `unstable`, which only add functions). Its
fingerprint says so, and a device loads only files with its own;
*About* shows the device's fingerprint and the compiler to build with.
Build against the SDK of the release (`paperpaw-sdk = "0.4"`) with the
toolchain that release names, and build again for every release, until
1.0: the fingerprint holds the SDK's version, so a release loads no file
built for another. The
store and the update check show which plugins wait for a build.
