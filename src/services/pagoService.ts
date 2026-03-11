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

export async function registrarPagoGlobal(payload: RegistrarPagoPayload): Promise<void> {
  const conn = await getConnection();

  const inscripciones: {
    inscripcion_id: number;
    precio: number;
    ya_pagado: number;
  }[] = await conn.select(`
    SELECT
      i.id AS inscripcion_id,
      m.precio,
      COALESCE(SUM(p.monto_pagado), 0) AS ya_pagado
    FROM inscripciones i
    JOIN modulos m ON i.modulo_id = m.id
    LEFT JOIN pagos p ON p.inscripcion_id = i.id
    WHERE i.estudiante_id = ?
    GROUP BY i.id
    HAVING m.precio - COALESCE(SUM(p.monto_pagado), 0) > 0
    ORDER BY i.id
  `, [payload.estudianteId]);

  let restante = payload.montoTotal - payload.descuento;
  if (restante <= 0) return;

  const hoy = new Date().toISOString().split("T")[0];

  for (const insc of inscripciones) {
    if (restante <= 0) break;
    const pendiente = insc.precio - insc.ya_pagado;
    const abonar = Math.min(restante, pendiente);

    await conn.execute(
      `INSERT INTO pagos (inscripcion_id, monto_pagado, descuento, metodo_pago, fecha_pago, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        insc.inscripcion_id,
        abonar,
        insc.inscripcion_id === inscripciones[0].inscripcion_id ? payload.descuento : 0,
        payload.metodoPago,
        hoy,
        payload.observaciones ?? "",
      ]
    );
    restante -= abonar;
  }
}

export async function obtenerCarteraEstudiante(estudianteId: number): Promise<CarteraEstudiante> {

  const conn = await getConnection();

  const rows = await conn.select<{
    inscripcion_id: number;
    modulo_nombre: string;
    modulo_codigo: string;
    precio: number;
    total_pagado: number;
  }[]>(`
    SELECT
      i.id AS inscripcion_id,
      m.nombre AS modulo_nombre,
      m.codigo AS modulo_codigo,
      m.precio,
      COALESCE((
        SELECT SUM(p.monto_pagado)
        FROM pagos p
        WHERE p.inscripcion_id = i.id
      ), 0) AS total_pagado
    FROM inscripciones i
    JOIN modulos m ON i.modulo_id = m.id
    WHERE i.estudiante_id = ?
  `, [estudianteId]);

  const lineas = rows.map((row: any) => {

    const saldo = Math.max(0, row.precio - row.total_pagado);

    return {
      inscripcionId: row.inscripcion_id,
      moduloNombre: row.modulo_nombre,
      moduloCodigo: row.modulo_codigo,
      precio: row.precio,
      totalPagado: row.total_pagado,
      saldoPendiente: saldo
    };

  });

  const totalDeuda = lineas.reduce((acc: number, l: any) => acc + l.saldoPendiente, 0);
  const totalPagado = lineas.reduce((acc: number, l: any) => acc + l.totalPagado, 0);

  return { lineas, totalDeuda, totalPagado };
}