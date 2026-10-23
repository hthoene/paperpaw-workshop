// The PaperPaw plugin workshop as an app on the person's own computer.
// No console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    paperpaw_workshop_lib::run()
}
