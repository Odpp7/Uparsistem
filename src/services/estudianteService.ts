import { getConnection } from "../database/connection";

export interface Estudiante {
  id: number;
  nombre_completo: string;
  cedula: string;
  telefono: string | null;
  correo: string | null;
  activo: number;
  fecha_registro: string;
}

export interface EstudianteConModulo extends Estudiante {
  modulos: string | null;
}

export interface FotosEstudiante {
  foto_perfil: string | null;
  foto_documento: string | null;
}


export async function obtenerEstudiantes(): Promise<Estudiante[]> {
  const conn = await getConnection();
  return await conn.select<Estudiante[]>(
    `SELECT id, nombre_completo, cedula, telefono, correo, activo, fecha_registro
     FROM estudiantes ORDER BY fecha_registro DESC`
  );
}

export async function obtenerEstudiantesConModulos(): Promise<EstudianteConModulo[]> {
  const conn = await getConnection();
  return await conn.select<EstudianteConModulo[]>(`
    SELECT
      e.id, e.nombre_completo, e.cedula, e.telefono, e.correo, e.activo, e.fecha_registro,
      GROUP_CONCAT(m.nombre, ', ') AS modulos
    FROM estudiantes e
    LEFT JOIN inscripciones i ON e.id = i.estudiante_id AND i.estado = 'ACTIVO'
    LEFT JOIN modulos m ON i.modulo_id = m.id
    GROUP BY e.id
    ORDER BY e.fecha_registro DESC
  `);
}

export async function buscarEstudiantes(query: string): Promise<Estudiante[]> {
  const conn = await getConnection();
  const q = `%${query}%`;
  return await conn.select<Estudiante[]>(
    `SELECT id, nombre_completo, cedula, telefono, correo, activo, fecha_registro
     FROM estudiantes
     WHERE nombre_completo LIKE ? OR cedula LIKE ?
     ORDER BY nombre_completo LIMIT 10`,
    [q, q]
  );
}


export async function obtenerFotosEstudiante(id: number): Promise<FotosEstudiante> {
  const conn = await getConnection();
  const rows = await conn.select<FotosEstudiante[]>(
    `SELECT foto_perfil, foto_documento FROM fotos_personas
     WHERE persona_tipo = 'ESTUDIANTE' AND persona_id = ?`,
    [id]
  );
  return rows[0] ?? { foto_perfil: null, foto_documento: null };
}

export async function guardarFotosEstudiante(id: number, fotos: Partial<FotosEstudiante>) {
  const conn = await getConnection();
  await conn.execute(
    `INSERT INTO fotos_personas (persona_tipo, persona_id, foto_perfil, foto_documento)
     VALUES ('ESTUDIANTE', ?, ?, ?)
     ON CONFLICT(persona_tipo, persona_id) DO UPDATE SET
       foto_perfil    = COALESCE(excluded.foto_perfil, foto_perfil),
       foto_documento = COALESCE(excluded.foto_documento, foto_documento)`,
    [id, fotos.foto_perfil ?? null, fotos.foto_documento ?? null]
  );
}



export async function crearEstudiante( est: Omit<Estudiante, "id" | "fecha_registro">, fotos?: Partial<FotosEstudiante>) {
  const conn = await getConnection();
  const existe = await conn.select<{ id: number }[]>( `SELECT id FROM estudiantes WHERE cedula = ?`, [est.cedula] );
  if (existe.length > 0) throw new Error("CEDULA_DUPLICADA");

  await conn.execute(
    `INSERT INTO estudiantes (nombre_completo, cedula, telefono, correo) VALUES (?, ?, ?, ?)`,
    [est.nombre_completo, est.cedula, est.telefono || null, est.correo || null]
  );

  if (fotos?.foto_perfil || fotos?.foto_documento) {
    const rows = await conn.select<{ id: number }[]>(
      `SELECT id FROM estudiantes WHERE cedula = ?`, [est.cedula]
    );
    await guardarFotosEstudiante(rows[0].id, fotos);
  }
}

export async function actualizarEstudiante( id: number, est: Partial<Omit<Estudiante, "id" | "fecha_registro">> ) {
  const conn = await getConnection();
  await conn.execute(
    `UPDATE estudiantes SET nombre_completo = ?, cedula = ?, telefono = ?, correo = ? WHERE id = ?`,
    [est.nombre_completo, est.cedula, est.telefono || null, est.correo || null, id]
  );
}

export async function eliminarEstudiante(id: number) {
  const conn = await getConnection();
  await conn.execute("BEGIN");
  try {
    await conn.execute(`UPDATE estudiantes SET activo = 0 WHERE id = ?`, [id]);
    await conn.execute(`UPDATE inscripciones SET estado = 'INACTIVO' WHERE estudiante_id = ?`, [id]);
    await conn.execute("COMMIT");
  } catch (error) {
    await conn.execute("ROLLBACK");
    throw error;
  }
}