import { useState, useEffect } from "react";
import { X, Search, Wallet, Tag, CreditCard, Landmark, Banknote, CheckCircle, AlertCircle } from "lucide-react";
import { buscarEstudiantes, Estudiante } from "../../services/estudianteService";
import { obtenerCarteraEstudiante, CarteraEstudiante } from "../../services/pagoService";
import { registrarPagoGlobal } from "../../services/pagoService";
import '../../styles/modalPagos.css';

interface Props {
  onClose: () => void;
  onPagoRegistrado?: () => void;
}

export default function ModalPago({ onClose, onPagoRegistrado }: Props) {
  // Búsqueda de estudiante
  const [query, setQuery]               = useState("");
  const [resultados, setResultados]     = useState<Estudiante[]>([]);
  const [buscando, setBuscando]         = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Estudiante seleccionado
  const [estudiante, setEstudiante]   = useState<Estudiante | null>(null);
  const [cartera, setCartera]         = useState<CarteraEstudiante | null>(null);
  const [cargandoCartera, setCargandoCartera] = useState(false);

  // Formulario de pago
  const [monto, setMonto]           = useState("");
  const [descuento, setDescuento]   = useState("");
  const [metodo, setMetodo]         = useState("Efectivo");
  const [observaciones, setObs]     = useState("");

  // Estado
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [exito, setExito]           = useState(false);

  // Buscar estudiantes con debounce
  useEffect(() => {
    if (query.trim().length < 2) { setResultados([]); setShowDropdown(false); return; }
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarEstudiantes(query);
        setResultados(data);
        setShowDropdown(true);
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function seleccionarEstudiante(e: Estudiante) {
    setEstudiante(e);
    setQuery(e.nombre_completo);
    setShowDropdown(false);
    setCartera(null);
    setMonto("");
    setDescuento("");
    setError(null);

    setCargandoCartera(true);
    try {
      const c = await obtenerCarteraEstudiante(e.id);
      setCartera(c);
      // Pre-llenar con el total pendiente
      setMonto(c.totalDeuda.toFixed(0));
      console.log("Estudiante seleccionado:", e.id);

    } finally {
      setCargandoCartera(false);
    }
  }

  // Cálculos en tiempo real
  const montoNum     = parseFloat(monto)    || 0;
  const descuentoNum = parseFloat(descuento) || 0;
  const totalFinal   = Math.max(0, montoNum - descuentoNum);
  const saldoTras    = cartera ? Math.max(0, cartera.totalDeuda - totalFinal) : 0;

  async function handleRegistrar() {
    if (!estudiante || !cartera) return;
    if (montoNum <= 0) { setError("Ingresa un monto válido."); return; }
    if (totalFinal > cartera.totalDeuda) {
      setError(`El pago ($${totalFinal.toLocaleString("es-CO")}) supera la deuda ($${cartera.totalDeuda.toLocaleString("es-CO")}).`);
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await registrarPagoGlobal({
        estudianteId: estudiante.id,
        montoTotal: montoNum,
        descuento: descuentoNum,
        metodoPago: metodo,
        observaciones,
      });
      setExito(true);
      // Refrescar cartera
      const c = await obtenerCarteraEstudiante(estudiante.id);
      setCartera(c);
      setMonto("");
      setDescuento("");
      onPagoRegistrado?.();
      setTimeout(() => setExito(false), 3000);
    } catch (e) {
      setError("Error al registrar el pago. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2 className="modal-header-title">Registrar Pago</h2>
            <p className="modal-header-sub">Uparsistem - University Management</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        {/* BODY */}
        <div className="modal-body">

          {/* Búsqueda de estudiante */}
          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">Buscar Estudiante</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Search size={16} /></span>
              <input
                className="form-input"
                placeholder="Nombre o cédula..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setEstudiante(null); setCartera(null); }}
                onFocus={() => resultados.length > 0 && setShowDropdown(true)}
              />
              {buscando && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8" }}>Buscando...</span>}
            </div>

            {/* Dropdown resultados */}
            {showDropdown && resultados.length > 0 && (
              <div className="search-dropdown">
                {resultados.map((e) => (
                  <button key={e.id} className="search-dropdown-item" onClick={() => seleccionarEstudiante(e)}>
                    <span className="dropdown-name">{e.nombre_completo}</span>
                    <span className="dropdown-meta">Cédula: {e.cedula}</span>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && resultados.length === 0 && !buscando && (
              <div className="search-dropdown">
                <p className="dropdown-empty">No se encontraron estudiantes.</p>
              </div>
            )}
          </div>

          {/* Si hay estudiante seleccionado */}
          {cargandoCartera && <p style={{ color: "#94a3b8", fontSize: 13 }}>Cargando cartera...</p>}

          {cartera && !cargandoCartera && (
            <>
              {/* Desglose de módulos */}
              {cartera.lineas.length === 0 ? (
                <div className="empty-cartera">
                  <AlertCircle size={20} />
                  <span>Este estudiante no tiene módulos inscritos o ya está al día.</span>
                </div>
              ) : (
                <>
                  {/* Balance cards */}
                  <div className="balance-grid">
                    <div className="balance-card">
                      <div>
                        <p className="balance-label">Saldo Pendiente</p>
                        <p className="balance-amount">${cartera.totalDeuda.toLocaleString("es-CO")}</p>
                      </div>
                      <div className="balance-icon balance-icon-red"><Wallet size={22} /></div>
                    </div>
                    <div className="balance-card">
                      <div>
                        <p className="balance-label">Total Pagado</p>
                        <p className="balance-amount paid">${cartera.totalPagado.toLocaleString("es-CO")}</p>
                      </div>
                      <div className="balance-icon balance-icon-green"><CheckCircle size={22} /></div>
                    </div>
                  </div>

                  {/* Tabla de módulos */}
                  <div className="modulos-deuda-table">
                    <p className="modulos-deuda-title">Detalle por módulo</p>
                    {cartera.lineas.map((l) => (
                      <div className="modulo-deuda-row" key={l.inscripcionId}>
                        <div>
                          <p className="modulo-deuda-nombre">{l.moduloCodigo} - {l.moduloNombre}</p>
                          <p className="modulo-deuda-meta">Precio: ${l.precio.toLocaleString("es-CO")} • Pagado: ${l.totalPagado.toLocaleString("es-CO")}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p className={`modulo-deuda-saldo ${l.saldoPendiente === 0 ? "saldo-cero" : "saldo-pendiente"}`}>
                            {l.saldoPendiente === 0 ? "✓ Al día" : `$${l.saldoPendiente.toLocaleString("es-CO")}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Solo mostrar formulario si hay deuda */}
                  {cartera.totalDeuda > 0 && (
                    <>
                      {/* Monto y descuento */}
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Monto del Pago</label>
                          <div className="form-input-wrap">
                            <span className="form-prefix">$</span>
                            <input
                              className="form-input with-prefix"
                              placeholder="0"
                              type="number"
                              min="0"
                              max={cartera.totalDeuda}
                              value={monto}
                              onChange={(e) => setMonto(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Descuento ($)</label>
                          <div className="form-input-wrap">
                            <span className="form-input-icon"><Tag size={16} /></span>
                            <input
                              className="form-input"
                              placeholder="0"
                              type="number"
                              min="0"
                              value={descuento}
                              onChange={(e) => setDescuento(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Método de pago */}
                      <div className="form-group">
                        <label className="form-label">Método de Pago</label>
                        <div className="method-grid">
                          {[
                            { label: "Efectivo",      icon: <Banknote size={22} />,  value: "Efectivo"      },
                            { label: "Tarjeta",       icon: <CreditCard size={22} />, value: "Tarjeta"      },
                            { label: "Transferencia", icon: <Landmark size={22} />,  value: "Transferencia" },
                          ].map((m) => (
                            <label key={m.value} className={`method-option ${metodo === m.value ? "selected" : ""}`}>
                              <input type="radio" name="metodo" checked={metodo === m.value} onChange={() => setMetodo(m.value)} />
                              <div className="method-card">
                                <span className="method-icon">{m.icon}</span>
                                <span className="method-label">{m.label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Resumen */}
                      <div className="summary-box">
                        <div className="summary-row">
                          <span>Monto ingresado</span>
                          <span>${montoNum.toLocaleString("es-CO")}</span>
                        </div>
                        <div className="summary-row discount">
                          <span>Descuento aplicado</span>
                          <span>- ${descuentoNum.toLocaleString("es-CO")}</span>
                        </div>
                        <hr className="summary-divider" />
                        <div className="summary-total">
                          <span className="summary-total-label">Total a registrar</span>
                          <span className="summary-total-value">${totalFinal.toLocaleString("es-CO")}</span>
                        </div>
                        <div className="summary-row" style={{ marginTop: 6 }}>
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>Saldo tras el pago</span>
                          <span style={{ fontSize: 12, color: saldoTras === 0 ? "#15803d" : "#c2410c", fontWeight: 600 }}>
                            ${saldoTras.toLocaleString("es-CO")}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertCircle size={14} /> {error}
                </p>
              )}
              {exito && (
                <p style={{ color: "#15803d", fontSize: 13, marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                  <CheckCircle size={14} /> Pago registrado exitosamente.
                </p>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="btn-save"
            onClick={handleRegistrar}
            disabled={!estudiante || !cartera || cartera.totalDeuda === 0 || guardando || totalFinal <= 0}
          >
            <CheckCircle size={16} />
            {guardando ? "Registrando..." : "Registrar Pago"}
          </button>
        </div>
      </div>
    </div>
  );
}