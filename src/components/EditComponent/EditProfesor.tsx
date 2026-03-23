import { useState, useEffect, useRef } from "react";
import { Save, X, User, Camera } from "lucide-react";
import { Profesor, actualizarProfesor, obtenerFotosProfesor, guardarFotoProfesor } from "../../services/profesorService";
import "../../styles/editProfesor.css";

interface Props {
  profesor: Profesor | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

function comprimirImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, 200, 200);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function EditProfesor({ profesor, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre]             = useState("");
  const [cedula, setCedula]             = useState("");
  const [correo, setCorreo]             = useState("");
  const [telefono, setTelefono]         = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [fotoPerfil, setFotoPerfil]     = useState<string | null>(null);
  const [verFoto, setVerFoto]           = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const refFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profesor) {
      setNombre(profesor.nombre_completo);
      setCedula(profesor.cedula);
      setCorreo(profesor.correo ?? "");
      setTelefono(profesor.telefono ?? "");
      setEspecialidad(profesor.especialidad ?? "");
      setError(null);
      setFotoPerfil(null);
      obtenerFotosProfesor(profesor.id).then((f) => setFotoPerfil(f.foto_perfil));
    }
  }, [profesor]);

  function obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(" ").filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoPerfil(await comprimirImagen(file));
  }

  async function handleGuardar() {
    if (!profesor) return;
    if (!nombre.trim() || !cedula.trim()) { setError("Nombre y cédula son obligatorios."); return; }
    setError(null);
    setGuardando(true);
    try {
      await actualizarProfesor(profesor.id, {
        nombre_completo: nombre.trim(),
        cedula: cedula.trim(),
        correo: correo.trim() || null,
        telefono: telefono.trim(),
        especialidad: especialidad.trim() || null,
      });
      if (fotoPerfil) await guardarFotoProfesor(profesor.id, fotoPerfil);
      onGuardado();
    } catch {
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
    <>
      {verFoto && (
        <div className="foto-visor-overlay" onClick={() => setVerFoto(false)}>
          <div className="foto-visor-box" onClick={(e) => e.stopPropagation()}>
            <button className="foto-visor-close" onClick={() => setVerFoto(false)}><X size={18} /></button>
            <p className="foto-visor-titulo">Foto de Perfil</p>
            {fotoPerfil
              ? <img src={fotoPerfil} alt="foto" className="foto-visor-img" />
              : <p className="foto-visor-vacio">Sin foto registrada</p>
            }
          </div>
        </div>
      )}

      <div className="edit-prof-panel">
        <div className="edit-prof-header">
          <div>
            <span className="edit-prof-label">Editar Profesor</span>
            <p className="edit-prof-id">ID: {profesor.cedula}</p>
          </div>
          <button className="edit-prof-close" onClick={onCancelar}><X size={18} /></button>
        </div>

        <div className="edit-prof-avatar-wrap">
          <div className="edit-prof-avatar-photo-wrap">
            <div
              className="edit-prof-avatar"
              onClick={() => fotoPerfil && setVerFoto(true)}
              style={{ cursor: fotoPerfil ? "pointer" : "default" }}
              title={fotoPerfil ? "Ver foto" : undefined}
            >
              {fotoPerfil
                ? <img src={fotoPerfil} alt="foto" className="edit-prof-avatar-img" />
                : obtenerIniciales(nombre || profesor.nombre_completo)
              }
            </div>
            <button className="edit-prof-avatar-cam" type="button" onClick={() => refFile.current?.click()}>
              <Camera size={12} />
            </button>
            <input ref={refFile} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
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
    </>
  );
}