# API de Pacientes - Documentación

## Base URL
```
/api/patients
```

## Endpoints Disponibles

### 1. CREATE - Registrar Nuevo Paciente
**POST** `/api/patients/`

**Body (JSON):**
```json
{
  "name": "Juan Pérez",
  "room_number": 101,
  "status": "Amigable",
  "doctor": "Dr. García",
  "meds": [1, 2, 3],
  "next_checkup": "2025-12-01T10:00:00Z"
}
```

**Campos:**
- `name` (String, requerido): Nombre del paciente
- `room_number` (Number, requerido): Número de habitación
- `status` (String, requerido): Estado del paciente. Valores: "Amigable", "Peligroso", "Inestable"
- `doctor` (String, requerido): Nombre del doctor asignado
- `meds` (Array, opcional): Array de IDs de medicamentos
- `next_checkup` (String, opcional): Fecha de próxima revisión (ISO 8601)

**Respuesta Exitosa (201):**
```json
{
  "message": "Paciente registrado exitosamente",
  "patient": {
    "id": 1,
    "name": "Juan Pérez",
    "room_number": 101,
    "status": "Amigable",
    "doctor": "Dr. García",
    "meds": [1, 2, 3],
    "next_checkup": "2025-12-01T10:00:00Z"
  }
}
```

---

### 2. READ - Obtener Todos los Pacientes (Paginado)
**GET** `/api/patients/patients/all`

**Query Parameters:**
- `page` (Number, opcional, default: 1): Número de página
- `limit` (Number, opcional, default: 10): Elementos por página

**Ejemplo:**
```
GET /api/patients/patients/all?page=1&limit=10
```

**Respuesta (200):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "room_number": 101,
      "status": "Amigable",
      "doctor": "Dr. García",
      "meds": [1, 2],
      "next_checkup": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

### 3. READ - Obtener Todos los Pacientes (Sin Paginación)
**GET** `/api/patients/all`

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "room_number": 101,
    "status": "Amigable",
    "doctor": "Dr. García",
    "meds": [1, 2],
    "next_checkup": "2025-12-01T10:00:00Z"
  }
]
```

---

### 4. READ - Obtener Paciente por ID
**GET** `/api/patients/:id`

**Ejemplo:**
```
GET /api/patients/1
```

**Respuesta (200):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "room_number": 101,
  "status": "Amigable",
  "doctor": "Dr. García",
  "meds": [1, 2],
  "next_checkup": "2025-12-01T10:00:00Z"
}
```

**Respuesta Error (404):**
```json
{
  "error": "Paciente con ID 999 no encontrado"
}
```

---

### 5. UPDATE - Actualizar Paciente Completo
**PUT** `/api/patients/:id`

**Body (JSON):**
```json
{
  "name": "Juan Pérez Actualizado",
  "room_number": 102,
  "status": "Inestable",
  "doctor": "Dr. López",
  "meds": [1, 3, 5],
  "next_checkup": "2025-12-15T14:00:00Z"
}
```

**Nota:** Los campos no proporcionados mantendrán sus valores actuales.

**Respuesta (200):**
```json
{
  "message": "Paciente actualizado exitosamente",
  "patient": {
    "id": 1,
    "name": "Juan Pérez Actualizado",
    "room_number": 102,
    "status": "Inestable",
    "doctor": "Dr. López",
    "meds": [1, 3, 5],
    "next_checkup": "2025-12-15T14:00:00Z"
  }
}
```

---

### 6. PATCH - Actualizar Parcialmente un Paciente
**PATCH** `/api/patients/:id`

**Body (JSON):** Solo incluye los campos que deseas actualizar
```json
{
  "status": "Peligroso",
  "room_number": 205
}
```

**Respuesta (200):**
```json
{
  "message": "Paciente actualizado exitosamente",
  "patient": {
    "id": 1,
    "name": "Juan Pérez",
    "room_number": 205,
    "status": "Peligroso",
    "doctor": "Dr. García",
    "meds": [1, 2],
    "next_checkup": "2025-12-01T10:00:00Z"
  }
}
```

