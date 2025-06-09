# Arquitectura Limpia - Todo API

Implementación de una API REST con arquitectura limpia que soporta múltiples tipos de datasource:
- **Prisma** (PostgreSQL)
- **TypeORM** (PostgreSQL)
- **Memory** (Arreglos de objetos literales en memoria)

## Características

### Arquitectura Limpia
- **Domain Layer**: Entidades, casos de uso, repositorios e interfaces
- **Infrastructure Layer**: Implementaciones de datasources y repositorios
- **Presentation Layer**: Controladores y rutas

### Datasources Disponibles
1. **Prisma**: Base de datos PostgreSQL con ORM Prisma
2. **TypeORM**: Base de datos PostgreSQL con TypeORM
3. **Memory**: Almacenamiento en memoria con arreglos de objetos literales

## Configuración y Desarrollo

### ⚡ Inicio Rápido - Sin Base de Datos (Recomendado para desarrollo)

```bash
# Instalar dependencias
npm install

# Ejecutar con datasource de memoria (NO requiere base de datos)
npm run dev:memory
```

¡Eso es todo! La aplicación funcionará completamente en memoria sin necesidad de Docker ni PostgreSQL.

### 🗄️ Con Base de Datos (Prisma/TypeORM)

#### Opción 1: Prisma
```bash
# 1. Crear archivo .env basado en .env.template
# 2. Configurar DATASOURCE_TYPE=PRISMA en .env
# 3. Ejecutar Docker
docker compose up -d
# 4. Migrar base de datos
npm run prisma:migrate:prod
# 5. Ejecutar aplicación
npm run dev:prisma
```

#### Opción 2: TypeORM
```bash
# 1. Crear archivo .env basado en .env.template
# 2. Configurar DATASOURCE_TYPE=TYPEORM en .env
# 3. Ejecutar Docker
docker compose up -d
# 4. Ejecutar aplicación
npm run dev:typeorm
```

## Scripts Disponibles

### Desarrollo
- `npm run dev` - Modo desarrollo (detecta DATASOURCE_TYPE automáticamente, por defecto: MEMORY)
- `npm run dev:memory` - Desarrollo con datasource de memoria
- `npm run dev:prisma` - Desarrollo con Prisma 
- `npm run dev:typeorm` - Desarrollo con TypeORM

### Producción
- `npm run start:memory` - Producción con datasource de memoria
- `npm run start:prisma` - Producción con Prisma
- `npm run start:typeorm` - Producción con TypeORM

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```bash
# Puerto de la aplicación
PORT=3000

# Tipo de datasource (MEMORY | PRISMA | TYPEORM)
# Default: MEMORY
DATASOURCE_TYPE=MEMORY

# Solo requerido para PRISMA/TYPEORM
POSTGRES_URL=postgresql://postgres:123456@localhost:5432/TodoDB

# Solo para Docker
POSTGRES_USER=postgres
POSTGRES_DB=TodoDB
POSTGRES_PASSWORD=123456
```

## Dominio de Flashcards

### Descripción del Dominio

El sistema de flashcards implementa un dominio completo para el aprendizaje mediante tarjetas de estudio con memoria espaciada. Este dominio está diseñado siguiendo principios de Clean Architecture y modela conceptos reales del aprendizaje.

### Entidades del Dominio

#### 1. FlashcardEntity
Representa una tarjeta de estudio individual con su contenido y metadatos de aprendizaje.

**Propiedades:**
- `id`: Identificador único
- `question`: Pregunta o concepto a estudiar
- `answer`: Respuesta correcta
- `categories`: Lista de categorías a las que pertenece
- `difficulty`: Nivel de dificultad (1-5)
- `tags`: Etiquetas para organización adicional
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Comportamientos específicos del dominio:**
- `hasCategory(category)`: Verifica si pertenece a una categoría
- `addCategory(category)`: Agrega nueva categoría validando duplicados
- `removeCategory(category)`: Remueve categoría existente
- `updateDifficulty(difficulty)`: Actualiza dificultad con validación de rango

**Justificación de inclusión:**
- Entidad central del dominio de aprendizaje
- Encapsula reglas de negocio para gestión de categorías
- Mantiene coherencia en datos de dificultad
- Representa concepto real del mundo de la educación

#### 2. StudySessionEntity
Representa una sesión de estudio para implementar memoria espaciada.

**Propiedades:**
- `id`: Identificador único
- `flashcardId`: Referencia a la flashcard estudiada
- `score`: Puntuación obtenida (1-5)
- `responseTime`: Tiempo de respuesta en segundos
- `studiedAt`: Fecha y hora del estudio
- `nextReviewDate`: Cuándo revisar nuevamente (memoria espaciada)

