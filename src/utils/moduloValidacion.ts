export interface ModuloForm {
  codigo: string
  nombre: string
  duracion: string
  horasTeoricas: number
  horasPracticas: number
  precio: number
}

export function validarModulo(data: ModuloForm): string | null {

  const codigoRegex = /^[A-Z]{3,5}-\d{3,5}$/
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]{3,100}$/
  const duracionRegex = /^[0-9]{1,3}\s?(mes(es)?|hora(s)?|semana(s)?)$/i

  if (!data.codigo.trim()) {
    return "El código del módulo es obligatorio"
  }

  if (!codigoRegex.test(data.codigo)) {
    return "Formato de código inválido. Ej: MOD-001"
  }

  if (!data.nombre.trim()) {
    return "El nombre del módulo es obligatorio"
  }

  if (!nombreRegex.test(data.nombre)) {
    return "Nombre del módulo inválido"
  }

  if (data.nombre.includes("  ")) {
    return "El nombre del módulo contiene espacios inválidos"
  }

  if (!data.duracion.trim()) {
    return "La duración es obligatoria"
  }

  if (!duracionRegex.test(data.duracion)) {
    return "Duración inválida. Ej: 3 meses, 120 horas"
  }

  if (data.horasTeoricas < 0) {
    return "Las horas teóricas no pueden ser negativas"
  }

  if (data.horasTeoricas > 1000) {
    return "Las horas teóricas son demasiado altas"
  }

  if (data.horasPracticas < 0) {
    return "Las horas prácticas no pueden ser negativas"
  }

  if (data.horasPracticas > 1000) {
    return "Las horas prácticas son demasiado altas"
  }

  if (data.horasTeoricas === 0 && data.horasPracticas === 0) {
    return "El módulo debe tener al menos horas teóricas o prácticas"
  }

  if (data.precio <= 0) {
    return "El precio debe ser mayor que 0"
  }

  if (data.precio > 10000000) {
    return "El precio es demasiado alto"
  }

  return null
}
