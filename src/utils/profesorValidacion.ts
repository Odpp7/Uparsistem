export interface ProfesorForm {
  nombre: string
  cedula: string
  correo: string
  telefono?: string
  especialidad: string
}

export function validarProfesor(data: ProfesorForm): string | null {

  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,100}$/
  const cedulaRegex = /^[0-9]{6,10}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const telefonoRegex = /^3\d{9}$/
  const especialidadRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,100}$/

  if (!data.nombre.trim()) {
    return "El nombre es obligatorio"
  }

  if (!nombreRegex.test(data.nombre)) {
    return "El nombre solo debe contener letras y mínimo 3 caracteres"
  }

  if (!data.cedula.trim()) {
    return "La cédula es obligatoria"
  }

  if (!cedulaRegex.test(data.cedula)) {
    return "La cédula debe tener entre 6 y 10 dígitos"
  }

  if (!data.correo.trim()) {
    return "El correo es obligatorio"
  }

  if (!emailRegex.test(data.correo)) {
    return "Correo electrónico inválido"
  }

  if (data.telefono && !telefonoRegex.test(data.telefono)) {
    return "El teléfono debe tener 10 dígitos y comenzar con 3"
  }

  if (data.especialidad && !especialidadRegex.test(data.especialidad)) {
    return "La especialidad solo debe contener letras y mínimo 3 caracteres"
  }

  return null
}
