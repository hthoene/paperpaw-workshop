//! The workshop's side on the computer: what a web page cannot do. The key
//! in the keychain, projects as folders in Documents, files dropped in,
//! sending a plugin to a reader, and building plugins with code.

mod checks;
mod emulator;
mod key;
mod paths;
mod pictures;
mod projects;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(emulator::for_app(app.handle().clone()));
            app.manage(emulator::Shown(std::sync::Mutex::new(None)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            key::key_get,
            key::key_set,
            key::key_clear,
            emulator::emulator_start,
            emulator::emulator_button,
            emulator::emulator_pointer,
            emulator::emulator_sync,
            emulator::emulator_describe,
            emulator::emulator_shot,
            emulator::emulator_open,
            emulator::emulator_run,
            emulator::emulator_told,
            emulator::emulator_ready,
            checks::plugin_check,
            pictures::picture_make,
            pictures::picture_info,
            projects::projects_list,
            projects::project_create,
            projects::project_files,
            projects::project_read,
            projects::project_write,
            projects::project_remove,
            projects::project_load,
            projects::project_save,
            projects::uploads_list,
            projects::upload_read,
            projects::upload_write,
            projects::upload_remove,
        ])
        .run(tauri::generate_context!())
        .expect("the workshop could not start");
}
