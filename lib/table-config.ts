import * as schema from "@/DB/schema";

export interface ForeignKeyConfig {
  slug: string;
  displayField: string;
  displayExpression?: string;
  optionsQuery?: string;
}

export interface FieldConfig {
  columnName: string;
  label: string;
  type: "text" | "number" | "select" | "timestamp";
  foreignKey?: ForeignKeyConfig;
  required?: boolean;
  editable?: boolean;
  helpText?: string;
}

export interface TableConfig {
  label: string;
  slug: string;
  dbName?: string;
  table: any;
  fields: FieldConfig[];
}

export const tableConfigs: Record<string, TableConfig> = {
  departamentos: {
    label: "Departamentos",
    slug: "departamentos",
    table: schema.Departamentos,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre_departamento", label: "Nombre del Departamento", type: "text", required: true },
    ],
  },
  profesores: {
    label: "Profesores",
    slug: "profesores",
    table: schema.Profesores,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre_profesor", label: "Nombre del Profesor", type: "text", required: true },
      { columnName: "carnet_identidad", label: "Carnet de Identidad", type: "text", required: true },
      { columnName: "id_departamento", label: "Departamento", type: "select", required: true, foreignKey: { slug: "departamentos", displayField: "nombre_departamento" } },
    ],
  },
  facultades: {
    label: "Facultades",
    slug: "facultades",
    table: schema.Facultades,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre_facultad", label: "Nombre de la Facultad", type: "text", required: true },
    ],
  },
  carreras: {
    label: "Carreras",
    slug: "carreras",
    table: schema.Carreras,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre_carrera", label: "Nombre de la Carrera", type: "text", required: true },
      { columnName: "id_facultad", label: "Facultad", type: "select", required: true, foreignKey: { slug: "facultades", displayField: "nombre_facultad" } },
    ],
  },
  modalidades: {
    label: "Modalidades",
    slug: "modalidades",
    table: schema.Modalidades,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre_modalidad", label: "Nombre de la Modalidad", type: "text", required: true },
      { columnName: "duracion_años", label: "Duración (años)", type: "number", required: true },
    ],
  },
  cursabilidad: {
    label: "Cursabilidad por Carrera",
    slug: "cursabilidad",
    dbName: "cursabilidad_por_carrera",
    table: schema.Cursabilidad,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "id_carrera", label: "Carrera", type: "select", required: true, foreignKey: { slug: "carreras", displayField: "nombre_carrera" } },
      { columnName: "id_modalidad", label: "Modalidad", type: "select", required: true, foreignKey: { slug: "modalidades", displayField: "nombre_modalidad" } },
    ],
  },
  tipo_trabajo: {
    label: "Tipos de Trabajo",
    slug: "tipo_trabajo",
    table: schema.Tipo_Trabajo,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre_trabajo", label: "Nombre del Tipo", type: "text", required: true },
    ],
  },
  estudiantado: {
    label: "Estudiantado",
    slug: "estudiantado",
    table: schema.Estudiantado,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "nombre", label: "Nombre", type: "text", required: true },
      { columnName: "apellidos", label: "Apellidos", type: "text", required: true },
      { columnName: "carnet_identidad", label: "Carnet de Identidad", type: "text", required: true },
      { columnName: "id_cursabilidad", label: "Cursabilidad", type: "select", required: true, foreignKey: {
        slug: "cursabilidad",
        displayField: "id",
        displayExpression: '(SELECT c."nombre_carrera" || \' - \' || m."nombre_modalidad" FROM "cursabilidad_por_carrera" cc JOIN "carreras" c ON cc."id_carrera" = c."id" JOIN "modalidades" m ON cc."id_modalidad" = m."id" WHERE cc."id" = "estudiantado"."id_cursabilidad")',
        optionsQuery: 'SELECT cc."id", c."nombre_carrera" || \' - \' || m."nombre_modalidad" AS display FROM "cursabilidad_por_carrera" cc JOIN "carreras" c ON cc."id_carrera" = c."id" JOIN "modalidades" m ON cc."id_modalidad" = m."id"',
      } },
      { columnName: "fecha_ingreso", label: "Fecha de Ingreso", type: "timestamp", editable: false },
    ],
  },
  trabajo_diploma: {
    label: "Trabajos de Diploma",
    slug: "trabajo_diploma",
    table: schema.Trabajo_Diploma,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "id_estudiante", label: "Estudiante", type: "select", required: true, foreignKey: { slug: "estudiantado", displayField: "nombre", displayExpression: '"estudiantado"."nombre" || \' \' || "estudiantado"."apellidos"' } },
      { columnName: "id_tipo_trabajo", label: "Tipo de Trabajo", type: "select", required: true, foreignKey: { slug: "tipo_trabajo", displayField: "nombre_trabajo" } },
    ],
  },
  cortes_tesis: {
    label: "Cortes de Tesis",
    slug: "cortes_tesis",
    table: schema.Cortes_tesis,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "id_trabajo_diploma", label: "Trabajo de Diploma", type: "select", required: true, foreignKey: {
        slug: "trabajo_diploma",
        displayField: "id",
        displayExpression: '(SELECT tt."nombre_trabajo" || \' - \' || e."nombre" || \' \' || e."apellidos" FROM "trabajo_diploma" td JOIN "tipo_trabajo" tt ON td."id_tipo_trabajo" = tt."id" JOIN "estudiantado" e ON td."id_estudiante" = e."id" WHERE td."id" = "cortes_tesis"."id_trabajo_diploma")',
        optionsQuery: 'SELECT td."id", tt."nombre_trabajo" || \' - \' || e."nombre" || \' \' || e."apellidos" AS display FROM "trabajo_diploma" td JOIN "tipo_trabajo" tt ON td."id_tipo_trabajo" = tt."id" JOIN "estudiantado" e ON td."id_estudiante" = e."id"',
      } },
      { columnName: "corte", label: "Número de Corte", type: "number", required: true },
      { columnName: "url_archivo", label: "URL del Archivo", type: "text" },
    ],
  },
  corte_tesis_profesor: {
    label: "Corte Tesis - Profesor",
    slug: "corte_tesis_profesor",
    table: schema.corte_tesis_profesor,
    fields: [
      { columnName: "id", label: "ID", type: "number", editable: false },
      { columnName: "id_profesor", label: "Profesor", type: "select", required: true, foreignKey: { slug: "profesores", displayField: "nombre_profesor" } },
      { columnName: "id_corte_tesis", label: "Corte de Tesis (seleccionar corte)", type: "select", required: true, helpText: "Seleccione el corte de tesis correspondiente", foreignKey: {
        slug: "cortes_tesis",
        displayField: "id",
        displayExpression: '(SELECT \'Corte \' || ct."numero_corte" || \' - \' || tt."nombre_trabajo" || \' de \' || e."nombre" || \' \' || e."apellidos" FROM "cortes_tesis" ct JOIN "trabajo_diploma" td ON ct."id_trabajo_diploma" = td."id" JOIN "tipo_trabajo" tt ON td."id_tipo_trabajo" = tt."id" JOIN "estudiantado" e ON td."id_estudiante" = e."id" WHERE ct."id" = "corte_tesis_profesor"."id_corte_tesis")',
        optionsQuery: 'SELECT ct."id", \'Corte \' || ct."numero_corte" || \' - \' || tt."nombre_trabajo" || \' de \' || e."nombre" || \' \' || e."apellidos" AS display FROM "cortes_tesis" ct JOIN "trabajo_diploma" td ON ct."id_trabajo_diploma" = td."id" JOIN "tipo_trabajo" tt ON td."id_tipo_trabajo" = tt."id" JOIN "estudiantado" e ON td."id_estudiante" = e."id"',
      } },
    ],
  },
};

export interface ReverseForeignKey {
  childSlug: string;
  childLabel: string;
  fkColumnName: string;
}

export function getReverseForeignKeys(): Record<string, ReverseForeignKey[]> {
  const map: Record<string, ReverseForeignKey[]> = {};

  for (const [slug, config] of Object.entries(tableConfigs)) {
    for (const field of config.fields) {
      if (field.foreignKey) {
        const targetSlug = field.foreignKey.slug;
        if (!map[targetSlug]) map[targetSlug] = [];
        map[targetSlug].push({
          childSlug: slug,
          childLabel: config.label,
          fkColumnName: field.columnName,
        });
      }
    }
  }

  return map;
}

export const tableOrder = [
  "departamentos",
  "profesores",
  "facultades",
  "carreras",
  "modalidades",
  "cursabilidad",
  "tipo_trabajo",
  "estudiantado",
  "trabajo_diploma",
  "cortes_tesis",
  "corte_tesis_profesor",
];
