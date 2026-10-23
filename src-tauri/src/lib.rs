//! The workshop's side on the computer: what a web page cannot do. The key
//! in the keychain, projects as folders in Documents, files dropped in,
//! sending a plugin to a reader, and building plugins with code.

mod author;
mod checks;
mod device;
mod code;
mod emulator;
mod export;
mod history;
mod install;
mod key;
mod paths;
mod pictures;
mod projects;
mod publish;
mod sample;
mod send;
mod toolchain;
mod usb;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
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
            emulator::emulator_bodies,
            emulator::emulator_slot,
            emulator::emulator_widget,
            checks::plugin_check,
            code::code_build,
            toolchain::build_tools_install,
            send::send_wifi,
            send::send_card,
            send::save_file,
            usb::usb_readers,
            usb::send_usb,
            pictures::picture_make,
            pictures::picture_info,
            publish::publish_save,
            author::author_status,
            author::author_create,
            author::author_backup,
            author::author_import,
            device::device_readiness,
            device::device_toolchain_install,
            device::device_build,
            publish::publish_show,
            projects::projects_list,
            projects::project_create,
            projects::project_rename,
            projects::project_archive,
            projects::project_restore,
            projects::projects_archived,
            projects::project_trash,
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
            history::history_begin,
            history::history_snapshot,
            history::history_list,
            history::history_restore,
            history::history_mark,
            history::history_preview,
            export::projects_export,
            export::projects_import,
            export::import_read,
            sample::sample_fetch,
        ])
        .run(tauri::generate_context!())
        .expect("the workshop could not start");
}
