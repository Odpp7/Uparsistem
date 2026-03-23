import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { check } from '@tauri-apps/plugin-updater';

async function checkUpdate() {
  try {
    const update = await check();

    console.log("Resultado updater:", update);

    if (update?.available) {
      console.log("Actualización disponible 🚀");
      await update.downloadAndInstall();
    } else {
      console.log("No hay actualización ❌");
    }
  } catch (error) {
    console.error("Error al buscar actualización:", error);
  }
}

// 🔥 CLAVE: esperar a que cargue la app
window.addEventListener("DOMContentLoaded", () => {
  checkUpdate();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
