import { getConnection } from "../database/connection";

export interface RegistrarPagoPayload {
  estudianteId: number;
  montoTotal: number;
  descuento: number;
  metodoPago: string;
  observaciones?: string;
}

export interface LineaCartera {
  inscripcionId: number;
  moduloNombre: string;
  moduloCodigo: string;
  precio: number;
  totalPagado: number;
  saldoPendiente: number;
}

export interface CarteraEstudiante {
  lineas: LineaCartera[];
  totalDeuda: number;
  totalPagado: number;
}

export interface PagoReciente {
  fecha: string;
  concepto: string;
  monto: number;
  metodo: string;
}


export async function registrarPagoGlobal(payload: RegistrarPagoPayload): Promise<void> {
  const conn = await getConnection();

  const inscripciones = await conn.select<{ inscripcion_id: number; precio: number; pagado: number }[]>(`
    SELECT 
      i.id AS inscripcion_id,
      m.precio,
      COALESCE(SUM(p.monto_pagado),0) AS pagado
    FROM inscripciones i
    JOIN modulos m ON i.modulo_id = m.id
    LEFT JOIN pagos p ON p.inscripcion_id = i.id
    WHERE i.estudiante_id = ?
    GROUP BY i.id
    ORDER BY i.id
  `, [payload.estudianteId]);

  let restante = payload.montoTotal - payload.descuento;
  if (restante <= 0) return;

  const fecha = new Date().toISOString().split("T")[0];

  for (const insc of inscripciones) {
    const pendiente = insc.precio - insc.pagado;
    if (pendiente <= 0) continue;
    const abono = Math.min(restante, pendiente);

    await conn.execute(`
      INSERT INTO pagos 
      (inscripcion_id, monto_pagado, descuento, metodo_pago, fecha_pago, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ insc.inscripcion_id, abono, payload.descuento, payload.metodoPago, fecha, payload.observaciones ?? "" ]);

    restante -= abono;

    if (restante <= 0) break;
  }
}


export async function obtenerCarteraEstudiante(estudianteId: number): Promise<CarteraEstudiante> {

  const conn = await getConnection();

  const rows = await conn.select<{
    inscripcion_id: number
    modulo_nombre: string
    modulo_codigo: string
    precio: number
    pagado: number
  }[]>(`
    SELECT
      i.id AS inscripcion_id,
      m.nombre AS modulo_nombre,
      m.codigo AS modulo_codigo,
      m.precio,
      COALESCE(SUM(p.monto_pagado),0) AS pagado
    FROM inscripciones i
    JOIN modulos m ON i.modulo_id = m.id
    LEFT JOIN pagos p ON p.inscripcion_id = i.id
    WHERE i.estudiante_id = ?
    GROUP BY i.id
  `,[estudianteId]);

  const lineas: LineaCartera[] = rows.map(r => ({
    inscripcionId: r.inscripcion_id,
    moduloNombre: r.modulo_nombre,
    moduloCodigo: r.modulo_codigo,
    precio: r.precio,
    totalPagado: r.pagado,
    saldoPendiente: Math.max(0, r.precio - r.pagado)
  }));

  const totalDeuda = lineas.reduce((s,l)=> s + l.saldoPendiente,0);
  const totalPagado = lineas.reduce((s,l)=> s + l.totalPagado,0);

  return { lineas, totalDeuda, totalPagado };
}



export async function obtenerPagosRecientes(estudianteId: number): Promise<PagoReciente[]> {

  const conn = await getConnection();

  const rows = await conn.select<{
    fecha_pago: string;
    modulo_nombre: string;
    monto_pagado: number;
    metodo_pago: string;
  }[]>(`
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
  `,[estudianteId]);

  return rows.map(r => ({
    fecha: r.fecha_pago,
    concepto: r.modulo_nombre,
    monto: r.monto_pagado,
    metodo: r.metodo_pago
  }));

}



export async function registrarPagoModulo(
  inscripcionId: number,
  monto: number,
  descuento: number,
  metodoPago: string,
  observaciones?: string
) {

  const conn = await getConnection();
  const fecha = new Date().toISOString().split("T")[0];

  await conn.execute(`
    INSERT INTO pagos
    (inscripcion_id, monto_pagado, descuento, metodo_pago, fecha_pago, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
  `,[ inscripcionId, monto, descuento, metodoPago, fecha, observaciones ?? ""]);
}
