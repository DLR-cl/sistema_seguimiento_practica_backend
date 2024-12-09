-- prisma/sql/obtenerCantidadInformes.sql
SELECT 
    u.nombre AS nombre_academico,
    u.rut AS rut_academico,
    u.id_usuario AS id_academico,
    COUNT(ia.id_informe) AS cantidad_informes
FROM 
    usuario u
LEFT JOIN 
    InformesAlumno ia ON ia.id_academico = u.id_usuario
WHERE
    u.tipo_usuario = "ACADEMICO"
GROUP BY 
    u.id_usuario;
