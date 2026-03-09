import { getConnection } from "../database/connection";

export interface RegistrarPagoPayload {
  estudianteId: number;
  montoTotal: number;
  descuento: number;
  metodoPago: string;
  observaciones?: string;
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