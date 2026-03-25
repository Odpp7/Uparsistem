#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn main() {
  tauri::Builder::default()
    .plugin(
      Builder::default()
        .add_migrations(
          "sqlite:uparsistem.db",
          vec![
            Migration {
              version: 1,
              description: "create initial tables",
              sql: include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/migrations/1.sql")),
              kind: MigrationKind::Up,
            },
          ],
        )
        .build(),
    )

    // ✅ updater
    .plugin(tauri_plugin_updater::Builder::new().build())

    // 🔥 FALTA ESTE 👇
    .plugin(tauri_plugin_process::init())

    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}