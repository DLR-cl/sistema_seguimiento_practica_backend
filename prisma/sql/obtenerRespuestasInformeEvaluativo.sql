SELECT 
      d.nombre AS dimension,
      p.enunciado_pregunta AS pregunta,
      rie.respuesta_texto AS respuesta
  FROM 
      RespuestasInformeEvaluacion rie
  JOIN 
      PreguntasImplementadasInformeEvaluacion pie ON rie.pregunta_id = pie.id_pregunta
  JOIN 
      Preguntas p ON pie.id_pregunta = p.id_pregunta
  JOIN 
      DimensionesEvaluativas d ON p.id_dimension = d.id_dimension
  WHERE 
      rie.informe_id = ?;
