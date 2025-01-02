SELECT
    p.id_practica AS id_practica,
    p.tipo_practica,
    a.nombre AS nombre_alumno,
    infA.id_informe AS id_informe_alumno,
    infA.estado AS estado_informe,
    iea.id_informe AS id_informe_evaluacion,
    DATE(iea.fecha_revision) AS fecha_revision
FROM
    Practicas AS p
LEFT JOIN
    usuario AS a ON a.id_usuario = p.id_alumno
LEFT JOIN
    InformesAlumno AS infA ON infA.id_practica = p.id_practica
LEFT JOIN
    InformeEvaluacionAcademicos AS iea ON iea.id_informe_alumno = infA.id_informe
WHERE
    iea.id_academico = ? -- Reemplazar con el ID del académico
    AND p.estado != 'CURSANDO';
