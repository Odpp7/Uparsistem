import { getConnection } from "../database/connection";

export interface LineaCartera {
  inscripcionId: number
  moduloNombre: string
  moduloCodigo: string
  precio: number
  descuento: number
  precioFinal: number
  totalPagado: number
  saldoPendiente: number
}

export interface CarteraEstudiante {
  lineas: LineaCartera[]
  totalDeuda: number
  totalPagado: number
}

export interface PagoReciente {
  fecha: string
  concepto: string
  monto: number
  metodo: string
}


export async function obtenerCarteraEstudiante(estudianteId: number): Promise<CarteraEstudiante> {

  const conn = await getConnection()

  const rows = await conn.select<any[]>(`
    SELECT
      i.id AS inscripcion_id,
      m.nombre AS modulo_nombre,
      m.codigo AS modulo_codigo,
      m.precio,
      i.descuento,
      COALESCE(SUM(p.monto_pagado),0) AS pagado
    FROM inscripciones i
    JOIN modulos m ON i.modulo_id = m.id
    LEFT JOIN pagos p ON p.inscripcion_id = i.id AND p.estado = 'CONFIRMADO'
    WHERE i.estudiante_id = ?
    GROUP BY i.id
  `,[estudianteId])


  const lineas: LineaCartera[] = rows.map(r => {

    const descuentoValor = r.precio * (r.descuento / 100)
    const precioFinal = r.precio - descuentoValor
    const saldo = Math.max(0, precioFinal - r.pagado)

    return {
      inscripcionId: r.inscripcion_id,
      moduloNombre: r.modulo_nombre,
      moduloCodigo: r.modulo_codigo,
      precio: r.precio,
      descuento: r.descuento,
      precioFinal,
      totalPagado: r.pagado,
      saldoPendiente: saldo
    }
  })


  const totalDeuda = lineas.reduce((s,l)=> s + l.saldoPendiente,0)
  const totalPagado = lineas.reduce((s,l)=> s + l.totalPagado,0)

  return { lineas, totalDeuda, totalPagado }
}



export async function registrarPagoModulo(
  inscripcionId: number,
  monto: number,
  metodoPago: string,
  observaciones?: string
) {

  const conn = await getConnection()

  const fecha = new Date().toISOString().split("T")[0]

  await conn.execute(`
    INSERT INTO pagos
    (inscripcion_id, monto_pagado, metodo_pago, fecha_pago, observaciones)
    VALUES (?, ?, ?, ?, ?)
  `,[ inscripcionId, monto, metodoPago, fecha, observaciones ?? "" ])
}



export async function actualizarDescuento(
  inscripcionId: number,
  descuento: number
){

  const conn = await getConnection()

  await conn.execute(`
    UPDATE inscripciones
    SET descuento = ?
    WHERE id = ?
  `,[descuento, inscripcionId])

}



export async function obtenerPagosRecientes(estudianteId: number): Promise<PagoReciente[]> {

  const conn = await getConnection()

  const rows = await conn.select<any[]>(`
    SELECT 
      p.fecha_pago,
      m.nombre AS modulo_nombre,
      p.monto_pagado,
      p.metodo_pago
    FROM pagos p
    JOIN inscripciones i ON p.inscripcion_id = i.id
    JOIN modulos m ON i.modulo_id = m.id
    WHERE i.estudiante_id = ?
    ORDER BY p.fecha_pago DESC
    LIMIT 10
  `,[estudianteId])

  return rows.map(r => ({
    fecha: r.fecha_pago,
    concepto: r.modulo_nombre,
    monto: r.monto_pagado,
    metodo: r.metodo_pago
  }))
}
