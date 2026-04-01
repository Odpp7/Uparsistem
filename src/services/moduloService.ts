import { getConnection } from "../database/connection";

export interface Modulo {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracion?: string;
  horas_aula?: number;
  horas_independiente?: number;
  creditos?: number;
  precio: number;
  profesor_id?: number | null;
  activo?: number;
  fecha_creacion?: string;
  programa_id?: number | null;
  ciclo_id?: number | null;
}

export interface Programa {
  id: number;
  nombre: string;
}

export interface Ciclo {
  id: number;
  nombre: string;
  programa_id: number;
}

export interface ModuloConProfesor extends Modulo {
  profesor_nombre?: string;
  programa_nombre?: string;
  ciclo_nombre?: string;
}





export async function obtenerProgramas(): Promise<Programa[]> {
  const conn = await getConnection();
  return await conn.select(`SELECT * FROM programas ORDER BY nombre`);
}


export async function obtenerCiclosPorPrograma(programaId: number): Promise<Ciclo[]> {
  const conn = await getConnection();
  return await conn.select(
    `SELECT * FROM ciclos WHERE programa_id = ? ORDER BY id`,
    [programaId]
  );
}
 
export async function obtenerTodosCiclos(): Promise<Ciclo[]> {
  const conn = await getConnection();
  return await conn.select(`SELECT * FROM ciclos ORDER BY programa_id, id`);
}


export async function obtenerModulos(): Promise<ModuloConProfesor[]> {
  const conn = await getConnection();
  return await conn.select(`
    SELECT
      m.*,
      p.nombre_completo  AS profesor_nombre,
      pr.nombre          AS programa_nombre,
      c.nombre           AS ciclo_nombre
    FROM modulos m
    LEFT JOIN profesores  p  ON m.profesor_id  = p.id
    LEFT JOIN programas   pr ON m.programa_id  = pr.id
    LEFT JOIN ciclos      c  ON m.ciclo_id     = c.id
    ORDER BY m.id DESC
  `);
}
 
export async function obtenerModulosActivos(): Promise<Modulo[]> {
  const conn = await getConnection();
  return await conn.select(`
    SELECT *
    FROM modulos
    WHERE activo = 1
    ORDER BY nombre
  `);
}
 
export async function crearModulo(mod: Omit<Modulo, "id" | "fecha_creacion">) {
  const conn = await getConnection();
 
  const existe = await conn.select<{ id: number }[]>(
    `SELECT id FROM modulos WHERE codigo = ?`,
    [mod.codigo]
  );
  
  if (existe.length > 0) throw new Error("CODIGO_DUPLICADO");
 
  await conn.execute(
    `INSERT INTO modulos
      (codigo, nombre, descripcion, duracion,
       horas_aula, horas_independiente, creditos,
       precio, profesor_id, programa_id, ciclo_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mod.codigo,
      mod.nombre,
      mod.descripcion   ?? "",
      mod.duracion      ?? "576 horas",
      mod.horas_aula         ?? 456,
      mod.horas_independiente ?? 120,
      mod.creditos      ?? 1,
      mod.precio,
      mod.profesor_id   ?? null,
      mod.programa_id   ?? null,
      mod.ciclo_id      ?? null,
    ]
  );
}
 
export async function actualizarModulo(
  id: number,
  mod: Partial<Omit<Modulo, "id" | "fecha_creacion">>
) {
  const conn = await getConnection();
  await conn.execute(
    `UPDATE modulos SET
      codigo              = ?,
      nombre              = ?,
      descripcion         = ?,
      duracion            = ?,
      horas_aula          = ?,
      horas_independiente = ?,
      creditos            = ?,
      precio              = ?,
      profesor_id         = ?,
      programa_id         = ?,
      ciclo_id            = ?
     WHERE id = ?`,
    [
      mod.codigo,
      mod.nombre,
      mod.descripcion,
      mod.duracion      ?? "576 horas",
      mod.horas_aula         ?? 456,
      mod.horas_independiente ?? 120,
      mod.creditos      ?? 1,
      mod.precio,
      mod.profesor_id   ?? null,
      mod.programa_id   ?? null,
      mod.ciclo_id      ?? null,
      id,
    ]
  );
}
 
export async function eliminarModulo(id: number) {
  const conn = await getConnection();
  await conn.execute("UPDATE modulos SET activo = 0 WHERE id = ?", [id]);
}