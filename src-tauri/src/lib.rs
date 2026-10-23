//! The workshop's side on the computer: what a web page cannot do. The key
//! in the keychain, projects as folders in Documents, files dropped in,
//! sending a plugin to a reader, and building plugins with code.

mod emulator;
mod key;
mod paths;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(emulator::spawn(app.handle().clone()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            key::key_get,
            key::key_set,
            key::key_clear,
            emulator::emulator_start,
            emulator::emulator_button,
            emulator::emulator_pointer,
        ])
        .run(tauri::generate_context!())
        .expect("the workshop could not start");
}
