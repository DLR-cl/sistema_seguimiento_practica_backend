SELECT 
    u.nombre AS nombre_alumno, 
    p.id_practica AS id_practica, 
    CASE 
        WHEN p.tipo_practica = 'PRACTICA_UNO' THEN 'Práctica I'
        WHEN p.tipo_practica = 'PRACTICA_DOS' THEN 'Práctica II'
    END AS tipo_practica, 
    p.estado AS estado_practica
FROM 
    Usuario u
JOIN 
    alumno_practica ap ON u.id_usuario = ap.id_user
JOIN 
    Practicas p ON ap.id_user = p.id_alumno;
