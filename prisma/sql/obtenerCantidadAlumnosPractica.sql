-- prisma/sql/obtenerCantidadALumnosPractica.sql
SELECT 
    COUNT(u.id_usuario) as cantidad_alumnos_practicas
FROM
    usuario u
LEFT JOIN
    Practicas p ON u.id_usuario = p.id_alumno
WHERE
    p.estado = "CURSANDO"
