import { useState, useEffect } from "react";
import { Pencil, Trash, ChevronDown, Plus, BrushCleaning } from "lucide-react";
import { obtenerModulos, ModuloConProfesor } from "../services/moduloService";
import ModalModulo from "../components/modals/ModalModulo";
import "../styles/modulos.css";

export default function Modulos() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modulos, setModulos] = useState<ModuloConProfesor[]>([]);

  async function cargarModulos() {
    try {
      const data = await obtenerModulos();
      setModulos(data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }

  useEffect(() => {
    cargarModulos();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Módulos</h1>
          <p className="page-subtitle">Administre los créditos, instructores y estados de los módulos educativos.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalAbierto(true)}>
          <Plus size={20} />
          Nuevo Módulo
        </button>
      </div>

      <div className="filters-bar">
        <button className="filter-btn">
          <span>Carrera</span>
          <ChevronDown size={18} />
        </button>
        <button className="filter-btn">
          <span>Semestre</span>
          <ChevronDown size={18} />
        </button>
        <button className="filter-clear">
          <BrushCleaning size={18} />
          Limpiar
        </button>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Módulo</th>
                <th className="center">Duracion</th>
                <th>Instructor</th>
                <th>Precio</th>
                <th>Estado</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modulos.map((m) => (
                <tr key={m.id}>
                  <td className="td-code">{m.codigo}</td>
                  <td className="td-name">{m.nombre}</td>
                  <td className="td-center">{m.duracion}</td>
                  <td>{m.profesor_nombre || "Sin asignar"}</td>
                  <td>$ {m.precio.toLocaleString("es-CO")}</td>
                  <td>
                    <span>--</span>
                  </td>
                  <td className="td-right">
                    <div className="actions-cell">
                      <button className="btn-action edit"><Pencil size={16} /></button>
                      <button className="btn-action delete"><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <p className="pagination-info">
            Mostrando <span>1</span> a <span>5</span> de <span>24</span> módulos
          </p>
          <div className="pagination-controls">
            <button className="page-prev-next" disabled>Anterior</button>
            <div className="page-nums">
              <button className="page-btn current">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="page-dots">...</span>
              <button className="page-btn">5</button>
            </div>
            <button className="page-prev-next">Siguiente</button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <ModalModulo 
        onClose={() => setModalAbierto(false)} 
        onGuardar={() => { setModalAbierto(false); cargarModulos(); }}/>
      )}
    </>
  );
}