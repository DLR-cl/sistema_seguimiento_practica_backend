-- prisma/sql/obtenerAcademico.sql
-- @Param {Type} $1: id del academico
SELECT 
    u.id_usuario,
    u.nombre,
    u.rut,
    u.tipo_usuario,
    u.correo
FROM
    Usuario
WHERE
    u.tipo_usuario = "ACADEMICO" AND u.id_usuario = $1