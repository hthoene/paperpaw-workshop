# The emulator the installer brings

`npm run app:installer` copies PaperPaw's `paperpaw-emu` and `paperpaw-dev`
here (from `PAPERPAW_EMU`) before it builds the installer, which puts them
into `emulator/` beside the app. The app uses them until a PaperPaw
release of the person's choice is in its own folder. They are not kept in
git.
