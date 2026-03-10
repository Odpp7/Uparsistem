import { useState, useEffect } from "react";
import { Save, X, BookOpen } from "lucide-react";
import { actualizarModulo, Modulo } from "../../services/moduloService";
import { obtenerProfesores, Profesor } from "../../services/profesorService";
import "../../styles/editModal.css";

interface Props {
  modulo: Modulo | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function EditModulo({ modulo, onGuardado, onCancelar }: Props) {
  const [codigo, setCodigo]           = useState("");
  const [nombre, setNombre]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion]       = useState("");
  const [horasTeo, setHorasTeo]       = useState("");
  const [horasPrac, setHorasPrac]     = useState("");
  const [precio, setPrecio]           = useState("");
  const [profesorId, setProfesorId]   = useState<number | null>(null);
  const [profesores, setProfesores]   = useState<Profesor[]>([]);
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState<string | null>(null);


  useEffect(() => { obtenerProfesores().then(setProfesores).catch(console.error) }, []);

  useEffect(() => {
    if (modulo) {
      setCodigo(modulo.codigo);
      setNombre(modulo.nombre);
      setDescripcion(modulo.descripcion ?? "");
      setDuracion(modulo.duracion ?? "");
      setHorasTeo(modulo.horas_teoricas?.toString() ?? "");
      setHorasPrac(modulo.horas_practicas?.toString() ?? "");
      setPrecio(modulo.precio.toString());
      setProfesorId(modulo.profesor_id ?? null);
      setError(null);
    } else {
      setCodigo(""); setNombre(""); setDescripcion("");
      setDuracion(""); setHorasTeo(""); setHorasPrac("");
      setPrecio(""); setProfesorId(null);
    }
  }, [modulo]);

  async function handleGuardar() {
    if (!modulo) return;
    if (!codigo.trim() || !nombre.trim() || !precio) {
      setError("Codigo, nombre y precio son obligatorios.");
      return;
    }
    if (isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
      setError("El precio debe ser un numero valido.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await actualizarModulo(modulo.id!, {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || "",
        duracion: duracion.trim() || "",
        horas_teoricas: parseInt(horasTeo) || 0,
        horas_practicas: parseInt(horasPrac) || 0,
        precio: parseFloat(precio),
        profesor_id: profesorId,
      });
      onGuardado();
    } catch (e) {
      setError("Error al guardar. Verifica que el codigo no este duplicado.");
    } finally {
      setGuardando(false);
    }
  }

  if (!modulo) {
    return (
      <div className="edit-mod-panel empty">
        <div className="edit-mod-empty-icon"><BookOpen size={40} /></div>
        <p className="edit-mod-empty-title">Selecciona un módulo</p>
        <p className="edit-mod-empty-sub">Haz clic en el botón editar de cualquier módulo para modificar su información.</p>
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
            onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: MOD-001" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Nombre del Módulo</label>
          <input className="edit-mod-input" type="text" value={nombre}
            onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del módulo" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Duración</label>
          <input className="edit-mod-input" type="text" value={duracion}
            onChange={(e) => setDuracion(e.target.value)} placeholder="Ej: 3 meses" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Precio ($)</label>
          <input className="edit-mod-input" type="number" value={precio}
            onChange={(e) => setPrecio(e.target.value)} placeholder="0" min="0" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Horas Teóricas</label>
          <input className="edit-mod-input" type="number" value={horasTeo}
            onChange={(e) => setHorasTeo(e.target.value)} placeholder="0" min="0" />
        </div>

        <div className="edit-mod-field">
          <label className="edit-mod-field-label">Horas Prácticas</label>
          <input className="edit-mod-input" type="number" value={horasPrac}
            onChange={(e) => setHorasPrac(e.target.value)} placeholder="0" min="0" />
        </div>

        <div className="edit-mod-field" style={{ gridColumn: "1 / -1" }}>
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
          <button className="edit-mod-btn-save" onClick={handleGuardar} disabled={guardando}>
            <Save size={15} />
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}