SELECT 
    caracter_empresa AS tipo_empresa,
    CASE
        WHEN tamano_empresa = '200 funcionarios o más' THEN '200 o más'
        WHEN tamano_empresa = 'Entre 50 a 199 funcionarios' THEN 'Entre 50 y 199'
        WHEN tamano_empresa = '49 funcionarios o menos' THEN '49 o menos'
        ELSE 'Otro'
    END AS tamano_categoria,
    COUNT(*) AS total
FROM Empresas
GROUP BY tipo_empresa, tamano_categoria
ORDER BY tipo_empresa, tamano_categoria;
