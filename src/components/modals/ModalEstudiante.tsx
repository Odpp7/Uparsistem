import { useState } from "react";
import { X, User, Fingerprint, Mail, Phone, Save, Camera } from "lucide-react";
import { crearEstudiante } from "../../services/estudianteService";
import { validarEstudiante } from "../../utils/estudianteValidacion";
import "../../styles/modalEstudiante.css";

interface Props {
  onClose: () => void;
  onGuardado: () => void;
}

export default function ModalEstudiante({ onClose, onGuardado }: Props) {

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {

    setError(null);
    const error = validarEstudiante({ nombre, cedula, correo, telefono });
    if (error) {
      setError(error)
      return
    }

    try {
      await crearEstudiante({ nombre_completo: nombre, cedula, correo, telefono, foto: null });
      onGuardado();
    } catch (err: any) {
      switch (err.message) {
        case "CEDULA_DUPLICADA":
          setError("La cédula ya está registrada.");
          break;
        default:
          setError("Error al guardar el estudiante.");
      }
    }

  }

  return (
    <div className="modal-overlay">

      <form className="modal-box" onSubmit={(e) => { e.preventDefault(); handleGuardar() }}>

        <div className="modal-header">
          <div>
            <h2 className="modal-header-title">Agregar Nuevo Estudiante</h2>
            <p className="modal-header-sub"> Complete la información para registrar al nuevo alumno. </p>
          </div>
          <button className="modal-close" type="button" onClick={onClose}> <X size={22} /> </button>
        </div>


        <div className="modal-body">
          <div className="avatar-upload">
            <div className="avatar-preview">
              <div className="avatar-circle-lg"> <User size={36} /> </div>
              <button className="avatar-camera-btn" type="button"> <Camera size={13} /> </button>
            </div>
            <div>
              <p className="avatar-upload-label">Foto de Perfil</p>
              <p className="avatar-upload-hint">PNG, JPG hasta 5MB</p>
              <button className="btn-upload-link" type="button"> Subir imagen </button>
            </div>
          </div>


          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"> <User size={16} /> </span>
                <input
                  className="form-input"
                  placeholder="Ej: Juan Pérez"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Identificación</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"> <Fingerprint size={16} /> </span>
                <input
                  className="form-input"
                  placeholder="Ej: 1065842369"
                  type="text"
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"> <Mail size={16} /> </span>
                <input
                  className="form-input"
                  placeholder="ejemplo@uparsistem.edu.co"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"> <Phone size={16} /> </span>
                <input
                  className="form-input"
                  placeholder="+57 300 000 0000"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

          </div>

          {error && <p className="mae-error">{error}</p>}
        </div>


        <div className="modal-footer">
          <button className="btn-cancel" type="button" onClick={onClose}> Cancelar </button>

          <button className="btn-save" type="submit"> <Save size={16} /> Guardar Estudiante </button>
        </div>

      </form>
    </div>
  );
}