**Comportamientos específicos del dominio:**
- `calculateNextReview()`: Determina próxima fecha de revisión
- `isCorrectAnswer()`: Evalúa si la respuesta fue correcta
- `getPerformanceLevel()`: Categoriza nivel de rendimiento

**Justificación de inclusión:**
- Implementa algoritmo de memoria espaciada
- Rastrea progreso individual de aprendizaje
- Optimiza retención de conocimiento
- Modela concepto científico de aprendizaje espaciado

### Reglas de Negocio Implementadas

1. **Gestión de Categorías:**
   - Una flashcard puede pertenecer a múltiples categorías
   - No se permiten categorías duplicadas
   - Validación de existencia antes de eliminación

2. **Dificultad:**
   - Rango válido: 1-5 (siendo 5 la más difícil)
   - Validación automática en actualizaciones
   - Influye en algoritmo de memoria espaciada

3. **Memoria Espaciada:**
   - Intervalos de revisión basados en rendimiento
   - Score alto = mayor intervalo hasta próxima revisión
   - Score bajo = revisión más frecuente

4. **Validaciones de Datos:**
   - Pregunta y respuesta obligatorias y no vacías
   - Categorías como arreglo válido
   - Fechas coherentes (creación ≤ actualización)

### Patrones de Diseño Aplicados

1. **Repository Pattern:**
   - Abstracción de acceso a datos
   - Permite intercambio de datasources

2. **Use Case Pattern:**
   - Encapsula lógica de negocio específica
   - Separa reglas de dominio de infraestructura

3. **DTO Pattern:**
   - Validación de datos de entrada
   - Transformación segura entre capas

4. **Entity Pattern:**
   - Comportamientos específicos del dominio
   - Invariantes de negocio protegidas

### DTOs Implementados

#### CreateFlashcardDto
Validaciones para crear nueva flashcard:
- `question`: Requerida, mínimo 1 carácter
- `answer`: Requerida, mínimo 1 carácter  
- `categories`: Opcional, arreglo de strings
- `difficulty`: Opcional, rango 1-5, default 3
- `tags`: Opcional, arreglo de strings

#### UpdateFlashcardDto
Validaciones para actualizar flashcard:
- Todos los campos opcionales
- Mismas validaciones que CreateFlashcardDto cuando presentes
- Permite actualizaciones parciales

#### CreateStudySessionDto
Validaciones para registrar sesión de estudio:
- `flashcardId`: Requerido, ID válido
- `score`: Requerido, rango 1-5
- `responseTime`: Opcional, número positivo

### Casos de Uso del Dominio

#### Flashcards
- `CreateFlashcard`: Crear nueva tarjeta de estudio
- `GetFlashcards`: Obtener todas las flashcards con paginación
- `GetFlashcard`: Obtener flashcard por ID
- `UpdateFlashcard`: Actualizar flashcard existente
- `DeleteFlashcard`: Eliminar flashcard
- `GetFlashcardsByCategory`: Filtrar por categoría
- `GetCategories`: Obtener todas las categorías disponibles

#### StudySessions
- `CreateStudySession`: Registrar nueva sesión de estudio
- `GetStudySessions`: Obtener historial de sesiones
- `GetFlashcardsForReview`: Obtener flashcards pendientes de revisión

### Arquitectura por Capas

#### Capa de Dominio
- **Entidades**: FlashcardEntity, StudySessionEntity
- **DTOs**: Validaciones y transformaciones
- **Repositorios**: Interfaces abstractas
- **Casos de Uso**: Lógica de negocio pura

#### Capa de Infraestructura
- **Datasources**: Implementaciones de acceso a datos
- **Repositorios**: Implementaciones concretas
- **Memory**: Almacenamiento en memoria para desarrollo

#### Capa de Presentación
- **Controladores**: FlashcardsController
- **Rutas**: Endpoints REST organizados
- **Validaciones**: Middleware de validación HTTP

## API Endpoints

### Flashcards API
- Base URL: `/api/flashcards`
- Operaciones CRUD completas
- Filtros por categoría
- Gestión de categorías

### Endpoints Unificados (Todos)
- Base URL: `/api/todos`
- **Funciona con cualquier datasource** configurado
- Operaciones CRUD estándar

### Endpoints Específicos de Memoria (Todos)
- Base URL: `/api/todos-memory`
- Operaciones CRUD + funcionalidades adicionales de gestión de datos
- **Siempre usa datasource de memoria**, independiente de la configuración

Para más detalles sobre los endpoints de memoria, consulta [MEMORY_DATASOURCE.md](./MEMORY_DATASOURCE.md)

## Casos de Uso

### 🧠 Memory Datasource (Recomendado para inicio)
- ✅ **Desarrollo rápido** sin configuración de base de datos
- ✅ **Testing** y prototipos instantáneos
- ✅ **Demos** y presentaciones
- ✅ **Aprendizaje** de arquitectura limpia
- ✅ **CI/CD** sin dependencias externas

