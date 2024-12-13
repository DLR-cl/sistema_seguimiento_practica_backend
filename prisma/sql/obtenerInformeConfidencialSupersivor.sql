SELECT 
    s.nombre AS nombre_supervisor,
    s.correo AS correo_supervisor,
    DATE(infC.fecha_inicio) AS fecha_inicio,
    a.nombre AS nombre_alumno,
    p.tipo_practica AS tipo_practica,
    DATE_ADD(DATE(infC.fecha_inicio), INTERVAL 14 DAY) AS fecha_limite_entrega,
    DATEDIFF(DATE_ADD(DATE(infC.fecha_inicio), INTERVAL 14 DAY), CURDATE()) AS dias_restantes
FROM
    practicas AS p
LEFT JOIN
    usuario AS s ON p.id_supervisor = s.id_usuario
LEFT JOIN
    usuario AS a ON a.id_usuario = p.id_alumno
LEFT JOIN
    informeconfidencial AS infC ON infC.id_supervisor = s.id_usuario 
                                 AND infC.id_alumno_evaluado = a.id_usuario
                                 AND infC.id_practica = p.id_practica -- Asegura que pertenece a la práctica
WHERE
    infC.fecha_inicio IS NOT NULL AND
    DATEDIFF(DATE_ADD(DATE(infC.fecha_inicio), INTERVAL 14 DAY), CURDATE()) <= 3 AND
    infC.estado = "ESPERA";