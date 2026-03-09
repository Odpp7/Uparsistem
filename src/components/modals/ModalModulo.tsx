import { useState, useEffect } from "react";
import { crearModulo } from "../../services/moduloService";
import { obtenerProfesores } from "../../services/profesorService";
import { X, Fingerprint, Tag, Star, CalendarDays, User, FileText, Save, ChevronDown } from "lucide-react";
import "../../styles/modalModulo.css";

interface Props {
  onClose: () => void;
  onGuardar?: () => void;
}

export default function ModalModulo({ onClose, onGuardar }: Props) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("");
  const [horasTeoricas, setHorasTeoricas] = useState<number>(0);
  const [horasPracticas, setHorasPracticas] = useState<number>(0);
  const [precio, setPrecio] = useState<number>(0);
  const [descripcion, setDescripcion] = useState("");
  const [profesorId, setProfesorId] = useState<number | null>(null);

  const [profesores, setProfesores] = useState<any[]>([]);

  useEffect(() => {
    cargarProfesores();
  }, []);

  async function cargarProfesores() {
    const data = await obtenerProfesores();
    setProfesores(data);
  }

  async function handleGuardar() {
    if (!codigo || !nombre || !precio) {
      alert("Complete los campos obligatorios");
      return;
    }
    try {
      await crearModulo({
        codigo,
        nombre,
        duracion,
        horas_teoricas: horasTeoricas,
        horas_practicas: horasPracticas,
        precio,
        descripcion,
        profesor_id: profesorId
      });
      if (onGuardar) onGuardar();
    } catch (error) {
      alert("Error al guardar el módulo");
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">

        <div className="modal-header">
          <div>
            <h2 className="modal-header-title">Agregar Nuevo Módulo</h2>
            <p className="modal-header-sub">Ingrese los detalles para registrar un nuevo componente académico.</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">

            <div className="form-group">
              <label className="form-label">
                <Fingerprint size={15} className="form-label-icon" />
                Código del Módulo
              </label>
              <input className="form-input" placeholder="Ej: MOD-006" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Tag size={15} className="form-label-icon" />
                Nombre del Módulo
              </label>
              <input className="form-input" placeholder="Ej: Ingeniería de Software" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Star size={15} className="form-label-icon" />
                Duracion
              </label>
              <input className="form-input" placeholder="Ej: 1256" value={duracion} onChange={(e) => setDuracion(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <CalendarDays size={15} className="form-label-icon" />
                Horas Teoricas
              </label>
              <input className="form-input" placeholder="Ej: 40 horas" type="text" value={horasTeoricas} onChange={(e) => setHorasTeoricas(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <CalendarDays size={15} className="form-label-icon" />
                Horas Prácticas
              </label>
              <input className="form-input" placeholder="Ej: 40 horas" type="text" value={horasPracticas} onChange={(e) => setHorasPracticas(Number(e.target.value))} />
            </div>


            <div className="form-group">
              <label className="form-label">
                <CalendarDays size={15} className="form-label-icon" />
                Precio
              </label>
              <input className="form-input" placeholder="Ej: $200.000" type="text" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />
            </div>


            <div className="form-group full-width">
              <label className="form-label">
                <User size={15} className="form-label-icon" />
                Docente Asignado
              </label>
              <div className="select-wrap">
                <select
                  className="form-select"
                  value={profesorId ?? ""}
                  onChange={(e) =>
                    setProfesorId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Seleccionar docente</option>
                  {profesores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={15} className="form-label-icon" />
                Descripción del Módulo
              </label>
              <textarea
                className="form-textarea"
                placeholder="Breve resumen del contenido programático..."
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleGuardar}>
            <Save size={16} />
            Guardar Módulo
          </button>
        </div>

      </div>
    </div>
  );
}