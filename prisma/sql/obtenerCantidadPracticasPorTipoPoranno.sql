SELECT 
    MONTHNAME(p.fecha_inicio) AS mes_inicio,
    p.tipo_practica AS tipo_practica,
    COUNT(p.id_practica) AS total_practicas
FROM 
    Practicas p
WHERE 
    YEAR(p.fecha_inicio) = ?
GROUP BY 
    MONTH(p.fecha_inicio), MONTHNAME(p.fecha_inicio), p.tipo_practica
ORDER BY 
    MONTH(p.fecha_inicio), p.tipo_practica;
