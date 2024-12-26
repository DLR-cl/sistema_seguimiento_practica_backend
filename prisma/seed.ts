import { Asignaturas, PrismaClient, Tipo_pregunta, Tipo_usuario } from '@prisma/client';
import * as dimensiones from '../src/data/dimensiones.json'
import * as preguntas from '../src/data/preguntas.json'
import * as preguntasInformeEvaluativo from '../src/data/asignarPreguntasInformeEvaluativo.json'
import * as preguntasInformeAlumno from '../src/data/asignarPreguntasInformeAlumnos.json'
import * as preguntasInformeConfidencial from '../src/data/asignarPreguntasInformeConfidencial.json'
import * as asignaturas from '../src/data/asignaturas.json'
import { crearAsignaturaDto } from 'src/modules/asignaturas/dto/crear-asignatura.dto';
import { CrearPreguntaDto } from 'src/modules/preguntas/dto/crear-pregunta.dto';
import { AsignarPreguntaDto } from 'src/modules/preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
import { encrypt } from '../src/auth/libs/bcryp';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding...');

  // crear administradores
  const defaultPassword = 'adminiici';
  const hashedPassword = await encrypt(defaultPassword);

  // Crear usuarios predeterminados
  const admin = await prisma.administrador.upsert({
    where: { correo: 'admin@admin.com' },
    update: {}, // Si ya existe, no lo modifica
    create: {
      nombre: 'Administrador',
      correo: 'admin@admin.com',
      password: hashedPassword,
      tipo_usuario: Tipo_usuario.ADMINISTRADOR,
      primerSesion: true,
    },
  });

  const jefeDepartamento = await prisma.administrador.upsert({
    where: { correo: 'jefe@departamento.com' },
    update: {},
    create: {
      nombre: 'Jefe de Departamento',
      correo: 'jefe@departamento.com',
      password: hashedPassword,
      tipo_usuario: Tipo_usuario.JEFE_DEPARTAMENTO,
      primerSesion: true,
    },
  });

  const jefeCarrera = await prisma.administrador.upsert({
    where: { correo: 'jefe@carrera.com' },
    update: {},
    create: {
      nombre: 'Jefe de Carrera',
      correo: 'jefe@carrera.com',
      password: hashedPassword,
      tipo_usuario: Tipo_usuario.JEFE_CARRERA,
      primerSesion: true,
    },
  });

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

    await prisma.preguntasImplementadasInformeConfidencial.createMany({
      data: preguntasInformeConfidencial
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
