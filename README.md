# Sistema de Seguimiento de Prácticas

## Descripción
Sistema backend desarrollado en NestJS para la gestión y seguimiento de prácticas profesionales de estudiantes. El sistema permite el manejo de informes, evaluaciones y seguimiento de prácticas tanto para alumnos como para académicos.

## Propósito Actual: Optimización y Remodelación
El proyecto se encuentra en fase de optimización y remodelación con los siguientes objetivos:

### 1. Mejoras de Rendimiento
- Implementación de sistema de colas con Redis y Bull para tareas asíncronas
- Optimización de consultas a base de datos
- Mejora en la generación de reportes Excel

### 2. Arquitectura Distribuida
- Preparación para entorno multi-instancia
- Implementación de patrones de diseño robustos
- Mejora en la escalabilidad del sistema

### 3. Generación de Reportes
- Automatización de reportes semanales
- Mejora en la estructura y presentación de reportes Excel
- Implementación de reportes por académico

## Características Principales
- Gestión de prácticas profesionales
- Seguimiento de informes de alumnos
- Evaluaciones académicas
- Generación automática de reportes
- Sistema de notificaciones
- Gestión de usuarios y roles

## Tecnologías
- NestJS
- TypeScript
- PostgreSQL
- Redis
- Bull (para manejo de colas)
- ExcelJS (para generación de reportes)

## Estructura del Proyecto
```
src/
├── auth/                 # Autenticación y autorización
├── database/            # Configuración de base de datos
├── modules/             # Módulos principales
├── services/            # Servicios de negocio
│   └── generacion-reportes/  # Generación de reportes
└── types/               # Interfaces y tipos
```

## Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run start:dev
```

## Variables de Entorno
```env
# Base de datos
DATABASE_URL=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=
```

## Optimizaciones Implementadas
1. **Sistema de Colas**
   - Implementación de Bull para tareas asíncronas
   - Manejo de reportes automáticos
   - Prevención de duplicación de tareas

2. **Reportes Excel**
   - Generación optimizada de reportes
   - Estructura mejorada por académico
   - Formato profesional y consistente

3. **Arquitectura**
   - Preparación para entorno distribuido
   - Mejora en la gestión de recursos
   - Optimización de consultas


## Contribución
Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT.
