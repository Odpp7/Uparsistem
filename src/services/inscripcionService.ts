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
     WHERE i.estudiante_id = ?
     AND m.activo = 1`,
    [estudianteId]
  );
}