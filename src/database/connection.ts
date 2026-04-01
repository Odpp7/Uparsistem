import Database from "@tauri-apps/plugin-sql";

let connection: Database | null = null;

export async function getConnection() {
    if (!connection) {
        connection = await Database.load("sqlite:Instituto-Ebenezer.db");
    }
    return connection;
}