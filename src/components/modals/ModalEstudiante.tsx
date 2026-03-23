import { useRef, useState } from "react";
import { X, User, Fingerprint, Mail, Phone, Save, Camera, FileText } from "lucide-react";
import { crearEstudiante } from "../../services/estudianteService";
import { validarEstudiante } from "../../utils/estudianteValidacion";
import "../../styles/modalEstudiante.css";

interface Props {
  onClose: () => void;
  onGuardado: () => void;
}

function comprimirImagen(file: File, maxSize: number, calidad: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, maxSize, maxSize);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", calidad));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ModalEstudiante({ onClose, onGuardado }: Props) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil]       = useState<string | null>(null);
  const [fotoDocumento, setFotoDocumento] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refPerfil    = useRef<HTMLInputElement>(null);
  const refDocumento = useRef<HTMLInputElement>(null);

  async function handleFotoPerfil(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoPerfil(await comprimirImagen(file, 200, 0.7));
  }

  async function handleFotoDocumento(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoDocumento(await comprimirImagen(file, 600, 0.75));
  }

  async function handleGuardar() {
    setError(null);
    const err = validarEstudiante({ nombre, cedula, correo, telefono });
    if (err) { setError(err); return; }

    try {
      await crearEstudiante(
        { nombre_completo: nombre, cedula, correo, telefono, activo: 1 },
        { foto_perfil: fotoPerfil, foto_documento: fotoDocumento }
      );
      onGuardado();
    } catch (e: any) {
      setError(e.message === "CEDULA_DUPLICADA" ? "La cédula ya está registrada." : "Error al guardar.");
    }
  }

  return (
    <div className="modal-overlay">
      <form className="modal-box" onSubmit={(e) => { e.preventDefault(); handleGuardar(); }}>

        <div className="modal-header">
          <div>
            <h2 className="modal-header-title">Agregar Nuevo Estudiante</h2>
            <p className="modal-header-sub">Complete la información para registrar al nuevo alumno.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="modal-body">

          <div className="fotos-row" style={{display: "flex", gap: "100px"}}>
            <div className="avatar-upload">
              <div className="avatar-preview">
                <div className="avatar-circle-lg">
                  {fotoPerfil ? <img src={fotoPerfil} alt="perfil" className="avatar-img" /> : <User size={36} />}
                </div>
                <button className="avatar-camera-btn" type="button" onClick={() => refPerfil.current?.click()}>
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <p className="avatar-upload-label">Foto de Perfil</p>
                <p className="avatar-upload-hint">PNG, JPG · 200×200</p>
                <button className="btn-upload-link" type="button" onClick={() => refPerfil.current?.click()}>Subir imagen</button>
              </div>
              <input ref={refPerfil} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFotoPerfil} />
            </div>

            <div className="avatar-upload">
              <div className="avatar-preview">
                <div className="avatar-circle-lg avatar-doc">
                  {fotoDocumento ? <img src={fotoDocumento} alt="documento" className="avatar-img" /> : <FileText size={30} />}
                </div>
                <button className="avatar-camera-btn" type="button" onClick={() => refDocumento.current?.click()}>
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <p className="avatar-upload-label">Foto del Documento</p>
                <p className="avatar-upload-hint">PNG, JPG · cédula / ID</p>
                <button className="btn-upload-link" type="button" onClick={() => refDocumento.current?.click()}>Subir imagen</button>
              </div>
              <input ref={refDocumento} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFotoDocumento} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"><User size={16} /></span>
                <input className="form-input" placeholder="Ej: Juan Pérez" type="text" required
                  value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Identificación</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"><Fingerprint size={16} /></span>
                <input className="form-input" placeholder="Ej: 1065842369" type="text" required
                  value={cedula} onChange={(e) => setCedula(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"><Mail size={16} /></span>
                <input className="form-input" placeholder="ejemplo@uparsistem.edu.co" type="email" required
                  value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"><Phone size={16} /></span>
                <input className="form-input" placeholder="+57 300 000 0000" type="tel"
                  value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
            </div>
          </div>

          {error && <p className="mae-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn-save" type="submit"><Save size={16} />Guardar Estudiante</button>
        </div>

      </form>
    </div>
  );
}