export interface EventoForm {
  nombre: string;
  fecha: string;
  hora?: string | null;
  categoria: string;
  descripcion?: string | null;
  lugar?: string | null;
}

export function validarEvento(data: EventoForm): string | null {

  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]{5,100}$/;

  if (!data.nombre.trim()) {
    return "El nombre del evento es obligatorio";
  }

  if (!nombreRegex.test(data.nombre)) {
    return "El nombre debe tener mínimo 5 caracteres y solo usar letras, números o texto válido";
  }

  if (!data.fecha) {
    return "La fecha es obligatoria";
  }

  const hoy = new Date();
  const fechaEvento = new Date(data.fecha);

  hoy.setHours(0,0,0,0);
  fechaEvento.setHours(0,0,0,0);

  if (fechaEvento < hoy) {
    return "La fecha no puede ser anterior a hoy";
  }

  const categoriasValidas = ["ACADEMICO", "ADMINISTRATIVO", "SOCIAL"];

  if (!categoriasValidas.includes(data.categoria)) {
    return "Categoría inválida";
  }

  if (data.hora && !/^\d{2}:\d{2}$/.test(data.hora)) {
    return "La hora no tiene un formato válido";
  }

  if (data.lugar && data.lugar.trim().length < 3) {
    return "El lugar debe tener al menos 3 caracteres";
  }

  if (data.descripcion && data.descripcion.trim().length < 5) {
    return "La descripción debe tener al menos 5 caracteres";
  }

  return null;
}
