import { getConnection } from "../database/connection";

export interface Estudiante {
  id: number;
  nombre_completo: string;
  cedula: string;
  telefono: string | null;
  correo: string | null;
  foto: string | null;
  fecha_registro: string;
}

export interface EstudianteConModulo extends Estudiante {
  activo: number;
  modulos: string | null;
  estado_inscripcion: string | null;
}


export async function obtenerEstudiantes(): Promise<Estudiante[]> {
    const conn = await getConnection();
    return await conn.select<Estudiante[]>(`SELECT * FROM estudiantes ORDER BY fecha_registro DESC`);
}


export async function crearEstudiante(est: Omit<Estudiante, "id" | "fecha_registro">) {
    const conn = await getConnection();
    const existe = await conn.select<{ id: number }[]>(`SELECT id FROM estudiantes WHERE cedula = ?`, [est.cedula]);
    if (existe.length > 0) { throw new Error("CEDULA_DUPLICADA")}
    await conn.execute(
    `INSERT INTO estudiantes (nombre_completo, cedula, telefono, correo, foto) VALUES (?, ?, ?, ?, ?)`,
    [est.nombre_completo, est.cedula, est.telefono || null, est.correo || null, est.foto || null]
  );
}


export async function actualizarEstudiante(id: number, est: Partial<Omit<Estudiante, "id" | "fecha_registro">>) {
    const conn = await getConnection();
    await conn.execute(
    `UPDATE estudiantes SET nombre_completo = ?, cedula = ?, telefono = ?, correo = ?, foto = ? WHERE id = ?`,
    [est.nombre_completo, est.cedula, est.telefono || null, est.correo || null, est.foto || null, id]
  );
}


export async function eliminarEstudiante(id: number) {
  const conn = await getConnection();
  await conn.execute("BEGIN");
  try {
    await conn.execute( `UPDATE estudiantes SET activo = 0 WHERE id = ?`, [id]);
    await conn.execute(`UPDATE inscripciones SET estado = 'INACTIVO' WHERE estudiante_id = ?`,[id]);
    await conn.execute("COMMIT");
  } catch (error) {
    await conn.execute("ROLLBACK");
    throw error;
  }
}


export async function obtenerEstudiantesConModulos(): Promise<EstudianteConModulo[]> {
  const conn = await getConnection();

  const result = await conn.select<EstudianteConModulo[]>(`
    SELECT 
      e.*,
      GROUP_CONCAT(m.nombre, ', ') AS modulos
    FROM estudiantes e
    LEFT JOIN inscripciones i ON e.id = i.estudiante_id AND i.estado = 'ACTIVO'
    LEFT JOIN modulos m ON i.modulo_id = m.id
    GROUP BY e.id
    ORDER BY e.fecha_registro DESC
  `);

  return result;
}


export async function buscarEstudiantes(query: string): Promise<Estudiante[]> {
  const conn = await getConnection();
  const q = `%${query}%`;
  return await conn.select<Estudiante[]>(
    `SELECT * FROM estudiantes
     WHERE nombre_completo LIKE ? OR cedula LIKE ?
     ORDER BY nombre_completo
     LIMIT 10`,
    [q, q]
  );
}


