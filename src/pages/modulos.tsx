import { useState, useEffect } from "react";
import { Pencil, Trash, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { obtenerModulos, ModuloConProfesor, eliminarModulo } from "../services/moduloService";
import EditModulo from "../components/EditComponent/EditModal";
import ModalModulo from "../components/modals/ModalModulo";
import "../styles/modulos.css";

export default function Modulos() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modulos, setModulos] = useState<ModuloConProfesor[]>([]);
  const [moduloEditando, setModuloEditando] = useState<ModuloConProfesor | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const MODULOS_POR_PAGINA = 6;

  async function cargarModulos() {
    try {
      const data = await obtenerModulos();
      setModulos(data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }

  async function handleEliminar(id: number) {
    if (window.confirm("¿Estás seguro de eliminar este módulo?")) {
      try {
        await eliminarModulo(id);
        cargarModulos();
      } catch (error) {
        console.error("Error al eliminar módulo:", error);
      }
    }
  }

  useEffect(() => {
    cargarModulos();
  }, []);

  const modulosFiltrados = modulos.filter((m) => {
    const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideBusqueda;
  });

  const totalPaginas = Math.ceil(modulosFiltrados.length / MODULOS_POR_PAGINA);
  const modulosPaginados = modulosFiltrados.slice(
    (paginaActual - 1) * MODULOS_POR_PAGINA,
    paginaActual * MODULOS_POR_PAGINA
  );

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
        <div className="search-bar-icon"><Search size={18} /></div>
        <input
          type="text"
          className="search-bar-input"
          placeholder="Buscar módulo por nombre, codigo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
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
              {modulosPaginados.map((m) => (
                <tr key={m.id}>
                  <td className="td-code">{m.codigo}</td>
                  <td className="td-name">{m.nombre}</td>
                  <td className="td-center">{m.duracion}</td>
                  <td>{m.profesor_nombre || "Sin asignar"}</td>
                  <td>$ {m.precio.toLocaleString("es-CO")}</td>
                  <td>
                    {m.activo === 1 ? (
                      <span className="badge badge-active">ACTIVO</span>
                    ) : (
                      <span className="badge badge-inactive">INACTIVO</span>
                    )}
                  </td>
                  <td className="td-right">
                    <div className="actions-cell">
                      <button
                        className="btn-action edit"
                        onClick={() => m.activo === 1 && setModuloEditando(m)}
                        disabled={m.activo === 0}>
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => m.activo === 1 && m.id !== undefined && handleEliminar(m.id)}
                        disabled={m.activo === 0 || m.id === undefined}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <p className="pagination-info"> <span>{modulos.length}</span> modulos inscritos </p>
          <div className="pagination-controls">
            <button className="page-prev-next"
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))} disabled={paginaActual === 1}>
              <ChevronLeft size={18} />
            </button>
            <button className="page-prev-next"
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <ModalModulo
          onClose={() => setModalAbierto(false)}
          onGuardar={() => { setModalAbierto(false); cargarModulos() }} />
      )}

      <EditModulo
        modulo={moduloEditando}
        onCancelar={() => setModuloEditando(null)}
        onGuardado={() => { setModuloEditando(null); cargarModulos() }}
      />

    </>
  );
}