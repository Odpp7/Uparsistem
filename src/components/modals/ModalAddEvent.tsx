import { useState } from "react";
import { X, CalendarDays, Clock, Plus, GraduationCap, Users, Building } from "lucide-react";
import { crearEvento } from "../../services/eventService";
import { validarEvento } from "../../utils/eventoValidacion";
import "../../styles/modalAddEvent.css";

interface Props {
  onClose: () => void;
  onGuardado: () => void;
}

const CATEGORIAS = [
  { value: "ACADEMICO", label: "Académico", icon: <GraduationCap size={16} /> },
  { value: "ADMINISTRATIVO", label: "Administrativo", icon: <Building size={16} /> },
  { value: "SOCIAL", label: "Social", icon: <Users size={16} /> },
];

export default function ModalAddEvent({ onClose, onGuardado }: Props) {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [categoria, setCategoria] = useState("ACADEMICO");
  const [descripcion, setDescripcion] = useState("");
  const [lugar, setLugar] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {

    setError(null);

    const errorValidacion = validarEvento({
      nombre,
      fecha,
      hora,
      categoria,
      descripcion,
      lugar
    });

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      await crearEvento({
        nombre: nombre.trim(),
        fecha,
        hora: hora || null,
        categoria,
        descripcion: descripcion.trim() || null,
        lugar: lugar.trim() || null,
      });
      onGuardado();
      onClose();
    } catch (e) {
      setError("Error al guardar el evento.");
    }
  }

  return (
    <div className="mae-overlay">
      <div className="mae-box">

        <div className="mae-header">
          <div>
            <h3 className="mae-title">Crear Evento</h3>
            <p className="mae-subtitle">Programa una nueva actividad institucional</p>
          </div>
          <button className="mae-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="mae-body">
          <div className="mae-field">
            <label className="mae-label">Nombre del Evento</label>
            <input
              className="mae-input"
              type="text"
              placeholder="Ej: Simposio Anual de Docentes"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="mae-row">
            <div className="mae-field">
              <label className="mae-label">Fecha</label>
              <div className="mae-input-wrap">
                <CalendarDays size={16} className="mae-icon" />
                <input
                  className="mae-input has-icon"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>
            <div className="mae-field">
              <label className="mae-label">Hora</label>
              <div className="mae-input-wrap">
                <Clock size={16} className="mae-icon" />
                <input
                  className="mae-input has-icon"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mae-field">
            <label className="mae-label">Categoría</label>
            <div className="mae-cat-grid">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`mae-cat-btn ${categoria === c.value ? "active" : ""}`}
                  onClick={() => setCategoria(c.value)}
                >
                  <span className="mae-cat-icon">{c.icon}</span>
                  <span className="mae-cat-label">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mae-field">
            <label className="mae-label">Lugar <span className="mae-optional">(opcional)</span></label>
            <input
              className="mae-input"
              type="text"
              placeholder="Ej: Auditorio Principal"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
            />
          </div>

          <div className="mae-field">
            <label className="mae-label">Descripción</label>
            <textarea
              className="mae-textarea"
              placeholder="Describe brevemente el propósito del evento..."
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {error && <p className="mae-error">{error}</p>}
        </div>

        <div className="mae-footer">
          <button className="mae-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="mae-btn-save" onClick={handleGuardar}> <Plus size={16} /> Crear Evento </button>
        </div>

      </div>
    </div>
  );
}