import { useState } from "react";
import { X, User, Save, Camera } from "lucide-react";
import { crearProfesor } from "../../services/profesorService";
import { validarProfesor } from "../../utils/profesorValidacion";
import "../../styles/modalProfesor.css";

interface Props {
  onClose: () => void;
  onGuardar: () => void;
}

export default function ModalProfesor({ onClose, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [especialidad, setEspecialidad] = useState("");

  async function handleGuardar() {

    const error = validarProfesor({ nombre, cedula, correo, telefono, especialidad });
    if(error) { alert(error); return }

    try {
      await crearProfesor({ nombre_completo: nombre, cedula, correo, telefono, especialidad, foto: null });
      onGuardar();
    } catch (error) {
      console.error("Error al guardar profesor:", error);
      alert((error as Error).message || "Error al guardar el profesor");
    }

  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <div>
            <h2 className="modal-header-title">Agregar Nuevo Profesor</h2>
            <p className="modal-header-sub"> Complete la información para registrar un nuevo docente.</p>
          </div>
          <button className="modal-close" onClick={onClose} type="button"> <X size={22} /> </button>
        </div>

        <form onSubmit={handleGuardar}>
          <div className="modal-body">
            <div className="avatar-upload-area">
              <div className="avatar-preview">
                <div className="avatar-circle-lg"> <User size={38} /> </div>
                <button className="avatar-camera-btn" type="button"> <Camera size={13} /></button>
              </div>

              <div className="avatar-upload-text">
                <p className="avatar-upload-label">Foto de Perfil</p>
                <p className="avatar-upload-hint"> Haz clic para subir una imagen (JPG, PNG) </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-input-profesor"
                  placeholder="Ej: Juan Pérez"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Identificación</label>
                <input
                  className="form-input-profesor"
                  placeholder="Documento de identidad"
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                
                <input
                  className="form-input-profesor"
                  placeholder="usuario@uparsistem.edu.co"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-input-profesor"
                  placeholder="Ej: +57 300 000 0000"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Especialidad</label>
                <input
                  className="form-input-profesor"
                  placeholder="Ej: Magíster en Educación"
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" type="button" onClick={onClose}> Cancelar </button>

            <button className="btn-save" type="submit"> <Save size={16} /> Guardar Profesor </button>
          </div>
        </form>

      </div>
    </div>

  );
}