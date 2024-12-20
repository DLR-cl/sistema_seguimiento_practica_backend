SELECT DISTINCT
    a.nombre AS nombre_alumno,
    p.tipo_practica,
    p.id_practica AS id_practica,
    infA.id_informe,
    infA.estado AS estado_informe,
    infA.intentos AS intentos,
    DATEDIFF(DATE(infA.fecha_termino_revision), DATE(CURDATE())) AS dias_para_revision,
    DATE(infA.fecha_inicio_revision) AS inicio_revision,
    DATE(infA.fecha_termino_revision) AS fin_revision
FROM   
    practicas AS p
LEFT JOIN
    usuario AS a ON a.id_usuario = p.id_alumno
LEFT JOIN
    informesalumno AS infA ON infA.id_practica = p.id_practica
WHERE
    infA.id_academico = ? -- Incluir solo informes asignados al académico 1
    AND p.estado != 'CURSANDO';