### 🗄️ Prisma/TypeORM
- ✅ Aplicaciones en producción
- ✅ Persistencia de datos
- ✅ Aplicaciones multi-usuario
- ✅ Transacciones complejas

## Detección Automática de Datasource

La aplicación detecta automáticamente qué datasource usar:

1. **Variable de entorno `DATASOURCE_TYPE`** (prioridad alta)
2. **Script npm específico** (ej: `npm run dev:memory`)
3. **Por defecto**: MEMORY (si no se especifica nada)

### Logs de Inicio
La aplicación muestra claramente qué datasource está usando:

```bash
🔧 Starting application with datasource: MEMORY
🧠 Using memory datasource - no database initialization required
💾 Data will be stored in memory arrays and lost on restart
🔗 Available endpoints: /api/todos-memory
🎯 Datasource configured: MEMORY
```

## Testing

Puedes usar el archivo `memory-datasource.http` para probar la funcionalidad con tu cliente HTTP favorito (REST Client, Postman, etc.)

## Ventajas de esta Arquitectura

1. **🔄 Intercambiable**: Cambia entre datasources sin modificar código de negocio
2. **🚀 Inicio inmediato**: Funciona sin configuración con datasource de memoria
3. **🧪 Testing**: Ideal para pruebas sin dependencias externas
4. **📚 Educativo**: Perfecto para aprender arquitectura limpia
5. **🔧 Flexible**: Cada datasource para su caso de uso específico

## 🏗️ Modelado del Dominio

### Entidades del Dominio

La aplicación implementa un sistema de flashcards con memoria espaciada basado en los principios de Clean Architecture. Las entidades del dominio han sido diseñadas para capturar las reglas de negocio esenciales del sistema de aprendizaje.

#### 📚 FlashcardEntity

**Descripción**: Representa una tarjeta de estudio (flashcard) que contiene una pregunta, respuesta y metadatos asociados.

**Atributos**:
- `id`: Identificador único de la flashcard
- `question`: Pregunta o concepto a estudiar (requerido)
- `answer`: Respuesta o explicación del concepto (requerido)
- `categories`: Array de categorías para organización (mínimo 1 requerida)
- `difficulty`: Nivel de dificultad del 1 al 5 (default: 1)
- `createdAt`: Timestamp de creación
- `updatedAt`: Timestamp de última modificación

**Comportamientos del Dominio**:
```typescript
- hasCategory(category: string): boolean          // Verifica si tiene una categoría específica
- addCategory(category: string): void             // Agrega nueva categoría sin duplicados
- removeCategory(category: string): void          // Remueve categoría específica
- updateDifficulty(newDifficulty: number): void   // Actualiza dificultad (1-5)
- fromObject(object: any): FlashcardEntity        // Factory method para hidratación
```

**Justificación de Inclusión**:
- **Núcleo del sistema**: Es la entidad principal que encapsula el conocimiento a estudiar
- **Múltiples categorías**: Permite organización flexible y filtrado por temas
- **Gestión de dificultad**: Facilita la adaptación del contenido al nivel del usuario
- **Integridad de datos**: Valida que question, answer y categorías sean obligatorias
- **Comportamientos específicos**: Encapsula la lógica de manipulación de categorías

#### 📊 StudySessionEntity

**Descripción**: Registra cada interacción del usuario con una flashcard durante el estudio, implementando los principios de memoria espaciada.

**Atributos**:
- `id`: Identificador único de la sesión de estudio
- `flashcardId`: Referencia a la flashcard estudiada
- `category`: Categoría bajo la cual se estudió la flashcard
- `response`: Respuesta del usuario ('easy' | 'medium' | 'hard' | 'again')
- `timeSpent`: Tiempo invertido en segundos
- `studiedAt`: Timestamp de la sesión de estudio

**Comportamientos del Dominio**:
```typescript
- getResponseScore(): number        // Convierte respuesta a puntuación (1-4)
- isCorrect(): boolean             // Determina si la respuesta fue correcta
- fromObject(object: any): StudySessionEntity  // Factory method para hidratación
```

**Justificación de Inclusión**:
- **Memoria espaciada**: Fundamental para implementar algoritmos de repetición espaciada
- **Métricas de aprendizaje**: Permite análisis del tiempo de estudio y dificultad percibida
- **Contexto de categoría**: Registra en qué contexto se estudió cada flashcard
- **Historial de progreso**: Habilita seguimiento del progreso del usuario
- **Datos para optimización**: Proporciona información para mejorar el algoritmo de estudio

### 🎯 Reglas de Negocio Implementadas

