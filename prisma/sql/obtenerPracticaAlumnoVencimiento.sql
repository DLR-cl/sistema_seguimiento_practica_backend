SELECT 
    a.correo AS correo_alumno,
    a.nombre AS nombre_alumno,
    p.tipo_practica AS tipo_practica,
    DATEDIFF(DATE(p.fecha_termino), DATE(CURDATE())) AS dias_restantes_practica
FROM 
    practicas as p
LEFT JOIN
    usuario AS a ON a.id_usuario = p.id_alumno
WHERE 
	p.estado = "CURSANDO" AND DATEDIFF(DATE(p.fecha_termino), DATE(CURDATE())) <= 3;