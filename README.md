# JSON Schema Editor & Validator

Editor visual y validador de **JSON Schema (Draft-07)** 100% estático. Sin instalación, sin servidor, sin paso de build: abres `index.html` en el navegador y ya está.

Pensado originalmente como herramienta interna para **LIBRA ERP**, pero es genérico y se puede usar con cualquier schema o documento JSON.

> ⚡ Stack: tres ficheros estáticos (`index.html` + `style.css` + `app.js`), JavaScript vanilla sin transpilación. Ajv 8.17 + ajv-formats se cargan **bajo demanda** desde CDN (`esm.sh`) solo cuando activas la validación.

---

## ✨ Características

- 🌳 **Editor visual en árbol** — añade, renombra, elimina y reordena propiedades, define tipos, restricciones y campos requeridos sin tocar JSON a mano.
- 🔁 **Sincronización bidireccional** — el panel de árbol (izquierda) y el JSON fuente (derecha) están vinculados: cualquier cambio en uno se refleja en el otro al instante.
- 🪄 **Inferencia desde JSON de ejemplo** — pega un JSON cualquiera y se genera automáticamente un schema base con tipos, propiedades y campos requeridos detectados.
- ✅ **Validación de JSON contra el schema** — panel inferior con dos áreas (JSON de prueba ↔ resultados) que valida en tiempo real usando Ajv.
- ✅ **Validación del propio schema** — se comprueba en vivo que el schema sea sintácticamente correcto (Draft-07).
- 📥📤 **Importar / exportar** — carga `.json` desde disco y descárgalo de vuelta cuando termines.
- 🧰 **Utilidades del JSON fuente** — formatear, minificar, copiar al portapapeles, codificar/decodificar Base64.
- ↶↷ **Deshacer / rehacer** — historial de cambios completo del schema.
- 🅰️ **Tamaño de fuente ajustable** y **modo compacto** para sesiones largas.
- 🌍 **Internacionalización** — interfaz en **español, inglés y francés**, seleccionable en caliente desde el header. La preferencia se persiste en `localStorage`.
- 📦 **Cero dependencias en local** — los tres ficheros estáticos son completamente autónomos; solo necesitan conexión a internet la primera vez si quieres activar la validación con Ajv.

---

## 🚀 Inicio rápido

```sh
# Clona el repositorio
git clone https://github.com/<tu-usuario>/json-schema-validator.git
cd json-schema-validator

# Ábrelo directamente en el navegador
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

No hay `npm install`, ni servidor de desarrollo, ni transpilación. **Doble clic en el HTML es suficiente.**

> 💡 Si quieres servirlo desde un servidor estático cualquiera (Nginx, GitHub Pages, S3, intranet…), basta con publicar `index.html` tal cual.

---

## 🖱️ Uso típico

### 1. Empezar desde cero

Pulsa **Nuevo** y construye el schema añadiendo propiedades en el árbol de la izquierda. Cada propiedad puede ser:

- `string`, `number`, `integer`, `boolean`, `null`
- `array` (con tipo de elementos configurable)
- `object` (anidable)
- `anyOf` / `oneOf` / `allOf` (composiciones)

Para cada nodo puedes definir restricciones específicas del tipo: `minLength`, `maxLength`, `pattern`, `format`, `minimum`, `maximum`, `enum`, `const`, etc.

### 2. Importar un schema existente

Pulsa **Importar** y selecciona un fichero `.json` con un JSON Schema. El editor lo parsea, lo muestra en el árbol y lo deja listo para editar.

### 3. Inferir un schema desde JSON de ejemplo

Pulsa **Inferir desde JSON**, pega tu documento de ejemplo y obtendrás un schema base que luego puedes refinar visualmente.

**Entrada:**

```json
{
  "id": "8b2cffc4-93b4-4b32-bf0b-9c0f54a8d7a1",
  "email": "alice@example.com",
  "age": 30,
  "tags": ["admin", "billing"]
}
```

**Salida (inferida automáticamente):**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Inferido",
  "type": "object",
  "properties": {
    "id":    { "type": "string" },
    "email": { "type": "string" },
    "age":   { "type": "integer" },
    "tags":  { "type": "array", "items": { "type": "string" } }
  },
  "required": ["id", "email", "age", "tags"]
}
```

A partir de aquí puedes añadir `format: "uuid"` a `id`, `format: "email"` a `email`, `minimum: 0` a `age`, etc., todo desde la interfaz.

### 4. Validar un JSON contra el schema

