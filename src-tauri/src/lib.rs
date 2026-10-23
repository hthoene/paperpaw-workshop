//! The workshop's side on the computer: what a web page cannot do. The key
//! in the keychain, projects as folders in Documents, files dropped in,
//! sending a plugin to a reader, and building plugins with code.

mod key;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![key::key_get, key::key_set, key::key_clear])
        .run(tauri::generate_context!())
        .expect("the workshop could not start");
}
