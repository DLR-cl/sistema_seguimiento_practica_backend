-- prisma/sql/obtenerAcademico.sql
SELECT 
    u.id_usuario,
    u.nombre,
    u.rut,
    u.tipo_usuario,
    u.correo
FROM
    Usuario u
WHERE
    u.tipo_usuario IN ("ACADEMICO", "JEFE_CARRERA", "JEFE_DEPARTAMENTO") AND u.id_usuario = ?