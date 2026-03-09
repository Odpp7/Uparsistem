import { useState, useEffect } from "react";
import { Save, X, User } from "lucide-react";
import { Profesor, actualizarProfesor } from "../../services/profesorService";
import "../../styles/editProfesor.css";

interface Props {
  profesor: Profesor | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function EditProfesor({ profesor, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre]           = useState("");
  const [cedula, setCedula]           = useState("");
  const [correo, setCorreo]           = useState("");
  const [telefono, setTelefono]       = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (profesor) {
      setNombre(profesor.nombre_completo);
      setCedula(profesor.cedula);
      setCorreo(profesor.correo ?? "");
      setTelefono(profesor.telefono ?? "");
      setEspecialidad(profesor.especialidad ?? "");
      setError(null);
    } else {
      setNombre(""); setCedula(""); setCorreo("");
      setTelefono(""); setEspecialidad("");
    }
  }, [profesor]);

  function obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(" ").filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  async function handleGuardar() {
    if (!profesor) return;
    if (!nombre.trim() || !cedula.trim()) {
      setError("Nombre y cédula son obligatorios.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await actualizarProfesor(profesor.id, {
        nombre_completo: nombre.trim(),
        cedula: cedula.trim(),
        correo: correo.trim() || null,
        telefono: telefono.trim(),
        especialidad: especialidad.trim() || null,
        foto: profesor.foto,
      });
      onGuardado();
    } catch (e) {
      setError("Error al guardar. Verifica que la cédula no esté duplicada.");
    } finally {
      setGuardando(false);
    }
  }

  if (!profesor) {
    return (
      <div className="edit-prof-panel empty">
        <div className="edit-prof-empty-icon"><User size={40} /></div>
        <p className="edit-prof-empty-title">Selecciona un profesor</p>
        <p className="edit-prof-empty-sub">Haz clic en el botón editar de cualquier profesor para ver y modificar su información aquí.</p>
      </div>
    );
  }

  return (
    <div className="edit-prof-panel">

      <div className="edit-prof-header">
        <div>
          <span className="edit-prof-label">Editar Profesor</span>
          <p className="edit-prof-id">ID: {profesor.cedula}</p>
        </div>
        <button className="edit-prof-close" onClick={onCancelar}><X size={18} /></button>
      </div>

      <div className="edit-prof-avatar-wrap">
        <div className="edit-prof-avatar">
          {obtenerIniciales(nombre || profesor.nombre_completo)}
        </div>
        <div>
          <p className="edit-prof-avatar-name">{nombre || profesor.nombre_completo}</p>
          <p className="edit-prof-avatar-since">
            Registrado: {new Date(profesor.fecha_registro).toLocaleDateString("es-CO")}
          </p>
        </div>
      </div>

      <div className="edit-prof-form">

        <div className="edit-prof-field">
          <label className="edit-prof-field-label">Nombre Completo</label>
          <input className="edit-prof-input" type="text" value={nombre}
            onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
        </div>

        <div className="edit-prof-field">
          <label className="edit-prof-field-label">Cédula</label>
          <input className="edit-prof-input" type="text" value={cedula}
            onChange={(e) => setCedula(e.target.value)} placeholder="Número de cédula" />
        </div>

        <div className="edit-prof-field">
          <label className="edit-prof-field-label">Correo Electrónico</label>
          <input className="edit-prof-input" type="email" value={correo}
            onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" />
        </div>

        <div className="edit-prof-field">
          <label className="edit-prof-field-label">Teléfono</label>
          <input className="edit-prof-input" type="tel" value={telefono}
            onChange={(e) => setTelefono(e.target.value)} placeholder="+57 300 000 0000" />
        </div>

        <div className="edit-prof-field" style={{ gridColumn: "1 / -1" }}>
          <label className="edit-prof-field-label">Especialidad</label>
          <input className="edit-prof-input" type="text" value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)} placeholder="Ej: Magíster en Educación" />
        </div>

        {error && <p className="edit-prof-error">{error}</p>}

        <div className="edit-prof-actions">
          <button className="edit-prof-btn-cancel" onClick={onCancelar}>Cancelar</button>
          <button className="edit-prof-btn-save" onClick={handleGuardar} disabled={guardando}>
            <Save size={15} />
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}