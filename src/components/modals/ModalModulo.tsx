import { useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { crearModulo, obtenerProgramas, obtenerCiclosPorPrograma, Programa, Ciclo } from "../../services/moduloService";
import { obtenerProfesores } from "../../services/profesorService";
import { validarModulo } from "../../utils/moduloValidacion";
import "../../styles/modalModulo.css";

interface Props {
  onClose: () => void;
  onGuardar?: () => void;
}

const DURACION_DEFAULT = "576 horas";
const HORAS_AULA_DEFAULT = 456;
const HORAS_IND_DEFAULT = 120;

export default function ModalModulo({ onClose, onGuardar }: Props) {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState(DURACION_DEFAULT);
  const [horasAula, setHorasAula] = useState(HORAS_AULA_DEFAULT);
  const [horasIndependiente, setHorasIndependiente] = useState(HORAS_IND_DEFAULT);
  const [creditos, setCreditos] = useState<number | "">("");
  const [precio, setPrecio] = useState<number | "">("");
  const [profesorId, setProfesorId] = useState<number | null>(null);
  const [programaId, setProgramaId] = useState<number | null>(null);
  const [cicloId, setCicloId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerProgramas().then(setProgramas);
    obtenerProfesores().then(setProfesores);
  }, [])
  

  useEffect(() => {
    setCicloId(null);
    setCiclos([]);
    if (programaId) obtenerCiclosPorPrograma(programaId).then(setCiclos);
  }, [programaId])


  async function handleGuardar() {
    setError(null);
    
    const err = validarModulo({
      codigo,
      nombre,
      duracion,
      horas_aula: horasAula,
      horas_independiente: horasIndependiente,
      creditos: Number(creditos),
      precio: Number(precio),
      programa_id: programaId,
      ciclo_id: cicloId,
    });
    if (err) { setError(err); return; }

    try {
      await crearModulo({
        codigo,
        nombre,
        descripcion,
        duracion,
        horas_aula: horasAula,
        horas_independiente: horasIndependiente,
        creditos: Number(creditos),
        precio: Number(precio),
        profesor_id: profesorId,
        programa_id: programaId,
        ciclo_id: cicloId,
      });
      if (onGuardar) onGuardar();
    } catch (err: any) {
      if (err.message === "CODIGO_DUPLICADO") {
        setError("El código del módulo ya está registrado.");
      } else {
        setError("Error al guardar el módulo.");
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon"><BookOpen size={20} /></div>
            <div>
              <p className="modal-header-title">Nuevo Módulo</p>
              <p className="modal-header-sub">Complete los datos del módulo educativo</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <p className="form-section-title">Programa Académico</p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Programa <span className="required">*</span></label>
                <select className="form-select" value={programaId ?? ""}
                  onChange={(e) => setProgramaId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">— Seleccionar programa —</option>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ciclo <span className="required">*</span></label>
                <select className="form-select" value={cicloId ?? ""}
                  onChange={(e) => setCicloId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!programaId}>
                  <option value="">— Seleccionar ciclo —</option>
                  {ciclos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section-modulo">
            <p className="form-section-title">Datos del Módulo</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código <span className="required">*</span></label>
                <input className="form-input" placeholder="Ej: FM-101" autoComplete="off"
                  value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Créditos <span className="required">*</span></label>
                <input className="form-input" type="number" placeholder="Ej: 1" min={1} autoComplete="off"
                  value={creditos}
                  onChange={(e) => setCreditos(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Módulo <span className="required">*</span></label>
              <input className="form-input" autoComplete="off"
                placeholder="Ej: Fundamentos Bíblicos de la Teología Pastoral"
                value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" rows={2} autoComplete="off"
                placeholder="Descripción opcional del módulo..."
                value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-title">Horas del Programa</p>

            <div className="form-row three-col">
              <div className="form-group">
                <label className="form-label">Duración total</label>
                <input className="form-input" autoComplete="off"
                  value={duracion} onChange={(e) => setDuracion(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Horas en aula con tutor (80%)</label>
                <input className="form-input" type="number" autoComplete="off"
                  value={horasAula} onChange={(e) => setHorasAula(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Horas independiente (20%)</label>
                <input className="form-input" type="number" autoComplete="off"
                  value={horasIndependiente} onChange={(e) => setHorasIndependiente(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-title">Precio e Instructor</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Precio (COP) <span className="required">*</span></label>
                <input className="form-input" type="number" placeholder="0" autoComplete="off"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Instructor</label>
                <select className="form-select" value={profesorId ?? ""}
                  onChange={(e) => setProfesorId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">— Sin asignar —</option>
                  {profesores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleGuardar}> Guardar Módulo </button>
        </div>

      </div>
    </div>
  );
}