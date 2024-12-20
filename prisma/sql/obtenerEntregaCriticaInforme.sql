SELECT
    a.nombre AS nombre_alumno,
    p.tipo_practica,
    p.id_practica,
    infA.estado AS estado_informe,
    DATEDIFF(DATE(infA.fecha_termino_revision), DATE(CURDATE())) AS dias_para_revision,
    DATE(infA.fecha_inicio_revision) AS inicio_revision,
    DATE(infA.fecha_termino_revision) AS fin_revision
FROM   
    InformesAlumno AS infA
LEFT JOIN
    usuario AS a ON a.id_usuario = infA.id_alumno
LEFT JOIN
    Practicas AS p ON p.id_alumno = a.id_usuario
WHERE
   infA.id_academico = ? AND p.estado != "CURSANDO" AND p.estado != "FINALIZADA" AND DATEDIFF(DATE(infA.fecha_termino_revision), DATE(CURDATE())) < 3;
