export interface PagoValidacion {
  inscripcionId: number
  monto: number
  saldoPendiente: number
  descuento: number
}

export function validarPago(data: PagoValidacion): string | null {

  if(data.monto <= 0){
    return "El monto debe ser mayor a 0"
  }

  if(isNaN(data.monto)){
    return "El monto ingresado no es válido"
  }

  if(data.monto > data.saldoPendiente){
    return "El monto no puede ser mayor al saldo pendiente"
  }

  if(data.descuento < 0){
    return "El descuento no puede ser negativo"
  }

  if(data.descuento > 100){
    return "El descuento no puede ser mayor a 100%"
  }

  return null
}
