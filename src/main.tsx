import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

function Root() {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  // 🔍 Buscar actualización al iniciar
  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await check();

        if (update?.available) {
          setUpdateInfo(update);
        }
      } catch (e) {
        console.error("Error updater:", e);
      }
    }

    checkUpdate();
  }, []);

  // 🚀 Ejecutar actualización
  const handleUpdate = async () => {
    try {
      setDownloading(true);
      await updateInfo.downloadAndInstall();
      await relaunch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* 🌐 Tu app */}
      <HashRouter>
        <App />
      </HashRouter>

      {/* 🔥 Modal de actualización */}
      {updateInfo && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>🚀 Nueva actualización disponible</h2>

            <p><b>Versión:</b> {updateInfo.version}</p>

            {updateInfo.body && (
              <p style={{ marginTop: "10px" }}>
                {updateInfo.body}
              </p>
            )}

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleUpdate}
                disabled={downloading}
                style={styles.button}
              >
                {downloading ? "Actualizando..." : "Actualizar"}
              </button>

              <button
                onClick={() => setUpdateInfo(null)}
                style={styles.cancelButton}
              >
                Después
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center" as const,
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  button: {
    padding: "10px 15px",
    marginRight: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 15px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);