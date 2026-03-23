import { getConnection } from "../database/connection";

export interface Profesor {
  id: number;
  nombre_completo: string;
  cedula: string;
  telefono: string;
  correo?: string | null;
  especialidad?: string | null;
  foto?: string | null;
  fecha_registro: string;
  activo: number;
}

export async function obtenerProfesores(): Promise<Profesor[]> {
  const conn = await getConnection();
  return await conn.select<Profesor[]>(`SELECT * FROM profesores ORDER BY fecha_registro DESC`);
}

export async function crearProfesor(prof: Omit<Profesor, "id" | "fecha_registro" | "activo">) {
  const conn = await getConnection();
  const existe = await conn.select<{ id: number }[]>(`SELECT id FROM profesores WHERE cedula = ?`, [prof.cedula]);
  if (existe.length > 0) { throw new Error("CEDULA_DUPLICADA")}
  await conn.execute(
    `INSERT INTO profesores (nombre_completo, cedula, telefono, correo, especialidad, foto) VALUES (?, ?, ?, ?, ?, ?)`,
    [prof.nombre_completo, prof.cedula, prof.telefono, prof.correo || null, prof.especialidad || null, prof.foto || null]
  );
}

export async function actualizarProfesor(id: number, prof: Partial<Omit<Profesor, "id" | "fecha_registro">>) {
  const conn = await getConnection();
  await conn.execute(
    `UPDATE profesores SET nombre_completo = ?, cedula = ?, telefono = ?, correo = ?, especialidad = ?, foto = ? WHERE id = ?`,
    [prof.nombre_completo, prof.cedula, prof.telefono, prof.correo || null, prof.especialidad || null, prof.foto || null, id]
  );
}

export async function eliminarProfesor(id: number) {
  const conn = await getConnection();
  await conn.execute(`UPDATE profesores SET activo = 0 WHERE id = ?`, [id]);
}

