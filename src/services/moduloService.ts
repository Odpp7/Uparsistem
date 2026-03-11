import { getConnection } from "../database/connection";

export interface Modulo {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracion?: string;
  horas_teoricas?: number;
  horas_practicas?: number;
  precio: number;
  profesor_id?: number | null;
  activo?: number;
  fecha_creacion?: string;
}

export interface ModuloConProfesor extends Modulo {
  profesor_nombre?: string;
}


export async function obtenerModulos(): Promise<ModuloConProfesor[]> {
    const conn = await getConnection();
    return await conn.select(`
    SELECT 
      m.*, 
      p.nombre_completo as profesor_nombre
    FROM modulos m
    LEFT JOIN profesores p ON m.profesor_id = p.id
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


export async function crearModulo(mod: Omit<Modulo, "id" | "fecha_registro">) {
    const conn = await getConnection();

    const existe = await conn.select<{ id: number }[]>(`SELECT id FROM modulos WHERE codigo = ?`, [mod.codigo]);
    if (existe.length > 0) { throw new Error("Ya existe un módulo con este código")}

    await conn.execute(
    `INSERT INTO modulos 
    (codigo, nombre, descripcion, duracion, horas_teoricas, horas_practicas, precio, profesor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mod.codigo,
      mod.nombre,
      mod.descripcion || "",
      mod.duracion || "",
      mod.horas_teoricas || 0,
      mod.horas_practicas || 0,
      mod.precio,
      mod.profesor_id || null,
    ]
  );
}

export async function actualizarModulo(id: number, mod: Partial<Omit<Modulo, "id" | "fecha_registro">>) {
    const conn = await getConnection();
    await conn.execute(
    `UPDATE modulos SET
      codigo = ?,
      nombre = ?,
      descripcion = ?,
      duracion = ?,
      horas_teoricas = ?,
      horas_practicas = ?,
      precio = ?,
      profesor_id = ?
     WHERE id = ?`,
    [
      mod.codigo,
      mod.nombre,
      mod.descripcion,
      mod.duracion,
      mod.horas_teoricas,
      mod.horas_practicas,
      mod.precio,
      mod.profesor_id,
      id
    ]
  );
}

export async function eliminarModulo(id: number) {
    const conn = await getConnection();
    await conn.execute("UPDATE modulos SET activo = 0 WHERE id = ?", [id]);
}