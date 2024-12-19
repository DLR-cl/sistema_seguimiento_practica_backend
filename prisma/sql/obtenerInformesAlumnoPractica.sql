SELECT 
    p.id_practica,
    p.tipo_practica,
    p.estado AS estado_practica,
    p.cantidad_horas,
    p.horas_semanales,
    p.fecha_inicio,
    p.fecha_termino,
    p.modalidad,
    u.nombre AS alumno_nombre,
    u.correo AS alumno_correo,
    u.rut AS alumno_rut,
    u.tipo_usuario AS alumno_tipo_usuario,
    ia.id_informe AS id_informe_alumno,
    ia.estado AS estado_informe_alumno,
    ia.archivo AS informe_alumno_archivo,
    ic.id_informe_confidencial,
    ic.horas_practicas_regulares,
    ic.horas_practicas_extraordinarias,
    ic.total_horas,
    ic.horas_inasistencia,
    ic.nota_evaluacion,
    ic.estado AS estado_informe_confidencial,
    us.nombre AS supervisor_nombre,
    us.rut AS supervisor_rut,
    us.correo AS supervisor_correo,
    ua.nombre AS academico_nombre,
    ua.rut AS academico_rut
FROM 
    Practicas p
LEFT JOIN 
    alumno_practica ap ON p.id_alumno = ap.id_user
LEFT JOIN 
    usuario u ON ap.id_user = u.id_usuario
LEFT JOIN 
    usuario us ON p.id_supervisor = us.id_usuario
LEFT JOIN 
    InformeConfidencial ic ON p.id_practica = ic.id_practica
LEFT JOIN 
    InformesAlumno ia ON p.id_practica = ia.id_practica
LEFT JOIN 
    academico ac ON ia.id_academico = ac.id_user
LEFT JOIN 
    usuario ua ON ac.id_user = ua.id_usuario;
