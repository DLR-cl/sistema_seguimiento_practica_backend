import { Test, TestingModule } from '@nestjs/testing';
import { TratamientoDatosService } from './tratamiento-datos.service';
import { RecopilacionDatosService } from '../recopilacion-datos/informe-confidencial/recopilacion-datos-confidencial.service';
import { DimensionesEvaluativas, Preguntas, PreguntasImplementadasInformeConfidencial, RespuestasInformeConfidencial, Tipo_pregunta } from '@prisma/client';

describe('TratamientoDatosService', () => {
  let service: TratamientoDatosService;
  let recopilacionDatosService: RecopilacionDatosService;

  const mockRecopilacionDatosService = {
    obtenerIdsInformeConfidencial: jest.fn(),
    obtenerRespuestasInformeConfidencial: jest.fn(),
    obtenerPreguntasImplementadasInformeConfidencial: jest.fn(),
    obtenerPreguntas: jest.fn(),
    obtenerDimensionPreguntas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TratamientoDatosService,
        {
          provide: RecopilacionDatosService,
          useValue: mockRecopilacionDatosService,
        },
      ],
    }).compile();

    service = module.get<TratamientoDatosService>(TratamientoDatosService);
    recopilacionDatosService = module.get<RecopilacionDatosService>(RecopilacionDatosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('tratarDatosInformeConfidencial', () => {
    it('should process and return counted responses grouped by dimension', async () => {
      // Arrange
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const mockDataInformeConfidencial = [
        { id_informe_confidencial: 1 },
        { id_informe_confidencial: 2 },
      ];

      const mockRespuestas: RespuestasInformeConfidencial[] = [
        {
          pregunta_id: 1,
          respuesta_texto: 'Sí',
          puntos: null,
          informe_id: 1,
        },
        {
          pregunta_id: 1,
          respuesta_texto: 'Sí',
          puntos: null,
          informe_id: 2,
        },
        {
          pregunta_id: 2,
          puntos: 5,
          respuesta_texto: null,
          informe_id: 1,
        },
      ];

      const mockPreguntasImplementadas: PreguntasImplementadasInformeConfidencial[] = [
        {
          id_pregunta: 1,
        },
        {
          id_pregunta: 2,
        },
      ];

      const mockPreguntas: Preguntas[] = [
        {
          id_pregunta: 1,
          enunciado_pregunta: '¿Está satisfecho con el servicio?',
          tipo_pregunta: Tipo_pregunta.ABIERTA,
          id_dimension: 1,
        },
        {
          id_pregunta: 2,
          enunciado_pregunta: 'Califique del 1 al 5',
          tipo_pregunta: Tipo_pregunta.EVALUATIVA,
          id_dimension: 1,
        },
      ];

      const mockDimensiones: DimensionesEvaluativas[] = [
        {
          id_dimension: 1,
          nombre: 'Satisfacción',
          descripcion: 'Dimension de satisfacción',
        },
      ];

      mockRecopilacionDatosService.obtenerIdsInformeConfidencial.mockResolvedValue(mockDataInformeConfidencial);
      mockRecopilacionDatosService.obtenerRespuestasInformeConfidencial.mockResolvedValue(mockRespuestas);
      mockRecopilacionDatosService.obtenerPreguntasImplementadasInformeConfidencial.mockResolvedValue(mockPreguntasImplementadas);
      mockRecopilacionDatosService.obtenerPreguntas.mockResolvedValue(mockPreguntas);
      mockRecopilacionDatosService.obtenerDimensionPreguntas.mockResolvedValue(mockDimensiones);

      // Act
      const result = await service.tratarDatosInformeConfidencial(fechaInicio, fechaFin);

      // Assert
      expect(result).toEqual([
        {
          dimension: 'Satisfacción',
          respuestas: [
            {
              pregunta: '¿Está satisfecho con el servicio?',
              respuesta: 'Sí',
              cantidad: 2,
            },
            {
              pregunta: 'Califique del 1 al 5',
              respuesta: 5,
              cantidad: 1,
            },
          ],
        },
      ]);

      // Verify service calls
      expect(mockRecopilacionDatosService.obtenerIdsInformeConfidencial).toHaveBeenCalledWith(fechaInicio, fechaFin);
      expect(mockRecopilacionDatosService.obtenerRespuestasInformeConfidencial).toHaveBeenCalledWith([1, 2]);
      expect(mockRecopilacionDatosService.obtenerPreguntasImplementadasInformeConfidencial).toHaveBeenCalledWith([1, 2]);
      expect(mockRecopilacionDatosService.obtenerPreguntas).toHaveBeenCalledWith([1, 2]);
      expect(mockRecopilacionDatosService.obtenerDimensionPreguntas).toHaveBeenCalledWith([1, 2]);
    });
  });
});
