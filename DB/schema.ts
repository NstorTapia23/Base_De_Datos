import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const Departamentos = pgTable('departamentos' , {
    id: serial('id').primaryKey(),
    nombre_departamento: varchar('nombre_departamento').notNull()
})

export const Profesores = pgTable('profesores' , 
    {
      id: serial('id').primaryKey(),
      nombre_profesor : varchar('nombre_profesor').notNull(),
      carnet_identidad: varchar('carnet_identidad').unique().notNull(),
      id_departamento: integer('id_departamento').references(() => Departamentos.id).notNull()
    }
)
export const Facultades = pgTable('facultades' ,{
        id: serial('id').primaryKey(),
        nombre_facultad: varchar('nombre_facultad').unique().notNull()
    })
    
export const Carreras = pgTable('carreras' , {
    id: serial('id').primaryKey(), 
    nombre_carrera : varchar('nombre_carrera').unique().notNull(),
    id_facultad : integer('id_facultad').references(() => Facultades.id).notNull()
})

export const Cursabilidad = pgTable('cursabilidad_por_carrera' , {

    id: serial('id').primaryKey(),
    id_carrera: integer('id_carrera').references(() => Carreras.id).notNull(),
    id_modalidad : integer('id_modalidad').references(()=> Modalidades.id).notNull()
})

export const Modalidades = pgTable('modalidades' , 
    {
        id: serial('id').primaryKey(),
        nombre_modalidad: varchar('nombre_modalidad').notNull(),
        duracion_años : integer('duracion_años').notNull()
    }
)
export const corte_tesis_profesor = pgTable("corte_tesis_profesor" , {
     id: serial('id').primaryKey(),
    id_profesor : integer("id_profesor").references(() => Profesores.id).notNull(),
    id_corte_tesis : integer("id_corte_tesis").references(() => Cortes_tesis.id).notNull()
})

export const Cortes_tesis = pgTable('cortes_tesis' , {
      id: serial('id').primaryKey(),
      id_trabajo_diploma: integer("id_trabajo_diploma").references(() => Trabajo_Diploma.id).notNull(),
      corte: integer("numero_corte").notNull(),
      url_archivo: varchar("url_archivo")
}, (t) => ({
  uniq_trabajo_corte: unique().on(t.id_trabajo_diploma, t.corte)
}));

export const Trabajo_Diploma = pgTable("trabajo_diploma" , {
      id: serial('id').primaryKey(),
     id_estudiante: integer("id_estudiante").references(() => Estudiantado.id).notNull(),
     id_tipo_trabajo: integer("id_tipo_trabajo").references(() => Tipo_Trabajo.id).notNull()
})


export const Tipo_Trabajo = pgTable("tipo_trabajo" , {
      id: serial('id').primaryKey(),
      nombre: varchar("nombre_trabajo").notNull()
})



export const Estudiantado = pgTable("estudiantado" , {
      id: serial('id').primaryKey(),
      nombre: varchar('nombre').notNull(),
      apellidos: varchar('apellidos').notNull(),
      carnet_identidad: varchar('carnet_identidad').unique().notNull(),
      id_cursabilidad: integer("id_cursabilidad").references(() => Cursabilidad.id).notNull(),
      fecha_ingreso: timestamp('fecha_ingreso', {withTimezone : true}).defaultNow().notNull(),
})