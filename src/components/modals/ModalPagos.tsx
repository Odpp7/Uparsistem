import { useState, useEffect } from "react";
import { X, Wallet, CheckCircle, AlertCircle, Banknote, CreditCard, Landmark } from "lucide-react";
import { validarPago } from "../../utils/pagoValidacion";
import { Estudiante } from "../../services/estudianteService";
import { obtenerCarteraEstudiante, registrarPagoModulo, actualizarDescuento, CarteraEstudiante } from "../../services/pagoService";
import "../../styles/modalPagos.css";

interface Props {
  estudiante: Estudiante
  onClose: () => void
  onPagoRegistrado?: () => void
}

export default function ModalPago({ estudiante, onClose, onPagoRegistrado }: Props) {

  const [cartera, setCartera] = useState<CarteraEstudiante | null>(null)
  const [seleccionados, setSeleccionados] = useState<Record<number, boolean>>({})
  const [descuentos, setDescuentos] = useState<Record<number, string>>({})
  const [montos, setMontos] = useState<Record<number, string>>({})
  const [metodo, setMetodo] = useState("Efectivo")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarCartera()
  }, [estudiante])

  async function cargarCartera() {
    const data = await obtenerCarteraEstudiante(estudiante.id)
    setCartera(data)
    const sel: Record<number, boolean> = {}
    const desc: Record<number, string> = {}
    const mont: Record<number, string> = {}

    data.lineas.forEach(l => {
      sel[l.inscripcionId] = false
      desc[l.inscripcionId] = String(l.descuento)
      const precioFinal = l.precio - (l.precio * l.descuento / 100)
      const pendiente = precioFinal - l.totalPagado
      mont[l.inscripcionId] = String(pendiente)
    })

    setSeleccionados(sel)
    setDescuentos(desc)
    setMontos(mont)
  }


  function toggleSeleccionado(id: number) {
    setSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }


  function handleDescuento(id: number, value: string) {
    setDescuentos(prev => ({
      ...prev,
      [id]: value
    }))
  }


  function handleMonto(id: number, value: string) {
    setMontos(prev => ({
      ...prev,
      [id]: value
    }))
  }


  const subtotal = cartera ? cartera.lineas.reduce((acc, l) => {
    if (!seleccionados[l.inscripcionId]) return acc
    const monto = parseFloat(montos[l.inscripcionId] || "0")
    return acc + monto
  }, 0) : 0


  async function handleRegistrar() {
    if (!cartera) return
    setError(null)

    try {
      let haySeleccionado = false
      for (const l of cartera.lineas) {

        if (!seleccionados[l.inscripcionId]) continue
        haySeleccionado = true
        const monto = parseFloat(montos[l.inscripcionId] || "0")
        const descuento = parseFloat(descuentos[l.inscripcionId] || "0")
        const precioFinal = l.precio - (l.precio * descuento / 100)
        const saldoPendiente = Math.max(0, precioFinal - l.totalPagado)
        const errorValidacion = validarPago({
          inscripcionId: l.inscripcionId,
          monto,
          saldoPendiente,
          descuento
        })

        if (errorValidacion) {
          setError(errorValidacion)
          return
        }

        if (descuento !== l.descuento) {
          await actualizarDescuento(l.inscripcionId, descuento)
        }

        await registrarPagoModulo(l.inscripcionId, monto, metodo)
      }

      if (!haySeleccionado) {
        setError("Debe seleccionar al menos un módulo para registrar el pago")
        return
      }

      await cargarCartera()
      onPagoRegistrado?.()
    }
    catch (err) {
      console.error(err)
      setError("Error al registrar el pago")
    }
  }


  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }


  return (
    <div className="mp-overlay" onClick={handleOverlayClick}>
      <div className="mp-box">

        <div className="mp-header">
          <div>
            <h2 className="mp-header-title">Registrar Pago</h2>
            <p className="mp-header-sub">
              <span className="mp-header-total">
                Total a Pagar: <span>${subtotal.toLocaleString("es-CO")}</span>
              </span>
            </p>
          </div>
          <button className="mp-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mp-body">
          {cartera && (
            <div className="mp-balance-grid">

              <div className="mp-balance-card">
                <div className="mp-balance-icon amber">
                  <Wallet size={22} />
                </div>
                <div>
                  <p className="mp-balance-label">Saldo Pendiente</p>
                  <p className="mp-balance-amount">
                    ${cartera.totalDeuda.toLocaleString("es-CO")}
                  </p>
                </div>
              </div>

              <div className="mp-balance-card">
                <div className="mp-balance-icon green">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <p className="mp-balance-label">Total Pagado</p>
                  <p className="mp-balance-amount">
                    ${cartera.totalPagado.toLocaleString("es-CO")}
                  </p>
                </div>
              </div>

            </div>
          )}

          {cartera && cartera.lineas.length > 0 && (

            <div>
              <p className="mp-section-label">
                Seleccionar Módulos a Pagar
              </p>
              <div className="mp-table-wrap">
                <table className="mp-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Módulo</th>
                      <th>Costo</th>
                      <th>Desc %</th>
                      <th>Monto a Pagar</th>
                      <th>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>

                    {cartera.lineas.map(l => {
                      const isSel = seleccionados[l.inscripcionId]
                      const descuentoActual = parseFloat(descuentos[l.inscripcionId] || "0")
                      const precioFinal = l.precio - (l.precio * descuentoActual / 100)
                      const pendiente = Math.max(0, precioFinal - l.totalPagado)

                      return (
                        <tr key={l.inscripcionId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSel}
                              disabled={pendiente === 0}
                              onChange={() => toggleSeleccionado(l.inscripcionId)}
                            />
                          </td>
                          
                          <td className="module-name">
                            {l.moduloCodigo} - {l.moduloNombre}
                            <div style={{ fontSize: "12px", opacity: 0.7 }}>
                              {l.intento === 1 ? "Primer intento" : `Intento ${l.intento} • Recursado`}
                            </div>
                          </td>

                          <td> ${l.precio.toLocaleString("es-CO")} </td>
                          <td>
                            <input
                              className="mp-table-input"
                              type="number"
                              value={descuentos[l.inscripcionId]}
                              disabled={!isSel}
                              onChange={(e) => handleDescuento(l.inscripcionId, e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="mp-table-input"
                              type="number"
                              value={montos[l.inscripcionId]}
                              disabled={!isSel}
                              onChange={(e) => handleMonto(l.inscripcionId, e.target.value)}
                            />
                          </td>
                          <td className="net-price"> ${pendiente.toLocaleString("es-CO")} </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <p className="mp-section-label">
              Método de Pago
            </p>
            <div className="mp-method-grid">

              {[
                { label: "Efectivo", icon: <Banknote size={22} />, value: "Efectivo" },
                { label: "Tarjeta", icon: <CreditCard size={22} />, value: "Tarjeta" },
                { label: "Transferencia", icon: <Landmark size={22} />, value: "Transferencia" }
              ].map(m => (

                <label key={m.value} className="mp-method-option">

                  <input type="radio" name="metodo" checked={metodo === m.value} onChange={() => setMetodo(m.value)} />

                  <div className="mp-method-card">
                    <span className="mp-method-icon">{m.icon}</span>
                    <span className="mp-method-label">{m.label}</span>
                  </div>

                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="mp-alert error">
              <AlertCircle size={14} /> {error}
            </p>
          )}

        </div>

        <div className="mp-footer">
          <button className="mp-btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="mp-btn-register" onClick={handleRegistrar} disabled={subtotal <= 0}>
            <CheckCircle size={18} />
            Registrar Pago
          </button>
        </div>

      </div>
    </div>
  )
}