---

### 7. DELETE - Eliminar Paciente
**DELETE** `/api/patients/:id`

**Ejemplo:**
```
DELETE /api/patients/1
```

**Respuesta (200):**
```json
{
  "message": "Paciente eliminado exitosamente",
  "patient": {
    "id": 1,
    "name": "Juan Pérez",
    "room_number": 101,
    "status": "Amigable",
    "doctor": "Dr. García",
    "meds": [1, 2],
    "next_checkup": "2025-12-01T10:00:00Z"
  }
}
```

---

### 8. SEARCH - Buscar Pacientes por Criterios
**GET** `/api/patients/search`

**Query Parameters:**
- `name` (String, opcional): Buscar por nombre (parcial)
- `status` (String, opcional): Filtrar por estado exacto
- `doctor` (String, opcional): Buscar por doctor (parcial)
- `room_number` (Number, opcional): Filtrar por habitación exacta

**Ejemplos:**
```
GET /api/patients/search?name=juan
GET /api/patients/search?status=Amigable
GET /api/patients/search?doctor=García&status=Inestable
GET /api/patients/search?room_number=101
```

**Respuesta (200):**
```json
{
  "total": 2,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "room_number": 101,
      "status": "Amigable",
      "doctor": "Dr. García",
      "meds": [1, 2],
      "next_checkup": "2025-12-01T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Juan Ramírez",
      "room_number": 102,
      "status": "Amigable",
      "doctor": "Dr. García",
      "meds": [3],
      "next_checkup": "2025-12-05T11:00:00Z"
    }
  ]
}
```

---

## Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o faltantes
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

---

## Validaciones

### Status
Solo se permiten los siguientes valores:
- "Amigable"
- "Peligroso"
- "Inestable"

### Meds
Debe ser un array de números (IDs de medicamentos):
```json
"meds": [1, 2, 3]
```

### Campos Requeridos (POST)
- name
- room_number
- status
- doctor

### Campos Opcionales
- meds (default: [])
- next_checkup

---

## Ejemplos de Uso con cURL

### Crear paciente:
```bash
curl -X POST http://localhost:3000/api/patients/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María González",
    "room_number": 203,
    "status": "Inestable",
    "doctor": "Dr. Rodríguez",
    "meds": [1, 4],
    "next_checkup": "2025-12-10T09:00:00Z"
  }'
```

### Obtener todos los pacientes:
```bash
curl http://localhost:3000/api/patients/all
```

### Obtener paciente específico:
```bash
curl http://localhost:3000/api/patients/1
```

### Actualizar paciente:
```bash
curl -X PUT http://localhost:3000/api/patients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María González Actualizada",
    "room_number": 204,
    "status": "Amigable",
    "doctor": "Dr. Rodríguez",
    "meds": [1, 2, 4],
    "next_checkup": "2025-12-20T10:00:00Z"
  }'
```

### Actualización parcial:
```bash
curl -X PATCH http://localhost:3000/api/patients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Peligroso"
  }'
```

### Eliminar paciente:
```bash
curl -X DELETE http://localhost:3000/api/patients/1
```

### Buscar pacientes:
```bash
curl "http://localhost:3000/api/patients/search?status=Amigable"
curl "http://localhost:3000/api/patients/search?name=juan&doctor=García"
```

---

## Notas Importantes

1. El ID se genera automáticamente al crear un paciente
2. El ID no puede ser modificado una vez creado
3. Los campos opcionales mantendrán su valor actual si no se proporcionan en PUT/PATCH
4. La búsqueda por nombre y doctor no distingue mayúsculas/minúsculas y es parcial
5. La búsqueda por status y room_number debe ser exacta
6. El formato de fecha recomendado es ISO 8601: "YYYY-MM-DDTHH:mm:ssZ"
