-- obtener la cantidad de asignaturas seleccionadas por el semestre
-- @param { DateTime } $1: ini_semestre
-- @param { DateTime } $2: fin_semestre
-- @param { Date } $3: year
select a.nombre, count(
    select * from AsignaturasEnRespuestasInforme where 
)