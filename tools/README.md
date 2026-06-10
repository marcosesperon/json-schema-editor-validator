# get_json_schema.py

Genera un JSON Schema (Draft-07) a partir de uno o varios JSON de ejemplo.

Pensado como complemento al editor visual de `index.html`: el schema producido se puede pegar directamente en el panel "JSON Schema" de la app web.

## Requisitos

- Python 3.7+ (probado en 3.13).
- **Sin `pip install` necesario**: la única dependencia (`genson`) está vendorizada en `tools/vendor/`.

## Fuentes de muestras

Puedes mezclar varias fuentes en la misma invocación. Todas las muestras se combinan para inferir un único schema.

| Origen | Cómo se pasa |
|---|---|
| Fichero con un JSON | argumento posicional: `samples/u1.json samples/u2.json` |
| JSON inline en plano | `--json '{"id":1,"name":"Alice"}'` (repetible con `-j`) |
| JSON inline en base64 | `--json-b64 eyJpZCI6IDF9` (URL-safe aceptado, sin padding ok) |
| Fichero con varios JSON | `--multi datos.jsonl` o `--multi datos.json` (array al raíz) |

`--multi` autodetecta el formato: si parsea como array JSON, cada elemento es una muestra; en otro caso, se trata como JSONL (un JSON por línea, líneas vacías ignoradas).

## Uso

```sh
# Un único JSON desde fichero
python3 tools/get_json_schema.py muestra.json

# Varias muestras (mezcla mejor el resultado)
python3 tools/get_json_schema.py datos/usuario_*.json

# JSON inline en plano (útil para pipes o invocaciones ad-hoc)
python3 tools/get_json_schema.py --json '{"id":1,"name":"Alice"}'

# JSON inline en base64 (útil cuando el JSON tiene comillas problemáticas en shell)
python3 tools/get_json_schema.py --json-b64 eyJpZCI6MX0

# Mezclar varias fuentes
python3 tools/get_json_schema.py muestra.json -j '{"id":2}' --json-b64 eyJpZCI6M30

# Fichero con varios JSONs (array o JSONL)
python3 tools/get_json_schema.py --multi muestras.jsonl
python3 tools/get_json_schema.py --multi muestras_array.json

# Guardar a fichero
python3 tools/get_json_schema.py *.json -o schema.json

# Con título y rangos numéricos / longitudes observadas
python3 tools/get_json_schema.py *.json --title "Usuario" --with-ranges

# Más estricto: marca additionalProperties: false en cada objeto
python3 tools/get_json_schema.py *.json --strict

# Desactivar detección de format o enum
python3 tools/get_json_schema.py *.json --no-format
python3 tools/get_json_schema.py *.json --no-enum

# Cambiar el umbral de detección de enum
python3 tools/get_json_schema.py *.json --enum-threshold 5
```

## Opciones

| Flag | Por defecto | Descripción |
|---|---|---|
| `files` (posicional) | — | Cero o más ficheros JSON (uno por fichero) |
| `-j`, `--json TXT` | — | JSON inline (repetible) |
| `--json-b64 B64` | — | JSON inline en base64 URL-safe (repetible) |
| `--multi PATH` | — | Fichero con varios JSONs (array o JSONL) (repetible) |
| `-o`, `--output PATH` | stdout | Escribir el schema en `PATH` |
| `--title TXT` | `Inferred` | Título del schema |
| `--enum-threshold N` | `10` | Propone `enum` si hay ≤ N valores únicos y ≥3 muestras |
| `--with-ranges` | off | Añade `minLength`/`maxLength`/`minimum`/`maximum` observados |
| `--strict` | off | Marca `additionalProperties: false` en cada objeto |
| `--no-format` | off | Desactiva detección de `format` |
| `--no-enum` | off | Desactiva detección de `enum`/`const` |

Al menos una fuente (`files`, `--json`, `--json-b64` o `--multi`) es obligatoria.

## Qué detecta

- **Estructura completa** (`type`, `properties`, `items`, `required`) vía `genson`.
- **`required`** = intersección de claves entre todas las muestras del mismo "shape" — una propiedad que aparece solo en algunas queda fuera.
- **Uniones de tipos** (`type: ["integer","string"]` o `anyOf`) cuando un campo varía entre muestras.
- **`format`** (date-time, date, time, email, uuid, ipv4, ipv6, uri, hostname). Solo se asigna si **todas** las cadenas del path lo cumplen.
- **`enum`** si hay pocos valores únicos (≤ `--enum-threshold`) y al menos 3 muestras.
- **`const`** si todas las muestras coinciden en un único valor (en lugar de `enum` con un solo elemento).
- **Rangos** (solo con `--with-ranges`): `minLength`/`maxLength` para strings, `minimum`/`maximum` para números.

## Qué NO detecta (de momento)

- `pattern` (regex inferido).
- Cardinalidad de arrays (`minItems`/`maxItems`).
- `uniqueItems`.
- `patternProperties`.
- `dependencies`.

## Ejemplos

### Ejemplo 1: un único JSON simple

`muestra.json`:
```json
{
  "id": "8b2cffc4-93b4-4b32-bf0b-9c0f54a8d7a1",
  "email": "alice@example.com",
  "created": "2026-01-15T08:30:00Z"
}
```

```sh
python3 tools/get_json_schema.py muestra.json
```

Salida:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Inferred",
  "type": "object",
  "properties": {
    "id":      { "type": "string", "format": "uuid" },
    "email":   { "type": "string", "format": "email" },
    "created": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "email", "created"]
}
```

### Ejemplo 2: varias muestras con campos opcionales

`a.json`:
```json
{"id": 1, "name": "Alice", "role": "admin"}
```

`b.json`:
```json
{"id": 2, "name": "Bob",   "role": "user", "lastLogin": "2026-03-01T00:00:00Z"}
```

```sh
python3 tools/get_json_schema.py a.json b.json
```

- `lastLogin` queda fuera de `required` (solo aparece en una muestra).
- `role` recibe `enum: ["admin","user"]` (2 valores únicos en 2 muestras).
- `lastLogin` recibe `format: "date-time"`.

### Ejemplo 3: tipos en conflicto

`m1.json`: `{"value": "ten"}`
`m2.json`: `{"value": 10}`

```sh
python3 tools/get_json_schema.py m1.json m2.json
```

```json
{
  "properties": {
    "value": { "type": ["integer", "string"] }
  }
}
```

## Notas de funcionamiento

- El vendor (`tools/vendor/genson/`) se añade al `sys.path` antes del import — el script funciona en cualquier máquina que tenga Python sin necesidad de red.
- La detección de `format` es **estricta**: si un solo valor de los `N` no cumple el patrón, el `format` no se asigna. Evita falsos positivos.
- La detección de `enum` se desactiva si solo hay 1-2 muestras (riesgo alto de proponer enums espurios).
- El patrón `hostname` exige al menos un punto separador para evitar matchear palabras sueltas como `"Alice"`.

## Actualizar la versión vendorizada de genson

```sh
rm -rf tools/vendor/genson*
python3 -m pip install --target=tools/vendor genson
rm -rf tools/vendor/bin  # opcional, no se necesita
```
