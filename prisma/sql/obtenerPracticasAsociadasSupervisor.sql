SELECT
    u.id_usuario AS id_supervisor,
    p.tipo_practica AS tipo_practica,
    al.id_usuario AS id_alumno,
    al.nombre AS nombre_alumno,
    infC.estado AS estado_informe,
    infC.id_informe_confidencial AS id_informe_confidencial,
    DATE(infC.fecha_inicio) AS fecha_inicio,
    DATE_ADD(DATE(infC.fecha_inicio), INTERVAL 14 DAY) AS fecha_limite_entrega,
    DATEDIFF(DATE_ADD(DATE(infC.fecha_inicio), INTERVAL 14 DAY), CURDATE()) AS dias_restantes,
    p.id_practica
FROM
    Practicas AS p
LEFT JOIN
    usuario AS u ON p.id_supervisor = u.id_usuario
LEFT JOIN
    InformeConfidencial AS infC ON p.id_practica = infC.id_practica
LEFT JOIN
    usuario AS al ON p.id_alumno = al.id_usuario
WHERE
    u.id_usuario = ? 
    AND infC.estado IS NOT NULL;