1. **Integridad de Flashcards**:
   - Una flashcard debe tener pregunta y respuesta obligatorias
   - Debe tener al menos una categoría asignada
   - La dificultad está limitada entre 1 y 5

2. **Sistema de Categorización**:
   - Las categorías no pueden estar vacías
   - Una flashcard puede pertenecer a múltiples categorías
   - Las categorías se utilizan para filtrar y organizar el estudio

3. **Memoria Espaciada**:
   - Cada interacción se registra con timestamp preciso
   - Las respuestas siguen el patrón: 'easy', 'medium', 'hard', 'again'
   - Se registra el tiempo invertido para análisis de dificultad

4. **Auditoría y Trazabilidad**:
   - Todas las entidades mantienen timestamps de creación/modificación
   - Las sesiones de estudio son inmutables una vez creadas

### 🔄 Patrones de Diseño Aplicados

- **Entity Pattern**: Entidades con identidad y comportamientos específicos
- **Factory Method**: Métodos `fromObject()` para construcción segura
- **Value Objects**: Respuestas de estudio como tipos enumerados
- **Domain Services**: Lógica compleja en casos de uso específicos

### 📝 DTOs (Data Transfer Objects)

Los DTOs validan y transportan datos entre capas, asegurando la integridad de las reglas de negocio:

#### CreateFlashcardDto
- **Propósito**: Validar datos para crear nuevas flashcards
- **Validaciones**:
  - Question y answer requeridas y no vacías
  - Al menos una categoría obligatoria
  - Categorías no pueden estar vacías
  - Dificultad entre 1-5 (opcional, default: 1)

#### UpdateFlashcardDto
- **Propósito**: Actualizar flashcards existentes
- **Características**:
  - Todos los campos opcionales (updates parciales)
  - Valida solo campos proporcionados
  - Incluye método `values()` para obtener solo campos modificados

#### CreateStudySessionDto
- **Propósito**: Registrar sesiones de estudio
- **Validaciones**:
  - FlashcardId debe ser válido
  - Categoría requerida
  - Response debe ser: 'easy', 'medium', 'hard', 'again'
  - TimeSpent debe ser positivo

### 🎯 Casos de Uso (Use Cases)

Los casos de uso encapsulan la lógica de negocio específica:

#### Gestión de Flashcards
```typescript
- CreateFlashcard      // Crear nueva flashcard con validaciones
- GetFlashcards        // Obtener todas las flashcards
- GetFlashcard         // Obtener flashcard por ID
- UpdateFlashcard      // Actualizar flashcard existente
- DeleteFlashcard      // Eliminar flashcard
- GetFlashcardsByCategory  // Filtrar por categoría específica
- GetCategories        // Obtener todas las categorías únicas
```

#### Sistema de Estudio (Preparado)
```typescript
- CreateStudySession   // Registrar interacción de estudio
- GetStudyStats        // Obtener estadísticas de progreso
- GetRecentSessions    // Sesiones recientes de estudio
```

### 🏛️ Arquitectura por Capas

```
📁 Domain Layer (Reglas de Negocio)
├── entities/           # Entidades del dominio
├── dtos/              # Objetos de transferencia
├── datasources/       # Interfaces de datos (abstractas)
├── repositories/      # Interfaces de repositorios (abstractas)
└── use-cases/         # Casos de uso específicos

📁 Infrastructure Layer (Implementaciones)
├── datasource/        # Implementaciones concretas (Memory, Prisma, TypeORM)
└── repositories/      # Implementaciones de repositorios

📁 Presentation Layer (Interfaz)
├── controllers/       # Controladores HTTP
└── routes/           # Definición de rutas
```

## Documentación Adicional

- [Memory Datasource Guide](./MEMORY_DATASOURCE.md) - Guía completa del datasource de memoria
- [memory-datasource.http](./memory-datasource.http) - Ejemplos de peticiones HTTP
- [flashcards-api.http](./flashcards-api.http) - Ejemplos de API de flashcards

## Aplicación de Flashcards

La primera imagen muestra un listado de flashcards para la administración de los usuarios.

![I1](./public/assets/images/I1.jpg)

La segunda imagen es donde se muestra la creación de las flashcards y podemos ver que una flashcard puede tener más de una categoría.

![I2](./public/assets/images/I2.jpg)

En la tercera imagen empezamos a estudiar las flashcards escogiendo una categoría de estudio.

![I3](./public/assets/images/I3.jpg)

En la cuarta imagen empezamos a visualizar las flashcard por la categoría escogida.

![I4](./public/assets/images/I4.jpg)

En la quinta imagen mostramos que al dar vuelta a las flashcards se puede ver la respuesta del concepto.

![I5](./public/assets/images/I5.jpg)

Cada iteración de los usuarios con las flashcards debe quedar almacenada para promover la memoria espaciada.
