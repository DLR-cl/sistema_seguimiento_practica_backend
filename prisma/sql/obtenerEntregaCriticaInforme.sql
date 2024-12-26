SELECT
    a.nombre AS nombre_alumno,
    p.tipo_practica,
    p.id_practica,
    infA.estado AS estado_informe,
    DATEDIFF(DATE(infA.fecha_termino_revision), DATE(CURDATE())) AS dias_para_revision,
    DATE(infA.fecha_inicio_revision) AS inicio_revision,
    DATE(infA.fecha_termino_revision) AS fin_revision
FROM   
    Practicas AS p
LEFT JOIN
    usuario AS a ON a.id_usuario = p.id_alumno
LEFT JOIN
    InformesAlumno AS infA ON infA.id_practica = p.id_practica
WHERE
   infA.id_academico = ? AND p.estado != "CURSANDO" AND p.estado != "FINALIZADA" AND DATEDIFF(DATE(infA.fecha_termino_revision), DATE(CURDATE())) < 3;