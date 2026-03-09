-- ============================================
-- TABLA: ESTUDIANTES
-- ============================================
CREATE TABLE IF NOT EXISTS estudiantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  telefono TEXT,
  correo TEXT,
  foto TEXT,
  activo INTEGER DEFAULT 1,
  fecha_registro DATETIME DEFAULT (datetime('now','localtime'))
);

-- ============================================
-- TABLA: PROFESORES
-- ============================================
CREATE TABLE IF NOT EXISTS profesores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  telefono TEXT,
  correo TEXT,
  especialidad TEXT,
  foto TEXT,
  activo INTEGER DEFAULT 1,
  fecha_registro DATETIME DEFAULT (datetime('now','localtime'))
);

-- ============================================
-- TABLA: MODULOS
-- ============================================
CREATE TABLE IF NOT EXISTS modulos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  duracion TEXT,
  horas_teoricas INTEGER,
  horas_practicas INTEGER,
  precio REAL NOT NULL,
  profesor_id INTEGER,
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (profesor_id) REFERENCES profesores(id)
);

-- ============================================
-- TABLA: INSCRIPCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS inscripciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL,
  modulo_id INTEGER NOT NULL,
  fecha_inscripcion DATE NOT NULL,
  estado TEXT DEFAULT 'ACTIVO',
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  FOREIGN KEY (modulo_id) REFERENCES modulos(id),
  UNIQUE(estudiante_id, modulo_id)
);

-- ============================================
-- TABLA: PAGOS
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inscripcion_id INTEGER NOT NULL,
  monto_pagado REAL NOT NULL,
  descuento REAL DEFAULT 0,
  metodo_pago TEXT,
  fecha_pago DATE NOT NULL,
  observaciones TEXT,
  FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id)
);

-- ============================================
-- INDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_estudiante_cedula 
ON estudiantes(cedula);

CREATE INDEX IF NOT EXISTS idx_profesor_cedula 
ON profesores(cedula);

CREATE INDEX IF NOT EXISTS idx_modulo_codigo 
ON modulos(codigo);

CREATE INDEX IF NOT EXISTS idx_inscripcion_estudiante 
ON inscripciones(estudiante_id);

CREATE INDEX IF NOT EXISTS idx_pagos_inscripcion 
ON pagos(inscripcion_id);
