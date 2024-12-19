import { Asignaturas, PrismaClient, Tipo_pregunta } from '@prisma/client';
import * as dimensiones from '../src/data/dimensiones.json'
import * as preguntas from '../src/data/preguntas.json'
import * as preguntasInformeEvaluativo from '../src/data/asignarPreguntasInformeEvaluativo.json'
import * as preguntasInformeAlumno from '../src/data/asignarPreguntasInformeAlumnos.json'
import * as preguntasInformeConfidencial from '../src/data/asignarPreguntasInformeConfidencial.json'
import * as asignaturas from '../src/data/asignaturas.json'
import { crearAsignaturaDto } from 'src/modules/asignaturas/dto/crear-asignatura.dto';
import { CrearPreguntaDto } from 'src/modules/preguntas/dto/crear-pregunta.dto';
import { AsignarPreguntaDto } from 'src/modules/preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding...');

  // Crear Dimensiones

  await prisma.dimensionesEvaluativas.createMany({
    data: dimensiones,
    skipDuplicates: true,
  });

  await prisma.preguntas.createMany({
    data: preguntas as CrearPreguntaDto[],
    skipDuplicates: true,
  })



    await prisma.preguntasImplementadasInformeAlumno.createMany({
      data: preguntasInformeAlumno,
      skipDuplicates: true,
    });

    await prisma.preguntasImplementadasInformeEvaluacion.createMany({
      data: preguntasInformeEvaluativo as AsignarPreguntaDto[],
      skipDuplicates: true
    })

  await prisma.asignaturas.createMany({
    data: asignaturas as crearAsignaturaDto[],
    skipDuplicates: true
  })
  // Crear prácticas

  console.log('Seeding completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
