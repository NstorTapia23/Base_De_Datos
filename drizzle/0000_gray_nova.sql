CREATE TABLE "carreras" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_carrera" varchar NOT NULL,
	"id_facultad" integer NOT NULL,
	CONSTRAINT "carreras_nombre_carrera_unique" UNIQUE("nombre_carrera")
);
--> statement-breakpoint
CREATE TABLE "cortes_tesis" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_trabajo_diploma" integer NOT NULL,
	"numero_corte" integer NOT NULL,
	"url_archivo" varchar,
	CONSTRAINT "cortes_tesis_id_trabajo_diploma_numero_corte_unique" UNIQUE("id_trabajo_diploma","numero_corte")
);
--> statement-breakpoint
CREATE TABLE "cursabilidad_por_carrera" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_carrera" integer NOT NULL,
	"id_modalidad" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_departamento" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estudiantado" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar NOT NULL,
	"apellidos" varchar NOT NULL,
	"id_cursabilidad" integer NOT NULL,
	"fecha_ingreso" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facultades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_facultad" varchar NOT NULL,
	CONSTRAINT "facultades_nombre_facultad_unique" UNIQUE("nombre_facultad")
);
--> statement-breakpoint
CREATE TABLE "modalidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_modalidad" varchar NOT NULL,
	"duracion_años" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profesores" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_profesor" varchar NOT NULL,
	"id_departamento" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipo_trabajo" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_trabajo" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trabajo_diploma" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_estudiante" integer NOT NULL,
	"id_tipo_trabajo" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corte_tesis_profesor" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_profesor" integer NOT NULL,
	"id_corte_tesis" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "carreras" ADD CONSTRAINT "carreras_id_facultad_facultades_id_fk" FOREIGN KEY ("id_facultad") REFERENCES "public"."facultades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cortes_tesis" ADD CONSTRAINT "cortes_tesis_id_trabajo_diploma_trabajo_diploma_id_fk" FOREIGN KEY ("id_trabajo_diploma") REFERENCES "public"."trabajo_diploma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursabilidad_por_carrera" ADD CONSTRAINT "cursabilidad_por_carrera_id_carrera_carreras_id_fk" FOREIGN KEY ("id_carrera") REFERENCES "public"."carreras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursabilidad_por_carrera" ADD CONSTRAINT "cursabilidad_por_carrera_id_modalidad_modalidades_id_fk" FOREIGN KEY ("id_modalidad") REFERENCES "public"."modalidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estudiantado" ADD CONSTRAINT "estudiantado_id_cursabilidad_cursabilidad_por_carrera_id_fk" FOREIGN KEY ("id_cursabilidad") REFERENCES "public"."cursabilidad_por_carrera"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profesores" ADD CONSTRAINT "profesores_id_departamento_departamentos_id_fk" FOREIGN KEY ("id_departamento") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trabajo_diploma" ADD CONSTRAINT "trabajo_diploma_id_estudiante_estudiantado_id_fk" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trabajo_diploma" ADD CONSTRAINT "trabajo_diploma_id_tipo_trabajo_tipo_trabajo_id_fk" FOREIGN KEY ("id_tipo_trabajo") REFERENCES "public"."tipo_trabajo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corte_tesis_profesor" ADD CONSTRAINT "corte_tesis_profesor_id_profesor_profesores_id_fk" FOREIGN KEY ("id_profesor") REFERENCES "public"."profesores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corte_tesis_profesor" ADD CONSTRAINT "corte_tesis_profesor_id_corte_tesis_cortes_tesis_id_fk" FOREIGN KEY ("id_corte_tesis") REFERENCES "public"."cortes_tesis"("id") ON DELETE no action ON UPDATE no action;