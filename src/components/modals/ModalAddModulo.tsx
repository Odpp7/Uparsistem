import { useState, useEffect } from "react";
import { obtenerModulosActivos, Modulo } from "../../services/moduloService";
import { crearInscripcion, obtenerModulosInscritos } from "../../services/inscripcionService";
import { X, School, Search, Plus, ReceiptText, ShieldCheck, ArrowRight, Trash2 } from "lucide-react";
import '../../styles/modalAddModulo.css';

interface Props {
  onClose: () => void;
  estudianteId: number;
  nombre: string;
  studentMeta?: string;
}

export default function ModalAddModulo({ onClose, estudianteId, nombre, studentMeta }: Props) {
  const [modulosDisponibles, setModulosDisponibles] = useState<Modulo[]>([]);
  const [modulosInscritos, setModulosInscritos] = useState<Modulo[]>([]);
  const [carrito, setCarrito] = useState<Modulo[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { cargarDatos() }, [estudianteId]);

  async function cargarDatos() {
    try {
      const modulos = await obtenerModulosActivos();
      const inscritos = await obtenerModulosInscritos(estudianteId);
      setModulosInscritos(inscritos);

      const ids = inscritos.map(m => m.id);
      setModulosDisponibles(modulos.filter(m => !ids.includes(m.id)));

    } catch (error) {
      console.error("Error cargando módulos", error);
    }
  }

  const modulosFiltrados = modulosDisponibles.filter((m) => {
    const q = busqueda.toLowerCase();
    return (m.codigo.toLowerCase().includes(q) || m.nombre.toLowerCase().includes(q));
  });

  function agregarAlCarrito(modulo: Modulo) {
    if (carrito.find((m) => m.id === modulo.id)) return;
    setCarrito((prev) => [...prev, modulo]);
    setModulosDisponibles((prev) => prev.filter((m) => m.id !== modulo.id));
  }

  function quitarDelCarrito(modulo: Modulo) {
    setCarrito((prev) => prev.filter((m) => m.id !== modulo.id));
    setModulosDisponibles((prev) => [...prev, modulo]);
  }

  async function confirmarInscripcion() {
    if (carrito.length === 0) return;
    try {
      for (const modulo of carrito) {
        await crearInscripcion(estudianteId, modulo.id!);
      }
      setModulosInscritos([...modulosInscritos, ...carrito]);
      setCarrito([]);
    } catch (error) {
      console.error("Error al inscribir módulos", error);
    }
  }

  function obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(" ").filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  const totalCarrito = carrito.reduce((acc, m) => acc + m.precio, 0);

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon"><School size={20} /></div>
            <div>
              <p className="modal-header-title">Inscripción de Módulos</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="modal-body">
          <div className="student-card">
            <div className="student-card-left">
              <div className="student-avatar">{obtenerIniciales(nombre || "")}</div>
              <div>
                <p className="student-name">{nombre}</p>
                <p className="student-meta">{studentMeta}</p>
              </div>
            </div>
          </div>

          <div className="inscripcion-grid">
            <div className="left-col">
              <div className="form-group">
                <label className="form-label">Buscar Módulos Disponibles</label>
                <div className="search-wrap">
                  <span className="search-icon"><Search size={16} /></span>
                  <input
                    className="search-input"
                    placeholder="Código o nombre del módulo..."
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="module-list">

                  {modulosFiltrados.length === 0 && (
                    <p style={{ padding: "12px", color: "#94a3b8", fontSize: 13 }}>
                      No hay módulos disponibles.
                    </p>
                  )}

                  {modulosFiltrados.map((m) => (
                    <div className="module-list-item" key={m.id}>
                      <div>
                        <p className="module-list-name">{m.codigo} - {m.nombre}</p>
                        <p className="module-list-meta"> Precio: ${m.precio.toLocaleString("es-CO")} </p>
                      </div>
                      <button className="btn-add-module" onClick={() => agregarAlCarrito(m)}>
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="right-col">
              <div className="summary-card">
                <div className="summary-card-title"> <ReceiptText size={15} /> Módulos a Inscribir </div>

                {carrito.map((m) => (
                  <div className="summary-row" key={m.id}>
                    <span>{m.codigo} - {m.nombre}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>${m.precio.toLocaleString("es-CO")}</span>
                      <button onClick={() => quitarDelCarrito(m)} style={{ border: "none", cursor: "pointer", color: "#ef4444" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {carrito.length > 0 && (
                  <>
                    <hr className="summary-divider" />
                    <div className="summary-total">
                      <div>
                        <p className="summary-total-label">Total a Pagar</p>
                        <p className="summary-total-amount">
                          ${totalCarrito.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="enrolled-title"> <ShieldCheck size={15} color="#1152d4" />
                  Módulos ya inscritos
                </div>
                <div className="enrolled-list">
                  {modulosInscritos.length === 0 && (
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>Ninguno aún.</p>
                  )}
                  {modulosInscritos.map((m) => (
                    <div className="enrolled-item" key={m.id}>
                      <span>{m.codigo} - {m.nombre}</span>
                      <span className="badge-confirmed">Confirmado</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={confirmarInscripcion} > Confirmar Inscripción <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}