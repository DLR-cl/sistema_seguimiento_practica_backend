SELECT
    a.nombre AS nombre_alumno,
    a.rut AS rut_alumno,
    p.tipo_practica,
    p.estado AS estado_practica,
    infA.estado AS estado_informe,
    ac.nombre AS nombre_academico,
    ac.correo AS correo_academico,
    DATEDIFF(DATE(infA.fecha_termino_revision), DATE(CURDATE())) AS dias_para_revision,
    DATE(infA.fecha_inicio_revision) AS inicio_revision,
    DATE(infA.fecha_termino_revision) AS fin_revision
FROM   
    InformesAlumno AS infA
LEFT JOIN
    Practicas AS p ON p.id_practica = infA.id_practica
LEFT JOIN
    usuario AS a ON a.id_usuario = p.id_alumno
LEFT JOIN
    usuario AS ac ON ac.id_usuario = infA.id_academico 
WHERE
   p.estado = "REVISION_GENERAL"
   AND infA.id_academico IS NOT NULL;
