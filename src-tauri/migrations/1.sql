-- ============================================
-- TABLA: ESTUDIANTES (sin columna foto)
-- ============================================
CREATE TABLE IF NOT EXISTS estudiantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  telefono TEXT,
  correo TEXT,
  activo INTEGER DEFAULT 1,
  fecha_registro DATETIME DEFAULT (datetime('now','localtime'))
);

-- ============================================
-- TABLA: PROFESORES (sin columna foto)
-- ============================================
CREATE TABLE IF NOT EXISTS profesores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  telefono TEXT,
  correo TEXT,
  especialidad TEXT,
  activo INTEGER DEFAULT 1,
  fecha_registro DATETIME DEFAULT (datetime('now','localtime'))
);

-- ============================================
-- TABLA: FOTOS_PERSONAS
-- Se consulta solo bajo demanda, nunca en listados
-- foto_perfil  → 200×200 JPEG ~20KB
-- foto_documento → 600×600 JPEG ~40KB
-- ============================================
CREATE TABLE IF NOT EXISTS fotos_personas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  persona_tipo TEXT NOT NULL CHECK(persona_tipo IN ('ESTUDIANTE', 'PROFESOR')),
  persona_id INTEGER NOT NULL,
  foto_perfil TEXT,
  foto_documento TEXT,
  UNIQUE(persona_tipo, persona_id)
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
  descuento REAL DEFAULT 0,
  nota REAL,
  fecha_nota DATETIME,
  intento INTEGER DEFAULT 1,
  nota_bloqueada INTEGER DEFAULT 0,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  FOREIGN KEY (modulo_id) REFERENCES modulos(id)
);

-- ============================================
-- TABLA: PAGOS
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inscripcion_id INTEGER NOT NULL,
  monto_pagado REAL NOT NULL,
  metodo_pago TEXT,
  fecha_pago DATE NOT NULL,
  observaciones TEXT,
  estado TEXT DEFAULT 'CONFIRMADO',
  FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id)
);

-- ============================================
-- TABLA: EVENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TEXT,
  descripcion TEXT,
  categoria TEXT CHECK(categoria IN ('ACADEMICO', 'ADMINISTRATIVO', 'SOCIAL')) DEFAULT 'ACADEMICO',
  lugar TEXT,
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT (datetime('now','localtime'))
);

-- ============================================
-- INDICES
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

CREATE INDEX IF NOT EXISTS idx_fotos_persona
ON fotos_personas(persona_tipo, persona_id);