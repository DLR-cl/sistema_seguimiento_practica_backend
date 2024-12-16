SELECT 
    p.tipo_practica AS practica,
    CASE 
        WHEN ia.estado = 'APROBADA' THEN 'APROBADOS'
        WHEN ia.estado = 'DESAPROBADA' THEN 'REPROBADOS'
    END AS estado,
    COUNT(*) AS cantidad
FROM 
    Practicas p
INNER JOIN 
    InformesAlumno ia ON ia.id_practica = p.id_practica
WHERE 
    p.tipo_practica = 'PRACTICA_UNO'
    AND ia.estado IN ('APROBADA', 'DESAPROBADA') -- Considerar solo estos dos estados
GROUP BY 
    p.tipo_practica, 
    estado;