Abre el panel **Validar JSON contra el schema** (parte inferior), pega un documento de prueba y verás en directo si cumple el schema y, si no, qué errores concretos reporta Ajv (ruta del campo, palabra clave incumplida y mensaje).

La validación necesita Ajv. La primera vez que la actives, el editor descarga `ajv@8.17.1` + `ajv-formats@3.0.1` desde `esm.sh`. Si no hay conexión, el editor sigue funcionando perfectamente — solo se desactiva la validación.

### 5. Exportar

Pulsa **Exportar** para descargar el schema como `.json`, o usa **Copiar** para llevártelo al portapapeles.

---

## 🧱 Estructura del repositorio

```
json-schema-validator/
├── index.html               # Marcado de la app (header, paneles, modales)
├── style.css                # Estilos de la app
├── app.js                   # Lógica completa: editor, sync bidireccional, i18n, validación
├── tools/
│   ├── get_json_schema.py   # Helper Python para inferir schemas desde CLI
│   ├── README.md            # Documentación detallada del helper
│   └── vendor/              # Dependencia 'genson' vendorizada (sin pip install)
└── README.md                # Este archivo
```

> El JS se carga como `<script src="app.js" defer></script>` (script clásico, no módulo), de modo que el "doble clic en `index.html`" sigue funcionando desde `file://`. Ajv se importa dinámicamente desde HTTPS cuando se activa la validación.

---

## 🐍 Helper Python: `tools/get_json_schema.py`

Complemento opcional para generar schemas desde la **línea de comandos**, útil cuando tienes muchas muestras o quieres integrarlo en un pipeline. El schema producido se puede pegar directamente en el panel "JSON Schema" del editor web.

**Sin `pip install`**: la única dependencia (`genson`) está vendorizada en `tools/vendor/`.

```sh
# Inferir desde uno o varios ficheros
python3 tools/get_json_schema.py muestra.json
python3 tools/get_json_schema.py datos/usuario_*.json

# Inferir desde JSON inline
python3 tools/get_json_schema.py --json '{"id":1,"name":"Alice"}'

# Guardar a fichero
python3 tools/get_json_schema.py *.json -o schema.json

# Modo estricto: additionalProperties: false
python3 tools/get_json_schema.py *.json --strict --with-ranges
```

El helper detecta automáticamente: `type`, `properties`, `required` (intersección entre muestras), uniones de tipos, `format` (date-time, email, uuid, ipv4, ipv6, uri, hostname…), `enum`, `const`, y rangos (`minimum`/`maximum`/`minLength`/`maxLength`) bajo demanda.

📖 Documentación completa, opciones y ejemplos: **[`tools/README.md`](tools/README.md)**.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|---|---|
| UI | HTML5 + CSS vanilla (variables CSS, sin framework) |
| Lógica | JavaScript vanilla (script clásico con `defer`), sin transpilación |
| Validación | [Ajv 8.17](https://ajv.js.org/) + [ajv-formats](https://github.com/ajv-validator/ajv-formats), cargados bajo demanda desde [`esm.sh`](https://esm.sh) |
| Schema spec | [JSON Schema Draft-07](https://json-schema.org/draft-07) |
| i18n | Objeto `I18N` interno con tres locales (`es` / `en` / `fr`), sin librerías externas |
| Helper CLI | Python 3.7+ con [genson](https://github.com/wolverdude/genson) vendorizado |

---

## 🌐 Internacionalización

La interfaz está disponible en:

- 🇪🇸 Español
- 🇬🇧 English
- 🇫🇷 Français

El idioma se selecciona en el desplegable del header y se recuerda entre sesiones (`localStorage["jse_locale"]`). Todos los textos visibles, placeholders y tooltips están traducidos.

---

## 🧭 Limitaciones conocidas

- Soporta **JSON Schema Draft-07**. Drafts más recientes (2019-09, 2020-12) no están cubiertos.
- La validación requiere conexión a internet **la primera vez** (para descargar Ajv desde CDN). Después queda cacheado por el navegador.
- El helper Python no detecta `pattern` (regex), `minItems`/`maxItems`, `uniqueItems`, `patternProperties` ni `dependencies`. Eso sí se puede añadir luego desde el editor web.

---

## 🤝 Contribuir

El proyecto es deliberadamente **sin build, sin framework, sin npm**. Cualquier cambio debería respetar esa filosofía: edita los tres ficheros estáticos (`index.html`, `style.css`, `app.js`) directamente.

Si añades cualquier texto visible nuevo, recuerda incluir las **tres claves de traducción** (`es` / `en` / `fr`) en el objeto `I18N`.

---

## 📄 Licencia

[MIT](LICENSE) © Marcos Esperón
