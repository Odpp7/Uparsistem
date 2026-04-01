import { useState, useEffect } from "react";
import { Save, X, BookOpen } from "lucide-react";
import { actualizarModulo, obtenerProgramas, obtenerCiclosPorPrograma, ModuloConProfesor, Programa, Ciclo } from "../../services/moduloService";
import { obtenerProfesores, Profesor } from "../../services/profesorService";
import { validarModulo } from "../../utils/moduloValidacion";
import "../../styles/editModal.css";

interface Props {
  modulo: ModuloConProfesor | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

const DURACION_DEFAULT = "576 horas";
const HORAS_AULA_DEFAULT = 456;
const HORAS_IND_DEFAULT = 120;

export default function EditModulo({ modulo, onGuardado, onCancelar }: Props) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState(DURACION_DEFAULT);
  const [horasAula, setHorasAula] = useState(HORAS_AULA_DEFAULT);
  const [horasIndependiente, setHorasIndependiente] = useState(HORAS_IND_DEFAULT);
  const [creditos, setCreditos] = useState(1);
  const [precio, setPrecio] = useState("");
  const [profesorId, setProfesorId] = useState<number | null>(null);
  const [programaId, setProgramaId] = useState<number | null>(null);
  const [cicloId, setCicloId] = useState<number | null>(null);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    obtenerProfesores().then(setProfesores).catch(console.error);
    obtenerProgramas().then(setProgramas).catch(console.error);
  }, []);


  useEffect(() => {
    if (modulo) {
      setCodigo(modulo.codigo);
      setNombre(modulo.nombre);
      setDescripcion(modulo.descripcion ?? "");
      setDuracion(modulo.duracion ?? DURACION_DEFAULT);
      setHorasAula(modulo.horas_aula ?? HORAS_AULA_DEFAULT);
      setHorasIndependiente(modulo.horas_independiente ?? HORAS_IND_DEFAULT);
      setCreditos(modulo.creditos ?? 1);
      setPrecio(modulo.precio.toString());
      setProfesorId(modulo.profesor_id ?? null);
      setProgramaId(modulo.programa_id ?? null);
      setCicloId(modulo.ciclo_id ?? null);
      setError(null);
    } else {
      setCodigo(""); setNombre(""); setDescripcion("");
      setDuracion(DURACION_DEFAULT);
      setHorasAula(HORAS_AULA_DEFAULT);
      setHorasIndependiente(HORAS_IND_DEFAULT);
      setCreditos(1); setPrecio("");
      setProfesorId(null); setProgramaId(null); setCicloId(null);
    }
  }, [modulo]);


  useEffect(() => {
    if (!programaId) { setCiclos([]); return; }
    obtenerCiclosPorPrograma(programaId).then(setCiclos).catch(console.error);
  }, [programaId]);


  async function handleGuardar() {
    if (!modulo) return;
    setError(null);

    const err = validarModulo({
      codigo,
      nombre,
      duracion,
      horas_aula: horasAula,
      horas_independiente: horasIndependiente,
      creditos,
      precio: parseFloat(precio),
      programa_id: programaId,
      ciclo_id: cicloId,
    });
    if (err) { setError(err); return; }

    try {
      await actualizarModulo(modulo.id!, {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || "",
        duracion: duracion.trim() || DURACION_DEFAULT,
        horas_aula: horasAula,
        horas_independiente: horasIndependiente,
        creditos,
        precio: parseFloat(precio),
        profesor_id: profesorId,
        programa_id: programaId,
        ciclo_id: cicloId,
      });
      onGuardado();
    } catch {
      setError("Error al guardar. Verifica que el código no esté duplicado.");
    }
  }

  if (!modulo) {
    return (
      <div className="edit-mod-panel empty">
        <div className="edit-mod-empty-icon"><BookOpen size={40} /></div>
        <p className="edit-mod-empty-title">Selecciona un módulo</p>
        <p className="edit-mod-empty-sub">
          Haz clic en el botón editar de cualquier módulo para modificar su información.
        </p>
      </div>
    );
  }

  return (
    <div className="edit-mod-panel">

      <div className="edit-mod-header">
        <div>
          <span className="edit-mod-label">Editar Módulo</span>
          <p className="edit-mod-codigo">{modulo.codigo}</p>
        </div>
        <button className="edit-mod-close" onClick={onCancelar}><X size={18} /></button>
      </div>

      <div className="edit-mod-title-wrap">
        <div className="edit-mod-icon"><BookOpen size={22} /></div>
        <div>
          <p className="edit-mod-name">{nombre || modulo.nombre}</p>
          <p className="edit-mod-since">
            Creado: {new Date(modulo.fecha_creacion ?? "").toLocaleDateString("es-CO")}
          </p>
        </div>
      </div>

      <div className="edit-mod-form">

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Código</label>
          <input className="edit-mod-input" type="text" value={codigo}
            onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: FM-101" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Créditos</label>
          <input className="edit-mod-input" type="number"
            placeholder="Ej: 1"
            min={1}
            value={creditos === 0 ? "" : creditos}
            onChange={(e) => setCreditos(Number(e.target.value))} />
        </div>

        <div className="edit-mod-field" style={{ gridColumn: "1 / -1" }}>
          <label className="edit-mod-field-label">Nombre del Módulo</label>
          <input className="edit-mod-input" type="text" value={nombre}
            onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del módulo" />
        </div>

        <div className="edit-mod-field" style={{ gridColumn: "1 / -1" }}>
          <label className="edit-mod-field-label">Programa Académico</label>
          <select className="edit-mod-input" value={programaId ?? ""}
            onChange={(e) => { setProgramaId(e.target.value ? Number(e.target.value) : null); setCicloId(null); }}>
            <option value="">— Seleccionar programa —</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="edit-mod-field" style={{ gridColumn: "1 / -1" }}>
          <label className="edit-mod-field-label">Ciclo</label>
          <select className="edit-mod-input" value={cicloId ?? ""}
            onChange={(e) => setCicloId(e.target.value ? Number(e.target.value) : null)}
            disabled={!programaId}>
            <option value="">— Seleccionar ciclo —</option>
            {ciclos.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="edit-mod-field" style={{ gridColumn: "1 / -1" }}>
          <label className="edit-mod-field-label">Duración total</label>
          <input className="edit-mod-input" type="text" value={duracion}
            onChange={(e) => setDuracion(e.target.value)} placeholder="576 horas" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Horas en aula con tutor (80%)</label>
          <input className="edit-mod-input" type="number" value={horasAula}
            onChange={(e) => setHorasAula(Number(e.target.value))} min="0" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Horas trabajo independiente (20%)</label>
          <input className="edit-mod-input" type="number" value={horasIndependiente}
            onChange={(e) => setHorasIndependiente(Number(e.target.value))} min="0" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Precio ($)</label>
          <input className="edit-mod-input" type="number" value={precio}
            onChange={(e) => setPrecio(e.target.value)} placeholder="0" min="0" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Instructor</label>
          <select className="edit-mod-input" value={profesorId ?? ""}
            onChange={(e) => setProfesorId(e.target.value ? parseInt(e.target.value) : null)}>
            <option value="">Sin asignar</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div className="edit-mod-field" style={{ gridColumn: "1 / -1" }}>
          <label className="edit-mod-field-label">Descripción</label>
          <textarea className="edit-mod-textarea" value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del módulo..." rows={3} />
        </div>

        {error && <p className="edit-mod-error">{error}</p>}

        <div className="edit-mod-actions">
          <button className="edit-mod-btn-cancel" onClick={onCancelar}>Cancelar</button>
          <button className="edit-mod-btn-save" onClick={handleGuardar}>
            <Save size={15} /> Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
}