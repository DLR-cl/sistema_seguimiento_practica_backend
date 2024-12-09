-- prisma/sql/obtenerCantidadALumnosPractica.sql
SELECT 
    COUNT(u.id_usuario) as cantidad_alumnos_practicas
FROM
    Usuario u
LEFT JOIN
    practicas p ON u.id_usuario = p.id_alumno
WHERE
    p.estado = "CURSANDO"
