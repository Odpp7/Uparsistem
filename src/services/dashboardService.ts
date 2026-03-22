import { getConnection } from "../database/connection";

export async function obtenerResumenDashboard() {
    const conn = await getConnection();

    const [totalEstudiantes] = await conn.select<{ total: number }[]>(
        `SELECT COUNT(*) as total FROM estudiantes WHERE activo = 1`
    );

    const [totalPagos] = await conn.select<{ total: number }[]>(
        `SELECT IFNULL(SUM(monto_pagado),0) as total FROM pagos WHERE estado = 'CONFIRMADO'`
    );

    const [pendientes] = await conn.select<{ total: number }[]>(
        `SELECT COUNT(*) as total
     FROM inscripciones i
     LEFT JOIN pagos p ON i.id = p.inscripcion_id
     WHERE p.id IS NULL`
    );

    return {
        totalEstudiantes: totalEstudiantes.total,
        totalPagos: totalPagos.total,
        pendientes: pendientes.total
    };
}


export async function obtenerPagosPorMes() {
  const conn = await getConnection();

  return await conn.select<any[]>(`
    SELECT 
      strftime('%m', fecha_pago) as mes,
      SUM(monto_pagado) as total
    FROM pagos
    WHERE estado = 'CONFIRMADO'
    GROUP BY mes
    ORDER BY mes
  `);
}


export async function obtenerNotificaciones() {
  const conn = await getConnection();

  return await conn.select<any[]>(`
    SELECT 
      'pago' as tipo,
      p.fecha_pago as fecha,
      e.nombre_completo as nombre,
      m.nombre as modulo,
      p.monto_pagado as monto
    FROM pagos p
    JOIN inscripciones i ON p.inscripcion_id = i.id
    JOIN estudiantes e ON i.estudiante_id = e.id
    JOIN modulos m ON i.modulo_id = m.id
    ORDER BY p.fecha_pago DESC
    LIMIT 5
  `);
}


