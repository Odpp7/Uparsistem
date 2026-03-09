import { getConnection } from "../database/connection";
import { Modulo } from "./moduloService";

export async function crearInscripcion(estudianteId: number, moduloId: number) {
  const conn = await getConnection();
  await conn.execute(
    `INSERT INTO inscripciones (estudiante_id, modulo_id, fecha_inscripcion)
     VALUES (?, ?, DATE('now'))`,
    [estudianteId, moduloId]
  );
}

export async function obtenerModulosInscritos(estudianteId: number): Promise<Modulo[]> {
  const conn = await getConnection();
  return await conn.select(
    `SELECT m.*
     FROM inscripciones i
     JOIN modulos m ON i.modulo_id = m.id
     WHERE i.estudiante_id = ?`,
    [estudianteId]
  );
}

export interface ResumenEstudiante {
  estudianteId: number;
  modulos: string[];
  tienePagoPendiente: boolean;
}

export async function obtenerResumenEstudiantes(): Promise<ResumenEstudiante[]> {
  const conn = await getConnection();
  const rows: {
    estudiante_id: number;
    modulo_nombre: string;
    pago_id: number | null;
    monto_pagado: number | null;
    precio: number;
  }[] = await conn.select(`
    SELECT 
      i.estudiante_id,
      m.nombre AS modulo_nombre,
      m.precio,
      p.id     AS pago_id,
      p.monto_pagado
    FROM inscripciones i
    JOIN modulos m ON i.modulo_id = m.id
    LEFT JOIN pagos p ON p.inscripcion_id = i.id
  `);

  const mapa = new Map<number, ResumenEstudiante>();
  for (const row of rows) {
    if (!mapa.has(row.estudiante_id)) {
      mapa.set(row.estudiante_id, {
        estudianteId: row.estudiante_id,
        modulos: [],
        tienePagoPendiente: false,
      });
    }
    const entry = mapa.get(row.estudiante_id)!;
    if (!entry.modulos.includes(row.modulo_nombre)) entry.modulos.push(row.modulo_nombre);
    if ((row.monto_pagado ?? 0) < row.precio) entry.tienePagoPendiente = true;
  }
  return Array.from(mapa.values());
}

// ─── NUEVO: cartera completa de un estudiante ───────────────────────────────

export interface LineaCartera {
  inscripcionId: number;
  moduloNombre: string;
  moduloCodigo: string;
  precio: number;
  totalPagado: number;   // suma de todos los pagos de esa inscripción
  saldoPendiente: number;
}

export interface CarteraEstudiante {
  lineas: LineaCartera[];
  totalDeuda: number;    // suma de saldos pendientes
  totalPagado: number;   // suma de todo lo pagado
}

export async function obtenerCarteraEstudiante(estudianteId: number): Promise<CarteraEstudiante> {
  const conn = await getConnection();

  const rows: {
    inscripcion_id: number;
    modulo_nombre: string;
    modulo_codigo: string;
    precio: number;
    total_pagado: number;
  }[] = await conn.select(`
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
    ORDER BY i.id
  `, [estudianteId]);

  const lineas: LineaCartera[] = rows.map(row => {
    const saldo = Math.max(0, row.precio - row.total_pagado);
    return {
      inscripcionId: row.inscripcion_id,
      moduloNombre: row.modulo_nombre,
      moduloCodigo: row.modulo_codigo,
      precio: row.precio,
      totalPagado: row.total_pagado,
      saldoPendiente: saldo,
    };
  });

  const totalDeuda = lineas.reduce((acc, l) => acc + l.saldoPendiente, 0);
  const totalPagado = lineas.reduce((acc, l) => acc + l.totalPagado, 0);

  return { lineas, totalDeuda, totalPagado };
}
