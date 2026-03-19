export interface NotaValidacion {
  nota: number
  notaActual: number | null
  bloqueada: boolean
  estado: string
}

export function validarNota(data: NotaValidacion): string | null {

  if (isNaN(data.nota)) {
    return "La nota ingresada no es válida"
  }

  if (data.nota === null || data.nota === undefined) {
    return "Debe ingresar una nota"
  }

  if (data.nota < 1) {
    return "La nota no puede ser menor a 1.0"
  }

  if (data.nota > 5) {
    return "La nota no puede ser mayor a 5.0"
  }

  const decimal = data.nota.toString().split(".")[1]
  if (decimal && decimal.length > 2) {
    return "La nota solo puede tener máximo 2 decimales"
  }

  if (data.notaActual !== null) {
    return "Este módulo ya tiene una nota registrada"
  }

  if (data.bloqueada) {
    return "La nota ya fue guardada y no se puede modificar"
  }

  if (data.estado !== "ACTIVO") {
    return "No se puede registrar nota en un módulo cerrado"
  }

  return null
}
