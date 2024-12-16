SELECT 
    p.tipo_practica AS tipo_practica,
    COUNT(p.id_practica) AS cantidad_estudiantes
FROM 
    Practicas p
WHERE 
    p.estado = 'CURSANDO' -- Filtrar solo prácticas en estado CURSANDO
GROUP BY 
    p.tipo_practica;
