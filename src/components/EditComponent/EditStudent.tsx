import { useState, useEffect } from "react";
import { Save, X, User } from "lucide-react";
import { Estudiante, actualizarEstudiante } from "../../services/estudianteService";
import "../../styles/editStudent.css";

interface Props {
  estudiante: Estudiante | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function EditStudent({ estudiante, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre]     = useState("");
  const [cedula, setCedula]     = useState("");
  const [correo, setCorreo]     = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (estudiante) {
      setNombre(estudiante.nombre_completo);
      setCedula(estudiante.cedula);
      setCorreo(estudiante.correo ?? "");
      setTelefono(estudiante.telefono ?? "");
      setError(null);
    } else {
      setNombre("");
      setCedula("");
      setCorreo("");
      setTelefono("");
    }
  }, [estudiante]);

  function obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(" ").filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  async function handleGuardar() {
    if (!estudiante) return;
    if (!nombre.trim() || !cedula.trim()) {
      setError("Nombre y cédula son obligatorios.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await actualizarEstudiante(estudiante.id, {
        nombre_completo: nombre.trim(),
        cedula: cedula.trim(),
        correo: correo.trim() || null,
        telefono: telefono.trim() || null,
        foto: estudiante.foto,
      });
      onGuardado();
    } catch (e) {
      setError("Error al guardar. Verifica que la cédula no esté duplicada.");
    } finally {
      setGuardando(false);
    }
  }

  if (!estudiante) {
    return (
      <div className="edit-student-panel empty">
        <div className="edit-empty-icon"><User size={40} /></div>
        <p className="edit-empty-title">Selecciona un estudiante</p>
        <p className="edit-empty-sub">Haz clic en el botón editar de cualquier estudiante para ver y modificar su información aquí.</p>
      </div>
    );
  }

  return (
    <div className="edit-student-panel">

      <div className="edit-panel-header">
        <div className="edit-panel-header-left">
          <span className="edit-panel-label">Editar Estudiante</span>
          <p className="edit-panel-id">ID: {estudiante.cedula}</p>
        </div>
        <button className="edit-panel-close" onClick={onCancelar} title="Cerrar">
          <X size={18} />
        </button>
      </div>

      <div className="edit-avatar-wrap">
        <div className="edit-avatar">
          {obtenerIniciales(nombre || estudiante.nombre_completo)}
        </div>
        <div>
          <p className="edit-avatar-name">{nombre || estudiante.nombre_completo}</p>
          <p className="edit-avatar-since">
            Registrado: {new Date(estudiante.fecha_registro).toLocaleDateString("es-CO")}
          </p>
        </div>
      </div>

      <div className="edit-form">

        <div className="edit-field">
          <label className="edit-label">Nombre Completo</label>
          <input
            className="edit-input"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
          />
        </div>

        <div className="edit-field">
          <label className="edit-label">Cédula</label>
          <input
            className="edit-input"
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Número de cédula"
          />
        </div>

        <div className="edit-field">
          <label className="edit-label">Correo Electrónico</label>
          <input
            className="edit-input"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="edit-field">
          <label className="edit-label">Teléfono</label>
          <input
            className="edit-input"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+57 300 000 0000"
          />
        </div>

        {error && <p className="edit-error">{error}</p>}

        <div className="edit-actions">
          <button className="edit-btn-cancel" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="edit-btn-save" onClick={handleGuardar} disabled={guardando}>
            <Save size={15} />
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}