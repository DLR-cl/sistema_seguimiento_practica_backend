import { Academico, Asignaturas, PrismaClient, Tipo_pregunta, Tipo_usuario } from '@prisma/client';
import * as dimensiones from '../src/data/dimensiones.json'
import * as preguntas from '../src/data/preguntas.json'
import * as preguntasInformeEvaluativo from '../src/data/asignarPreguntasInformeEvaluativo.json'
import * as preguntasInformeAlumno from '../src/data/asignarPreguntasInformeAlumnos.json'
import * as preguntasInformeConfidencial from '../src/data/asignarPreguntasInformeConfidencial.json'
import * as asignaturas from '../src/data/asignaturas.json'
import * as academicos from '../src/data/academicos2024.json'
import { encrypt } from '../src/auth/libs/bcryp';
import { AsignarPreguntaDto, crearAsignaturaDto, CrearPreguntaDto } from './dto/dto';
import { CreateAcademicoDto } from 'modules/academicos/dto/create-academicos.dto';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding...');
  const startTime = new Date(); // Marca el inicio
  // crear administradores
  try {


    const defaultPassword = 'adminiici';
    const hashedPassword = await encrypt(defaultPassword);



    await Promise.all([
      prisma.administrador.upsert({
        where: { correo: 'admin@admin.com' },
        update: {},
        create: {
          nombre: 'Administrador',
          correo: 'admin@admin.com',
          password: hashedPassword,
          tipo_usuario: Tipo_usuario.ADMINISTRADOR,
          primerSesion: true,
        },
      }),
      prisma.administrador.upsert({
        where: { correo: 'diis@gestion.uta.cl' },
        update: {},
        create: {
          nombre: 'Secretaria Departamento',
          correo: 'diis@gestion.uta.cl',
          password: hashedPassword,
          tipo_usuario: Tipo_usuario.SECRETARIA_DEPARTAMENTO,
          primerSesion: true,
        },
      }),
      prisma.administrador.upsert({
        where: { correo: 'ici@gestion.uta.cl' },
        update: {},
        create: {
          nombre: 'Secretaria Carrera',
          correo: 'ici@gestion.uta.cl',
          password: hashedPassword,
          tipo_usuario: Tipo_usuario.SECRETARIA_CARRERA,
          primerSesion: true,
        },
      }),
      prisma.administrador.upsert({
        where: { correo: 'jefe@departamento.com' },
        update: {},
        create: {
          nombre: 'Jefe de Departamento',
          correo: 'jefe@departamento.com',
          password: hashedPassword,
          tipo_usuario: Tipo_usuario.JEFE_DEPARTAMENTO,
          primerSesion: true,
        },
      }),
      prisma.administrador.upsert({
        where: { correo: 'jefe@carrera.com' },
        update: {},
        create: {
          nombre: 'Jefe de Carrera',
          correo: 'jefe@carrera.com',
          password: hashedPassword,
          tipo_usuario: Tipo_usuario.JEFE_CARRERA,
          primerSesion: true,
        },
      }),
    ]);

    // Crear dimensiones y preguntas
    await prisma.dimensionesEvaluativas.createMany({
      data: dimensiones,
      skipDuplicates: true,
    });

    await prisma.preguntas.createMany({
      data: preguntas as CrearPreguntaDto[],
      skipDuplicates: true,
    });



    // Asignar preguntas a informes
    await Promise.all([
      prisma.preguntasImplementadasInformeAlumno.createMany({
        data: preguntasInformeAlumno,
        skipDuplicates: true,
      }),
      prisma.preguntasImplementadasInformeEvaluacion.createMany({
        data: preguntasInformeEvaluativo as AsignarPreguntaDto[],
        skipDuplicates: true,
      }),
      prisma.preguntasImplementadasInformeConfidencial.createMany({
        data: preguntasInformeConfidencial,
        skipDuplicates: true,
      }),
    ]);

    // Crear asignaturas
    await prisma.asignaturas.createMany({
      data: asignaturas as crearAsignaturaDto[],
      skipDuplicates: true,
    });

    const academicosConPassword = await Promise.all(
      academicos.map(async (academico) => {
        const passwordRaw = academico.rut.replace(/[^0-9]/g, '').slice(0, 8);
        const hashedPassword = await encrypt(passwordRaw);
        return {
          ...academico,
          password: hashedPassword,
          tipo_usuario: Tipo_usuario.ACADEMICO
        };
      })
    );
    // Crear usuarios y académicos
    await crearUsuariosYAcademicos(academicosConPassword);
    console.log('Seeding completado.');
  } catch (error) {
    console.error('Error durante el seeding:', error);
  } finally {
    const endTime = new Date(); // Marca el final
    const elapsedTime = endTime.getTime() - startTime.getTime(); // Tiempo en milisegundos
    console.log(`Tiempo total de ejecución: ${elapsedTime / 1000} segundos`);

    await prisma.$disconnect();
  }
}
async function crearUsuariosYAcademicos(academicosConPassword: any[]) {
  for (const academico of academicosConPassword) {
    // Crear usuario en la tabla usuarios
    const acad = await prisma.usuarios.findUnique({where: {correo:  academico.correo}});
    if(!acad){
      const usuarioCreado = await prisma.usuarios.create({
        data: {
          correo: academico.correo,
          nombre: academico.nombre,
          rut: academico.rut,
          password: academico.password,
          tipo_usuario: academico.tipo_usuario,
          primerSesion: true,
        }
      });
    // Crear académico en la tabla academicos
      await prisma.academico.create({
        data: {
          id_user: usuarioCreado.id_usuario, // ID del usuario creado
        },
      });
    }



  }

  console.log('Usuarios y académicos creados correctamente.');
}

main();

