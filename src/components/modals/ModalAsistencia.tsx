import { useState,RefObject  } from "react"
import { CalendarDays, X } from "lucide-react"
import { ModuloConProfesor } from "../../services/moduloService"
import { generarAsistenciaPDF } from "../../utils/AsistenciaPDF"
import { Toast } from "primereact/toast";

interface Props {
    modulo: ModuloConProfesor
    onClose: () => void
     toast: RefObject<Toast | null> 
}

export default function ModalAsistencia({ modulo, onClose, toast }: Props) {
    const hoy = new Date().toISOString().split("T")[0]
    const [fecha, setFecha] = useState(hoy)
    const [filas, setFilas] = useState(20)
    const [error, setError] = useState("")

    async function handleGenerar() {
        try {
            if (!fecha) {
                setError("Por favor, selecciona una fecha para la clase.")
                return
            }

            await generarAsistenciaPDF(modulo, fecha, filas);
            onClose();
            toast.current?.show({
                severity: "success",
                summary: "Planilla generada",
                detail: "La planilla de asistencia se ha generado correctamente en la carpeta descargas.",
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo generar la planilla de asistencia.",
                life: 3000
            });
        }
    }

    return (
        <>
            <div className="modal-overlay" style={{}} onClick={onClose}>
                <div style={{ backgroundColor: "white", borderRadius: "20px" }} onClick={(e) => e.stopPropagation()} >
                    <div className="modal-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <CalendarDays size={20} color="#1B2B4B" />
                            <div>
                                <h2 className="modal-title" style={{ margin: 0 }}>Planilla de Asistencia</h2>
                                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                                    {modulo.codigo} — {modulo.nombre}
                                </p>
                            </div>
                        </div>
                        <button className="modal-close" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

                        <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
                            Selecciona la fecha y cuántas filas necesitas. Se generará una planilla en blanco lista para imprimir.
                        </p>

                        <div className="form-group">
                            <label className="form-label">Fecha de la clase</label>
                            <input
                                type="date"
                                className="form-input"
                                value={fecha}
                                onChange={(e) => { setFecha(e.target.value); setError("") }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Número de filas en blanco</label>
                            <input
                                type="number"
                                className="form-input"
                                min={5}
                                max={50}
                                value={filas}
                                onChange={(e) => setFilas(Number(e.target.value))}
                            />
                            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                                Mínimo 5, máximo 50 filas
                            </p>
                        </div>

                        {error && (
                            <p style={{ fontSize: 12, color: "#9B2335", margin: 0 }}>{error}</p>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button className="btn-primary" onClick={handleGenerar}>
                            Generar Planilla PDF
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}