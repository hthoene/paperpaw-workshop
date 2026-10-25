### Firmware updates

Where PaperPaw is the device's firmware (the X4s), `env.firmware()` says
which version runs and how an install goes; elsewhere it is `None`.
`Command::Firmware(FirmwareCommand::Install { path, key, older })`
installs a signed update file: `key` is the key of one not signed by
PaperPaw that the reader accepted, shown its fingerprint, `older` that
they chose one not newer than the running firmware
(`firmware::Update::may_install` is the shell's check).
`FirmwareCommand::Restart` restarts into it once
`FirmwareState::Installed`; `events::FIRMWARE_CHANGED` comes on the
way. `firmware::Update::read` tells what a file holds before. The
`update` plugin does all this for update files on the card; a plugin
that fetches updates from somewhere else only needs to put the file
there.

`FirmwareCommand::InstallForeign { path }` installs another firmware's
app image instead (the way back to CrossPoint): not signed, so send it
only for a file the reader chose as such, told that it is not PaperPaw.
`firmware::ForeignImage::read` and `fits` tell what the file is before;
the shell checks the whole image as it writes it (`ForeignCheck`: its
chip, segments, checksum and hash, and CrossPoint's board tag).
