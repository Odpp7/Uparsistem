import { useState } from "react";
import { PlusCircle, UserSearch, Clock, CheckCircle2, Tag, Wallet } from "lucide-react";
import { buscarEstudiantes, Estudiante } from "../services/estudianteService";
import { obtenerCarteraEstudiante, CarteraEstudiante } from "../services/pagoService";
import ModalPago from "../components/modals/ModalPagos";
import "../styles/pagos.css";

interface PagoReciente {
  fecha: string;
  concepto: string;
  monto: number;
  metodo: string;
}

export default function Pagos() {
  const [modalPago, setModalPago] = useState(false);

  // Búsqueda
  const [query, setQuery]               = useState("");
  const [resultados, setResultados]     = useState<Estudiante[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [buscando, setBuscando]         = useState(false);

  // Datos del estudiante seleccionado
  const [estudiante, setEstudiante]     = useState<Estudiante | null>(null);
  const [cartera, setCartera]           = useState<CarteraEstudiante | null>(null);
  const [pagosRecientes, setPagosRecientes] = useState<PagoReciente[]>([]);
  const [cargando, setCargando]         = useState(false);

  // Debounce de búsqueda
  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setEstudiante(null);
    setCartera(null);
    clearTimeout(debounceTimer);
    if (val.trim().length < 2) { setResultados([]); setShowDropdown(false); return; }
    debounceTimer = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarEstudiantes(val);
        setResultados(data);
        setShowDropdown(true);
      } finally {
        setBuscando(false);
      }
    }, 300);
  }

  async function seleccionarEstudiante(est: Estudiante) {
    setEstudiante(est);
    setQuery(est.nombre_completo);
    setShowDropdown(false);
    setResultados([]);
    setCargando(true);
    try {
      const c = await obtenerCarteraEstudiante(est.id);
      setCartera(c);

      // Traer pagos recientes desde inscripcionService directamente
      // Los armamos desde las líneas de cartera que ya tenemos
      // (para evitar otra query, usamos la info disponible)
      setPagosRecientes([]); // se llena abajo con query separada
      console.log("Estudiante en página:", estudiante?.id);

      await cargarPagosRecientes(est.id);
    } finally {
      setCargando(false);
    }
  }

  async function cargarPagosRecientes(estudianteId: number) {
    // Importamos getConnection directamente para una query específica de pagos
    const { getConnection } = await import("../database/connection");
    const conn = await getConnection();
    const rows: { fecha_pago: string; modulo_nombre: string; monto_pagado: number; metodo_pago: string }[] =
      await conn.select(`
        SELECT 
          p.fecha_pago,
          m.nombre AS modulo_nombre,
          p.monto_pagado,
          p.metodo_pago
        FROM pagos p
        JOIN inscripciones i ON p.inscripcion_id = i.id
        JOIN modulos m ON i.modulo_id = m.id
        WHERE i.estudiante_id = ?
        ORDER BY p.fecha_pago DESC
        LIMIT 10
      `, [estudianteId]);

    setPagosRecientes(rows.map((r) => ({
      fecha: r.fecha_pago,
      concepto: r.modulo_nombre,
      monto: r.monto_pagado,
      metodo: r.metodo_pago,
    })));
  }

  async function handlePagoRegistrado() {
    setModalPago(false);
    if (estudiante) {
      setCargando(true);
      try {
        const c = await obtenerCarteraEstudiante(estudiante.id);
        setCartera(c);
        await cargarPagosRecientes(estudiante.id);
      } finally {
        setCargando(false);
      }
    }
  }

  // ── Estado vacío (sin estudiante buscado) ──────────────────────────────────
  const sinEstudiante = !estudiante && !cargando;

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cartera y Pagos</h1>
          <p className="page-subtitle">Gestión financiera y seguimiento de pagos de estudiantes</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setModalPago(true)}
        >
          <PlusCircle size={18} />
          Registrar Pago
        </button>
      </div>

      {/* BÚSQUEDA */}
      <div className="search-big" style={{ position: "relative" }}>
        <span className="search-big-icon"><UserSearch size={22} /></span>
        <input
          className="search-big-input"
          placeholder="Buscar estudiante por nombre o documento..."
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => resultados.length > 0 && setShowDropdown(true)}
        />
        {buscando && (
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94a3b8" }}>
            Buscando...
          </span>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="search-dropdown">
            {resultados.length === 0 && !buscando && (
              <p className="dropdown-empty">No se encontraron estudiantes.</p>
            )}
            {resultados.map((e) => (
              <button key={e.id} className="search-dropdown-item" onClick={() => seleccionarEstudiante(e)}>
                <span className="dropdown-name">{e.nombre_completo}</span>
                <span className="dropdown-meta">Cédula: {e.cedula} {e.correo ? `• ${e.correo}` : ""}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── SIN ESTUDIANTE: mensaje de estado vacío ── */}
      {sinEstudiante && (
        <div className="pagos-empty-state">
          <div className="pagos-empty-icon"><UserSearch size={48} /></div>
          <p className="pagos-empty-title">Busca un estudiante para ver su cartera</p>
          <p className="pagos-empty-sub">
            Escribe el nombre o cédula en el campo de búsqueda para ver las tarjetas de saldo,
            transacciones recientes y módulos inscritos.
          </p>
        </div>
      )}

      {/* ── CARGANDO ── */}
      {cargando && (
        <div className="pagos-empty-state">
          <p style={{ color: "#94a3b8", fontSize: 15 }}>Cargando información...</p>
        </div>
      )}

      {/* ── CON ESTUDIANTE ── */}
      {estudiante && cartera && !cargando && (
        <>
          {/* Chip del estudiante seleccionado */}
          <div className="estudiante-seleccionado">
            <div className="est-avatar">
              {estudiante.nombre_completo.trim().split(" ").filter(Boolean)
                .reduce((acc, p, i, arr) => i === 0 || i === arr.length - 1 ? acc + p[0] : acc, "")
                .toUpperCase()}
            </div>
            <div>
              <p className="est-nombre">{estudiante.nombre_completo}</p>
              <p className="est-meta">Cédula: {estudiante.cedula}{estudiante.correo ? ` • ${estudiante.correo}` : ""}</p>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Saldo Pendiente</span>
                <span className="stat-icon-wrap stat-icon-red"><Clock size={22} /></span>
              </div>
              <p className="stat-value">${cartera.totalDeuda.toLocaleString("es-CO")}</p>
              <p className="stat-sub">
                {cartera.totalDeuda === 0
                  ? "✓ Estudiante al día"
                  : `${cartera.lineas.filter(l => l.saldoPendiente > 0).length} módulo(s) con saldo`}
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Total Pagado</span>
                <span className="stat-icon-wrap stat-icon-green"><CheckCircle2 size={22} /></span>
              </div>
              <p className="stat-value">${cartera.totalPagado.toLocaleString("es-CO")}</p>
              <p className="stat-sub">{pagosRecientes.length} pago(s) registrado(s)</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Módulos Inscritos</span>
                <span className="stat-icon-wrap stat-icon-amber"><Tag size={22} /></span>
              </div>
              <p className="stat-value">{cartera.lineas.length}</p>
              <p className="stat-sub">
                {cartera.lineas.filter(l => l.saldoPendiente === 0).length} pagado(s) •{" "}
                {cartera.lineas.filter(l => l.saldoPendiente > 0).length} pendiente(s)
              </p>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="main-grid">

            {/* Transacciones recientes */}
            <div>
              <div className="section-header">
                <span className="section-title">Transacciones Recientes</span>
              </div>
              <div className="table-container">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Módulo</th>
                        <th>Método</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagosRecientes.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                            No hay pagos registrados aún.
                          </td>
                        </tr>
                      ) : (
                        pagosRecientes.map((t, i) => (
                          <tr key={i}>
                            <td className="td-date">{t.fecha}</td>
                            <td className="td-concept">{t.concepto}</td>
                            <td>{t.metodo}</td>
                            <td className="td-amount">${t.monto.toLocaleString("es-CO")}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Módulos inscritos */}
            <div>
              <div className="section-header">
                <span className="section-title">Módulos Inscritos</span>
              </div>
              <div className="modules-card">
                {cartera.lineas.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                    Sin módulos inscritos.
                  </p>
                ) : (
                  cartera.lineas.map((l) => (
                    <div className="module-item" key={l.inscripcionId}>
                      <div className={`module-icon ${l.saldoPendiente === 0 ? "mod-green" : "mod-amber"}`}>
                        <Wallet size={18} />
                      </div>
                      <div className="module-info">
                        <p className="module-name">{l.moduloCodigo} - {l.moduloNombre}</p>
                        <p className="module-sub">
                          Precio: ${l.precio.toLocaleString("es-CO")} •{" "}
                          {l.saldoPendiente === 0
                            ? "Al día"
                            : `Pendiente: $${l.saldoPendiente.toLocaleString("es-CO")}`}
                        </p>
                      </div>
                      <span className={`badge-modulo-estado ${l.saldoPendiente === 0 ? "badge-done" : "badge-pending"}`}>
                        {l.saldoPendiente === 0 ? "Pagado" : "Pendiente"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Modal pago */}
      {modalPago && (
        <ModalPago
          onClose={() => setModalPago(false)}
          onPagoRegistrado={handlePagoRegistrado}
        />
      )}
    </>
  );
}