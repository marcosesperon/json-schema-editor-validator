let ajv = null;
let ajvLoadError = null;
// validationState: "off" | "loading" | "error" | "ready"
let validationState = "off";

async function loadAjvOnDemand() {
  if (validationState === "loading" || validationState === "ready") return;
  validationState = "loading";
  ajvLoadError = null;
  updateStatusPill();
  runValidation();
  try {
    const [ajvMod, formatsMod] = await Promise.all([
      import("https://esm.sh/ajv@8.17.1"),
      import("https://esm.sh/ajv-formats@3.0.1"),
    ]);
    const Ajv = ajvMod.default;
    const addFormats = formatsMod.default;
    ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
    addFormats(ajv);
    validationState = "ready";
    validateSchemaItself();
    runValidation();
  } catch (e) {
    ajvLoadError = e;
    validationState = "error";
    console.warn("[json-schema-editor] Ajv no se pudo cargar.", e);
    updateStatusPill();
    runValidation();
  }
}

function updateStatusPill() {
  const pill = document.getElementById("statusPill");
  if (!pill) return;
  pill.title = "";
  if (validationState === "off") {
    pill.className = "status-pill activate";
    pill.textContent = t("activate_validation");
    pill.title = t("activate_validation_hint");
    pill.disabled = false;
  } else if (validationState === "loading") {
    pill.className = "status-pill loading";
    pill.textContent = t("loading_validation");
    pill.disabled = true;
  } else if (validationState === "error") {
    pill.className = "status-pill err";
    pill.textContent = t("validation_load_failed");
    pill.title = (ajvLoadError && (ajvLoadError.message || String(ajvLoadError))) || t("validation_load_failed_hint");
    pill.disabled = false;
  }
  // "ready" state is managed by validateSchemaItself
}

// ──────────────────────────────────────────────────────────────
// i18n
// ──────────────────────────────────────────────────────────────
const I18N = {
  es: {
    _label: "Español",
    app_title: "JSON Schema Editor & Validator | ME",
    btn_new: "Nuevo",
    btn_import: "Importar",
    btn_export: "Exportar",
    btn_infer: "Inferir desde JSON",
    btn_format: "Formatear",
    btn_minify: "Minificar",
    btn_base64: "Base64",
    btn_copy: "Copiar",
    btn_copied: "¡Copiado!",
    btn_cancel: "Cancelar",
    btn_generate: "Generar schema",
    schema_valid: "Schema válido",
    schema_invalid_short: "Schema inválido",
    schema_invalid_prefix: "Schema: ",
    json_invalid: "JSON inválido",
    json_invalid_prefix: "JSON inválido: ",
    valid: "Válido",
    untested: "Sin probar",
    validate_json: "Validar JSON",
    validate_panel_title: "Validar JSON contra el schema",
    visual_editor: "Editor visual",
    visual_hint: "— Edita propiedades, tipos y restricciones",
    json_schema_pane: "JSON Schema",
    source_hint: "— Fuente editable",
    test_json: "JSON de prueba",
    test_json_placeholder: '{"ejemplo": "pega aquí tu JSON"}',
    results: "Resultados",
    edit_test_json: "Edita el JSON de prueba para validar.",
    json_meets_schema: "✓ El JSON cumple el schema.",
    json_tree_title: "Árbol del JSON",
    infer_modal_title: "Inferir schema desde JSON de ejemplo",
    infer_modal_hint: "Pega un JSON de ejemplo y se generará automáticamente un schema base.",
    collapse_toggle: "Plegar/desplegar",
    schema_title_placeholder: "Título del schema",
    name_placeholder: "nombre",
    description_placeholder: "descripción…",
    comment_placeholder: "// $comment (anotación interna, no afecta validación)",
    mark_required: "Marcar como requerido",
    required_label: "requerido",
    delete_action: "Eliminar",
    no_properties: "Sin propiedades aún.",
    property_exists: "Ya existe una propiedad con ese nombre",
    property_exists_short: "Ya existe",
    new_property_placeholder: "nuevo nombre de propiedad",
    add_property: "+ Añadir",
    array_items_label: "Tipo de los elementos del array:",
    type_any: "(cualquiera)",
    confirm_new: "¿Empezar un schema vacío? Perderás los cambios actuales.",
    file_read_error: "Error al leer el archivo: ",
    copy_failed: "No se pudo copiar",
    inferred_title: "Inferido",
    default_schema_title: "Mi Schema",
    add_field: "Agregar campo",
    add_pattern: "Agregar patrón",
    pattern_section: "Patrones (regex)",
    pattern_placeholder: "^.*$",
    invalid_regex: "Expresión regular inválida",
    pattern_exists: "Ya existe un patrón con esa expresión.",
    collapse_all: "Colapsar todo",
    expand_all: "Expandir todo",
    compact_mode: "Compacto",
    compact_mode_hint: "Reduce el espaciado y oculta la descripción de los nodos colapsados",
    search_placeholder: "Buscar en el source…",
    search_prev_title: "Anterior coincidencia (Shift+Enter)",
    search_next_title: "Siguiente coincidencia (Enter)",
    btn_undo_title: "Deshacer (Ctrl/⌘+Z)",
    btn_redo_title: "Rehacer (Ctrl/⌘+Shift+Z)",
    validation_disabled: "Validación deshabilitada",
    validation_disabled_hint: "No se pudo cargar Ajv (sin conexión o CDN bloqueada). El editor sigue funcionando.",
    help_title: "Ayuda",
    font_dec_title: "Reducir tamaño de texto",
    font_inc_title: "Aumentar tamaño de texto",
    activate_validation: "Activar validación",
    activate_validation_hint: "Haz clic para cargar Ajv y habilitar la validación.",
    loading_validation: "Cargando Ajv…",
    validation_load_failed: "Error al cargar Ajv",
    validation_load_failed_hint: "No se pudo descargar Ajv. Haz clic para reintentar.",
    retry: "Reintentar",
    required_state: "Requerido",
    optional_state: "Opcional",
    allow_additional_props: "Permitir propiedades adicionales",
    additional_props_allowed: "Propiedades adicionales permitidas",
    array_items_type: "Tipo de elemento",
    type_string: "Texto",
    type_number: "Número",
    type_integer: "Entero",
    type_boolean: "Sí/No",
    type_object: "Objeto",
    type_array: "Lista",
    type_null: "Vacío",
    type_anyOf: "Cualquiera de",
    type_oneOf: "Exactamente uno de",
    type_allOf: "Todos",
    add_alternative: "Agregar alternativa",
    label_min_length: "Longitud mínima",
    label_max_length: "Longitud máxima",
    label_pattern: "Patrón (regex)",
    label_format: "Formato",
    label_minimum: "Mínimo",
    label_maximum: "Máximo",
    label_excl_min: "Mínimo exclusivo",
    label_excl_max: "Máximo exclusivo",
    label_multiple_of: "Múltiplo de",
    label_min_items: "Mínimo de elementos",
    label_max_items: "Máximo de elementos",
    label_unique_items: "Forzar elementos únicos",
    label_min_props: "Mínimo de propiedades",
    label_max_props: "Máximo de propiedades",
    label_default: "Valor por defecto",
    label_enum: "Valores permitidos",
    label_const: "Valor constante",
    ph_no_min: "Sin mínimo",
    ph_no_max: "Sin máximo",
    ph_no_limit: "Sin límite",
    ph_regex: "Expresión regular",
    ph_enum: "a, b, c",
    ph_default: "valor por defecto",
    ph_const: "valor exacto",
    ph_format: "(ninguno)",
    comp_add_alternative: "Añadir alternativa a {0}",
    comp_remove_block: "Quitar todo {0}",
    comp_confirm_remove: "¿Eliminar todo el bloque {0}?",
    comp_add_x: "Añadir {0}",
    comp_alt_label: "+ Alternativa",
    alternatives_one: "1 alternativa",
    alternatives_many: "{0} alternativas",
    errors_one: "1 error",
    errors_many: "{0} errores",
    error_count_one: "1 error",
    error_count_many: "{0} errores",
    locale_label: "Idioma",
    enum_placeholder: "a, b, c",
    error_invalid_json: "JSON inválido:",
    error_invalid_schema: "Schema inválido:",
    bmc_label: "Hacer donación",
  },
  en: {
    _label: "English",
    app_title: "JSON Schema Editor",
    btn_new: "New",
    btn_import: "Import",
    btn_export: "Export",
    btn_infer: "Infer from JSON",
    btn_format: "Format",
    btn_minify: "Minify",
    btn_base64: "Base64",
    btn_copy: "Copy",
    btn_copied: "Copied!",
    btn_cancel: "Cancel",
    btn_generate: "Generate schema",
    schema_valid: "Schema valid",
    schema_invalid_short: "Invalid schema",
    schema_invalid_prefix: "Schema: ",
    json_invalid: "Invalid JSON",
    json_invalid_prefix: "Invalid JSON: ",
    valid: "Valid",
    untested: "Not tested",
    validate_json: "Validate JSON",
    validate_panel_title: "Validate JSON against schema",
    visual_editor: "Visual editor",
    visual_hint: "— Edit properties, types and constraints",
    json_schema_pane: "JSON Schema",
    source_hint: "— Editable source",
    test_json: "Test JSON",
    test_json_placeholder: '{"example": "paste your JSON here"}',
    results: "Results",
    edit_test_json: "Edit the test JSON to validate.",
    json_meets_schema: "✓ JSON matches the schema.",
    json_tree_title: "JSON tree",
    infer_modal_title: "Infer schema from sample JSON",
    infer_modal_hint: "Paste a sample JSON and a base schema will be generated automatically.",
    collapse_toggle: "Collapse/expand",
    schema_title_placeholder: "Schema title",
    name_placeholder: "name",
    description_placeholder: "description…",
    comment_placeholder: "// $comment (internal annotation, does not affect validation)",
    mark_required: "Mark as required",
    required_label: "required",
    delete_action: "Delete",
    no_properties: "No properties yet.",
    property_exists: "A property with that name already exists",
    property_exists_short: "Already exists",
    new_property_placeholder: "new property name",
    add_property: "+ Add",
    array_items_label: "Array item type:",
    type_any: "(any)",
    confirm_new: "Start an empty schema? You will lose current changes.",
    file_read_error: "Error reading file: ",
    copy_failed: "Could not copy",
    inferred_title: "Inferred",
    default_schema_title: "My Schema",
    add_field: "Add field",
    add_pattern: "Add pattern",
    pattern_section: "Patterns (regex)",
    pattern_placeholder: "^.*$",
    invalid_regex: "Invalid regular expression",
    pattern_exists: "A pattern with that expression already exists.",
    collapse_all: "Collapse all",
    expand_all: "Expand all",
    compact_mode: "Compact",
    compact_mode_hint: "Reduce spacing and hide the description of collapsed nodes",
    search_placeholder: "Search in source…",
    search_prev_title: "Previous match (Shift+Enter)",
    search_next_title: "Next match (Enter)",
    btn_undo_title: "Undo (Ctrl/⌘+Z)",
    btn_redo_title: "Redo (Ctrl/⌘+Shift+Z)",
    validation_disabled: "Validation disabled",
    validation_disabled_hint: "Ajv could not be loaded (offline or CDN blocked). The editor still works.",
    help_title: "Help",
    font_dec_title: "Decrease text size",
    font_inc_title: "Increase text size",
    activate_validation: "Enable validation",
    activate_validation_hint: "Click to load Ajv and enable validation.",
    loading_validation: "Loading Ajv…",
    validation_load_failed: "Failed to load Ajv",
    validation_load_failed_hint: "Could not download Ajv. Click to retry.",
    retry: "Retry",
    required_state: "Required",
    optional_state: "Optional",
    allow_additional_props: "Allow additional properties",
    additional_props_allowed: "Additional properties allowed",
    array_items_type: "Item type",
    type_string: "Text",
    type_number: "Number",
    type_integer: "Integer",
    type_boolean: "Yes/No",
    type_object: "Object",
    type_array: "List",
    type_null: "Empty",
    type_anyOf: "Any of",
    type_oneOf: "Exactly one of",
    type_allOf: "All of",
    add_alternative: "Add alternative",
    label_min_length: "Minimum length",
    label_max_length: "Maximum length",
    label_pattern: "Pattern (regex)",
    label_format: "Format",
    label_minimum: "Minimum",
    label_maximum: "Maximum",
    label_excl_min: "Exclusive minimum",
    label_excl_max: "Exclusive maximum",
    label_multiple_of: "Multiple of",
    label_min_items: "Minimum items",
    label_max_items: "Maximum items",
    label_unique_items: "Force unique items",
    label_min_props: "Minimum properties",
    label_max_props: "Maximum properties",
    label_default: "Default value",
    label_enum: "Allowed values",
    label_const: "Constant value",
    ph_no_min: "No minimum",
    ph_no_max: "No maximum",
    ph_no_limit: "No limit",
    ph_regex: "Regular expression",
    ph_enum: "a, b, c",
    ph_default: "default value",
    ph_const: "exact value",
    ph_format: "(none)",
    comp_add_alternative: "Add alternative to {0}",
    comp_remove_block: "Remove entire {0}",
    comp_confirm_remove: "Remove the entire {0} block?",
    comp_add_x: "Add {0}",
    comp_alt_label: "+ Alternative",
    alternatives_one: "1 alternative",
    alternatives_many: "{0} alternatives",
    errors_one: "1 error",
    errors_many: "{0} errors",
    error_count_one: "1 error",
    error_count_many: "{0} errors",
    locale_label: "Language",
    enum_placeholder: "a, b, c",
    error_invalid_json: "Invalid JSON:",
    error_invalid_schema: "Invalid schema:",
    bmc_label: "Buy me a coffee",
  },
  fr: {
    _label: "Français",
    app_title: "Éditeur de JSON Schema",
    btn_new: "Nouveau",
    btn_import: "Importer",
    btn_export: "Exporter",
    btn_infer: "Inférer depuis JSON",
    btn_format: "Formater",
    btn_minify: "Minifier",
    btn_base64: "Base64",
    btn_copy: "Copier",
    btn_copied: "Copié !",
    btn_cancel: "Annuler",
    btn_generate: "Générer le schéma",
    schema_valid: "Schéma valide",
    schema_invalid_short: "Schéma invalide",
    schema_invalid_prefix: "Schéma : ",
    json_invalid: "JSON invalide",
    json_invalid_prefix: "JSON invalide : ",
    valid: "Valide",
    untested: "Non testé",
    validate_json: "Valider le JSON",
    validate_panel_title: "Valider le JSON par rapport au schéma",
    visual_editor: "Éditeur visuel",
    visual_hint: "— Modifier propriétés, types et contraintes",
    json_schema_pane: "JSON Schema",
    source_hint: "— Source éditable",
    test_json: "JSON de test",
    test_json_placeholder: '{"exemple": "collez votre JSON ici"}',
    results: "Résultats",
    edit_test_json: "Modifiez le JSON de test pour valider.",
    json_meets_schema: "✓ Le JSON respecte le schéma.",
    json_tree_title: "Arbre JSON",
    infer_modal_title: "Inférer un schéma depuis un JSON d'exemple",
    infer_modal_hint: "Collez un JSON d'exemple et un schéma de base sera généré automatiquement.",
    collapse_toggle: "Replier/déplier",
    schema_title_placeholder: "Titre du schéma",
    name_placeholder: "nom",
    description_placeholder: "description…",
    comment_placeholder: "// $comment (annotation interne, n'affecte pas la validation)",
    mark_required: "Marquer comme requis",
    required_label: "requis",
    delete_action: "Supprimer",
    no_properties: "Aucune propriété pour l'instant.",
    property_exists: "Une propriété de ce nom existe déjà",
    property_exists_short: "Existe déjà",
    new_property_placeholder: "nouveau nom de propriété",
    add_property: "+ Ajouter",
    array_items_label: "Type des éléments du tableau :",
    type_any: "(quelconque)",
    confirm_new: "Démarrer un schéma vide ? Vous perdrez les modifications en cours.",
    file_read_error: "Erreur de lecture du fichier : ",
    copy_failed: "Impossible de copier",
    inferred_title: "Inféré",
    default_schema_title: "Mon Schéma",
    add_field: "Ajouter un champ",
    add_pattern: "Ajouter un motif",
    pattern_section: "Motifs (regex)",
    pattern_placeholder: "^.*$",
    invalid_regex: "Expression régulière invalide",
    pattern_exists: "Un motif avec cette expression existe déjà.",
    collapse_all: "Tout replier",
    expand_all: "Tout déplier",
    compact_mode: "Compact",
    compact_mode_hint: "Réduit l’espacement et masque la description des nœuds repliés",
    search_placeholder: "Rechercher dans la source…",
    search_prev_title: "Résultat précédent (Maj+Entrée)",
    search_next_title: "Résultat suivant (Entrée)",
    btn_undo_title: "Annuler (Ctrl/⌘+Z)",
    btn_redo_title: "Rétablir (Ctrl/⌘+Maj+Z)",
    validation_disabled: "Validation désactivée",
    validation_disabled_hint: "Ajv n'a pas pu être chargé (hors ligne ou CDN bloquée). L'éditeur fonctionne toujours.",
    help_title: "Aide",
    font_dec_title: "Réduire la taille du texte",
    font_inc_title: "Augmenter la taille du texte",
    activate_validation: "Activer la validation",
    activate_validation_hint: "Cliquez pour charger Ajv et activer la validation.",
    loading_validation: "Chargement d'Ajv…",
    validation_load_failed: "Échec du chargement d'Ajv",
    validation_load_failed_hint: "Impossible de télécharger Ajv. Cliquez pour réessayer.",
    retry: "Réessayer",
    required_state: "Requis",
    optional_state: "Optionnel",
    allow_additional_props: "Autoriser propriétés supplémentaires",
    additional_props_allowed: "Propriétés supplémentaires autorisées",
    array_items_type: "Type d'élément",
    type_string: "Texte",
    type_number: "Nombre",
    type_integer: "Entier",
    type_boolean: "Oui/Non",
    type_object: "Objet",
    type_array: "Liste",
    type_null: "Vide",
    type_anyOf: "N'importe lequel",
    type_oneOf: "Exactement un",
    type_allOf: "Tous",
    add_alternative: "Ajouter une alternative",
    label_min_length: "Longueur minimum",
    label_max_length: "Longueur maximum",
    label_pattern: "Motif (regex)",
    label_format: "Format",
    label_minimum: "Minimum",
    label_maximum: "Maximum",
    label_excl_min: "Minimum exclusif",
    label_excl_max: "Maximum exclusif",
    label_multiple_of: "Multiple de",
    label_min_items: "Nombre minimum d'éléments",
    label_max_items: "Nombre maximum d'éléments",
    label_unique_items: "Forcer éléments uniques",
    label_min_props: "Minimum de propriétés",
    label_max_props: "Maximum de propriétés",
    label_default: "Valeur par défaut",
    label_enum: "Valeurs autorisées",
    label_const: "Valeur constante",
    ph_no_min: "Sans minimum",
    ph_no_max: "Sans maximum",
    ph_no_limit: "Sans limite",
    ph_regex: "Expression régulière",
    ph_enum: "a, b, c",
    ph_default: "valeur par défaut",
    ph_const: "valeur exacte",
    ph_format: "(aucun)",
    comp_add_alternative: "Ajouter une alternative à {0}",
    comp_remove_block: "Supprimer tout {0}",
    comp_confirm_remove: "Supprimer tout le bloc {0} ?",
    comp_add_x: "Ajouter {0}",
    comp_alt_label: "+ Alternative",
    alternatives_one: "1 alternative",
    alternatives_many: "{0} alternatives",
    errors_one: "1 erreur",
    errors_many: "{0} erreurs",
    error_count_one: "1 erreur",
    error_count_many: "{0} erreurs",
    locale_label: "Langue",
    enum_placeholder: "a, b, c",
    error_invalid_json: "JSON invalide :",
    error_invalid_schema: "Schéma invalide :",
    bmc_label: "Buy me a coffee",
  },
};

const HELP_CONTENT = {
  es: `
<h3>¿Qué es esta aplicación?</h3>
<p>Editor visual y validador de <strong>JSON Schema</strong>. Permite crear, editar y probar esquemas sin escribir JSON a mano, aunque también puedes hacerlo en el panel derecho.</p>

<h3>¿Qué es un JSON Schema?</h3>
<p>JSON Schema es un estándar (Draft-07 en esta app) para describir la <strong>estructura y las reglas</strong> que debe cumplir un documento JSON. Sirve para:</p>
<ul>
  <li><strong>Validar datos</strong>: comprobar que un JSON cumple un contrato (formularios, APIs, configuraciones).</li>
  <li><strong>Documentar</strong>: indicar qué campos existen, sus tipos, restricciones y descripciones.</li>
  <li><strong>Generar código o formularios</strong>: muchas herramientas leen schemas para crear UI o tipos automáticamente.</li>
</ul>
<p>Ejemplo mínimo:</p>
<pre><code>{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}</code></pre>

<h3>Estructura del editor</h3>
<ul>
  <li><strong>Editor visual</strong> (izquierda): árbol jerárquico donde editas propiedades, tipos, restricciones y descripciones.</li>
  <li><strong>JSON Schema</strong> (derecha): fuente editable del esquema. Cualquier cambio aquí se refleja en el árbol y viceversa.</li>
  <li><strong>Validar JSON</strong> (panel inferior): pega un JSON de prueba para comprobarlo contra el esquema. Requiere activar la validación.</li>
</ul>

<h3>Cómo añadir y editar campos</h3>
<ul>
  <li>Pulsa <strong>+ Agregar campo</strong> dentro de un objeto para crear una propiedad nueva.</li>
  <li>Haz clic en el <strong>chevron (›)</strong> a la izquierda de un nodo para expandirlo y ver/editar sus restricciones.</li>
  <li>El <strong>nombre</strong> es el identificador (en mono). La <strong>descripción</strong> es texto libre en cursiva.</li>
  <li>El campo <strong><code>$comment</code></strong> (textarea al pie de cada elemento) sirve para anotaciones internas multilinea. No afecta a la validación y se serializa con los saltos de línea como <code>\n</code>.</li>
  <li>Pulsa el <strong>pill de tipo</strong> para cambiar el tipo del elemento.</li>
  <li>Pulsa <span class="req-pill req-pill--required">Requerido</span> / <span class="req-pill req-pill--optional">Opcional</span> para alternar si la propiedad es obligatoria.</li>
  <li>Pulsa <strong>×</strong> para eliminar la propiedad.</li>
  <li><strong>Arrastra</strong> una propiedad (o alternativa de composición) sobre otra del mismo nivel para <strong>reordenarla</strong>. Solo se permite mover dentro del mismo padre.</li>
  <li>El botón <strong>Colapsar/Expandir todo</strong> en la cabecera del editor visual aplica a todo el árbol.</li>
</ul>

<h3>Tipos de elementos</h3>
<dl>
  <dt><span class="type-pill type-pill--string">Texto</span> <code>string</code></dt>
  <dd>Cadena de caracteres. Restricciones: <code>minLength</code>, <code>maxLength</code>, <code>pattern</code> (regex), <code>format</code> (email, date, uri…).</dd>

  <dt><span class="type-pill type-pill--number">Número</span> <code>number</code> · <span class="type-pill type-pill--integer">Entero</span> <code>integer</code></dt>
  <dd>Número decimal o entero. Restricciones: <code>minimum</code>, <code>maximum</code>, <code>exclusiveMinimum/Maximum</code>, <code>multipleOf</code>.</dd>

  <dt><span class="type-pill type-pill--boolean">Sí/No</span> <code>boolean</code></dt>
  <dd>Valor booleano: <code>true</code> o <code>false</code>.</dd>

  <dt><span class="type-pill type-pill--object">Objeto</span> <code>object</code></dt>
  <dd>Conjunto de propiedades nombradas. Restricciones: <code>minProperties</code>, <code>maxProperties</code>, <code>additionalProperties</code> (si se permiten claves extra).</dd>

  <dt><span class="type-pill type-pill--array">Lista</span> <code>array</code></dt>
  <dd>Array de elementos del mismo tipo. Restricciones: <code>minItems</code>, <code>maxItems</code>, <code>uniqueItems</code>.</dd>

  <dt><span class="type-pill type-pill--null">Vacío</span> <code>null</code></dt>
  <dd>Valor <code>null</code>. Útil en combinaciones para hacer un campo opcionalmente nulo.</dd>
</dl>

<h3>Combinaciones (composiciones)</h3>
<p>Cuando un campo puede tomar varias formas, usa una combinación. Son <strong>excluyentes</strong> entre sí: un elemento es de un tipo concreto <em>o</em> de una combinación, no ambos a la vez.</p>
<dl>
  <dt><span class="type-pill type-pill--oneOf">Exactamente uno de</span> <code>oneOf</code></dt>
  <dd>El valor debe cumplir <strong>exactamente uno</strong> de los esquemas alternativos. Útil para enums con tipos distintos o "elige una opción".</dd>

  <dt><span class="type-pill type-pill--anyOf">Cualquiera de</span> <code>anyOf</code></dt>
  <dd>El valor debe cumplir <strong>al menos uno</strong> de los esquemas (permite solapamiento).</dd>

  <dt><span class="type-pill type-pill--allOf">Todos</span> <code>allOf</code></dt>
  <dd>El valor debe cumplir <strong>todos</strong> los esquemas a la vez. Útil para combinar restricciones (por ejemplo: es un objeto Y tiene un campo concreto).</dd>
</dl>
<p>Ejemplo de enum con etiquetas usando <code>oneOf</code>:</p>
<pre><code>{
  "oneOf": [
    { "const": "M", "title": "Manual" },
    { "const": "S", "title": "Semiautomático" },
    { "const": "T", "title": "Automático" }
  ]
}</code></pre>

<h3>Restricciones comunes a todos los tipos hoja</h3>
<ul>
  <li><code>default</code>: valor por defecto sugerido.</li>
  <li><code>enum</code>: lista cerrada de valores permitidos (en el editor visual se introducen separados por coma).</li>
  <li><code>const</code>: el valor debe ser exactamente este.</li>
  <li><code>description</code>: texto explicativo, sin afectar la validación.</li>
</ul>

<h3>Importar, exportar e inferir</h3>
<ul>
  <li><strong>Importar</strong>: carga un archivo <code>.json</code> con un esquema existente.</li>
  <li><strong>Exportar</strong>: descarga el contenido actual del editor JSON como archivo <code>.json</code> (respeta el formato visible: formateado o minificado).</li>
  <li><strong>Inferir desde JSON</strong>: pega un JSON de ejemplo y se generará un esquema base automáticamente, listo para refinar.</li>
</ul>

<h3>Panel JSON Schema</h3>
<ul>
  <li><strong>Formatear</strong>: re-indenta el JSON con 2 espacios.</li>
  <li><strong>Minificar</strong>: elimina saltos de línea y espacios innecesarios para que ocupe lo menos posible.</li>
  <li><strong>Base64</strong>: reemplaza el contenido del editor por su codificación base64 URL-safe (apta para pasar como parámetro <code>?schema=</code>). Usa <strong>Copiar</strong> después para llevarlo al portapapeles.</li>
  <li><strong>Copiar</strong>: copia al portapapeles el texto tal cual está en el editor.</li>
</ul>

<h3>Cargar desde URL</h3>
<p>Puedes abrir la app con un esquema precargado pasándolo como base64 en la URL:</p>
<ul>
  <li><code>?schema=&lt;base64&gt;</code> (query string)</li>
  <li><code>#schema=&lt;base64&gt;</code> (hash, no se envía al servidor)</li>
</ul>
<p>Acepta base64 estándar y URL-safe (<code>-</code> y <code>_</code>) y padding opcional. Usa el botón <strong>Base64</strong> para generar el valor a partir del esquema actual.</p>

<h3>Validación</h3>
<p>La validación está <strong>deshabilitada por defecto</strong> para que la app cargue rápido y funcione offline. Pulsa <strong>Activar validación</strong> en el pill superior para descargar Ajv (motor de validación). Una vez cargado:</p>
<ul>
  <li>El pill mostrará el estado del esquema (válido o con errores de definición).</li>
  <li>Despliega el panel inferior <strong>Validar JSON ▲</strong> y pega un JSON de prueba para comprobarlo contra el esquema en tiempo real.</li>
  <li>Si la carga de Ajv falla, el pill mostrará el error y podrás reintentarlo. El editor sigue funcionando sin validación.</li>
</ul>

<h3>Consejos</h3>
<ul>
  <li>El árbol y el JSON están <strong>sincronizados</strong>: edita en uno y se actualiza el otro automáticamente.</li>
  <li>Si pegas un esquema con keywords avanzadas no editables visualmente (p. ej. <code>$ref</code>), se conservan en el JSON aunque no aparezcan en el árbol.</li>
  <li>Los <strong>patrones</strong> (<code>patternProperties</code>) se editan dentro del nodo objeto: pulsa <strong>+ Agregar patrón</strong>. Cada entrada tiene una regex como clave (con un badge <code>regex</code> y validación en vivo: borde rojo si la expresión es inválida).</li>
  <li>El idioma se puede cambiar desde la barra superior y se recuerda para futuras visitas.</li>
</ul>
`,
  en: `
<h3>What is this application?</h3>
<p>A visual editor and validator for <strong>JSON Schema</strong>. Lets you create, edit and test schemas without writing JSON by hand, although you can also do that in the right pane.</p>

<h3>What is a JSON Schema?</h3>
<p>JSON Schema is a standard (Draft-07 in this app) for describing the <strong>structure and rules</strong> a JSON document must satisfy. It is used for:</p>
<ul>
  <li><strong>Validating data</strong>: checking that a JSON conforms to a contract (forms, APIs, configuration).</li>
  <li><strong>Documenting</strong>: stating which fields exist, their types, constraints and descriptions.</li>
  <li><strong>Generating code or forms</strong>: many tools read schemas to build UI or types automatically.</li>
</ul>
<p>Minimal example:</p>
<pre><code>{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}</code></pre>

<h3>Editor layout</h3>
<ul>
  <li><strong>Visual editor</strong> (left): hierarchical tree where you edit properties, types, constraints and descriptions.</li>
  <li><strong>JSON Schema</strong> (right): editable schema source. Any change here is reflected in the tree and vice versa.</li>
  <li><strong>Validate JSON</strong> (bottom panel): paste a test JSON to check it against the schema. Requires enabling validation.</li>
</ul>

<h3>Adding and editing fields</h3>
<ul>
  <li>Click <strong>+ Add field</strong> inside an object to create a new property.</li>
  <li>Click the <strong>chevron (›)</strong> on the left of a node to expand it and view/edit its constraints.</li>
  <li>The <strong>name</strong> is the identifier (mono font). The <strong>description</strong> is free text in italics.</li>
  <li>The <strong><code>$comment</code></strong> field (textarea at the bottom of each element) is for multiline internal annotations. It does not affect validation and is serialised with line breaks as <code>\n</code>.</li>
  <li>Click the <strong>type pill</strong> to change the element type.</li>
  <li>Click <span class="req-pill req-pill--required">Required</span> / <span class="req-pill req-pill--optional">Optional</span> to toggle whether the property is mandatory.</li>
  <li>Click <strong>×</strong> to delete the property.</li>
  <li><strong>Drag and drop</strong> a property (or composition alternative) onto another sibling to <strong>reorder</strong> it. Moves are restricted to the same parent.</li>
  <li>The <strong>Collapse/Expand all</strong> button in the visual editor header applies to the whole tree.</li>
</ul>

<h3>Element types</h3>
<dl>
  <dt><span class="type-pill type-pill--string">Text</span> <code>string</code></dt>
  <dd>Character string. Constraints: <code>minLength</code>, <code>maxLength</code>, <code>pattern</code> (regex), <code>format</code> (email, date, uri…).</dd>

  <dt><span class="type-pill type-pill--number">Number</span> <code>number</code> · <span class="type-pill type-pill--integer">Integer</span> <code>integer</code></dt>
  <dd>Decimal or integer number. Constraints: <code>minimum</code>, <code>maximum</code>, <code>exclusiveMinimum/Maximum</code>, <code>multipleOf</code>.</dd>

  <dt><span class="type-pill type-pill--boolean">Yes/No</span> <code>boolean</code></dt>
  <dd>Boolean value: <code>true</code> or <code>false</code>.</dd>

  <dt><span class="type-pill type-pill--object">Object</span> <code>object</code></dt>
  <dd>Set of named properties. Constraints: <code>minProperties</code>, <code>maxProperties</code>, <code>additionalProperties</code> (whether extra keys are allowed).</dd>

  <dt><span class="type-pill type-pill--array">List</span> <code>array</code></dt>
  <dd>Array of items of the same type. Constraints: <code>minItems</code>, <code>maxItems</code>, <code>uniqueItems</code>.</dd>

  <dt><span class="type-pill type-pill--null">Empty</span> <code>null</code></dt>
  <dd>The <code>null</code> value. Useful in compositions to make a field optionally null.</dd>
</dl>

<h3>Compositions</h3>
<p>When a field can take several forms, use a composition. They are <strong>mutually exclusive</strong>: an element is of a concrete type <em>or</em> a composition, not both at once.</p>
<dl>
  <dt><span class="type-pill type-pill--oneOf">Exactly one of</span> <code>oneOf</code></dt>
  <dd>The value must match <strong>exactly one</strong> alternative schema. Useful for enums with different types or "choose one".</dd>

  <dt><span class="type-pill type-pill--anyOf">Any of</span> <code>anyOf</code></dt>
  <dd>The value must match <strong>at least one</strong> alternative (overlap allowed).</dd>

  <dt><span class="type-pill type-pill--allOf">All of</span> <code>allOf</code></dt>
  <dd>The value must match <strong>every</strong> alternative at once. Useful to combine constraints.</dd>
</dl>
<p>Example of a labelled enum using <code>oneOf</code>:</p>
<pre><code>{
  "oneOf": [
    { "const": "M", "title": "Manual" },
    { "const": "S", "title": "Semi-automatic" },
    { "const": "T", "title": "Automatic" }
  ]
}</code></pre>

<h3>Common constraints for all leaf types</h3>
<ul>
  <li><code>default</code>: suggested default value.</li>
  <li><code>enum</code>: closed list of allowed values (in the visual editor, comma-separated).</li>
  <li><code>const</code>: the value must be exactly this.</li>
  <li><code>description</code>: explanatory text; does not affect validation.</li>
</ul>

<h3>Import, export and infer</h3>
<ul>
  <li><strong>Import</strong>: load a <code>.json</code> file with an existing schema.</li>
  <li><strong>Export</strong>: download the current JSON editor content as a <code>.json</code> file (preserves the visible format: pretty or minified).</li>
  <li><strong>Infer from JSON</strong>: paste a sample JSON to auto-generate a base schema, ready to refine.</li>
</ul>

<h3>JSON Schema panel</h3>
<ul>
  <li><strong>Format</strong>: re-indent the JSON with 2 spaces.</li>
  <li><strong>Minify</strong>: strip line breaks and unnecessary whitespace so the JSON takes as little space as possible.</li>
  <li><strong>Base64</strong>: replace the editor content with its URL-safe base64 encoding (ready to pass as a <code>?schema=</code> parameter). Use <strong>Copy</strong> afterwards to send it to the clipboard.</li>
  <li><strong>Copy</strong>: copy the editor text verbatim to the clipboard.</li>
</ul>

<h3>Load from URL</h3>
<p>You can open the app with a preloaded schema by passing it as base64 in the URL:</p>
<ul>
  <li><code>?schema=&lt;base64&gt;</code> (query string)</li>
  <li><code>#schema=&lt;base64&gt;</code> (hash, not sent to the server)</li>
</ul>
<p>Accepts standard and URL-safe base64 (<code>-</code> and <code>_</code>) with optional padding. Use the <strong>Base64</strong> button to generate the value from the current schema.</p>

<h3>Validation</h3>
<p>Validation is <strong>disabled by default</strong> so the app loads fast and works offline. Click <strong>Enable validation</strong> on the top pill to download Ajv (the validation engine). Once loaded:</p>
<ul>
  <li>The pill shows the schema status (valid or definition errors).</li>
  <li>Open the bottom <strong>Validate JSON ▲</strong> panel and paste a test JSON to check it in real time.</li>
  <li>If Ajv fails to load, the pill shows the error and you can retry. The editor keeps working without validation.</li>
</ul>

<h3>Tips</h3>
<ul>
  <li>The tree and the JSON source are <strong>synchronised</strong>: edit one and the other updates automatically.</li>
  <li>If you paste a schema with advanced keywords not editable visually (e.g. <code>$ref</code>), they are kept in the JSON though they don't appear in the tree.</li>
  <li><strong>Patterns</strong> (<code>patternProperties</code>) are edited inside the object node: click <strong>+ Add pattern</strong>. Each entry uses a regex as key (with a <code>regex</code> badge and live validation: red border if the expression is invalid).</li>
  <li>The language can be changed from the top bar and is remembered for future visits.</li>
</ul>
`,
  fr: `
<h3>Qu'est-ce que cette application ?</h3>
<p>Éditeur visuel et validateur de <strong>JSON Schema</strong>. Permet de créer, modifier et tester des schémas sans écrire de JSON à la main, même si vous pouvez aussi le faire dans le panneau de droite.</p>

<h3>Qu'est-ce qu'un JSON Schema ?</h3>
<p>JSON Schema est un standard (Draft-07 dans cette app) qui décrit la <strong>structure et les règles</strong> qu'un document JSON doit respecter. Utilisé pour :</p>
<ul>
  <li><strong>Valider des données</strong> : vérifier qu'un JSON respecte un contrat (formulaires, APIs, configurations).</li>
  <li><strong>Documenter</strong> : indiquer quels champs existent, leurs types, leurs contraintes et descriptions.</li>
  <li><strong>Générer du code ou des formulaires</strong> : de nombreux outils lisent les schémas pour créer UI ou types automatiquement.</li>
</ul>
<p>Exemple minimal :</p>
<pre><code>{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}</code></pre>

<h3>Structure de l'éditeur</h3>
<ul>
  <li><strong>Éditeur visuel</strong> (gauche) : arbre hiérarchique pour modifier propriétés, types, contraintes et descriptions.</li>
  <li><strong>JSON Schema</strong> (droite) : source éditable du schéma. Toute modification ici se reflète dans l'arbre et vice versa.</li>
  <li><strong>Valider le JSON</strong> (panneau bas) : collez un JSON de test pour le valider contre le schéma. Nécessite d'activer la validation.</li>
</ul>

<h3>Ajouter et modifier des champs</h3>
<ul>
  <li>Cliquez sur <strong>+ Ajouter un champ</strong> dans un objet pour créer une propriété.</li>
  <li>Cliquez sur le <strong>chevron (›)</strong> à gauche d'un nœud pour le déplier et voir/modifier ses contraintes.</li>
  <li>Le <strong>nom</strong> est l'identifiant (mono). La <strong>description</strong> est du texte libre en italique.</li>
  <li>Le champ <strong><code>$comment</code></strong> (textarea en bas de chaque élément) sert aux annotations internes multilignes. Il n'affecte pas la validation et est sérialisé avec les sauts de ligne en <code>\n</code>.</li>
  <li>Cliquez sur le <strong>pill de type</strong> pour changer le type.</li>
  <li>Cliquez sur <span class="req-pill req-pill--required">Requis</span> / <span class="req-pill req-pill--optional">Optionnel</span> pour basculer.</li>
  <li>Cliquez sur <strong>×</strong> pour supprimer la propriété.</li>
  <li><strong>Glissez-déposez</strong> une propriété (ou une alternative de composition) sur une autre du même niveau pour la <strong>réordonner</strong>. Le déplacement n'est possible qu'au sein du même parent.</li>
</ul>

<h3>Types d'éléments</h3>
<dl>
  <dt><span class="type-pill type-pill--string">Texte</span> <code>string</code></dt>
  <dd>Chaîne de caractères. Contraintes : <code>minLength</code>, <code>maxLength</code>, <code>pattern</code>, <code>format</code>.</dd>

  <dt><span class="type-pill type-pill--number">Nombre</span> <code>number</code> · <span class="type-pill type-pill--integer">Entier</span> <code>integer</code></dt>
  <dd>Nombre décimal ou entier. Contraintes : <code>minimum</code>, <code>maximum</code>, <code>exclusiveMinimum/Maximum</code>, <code>multipleOf</code>.</dd>

  <dt><span class="type-pill type-pill--boolean">Oui/Non</span> <code>boolean</code></dt>
  <dd>Valeur booléenne : <code>true</code> ou <code>false</code>.</dd>

  <dt><span class="type-pill type-pill--object">Objet</span> <code>object</code></dt>
  <dd>Ensemble de propriétés nommées. Contraintes : <code>minProperties</code>, <code>maxProperties</code>, <code>additionalProperties</code>.</dd>

  <dt><span class="type-pill type-pill--array">Liste</span> <code>array</code></dt>
  <dd>Tableau d'éléments du même type. Contraintes : <code>minItems</code>, <code>maxItems</code>, <code>uniqueItems</code>.</dd>

  <dt><span class="type-pill type-pill--null">Vide</span> <code>null</code></dt>
  <dd>Valeur <code>null</code>. Utile dans les compositions pour rendre un champ optionnellement nul.</dd>
</dl>

<h3>Compositions</h3>
<p>Quand un champ peut prendre plusieurs formes, utilisez une composition. Elles sont <strong>mutuellement exclusives</strong> : un élément est d'un type concret <em>ou</em> d'une composition, pas les deux.</p>
<dl>
  <dt><span class="type-pill type-pill--oneOf">Exactement un</span> <code>oneOf</code></dt>
  <dd>La valeur doit correspondre <strong>exactement à un</strong> schéma alternatif.</dd>

  <dt><span class="type-pill type-pill--anyOf">N'importe lequel</span> <code>anyOf</code></dt>
  <dd>La valeur doit correspondre à <strong>au moins un</strong> schéma.</dd>

  <dt><span class="type-pill type-pill--allOf">Tous</span> <code>allOf</code></dt>
  <dd>La valeur doit correspondre à <strong>tous</strong> les schémas simultanément.</dd>
</dl>

<h3>Contraintes communes</h3>
<ul>
  <li><code>default</code> : valeur par défaut suggérée.</li>
  <li><code>enum</code> : liste fermée de valeurs autorisées (séparées par virgule dans l'éditeur).</li>
  <li><code>const</code> : la valeur doit être exactement celle-ci.</li>
  <li><code>description</code> : texte explicatif, n'affecte pas la validation.</li>
</ul>

<h3>Importer, exporter et inférer</h3>
<ul>
  <li><strong>Importer</strong> : charge un fichier <code>.json</code> avec un schéma existant.</li>
  <li><strong>Exporter</strong> : télécharge le contenu actuel de l'éditeur JSON comme fichier <code>.json</code> (respecte le format affiché : formaté ou minifié).</li>
  <li><strong>Inférer depuis JSON</strong> : collez un JSON d'exemple pour générer un schéma de base.</li>
</ul>

<h3>Panneau JSON Schema</h3>
<ul>
  <li><strong>Formater</strong> : ré-indente le JSON avec 2 espaces.</li>
  <li><strong>Minifier</strong> : supprime les sauts de ligne et espaces inutiles.</li>
  <li><strong>Base64</strong> : remplace le contenu de l'éditeur par son encodage base64 URL-safe (prêt à être passé comme paramètre <code>?schema=</code>). Utilisez <strong>Copier</strong> ensuite pour l'envoyer dans le presse-papiers.</li>
  <li><strong>Copier</strong> : copie le texte de l'éditeur tel quel dans le presse-papiers.</li>
</ul>

<h3>Charger depuis l'URL</h3>
<p>Vous pouvez ouvrir l'app avec un schéma préchargé en le passant en base64 dans l'URL :</p>
<ul>
  <li><code>?schema=&lt;base64&gt;</code> (query string)</li>
  <li><code>#schema=&lt;base64&gt;</code> (hash, non envoyé au serveur)</li>
</ul>
<p>Accepte le base64 standard et URL-safe (<code>-</code> et <code>_</code>) avec padding optionnel. Utilisez le bouton <strong>Base64</strong> pour générer la valeur depuis le schéma actuel.</p>

<h3>Validation</h3>
<p>La validation est <strong>désactivée par défaut</strong> pour que l'app charge vite et fonctionne hors ligne. Cliquez sur <strong>Activer la validation</strong> pour télécharger Ajv. Une fois chargé :</p>
<ul>
  <li>Le pill indique l'état du schéma (valide ou erreurs de définition).</li>
  <li>Ouvrez le panneau <strong>Valider le JSON ▲</strong> et collez un JSON de test pour le vérifier en temps réel.</li>
  <li>Si le chargement d'Ajv échoue, le pill affiche l'erreur. Vous pouvez réessayer. L'éditeur continue de fonctionner.</li>
</ul>

<h3>Astuces</h3>
<ul>
  <li>L'arbre et la source JSON sont <strong>synchronisés</strong>.</li>
  <li>Les mots-clés avancés non éditables visuellement (p. ex. <code>$ref</code>) sont conservés dans le JSON.</li>
  <li>Les <strong>motifs</strong> (<code>patternProperties</code>) s'éditent dans le nœud objet : cliquez sur <strong>+ Ajouter un motif</strong>. Chaque entrée utilise une regex comme clé (badge <code>regex</code> et validation en direct : bordure rouge si l'expression est invalide).</li>
  <li>La langue se change depuis la barre supérieure et est mémorisée.</li>
</ul>
`,
};

let currentLocale = localStorage.getItem("jse_locale") || "es";
if (!I18N[currentLocale]) currentLocale = "es";

function t(key, ...args) {
  const dict = I18N[currentLocale] || I18N.es;
  let s = dict[key];
  if (s == null) s = I18N.es[key] ?? key;
  args.forEach((a, i) => { s = s.replace(`{${i}}`, a); });
  return s;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLocale;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  }
  for (const node of document.querySelectorAll("[data-i18n-title]")) {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  }
  const titleEl = document.querySelector("title[data-i18n]");
  if (titleEl) document.title = t(titleEl.dataset.i18n);
}

function setLocale(loc) {
  if (!I18N[loc]) return;
  currentLocale = loc;
  localStorage.setItem("jse_locale", loc);
  applyStaticTranslations();
  refreshToggleAllLabel();
  // Refresh help content if the modal is open
  const hm = document.getElementById("helpModal");
  if (hm && hm.style.display === "flex") {
    document.getElementById("helpContent").innerHTML = HELP_CONTENT[currentLocale] || HELP_CONTENT.es;
  }
  // Re-render dynamic UI
  render();
  runValidation();
}

function refreshToggleAllLabel() {
  const btn = document.getElementById("btnToggleAll");
  if (btn) btn.textContent = allExpanded ? t("collapse_all") : t("expand_all");
}

// ──────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────
const TYPES = ["string", "number", "integer", "boolean", "object", "array", "null"];
const COMP_TYPES = ["anyOf", "oneOf", "allOf"];
const ALL_TYPES = [...TYPES, ...COMP_TYPES];
const STRING_FORMATS = ["", "date", "date-time", "time", "email", "hostname", "ipv4", "ipv6", "uri", "uri-reference", "uuid", "regex"];

let schema = defaultSchema();
let sourceErrorTimer = null;

// ──────────────────────────────────────────────────────────────
// Undo / Redo history
// Snapshots are deep clones that preserve the EXPANDED symbol so
// undo/redo also restore which nodes were open. Content comparison
// ignores symbols so toggling expansion alone does not create entries.
// ──────────────────────────────────────────────────────────────
const HISTORY_LIMIT = 100;
let history = [];
let historyIdx = -1;
let historyCommitTimer = null;
let suppressHistory = false; // set while restoring a snapshot to avoid feedback loops

function deepCloneWithSymbols(o) {
  if (o === null || typeof o !== "object") return o;
  if (Array.isArray(o)) return o.map(deepCloneWithSymbols);
  const out = {};
  for (const k of Object.keys(o)) out[k] = deepCloneWithSymbols(o[k]);
  for (const s of Object.getOwnPropertySymbols(o)) out[s] = deepCloneWithSymbols(o[s]);
  return out;
}
function schemaContentHash(s) {
  try { return JSON.stringify(serializableSchema(s)); }
  catch { return ""; }
}
function pushHistoryNow() {
  clearTimeout(historyCommitTimer);
  historyCommitTimer = null;
  if (suppressHistory) return;
  const currentHash = schemaContentHash(schema);
  if (historyIdx >= 0 && schemaContentHash(history[historyIdx]) === currentHash) return;
  if (historyIdx < history.length - 1) history.length = historyIdx + 1;
  history.push(deepCloneWithSymbols(schema));
  if (history.length > HISTORY_LIMIT) {
    const drop = history.length - HISTORY_LIMIT;
    history.splice(0, drop);
  }
  historyIdx = history.length - 1;
  updateUndoRedoUI();
}
function commitHistoryDebounced() {
  if (suppressHistory) return;
  clearTimeout(historyCommitTimer);
  historyCommitTimer = setTimeout(pushHistoryNow, 500);
}
function restoreFromHistory(idx) {
  if (idx < 0 || idx >= history.length) return;
  historyIdx = idx;
  suppressHistory = true;
  schema = deepCloneWithSymbols(history[idx]);
  render();
  suppressHistory = false;
  updateUndoRedoUI();
}
function undoHistory() {
  if (historyCommitTimer) pushHistoryNow();
  if (historyIdx <= 0) return;
  restoreFromHistory(historyIdx - 1);
}
function redoHistory() {
  if (historyCommitTimer) pushHistoryNow();
  if (historyIdx >= history.length - 1) return;
  restoreFromHistory(historyIdx + 1);
}
function updateUndoRedoUI() {
  const u = document.getElementById("btnUndo");
  const r = document.getElementById("btnRedo");
  if (u) u.disabled = historyIdx <= 0;
  if (r) r.disabled = historyIdx >= history.length - 1;
}

const DRAFT07_META = "http://json-schema.org/draft-07/schema#";
function normalizeSchema(s) {
  if (s && typeof s === "object" && typeof s.$schema === "string") {
    const stripped = s.$schema.replace(/^https?:\/\//, "").replace(/#$/, "");
    if (stripped === "json-schema.org/draft-07/schema") s.$schema = DRAFT07_META;
  }
  return s;
}

function defaultSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    title: t("default_schema_title"),
    properties: {},
    required: [],
  };
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "style") Object.assign(node.style, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "checked") node.checked = v;
    else if (k === "value") node.value = v;
    else if (v !== null && v !== undefined && v !== false) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

let dragState = null;
function attachDragReorder(childEl, ctx) {
  childEl.setAttribute("draggable", "true");
  childEl.addEventListener("dragstart", (e) => {
    if (e.target.matches("input, select, textarea")) { e.preventDefault(); return; }
    e.stopPropagation();
    dragState = ctx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "schema-node");
    childEl.classList.add("dragging");
  });
  childEl.addEventListener("dragend", (e) => {
    e.stopPropagation();
    childEl.classList.remove("dragging");
    document.querySelectorAll(".drop-before, .drop-after").forEach(n => n.classList.remove("drop-before", "drop-after"));
    dragState = null;
  });
  childEl.addEventListener("dragover", (e) => {
    if (!isSameDropGroup(ctx)) return;
    if ((ctx.kind === "props" || ctx.kind === "patternProps") && dragState.key === ctx.key) return;
    if (ctx.kind === "comp" && dragState.index === ctx.index) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = childEl.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    childEl.classList.toggle("drop-before", before);
    childEl.classList.toggle("drop-after", !before);
  });
  childEl.addEventListener("dragleave", (e) => {
    if (e.target === childEl) childEl.classList.remove("drop-before", "drop-after");
  });
  childEl.addEventListener("drop", (e) => {
    if (!isSameDropGroup(ctx)) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = childEl.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    childEl.classList.remove("drop-before", "drop-after");
    if (ctx.kind === "props") {
      if (dragState.key !== ctx.key) {
        reorderKeyedMap(ctx.parent, "properties", dragState.key, ctx.key, before);
        render();
      }
    } else if (ctx.kind === "patternProps") {
      if (dragState.key !== ctx.key) {
        reorderKeyedMap(ctx.parent, "patternProperties", dragState.key, ctx.key, before);
        render();
      }
    } else {
      if (dragState.index !== ctx.index) {
        reorderCompArray(ctx.parent, ctx.compKey, dragState.index, ctx.index, before);
        render();
      }
    }
    dragState = null;
  });
}
function isSameDropGroup(ctx) {
  if (!dragState || dragState.kind !== ctx.kind || dragState.parent !== ctx.parent) return false;
  if (ctx.kind === "comp" && dragState.compKey !== ctx.compKey) return false;
  return true;
}
function reorderObjectProps(node, fromKey, toKey, before) {
  reorderKeyedMap(node, "properties", fromKey, toKey, before);
}
function reorderKeyedMap(parent, mapKey, fromKey, toKey, before) {
  const map = parent[mapKey];
  if (!map || fromKey === toKey) return;
  const keys = Object.keys(map).filter(k => k !== fromKey);
  const target = keys.indexOf(toKey);
  if (target === -1) return;
  keys.splice(before ? target : target + 1, 0, fromKey);
  const reordered = {};
  for (const k of keys) reordered[k] = map[k];
  parent[mapKey] = reordered;
}
function reorderCompArray(node, compKey, fromIdx, toIdx, before) {
  if (fromIdx === toIdx) return;
  const arr = node[compKey];
  const [item] = arr.splice(fromIdx, 1);
  let target = toIdx;
  if (fromIdx < toIdx) target--;
  if (!before) target++;
  arr.splice(target, 0, item);
}

function getType(s) {
  if (!s || typeof s !== "object") return "";
  // Composition keywords take precedence — the element IS the composition
  for (const k of COMP_TYPES) if (Array.isArray(s[k])) return k;
  if (Array.isArray(s.type)) return s.type[0];
  if (typeof s.type === "string") return s.type;
  if (s.properties || s.additionalProperties !== undefined || s.patternProperties) return "object";
  if (s.items) return "array";
  return "";
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function ensureTypeDefaults(s, type) {
  const fromComp = COMP_TYPES.find(k => Array.isArray(s[k]));
  const toComp = COMP_TYPES.includes(type) ? type : null;

  // Switching INTO a composition type
  if (toComp) {
    // Clear regular-type fields
    delete s.type;
    delete s.properties;
    delete s.patternProperties;
    delete s.required;
    delete s.items;
    // Move existing alternatives if switching between compositions
    if (fromComp && fromComp !== toComp) {
      s[toComp] = s[fromComp];
      delete s[fromComp];
    } else if (!Array.isArray(s[toComp])) {
      const alt = {};
      alt[EXPANDED] = true;
      s[toComp] = [alt];
    }
    // Drop any leftover composition keys
    for (const k of COMP_TYPES) if (k !== toComp) delete s[k];
    return;
  }

  // Switching to a regular type (or empty) — drop all compositions
  for (const k of COMP_TYPES) delete s[k];

  if (!type) { delete s.type; return; }
  if (type === "object") {
    if (!s.properties) s.properties = {};
    if (!Array.isArray(s.required)) s.required = [];
    delete s.items;
  } else if (type === "array") {
    if (!s.items) s.items = { type: "string" };
    delete s.properties;
    delete s.patternProperties;
    delete s.required;
  } else {
    delete s.properties;
    delete s.patternProperties;
    delete s.required;
    delete s.items;
  }
  s.type = type;
}

// ──────────────────────────────────────────────────────────────
// Render the visual tree
// ──────────────────────────────────────────────────────────────
const EXPANDED = Symbol("expanded");
function isExpanded(node) { return node[EXPANDED] === true; }
function toggleExpanded(node) { node[EXPANDED] = !isExpanded(node); }
function setAllExpanded(value) {
  function walk(s) {
    if (!s || typeof s !== "object") return;
    s[EXPANDED] = value;
    if (s.properties && typeof s.properties === "object") {
      for (const k of Object.keys(s.properties)) walk(s.properties[k]);
    }
    if (s.items && typeof s.items === "object") walk(s.items);
    for (const k of ["oneOf", "anyOf", "allOf"]) {
      if (Array.isArray(s[k])) for (const alt of s[k]) walk(alt);
    }
  }
  walk(schema);
  allExpanded = value;
  render();
}
let allExpanded = false;
function typeLabel(typeName) {
  if (!typeName) return t("type_any");
  return t("type_" + typeName);
}

function render() {
  const root = document.getElementById("treeBody");
  root.innerHTML = "";
  root.appendChild(renderSchemaNode(schema, { isRoot: true, path: "" }));
  updateSourceFromSchema();
  validateSchemaItself();
}

function escapeJsonPointer(s) {
  return String(s).replace(/~/g, "~0").replace(/\//g, "~1");
}

function renderSchemaNode(node, opts = {}) {
  const {
    isRoot = false, name = null, nameLabel = null,
    requiredList = null, onRename = null, onDelete = null,
    isArrayItem = false, isPatternProp = false, path = "",
  } = opts;
  const type = getType(node);
  const expanded = isRoot ? true : isExpanded(node);
  const wrapper = el("div", {
    class: "schema-node" + (isRoot ? " root" : "") + (expanded ? " expanded" : " collapsed"),
  });
  wrapper.dataset.path = path;

  const row = el("div", { class: "schema-row" });
  const topRow = el("div", { class: "schema-row-top" });
  const bottomRow = el("div", { class: "schema-row-bottom" });

  // Collapse chevron (every non-root node)
  if (!isRoot) {
    const chev = el("button", {
      class: "collapse-btn",
      title: t("collapse_toggle"),
      onclick: () => { toggleExpanded(node); render(); },
    }, "›");
    chev.setAttribute("data-expanded", expanded ? "true" : "false");
    topRow.appendChild(chev);
  }

  // Name / label
  if (isRoot) {
    topRow.appendChild(el("input", {
      class: "name-input",
      value: node.title || "",
      placeholder: t("schema_title_placeholder"),
      oninput: (e) => { node.title = e.target.value; updateSourceFromSchema(); },
    }));
  } else if (isArrayItem) {
    topRow.appendChild(el("span", { class: "name-label" }, t("array_items_type")));
  } else if (nameLabel !== null) {
    topRow.appendChild(el("span", { class: "name-label" }, nameLabel));
  } else {
    if (isPatternProp) topRow.appendChild(el("span", { class: "regex-badge" }, "regex"));
    const nameInput = el("input", {
      class: "name-input",
      value: name || "",
      placeholder: isPatternProp ? t("pattern_placeholder") : t("name_placeholder"),
      onchange: (e) => onRename && onRename(e.target.value),
    });
    if (isPatternProp) {
      const validateRegex = () => {
        try { new RegExp(nameInput.value); nameInput.classList.remove("invalid-regex"); nameInput.title = ""; }
        catch (err) { nameInput.classList.add("invalid-regex"); nameInput.title = t("invalid_regex") + ": " + err.message; }
      };
      nameInput.addEventListener("input", validateRegex);
      validateRegex();
    }
    topRow.appendChild(nameInput);
  }

  // Type pill (styled select)
  const typeKey = type || "any";
  const typeSelect = el("select", {
    class: `type-pill type-pill--${typeKey}`,
    onchange: (e) => {
      ensureTypeDefaults(node, e.target.value);
      render();
    },
  });
  typeSelect.appendChild(el("option", { value: "" }, t("type_any")));
  for (const tname of ALL_TYPES) {
    const opt = el("option", { value: tname }, typeLabel(tname));
    if (tname === type) opt.selected = true;
    typeSelect.appendChild(opt);
  }
  if (!type) typeSelect.value = "";
  topRow.appendChild(typeSelect);

  // Required / Optional pill (only for named properties inside an object)
  if (!isRoot && !isArrayItem && nameLabel === null && requiredList && name !== null) {
    const isRequired = requiredList.includes(name);
    const reqBtn = el("button", {
      class: `req-pill ${isRequired ? "req-pill--required" : "req-pill--optional"}`,
      title: t("mark_required"),
      onclick: () => {
        const idx = requiredList.indexOf(name);
        if (idx === -1) requiredList.push(name);
        else requiredList.splice(idx, 1);
        render();
      },
    }, isRequired ? t("required_state") : t("optional_state"));
    topRow.appendChild(reqBtn);
  }

  // Delete action (right side)
  if (!isRoot && !isArrayItem && onDelete) {
    const actions = el("div", { class: "schema-actions" });
    actions.appendChild(el("button", {
      class: "delete-btn",
      title: t("delete_action"),
      onclick: () => onDelete(),
    }, "✕"));
    topRow.appendChild(actions);
  }

  // Description (full-width second row)
  bottomRow.appendChild(el("input", {
    class: "desc-input",
    value: node.description || "",
    placeholder: t("description_placeholder"),
    oninput: (e) => {
      if (e.target.value) node.description = e.target.value;
      else delete node.description;
      updateSourceFromSchema();
    },
  }));

  row.appendChild(topRow);
  row.appendChild(bottomRow);
  wrapper.appendChild(row);

  // Expanded body
  if (expanded) {
    const constraintsWrap = renderConstraints(node, type);

    // $comment textarea — at the end of the element's parameters
    // (for root, shown before the constraints so it sits right after description)
    const commentRow = el("div", { class: "schema-row-comment" });
    const initialComment = typeof node.$comment === "string" ? node.$comment : "";
    const commentArea = el("textarea", {
      class: "comment-input",
      placeholder: t("comment_placeholder"),
      rows: Math.max(1, initialComment.split("\n").length),
      oninput: (e) => {
        if (e.target.value) node.$comment = e.target.value;
        else delete node.$comment;
        e.target.rows = Math.max(1, e.target.value.split("\n").length);
        updateSourceFromSchema();
      },
    });
    commentArea.value = initialComment;
    commentRow.appendChild(commentArea);

    if (isRoot) wrapper.appendChild(commentRow);
    if (constraintsWrap.children.length) wrapper.appendChild(constraintsWrap);
    if (!isRoot) wrapper.appendChild(commentRow);

    if (type === "object") {
      const childrenWrap = el("div", { class: "schema-children" });
      renderObjectChildren(node, childrenWrap, path);
      wrapper.appendChild(childrenWrap);
    } else if (type === "array") {
      const childrenWrap = el("div", { class: "schema-children" });
      renderArrayChildren(node, childrenWrap, path);
      wrapper.appendChild(childrenWrap);
    } else if (COMP_TYPES.includes(type)) {
      const childrenWrap = el("div", { class: "schema-children" });
      renderCompositionChildren(node, type, childrenWrap, path);
      wrapper.appendChild(childrenWrap);
    }
  }

  return wrapper;
}

// ──────────────────────────────────────────────────────────────
// Inline insert slots (hover between siblings to add at that position)
// ──────────────────────────────────────────────────────────────
function nextFieldName(node) {
  const base = currentLocale === "es" ? "campo" : currentLocale === "fr" ? "champ" : "field";
  if (!node.properties) return `${base}1`;
  let i = 1, nm;
  do { nm = `${base}${i++}`; } while (node.properties[nm]);
  return nm;
}
function nextPatternKey(node) {
  let i = 1, pk = "^.*$";
  while (node.patternProperties && (pk in node.patternProperties)) { pk = `^.*$_${i++}`; }
  return pk;
}
function insertKeyedAt(parent, mapKey, index, key, value) {
  if (!parent[mapKey]) parent[mapKey] = {};
  const entries = Object.entries(parent[mapKey]);
  entries.splice(index, 0, [key, value]);
  parent[mapKey] = Object.fromEntries(entries);
}
function makeInsertSlot(buildActions) {
  const slot = el("div", { class: "insert-slot" });
  slot.appendChild(el("div", { class: "insert-zone" }));
  const actions = el("div", { class: "insert-actions" });
  buildActions(actions);
  slot.appendChild(actions);
  return slot;
}
function insertSlotBtn(labelKey, onClick) {
  const btn = el("button", {
    class: "insert-btn",
    type: "button",
    onclick: (e) => { e.stopPropagation(); onClick(); },
  });
  btn.appendChild(el("span", { class: "plus" }, "+"));
  btn.appendChild(el("span", {}, t(labelKey)));
  return btn;
}
function renderPropertyInsertSlot(node, index) {
  return makeInsertSlot((actions) => {
    actions.appendChild(insertSlotBtn("add_field", () => {
      const value = { type: "string" };
      value[EXPANDED] = true;
      insertKeyedAt(node, "properties", index, nextFieldName(node), value);
      node[EXPANDED] = true;
      render();
    }));
  });
}
function renderPatternInsertSlot(node, index) {
  return makeInsertSlot((actions) => {
    actions.appendChild(insertSlotBtn("add_pattern", () => {
      const value = { type: "string" };
      value[EXPANDED] = true;
      insertKeyedAt(node, "patternProperties", index, nextPatternKey(node), value);
      node[EXPANDED] = true;
      render();
    }));
  });
}
function renderCompositionInsertSlot(node, compKey, index) {
  return makeInsertSlot((actions) => {
    actions.appendChild(insertSlotBtn("add_alternative", () => {
      const alt = {};
      alt[EXPANDED] = true;
      if (!Array.isArray(node[compKey])) node[compKey] = [];
      node[compKey].splice(index, 0, alt);
      node[EXPANDED] = true;
      render();
    }));
  });
}

function renderCompositionChildren(node, compKey, container, parentPath = "") {
  if (!Array.isArray(node[compKey])) node[compKey] = [{}];

  node[compKey].forEach((alt, idx) => {
    container.appendChild(renderCompositionInsertSlot(node, compKey, idx));
    const altNode = renderSchemaNode(alt, {
      nameLabel: `[${idx}]`,
      path: `${parentPath}/${compKey}/${idx}`,
      onDelete: () => {
        node[compKey].splice(idx, 1);
        if (node[compKey].length === 0) {
          const e = {};
          e[EXPANDED] = true;
          node[compKey] = [e];
        }
        render();
      },
    });
    attachDragReorder(altNode, { kind: "comp", parent: node, compKey, index: idx });
    container.appendChild(altNode);
  });

  const actions = el("div", { class: "object-actions" });
  const addBtn = el("button", {
    class: "add-field-btn",
    onclick: () => {
      const alt = {};
      alt[EXPANDED] = true;
      node[compKey].push(alt);
      node[EXPANDED] = true;
      render();
    },
  });
  addBtn.appendChild(el("span", { class: "plus" }, "+"));
  addBtn.appendChild(el("span", {}, t("add_alternative")));
  actions.appendChild(addBtn);
  container.appendChild(actions);
}

function renderObjectChildren(node, container, parentPath = "") {
  if (!node.properties) node.properties = {};
  if (!node.required) node.required = [];

  const propNames = Object.keys(node.properties);
  propNames.forEach((name, idx) => {
    container.appendChild(renderPropertyInsertSlot(node, idx));
    const child = renderSchemaNode(node.properties[name], {
      name,
      requiredList: node.required,
      path: `${parentPath}/properties/${escapeJsonPointer(name)}`,
      onRename: (newName) => {
        if (!newName || newName === name) return;
        if (node.properties[newName]) { alert(t("property_exists")); render(); return; }
        const reordered = {};
        for (const k of Object.keys(node.properties)) reordered[k === name ? newName : k] = node.properties[k];
        node.properties = reordered;
        const ri = node.required.indexOf(name);
        if (ri !== -1) node.required[ri] = newName;
        render();
      },
      onDelete: () => {
        delete node.properties[name];
        const ri = node.required.indexOf(name);
        if (ri !== -1) node.required.splice(ri, 1);
        render();
      },
    });
    attachDragReorder(child, { kind: "props", parent: node, key: name });
    container.appendChild(child);
  });

  // Pattern properties section (only shown when there are entries)
  if (node.patternProperties && typeof node.patternProperties === "object" && Object.keys(node.patternProperties).length > 0) {
    container.appendChild(el("div", { class: "pattern-section-label" }, t("pattern_section")));
    renderPatternProperties(node, container, parentPath);
  }

  // Actions: big "+ Add field" button + additionalProperties toggle
  const actions = el("div", { class: "object-actions" });

  const addBtn = el("button", {
    class: "add-field-btn",
    onclick: () => {
      const newProp = { type: "string" };
      newProp[EXPANDED] = true;
      node.properties[nextFieldName(node)] = newProp;
      node[EXPANDED] = true;
      render();
    },
  });
  addBtn.appendChild(el("span", { class: "plus" }, "+"));
  addBtn.appendChild(el("span", {}, t("add_field")));
  actions.appendChild(addBtn);

  const addPatternBtn = el("button", {
    class: "add-field-btn",
    onclick: () => {
      if (!node.patternProperties) node.patternProperties = {};
      const newPP = { type: "string" };
      newPP[EXPANDED] = true;
      node.patternProperties[nextPatternKey(node)] = newPP;
      node[EXPANDED] = true;
      render();
    },
  });
  addPatternBtn.appendChild(el("span", { class: "plus" }, "+"));
  addPatternBtn.appendChild(el("span", {}, t("add_pattern")));
  actions.appendChild(addPatternBtn);

  const allowAdditional = node.additionalProperties !== false;
  const additionalBtn = el("button", {
    class: "additional-toggle" + (allowAdditional ? "" : " off"),
    onclick: () => {
      if (allowAdditional) node.additionalProperties = false;
      else delete node.additionalProperties;
      render();
    },
  }, allowAdditional ? t("additional_props_allowed") : t("allow_additional_props"));
  actions.appendChild(additionalBtn);

  container.appendChild(actions);
}

function renderPatternProperties(node, container, parentPath = "") {
  if (!node.patternProperties || typeof node.patternProperties !== "object") return;
  const patternKeys = Object.keys(node.patternProperties);
  patternKeys.forEach((pattern, idx) => {
    container.appendChild(renderPatternInsertSlot(node, idx));
    const child = renderSchemaNode(node.patternProperties[pattern], {
      name: pattern,
      isPatternProp: true,
      path: `${parentPath}/patternProperties/${escapeJsonPointer(pattern)}`,
      onRename: (newPattern) => {
        if (!newPattern || newPattern === pattern) return;
        if (newPattern in node.patternProperties) { alert(t("pattern_exists")); render(); return; }
        const reordered = {};
        for (const k of Object.keys(node.patternProperties)) reordered[k === pattern ? newPattern : k] = node.patternProperties[k];
        node.patternProperties = reordered;
        render();
      },
      onDelete: () => {
        delete node.patternProperties[pattern];
        if (Object.keys(node.patternProperties).length === 0) delete node.patternProperties;
        render();
      },
    });
    attachDragReorder(child, { kind: "patternProps", parent: node, key: pattern });
    container.appendChild(child);
  });
}

function renderArrayChildren(node, container, parentPath = "") {
  if (!node.items) node.items = { type: "string" };
  const child = renderSchemaNode(node.items, { isArrayItem: true, path: `${parentPath}/items` });
  container.appendChild(child);
}

// ──────────────────────────────────────────────────────────────
// Constraints by type
// ──────────────────────────────────────────────────────────────
function renderConstraints(node, type) {
  const wrap = el("div", { class: "constraints" });
  if (COMP_TYPES.includes(type)) return wrap; // compositions: no constraints, only alternatives

  // default + enum (same row, 2 columns) and const (own full row).
  // Mutual exclusion is recomputed live via the wrap's input/change listener below.
  if (type && type !== "object" && type !== "array") {
    const row = el("div", { class: "constraint-row" });
    row.appendChild(renderConstraint(node, { key: "default", labelKey: "label_default", phKey: "ph_default", type: "any" }));
    row.appendChild(renderConstraint(node, { key: "enum", labelKey: "label_enum", phKey: "ph_enum", type: "enum" }));
    wrap.appendChild(row);
    wrap.appendChild(renderConstraint(node, { key: "const", labelKey: "label_const", phKey: "ph_const", type: "any", fullRow: true }));
    applyExclusiveConstraints(wrap, node);
    const refresh = () => applyExclusiveConstraints(wrap, node);
    wrap.addEventListener("input", refresh);
    wrap.addEventListener("change", refresh);
  }

  const fields = constraintFields(type);
  for (const f of fields) wrap.appendChild(renderConstraint(node, f));
  return wrap;
}

function applyExclusiveConstraints(wrap, node) {
  const hasConst = node.const !== undefined;
  const hasDefault = node.default !== undefined;
  const hasEnum = Array.isArray(node.enum) && node.enum.length > 0;
  const showConst = !hasDefault && !hasEnum;
  const showDefaultEnum = !hasConst;
  const row = wrap.querySelector(":scope > .constraint-row");
  if (row) row.style.display = showDefaultEnum ? "" : "none";
  const c = wrap.querySelector(':scope > .constraint[data-key="const"]');
  if (c) c.style.display = showConst ? "" : "none";
}

function constraintFields(type) {
  switch (type) {
    case "string": return [
      { key: "minLength", labelKey: "label_min_length", phKey: "ph_no_min", type: "int" },
      { key: "maxLength", labelKey: "label_max_length", phKey: "ph_no_max", type: "int" },
      { key: "pattern", labelKey: "label_pattern", phKey: "ph_regex", type: "string" },
      { key: "format", labelKey: "label_format", phKey: "ph_format", type: "select", options: STRING_FORMATS },
    ];
    case "number":
    case "integer": return [
      { key: "minimum", labelKey: "label_minimum", phKey: "ph_no_min", type: "num" },
      { key: "maximum", labelKey: "label_maximum", phKey: "ph_no_max", type: "num" },
      { key: "exclusiveMinimum", labelKey: "label_excl_min", phKey: "ph_no_min", type: "num" },
      { key: "exclusiveMaximum", labelKey: "label_excl_max", phKey: "ph_no_max", type: "num" },
      { key: "multipleOf", labelKey: "label_multiple_of", phKey: "ph_no_limit", type: "num" },
    ];
    case "array": return [
      { key: "minItems", labelKey: "label_min_items", phKey: "ph_no_min", type: "int" },
      { key: "maxItems", labelKey: "label_max_items", phKey: "ph_no_max", type: "int" },
      { key: "uniqueItems", labelKey: "label_unique_items", type: "bool" },
    ];
    case "object": return [
      { key: "minProperties", labelKey: "label_min_props", phKey: "ph_no_min", type: "int" },
      { key: "maxProperties", labelKey: "label_max_props", phKey: "ph_no_max", type: "int" },
    ];
    default: return [];
  }
}

function renderConstraint(node, f) {
  const cur = node[f.key];
  const label = f.labelKey ? t(f.labelKey) : (f.label || f.key);
  const ph = f.phKey ? t(f.phKey) : "";

  // Boolean → toggle switch (full row)
  if (f.type === "bool") {
    const wrap = el("div", { class: "constraint", style: { gridColumn: "1 / -1" } });
    wrap.dataset.key = f.key;
    const toggleLbl = el("label", { class: "toggle" });
    const input = el("input", { type: "checkbox" });
    input.checked = cur === true;
    input.onchange = () => {
      if (input.checked) node[f.key] = true;
      else delete node[f.key];
      updateSourceFromSchema();
    };
    toggleLbl.appendChild(input);
    toggleLbl.appendChild(el("span", { class: "track" }));
    toggleLbl.appendChild(el("span", { style: { fontWeight: "600" } }, label));
    wrap.appendChild(toggleLbl);
    return wrap;
  }

  const wrap = el("div", { class: "constraint" });
  if (f.fullRow) wrap.style.gridColumn = "1 / -1";
  wrap.dataset.key = f.key;
  wrap.appendChild(el("label", {}, label));
  let input;

  if (f.type === "select") {
    input = el("select");
    for (const o of f.options) input.appendChild(el("option", { value: o }, o || ph || "—"));
    input.value = cur || "";
    input.onchange = () => {
      if (!input.value) delete node[f.key];
      else node[f.key] = input.value;
      updateSourceFromSchema();
    };
  } else if (f.type === "enum") {
    input = el("input", { type: "text", placeholder: ph });
    input.value = Array.isArray(cur) ? cur.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(", ") : "";
    input.oninput = () => {
      const raw = input.value.trim();
      if (!raw) { delete node.enum; updateSourceFromSchema(); return; }
      const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
      const nodeType = getType(node);
      node.enum = parts.map(p => {
        if (nodeType === "number" || nodeType === "integer") { const n = Number(p); return Number.isNaN(n) ? p : n; }
        if (nodeType === "boolean") return p === "true";
        try { return JSON.parse(p); } catch { return p; }
      });
      updateSourceFromSchema();
    };
  } else if (f.type === "int" || f.type === "num") {
    input = el("input", { type: "number", placeholder: ph });
    input.value = cur ?? "";
    input.oninput = () => {
      if (input.value === "") delete node[f.key];
      else node[f.key] = f.type === "int" ? parseInt(input.value, 10) : Number(input.value);
      updateSourceFromSchema();
    };
  } else if (f.type === "any") {
    input = el("input", { type: "text", placeholder: ph });
    input.value = cur === undefined ? "" : (typeof cur === "string" ? cur : JSON.stringify(cur));
    input.oninput = () => {
      const raw = input.value;
      if (raw === "") { delete node[f.key]; updateSourceFromSchema(); return; }
      try { node[f.key] = JSON.parse(raw); }
      catch { node[f.key] = raw; }
      updateSourceFromSchema();
    };
  } else {
    input = el("input", { type: "text", placeholder: ph });
    input.value = cur ?? "";
    input.oninput = () => {
      if (input.value === "") delete node[f.key];
      else node[f.key] = input.value;
      updateSourceFromSchema();
    };
  }
  wrap.appendChild(input);
  return wrap;
}

// ──────────────────────────────────────────────────────────────
// Source <-> Schema sync
// ──────────────────────────────────────────────────────────────
const sourceEditor = document.getElementById("sourceEditor");
// Wrap textarea with a relative container so we can overlay highlights on top.
const sourceWrap = document.createElement("div");
sourceWrap.className = "source-wrap";
sourceEditor.parentNode.insertBefore(sourceWrap, sourceEditor);
sourceWrap.appendChild(sourceEditor);
const sourceHighlight = document.createElement("div");
sourceHighlight.className = "source-highlight";
sourceWrap.appendChild(sourceHighlight);
const sourceScope = document.createElement("div");
sourceScope.className = "source-scope";
sourceWrap.appendChild(sourceScope);

// Breadcrumb above the source body
const sourceBreadcrumb = document.createElement("div");
sourceBreadcrumb.className = "source-breadcrumb";
sourceBreadcrumb.id = "sourceBreadcrumb";
const sourcePaneBody = sourceEditor.closest(".pane-body");
sourcePaneBody.parentNode.insertBefore(sourceBreadcrumb, sourcePaneBody);

const sourceBreadcrumbCrumbs = document.createElement("div");
sourceBreadcrumbCrumbs.className = "source-breadcrumb-crumbs";
sourceBreadcrumbCrumbs.id = "sourceBreadcrumbCrumbs";
sourceBreadcrumbCrumbs.appendChild(document.createTextNode("root"));
sourceBreadcrumb.appendChild(sourceBreadcrumbCrumbs);

const sourceSearchWrap = document.createElement("div");
sourceSearchWrap.className = "source-search";
const searchInput = document.createElement("input");
searchInput.type = "search";
searchInput.id = "sourceSearchInput";
searchInput.autocomplete = "off";
searchInput.spellcheck = false;
searchInput.setAttribute("data-i18n-placeholder", "search_placeholder");
const searchCounter = document.createElement("span");
searchCounter.className = "source-search-counter";
searchCounter.id = "sourceSearchCounter";
const searchPrev = document.createElement("button");
searchPrev.type = "button";
searchPrev.id = "sourceSearchPrev";
searchPrev.className = "source-search-btn";
searchPrev.textContent = "‹";
searchPrev.disabled = true;
searchPrev.setAttribute("data-i18n-title", "search_prev_title");
const searchNext = document.createElement("button");
searchNext.type = "button";
searchNext.id = "sourceSearchNext";
searchNext.className = "source-search-btn";
searchNext.textContent = "›";
searchNext.disabled = true;
searchNext.setAttribute("data-i18n-title", "search_next_title");
sourceSearchWrap.appendChild(searchInput);
sourceSearchWrap.appendChild(searchCounter);
sourceSearchWrap.appendChild(searchPrev);
sourceSearchWrap.appendChild(searchNext);
sourceBreadcrumb.appendChild(sourceSearchWrap);

function updateSourceFromSchema() {
  sourceEditor.value = JSON.stringify(serializableSchema(schema), null, 2);
  sourceEditor.classList.remove("error");
  pathRangeMap = buildPathRangeMap(sourceEditor.value);
  refreshSourceSearch();
  commitHistoryDebounced();
  runValidation(); // re-validate if a test JSON is set
}

function serializableSchema(s) {
  if (!s || typeof s !== "object" || Array.isArray(s)) return s;

  const hasSchema = "$schema" in s;
  const hasTitle = "title" in s;
  const hasDescription = "description" in s;
  const hasComment = "$comment" in s;
  const hasItems = "items" in s;

  let keys = Object.keys(s).filter(k =>
    k !== "$schema" && k !== "title" &&
    k !== "description" && k !== "$comment" && k !== "items"
  );
  // description right after type (or at the very start if no type)
  if (hasDescription) {
    const ti = keys.indexOf("type");
    keys.splice(ti === -1 ? 0 : ti + 1, 0, "description");
  }
  // $comment right after description (or after type, or at the start)
  if (hasComment) {
    const after = hasDescription
      ? keys.indexOf("description")
      : keys.indexOf("type");
    keys.splice(after === -1 ? 0 : after + 1, 0, "$comment");
  }
  // title and $schema pinned to the very top ($schema first, then title)
  if (hasTitle) keys.unshift("title");
  if (hasSchema) keys.unshift("$schema");
  // items always last
  if (hasItems) keys.push("items");

  const out = {};
  for (const k of keys) {
    const v = s[k];
    if ((k === "properties" || k === "patternProperties") && v && typeof v === "object" && !Array.isArray(v)) {
      const np = {};
      for (const pk of Object.keys(v)) np[pk] = serializableSchema(v[pk]);
      out[k] = np;
    } else if (k === "items") {
      out[k] = serializableSchema(v);
    } else if (k === "allOf" || k === "anyOf" || k === "oneOf") {
      out[k] = Array.isArray(v) ? v.map(serializableSchema) : v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Returns the JSON Pointer of the position where the cursor sits in `text`.
// Tolerant to invalid JSON: returns the last valid path reached.
function pathAtOffset(text, offset) {
  let pos = 0;
  const stack = [];
  let result = null;
  const len = text.length;

  function snapshot() { if (result === null) result = stack.slice(); }
  function done() { return result !== null; }

  function skipWs() {
    while (pos < len) {
      const c = text.charCodeAt(pos);
      if (c !== 32 && c !== 9 && c !== 10 && c !== 13) break;
      pos++;
      if (pos >= offset) { snapshot(); return; }
    }
  }

  function readStringKey() {
    // assumes text[pos] === '"'
    pos++;
    let key = "";
    while (pos < len) {
      const ch = text[pos];
      if (ch === "\\") {
        const n = text[pos + 1];
        if (n === "n") key += "\n";
        else if (n === "t") key += "\t";
        else if (n === "r") key += "\r";
        else if (n === '"') key += '"';
        else if (n === "\\") key += "\\";
        else if (n === "/") key += "/";
        else if (n === "b") key += "\b";
        else if (n === "f") key += "\f";
        else if (n === "u") {
          const hex = text.substr(pos + 2, 4);
          const code = parseInt(hex, 16);
          if (!isNaN(code)) key += String.fromCharCode(code);
          pos += 6;
          continue;
        } else key += n || "";
        pos += 2;
        continue;
      }
      if (ch === '"') { pos++; return key; }
      key += ch;
      pos++;
    }
    return key;
  }

  function skipString() {
    pos++; // opening quote
    while (pos < len) {
      const ch = text[pos];
      if (ch === "\\") { pos += 2; if (pos >= offset) { snapshot(); return; } continue; }
      if (ch === '"') { pos++; if (pos >= offset) snapshot(); return; }
      pos++;
      if (pos >= offset) { snapshot(); return; }
    }
  }

  function skipPrimitive() {
    while (pos < len) {
      const ch = text[pos];
      if (ch === "," || ch === "}" || ch === "]" || ch === " " || ch === "\t" || ch === "\n" || ch === "\r") return;
      pos++;
      if (pos >= offset) { snapshot(); return; }
    }
  }

  function readValue() {
    skipWs(); if (done()) return;
    if (pos >= len) return;
    const ch = text[pos];
    if (ch === "{") readObject();
    else if (ch === "[") readArray();
    else if (ch === '"') skipString();
    else skipPrimitive();
  }

  function readObject() {
    pos++; if (pos >= offset) { snapshot(); return; }
    while (pos < len && !done()) {
      skipWs(); if (done()) return;
      if (pos >= len) return;
      if (text[pos] === "}") { pos++; return; }
      if (text[pos] !== '"') { pos++; continue; }

      const keyStart = pos;
      const key = readStringKey();
      const keyEnd = pos;
      stack.push(escapeJsonPointer(key));

      // cursor inside or right at the key
      if (result === null && offset >= keyStart && offset <= keyEnd) { snapshot(); return; }

      skipWs(); if (done()) return;
      if (pos < len && text[pos] === ":") { pos++; if (pos >= offset) snapshot(); }
      if (done()) return;

      readValue();
      if (done()) return;
      stack.pop();

      skipWs(); if (done()) return;
      if (pos < len && text[pos] === ",") { pos++; if (pos >= offset) snapshot(); continue; }
      if (pos < len && text[pos] === "}") { pos++; return; }
    }
  }

  function readArray() {
    pos++; if (pos >= offset) { snapshot(); return; }
    let idx = 0;
    while (pos < len && !done()) {
      skipWs(); if (done()) return;
      if (pos >= len) return;
      if (text[pos] === "]") { pos++; return; }

      stack.push(String(idx));
      readValue();
      if (done()) return;
      stack.pop();
      idx++;

      skipWs(); if (done()) return;
      if (pos < len && text[pos] === ",") { pos++; if (pos >= offset) snapshot(); continue; }
      if (pos < len && text[pos] === "]") { pos++; return; }
    }
  }

  try { readValue(); } catch (_) { /* keep last valid path */ }

  const finalStack = result || stack;
  return finalStack.length ? "/" + finalStack.join("/") : "";
}

// Single-pass parser that records start/end offsets for every value, plus key range
// for object members. Result: Map<jsonPointer, { start, end, keyStart?, keyEnd? }>.
let pathRangeMap = null;
function buildPathRangeMap(text) {
  const map = new Map();
  const stack = [];
  const len = text.length;
  let pos = 0;

  function skipWs() {
    while (pos < len) {
      const c = text.charCodeAt(pos);
      if (c !== 32 && c !== 9 && c !== 10 && c !== 13) return;
      pos++;
    }
  }
  function readKey() {
    pos++;
    let k = "";
    while (pos < len) {
      const ch = text[pos];
      if (ch === "\\") {
        const n = text[pos + 1];
        if (n === "n") k += "\n";
        else if (n === "t") k += "\t";
        else if (n === "r") k += "\r";
        else if (n === '"') k += '"';
        else if (n === "\\") k += "\\";
        else if (n === "/") k += "/";
        else if (n === "b") k += "\b";
        else if (n === "f") k += "\f";
        else if (n === "u") {
          const code = parseInt(text.substr(pos + 2, 4), 16);
          if (!isNaN(code)) k += String.fromCharCode(code);
          pos += 6; continue;
        } else k += n || "";
        pos += 2; continue;
      }
      if (ch === '"') { pos++; return k; }
      k += ch; pos++;
    }
    return k;
  }
  function skipString() {
    pos++;
    while (pos < len) {
      const ch = text[pos];
      if (ch === "\\") { pos += 2; continue; }
      if (ch === '"') { pos++; return; }
      pos++;
    }
  }
  function skipPrimitive() {
    while (pos < len) {
      const ch = text[pos];
      if (ch === "," || ch === "}" || ch === "]" || ch === " " || ch === "\t" || ch === "\n" || ch === "\r") return;
      pos++;
    }
  }
  function readValue(entryKey, keyStart, keyEnd) {
    skipWs();
    const start = pos;
    if (pos < len) {
      const ch = text[pos];
      if (ch === "{") readObject();
      else if (ch === "[") readArray();
      else if (ch === '"') skipString();
      else skipPrimitive();
    }
    const end = pos;
    if (entryKey !== undefined) {
      const entry = { start, end };
      if (keyStart !== undefined) { entry.keyStart = keyStart; entry.keyEnd = keyEnd; }
      map.set(entryKey, entry);
    }
  }
  function readObject() {
    pos++;
    while (pos < len) {
      skipWs();
      if (pos >= len) return;
      if (text[pos] === "}") { pos++; return; }
      if (text[pos] !== '"') { pos++; continue; }
      const keyStart = pos;
      const k = readKey();
      const keyEnd = pos;
      stack.push(escapeJsonPointer(k));
      skipWs();
      if (pos < len && text[pos] === ":") pos++;
      readValue("/" + stack.join("/"), keyStart, keyEnd);
      stack.pop();
      skipWs();
      if (pos < len && text[pos] === ",") { pos++; continue; }
      if (pos < len && text[pos] === "}") { pos++; return; }
    }
  }
  function readArray() {
    pos++;
    let idx = 0;
    while (pos < len) {
      skipWs();
      if (pos >= len) return;
      if (text[pos] === "]") { pos++; return; }
      stack.push(String(idx));
      readValue("/" + stack.join("/"));
      stack.pop();
      idx++;
      skipWs();
      if (pos < len && text[pos] === ",") { pos++; continue; }
      if (pos < len && text[pos] === "]") { pos++; return; }
    }
  }

  // Root: capture start/end without a key.
  skipWs();
  const rootStart = pos;
  if (pos < len) {
    const ch = text[pos];
    if (ch === "{") readObject();
    else if (ch === "[") readArray();
    else if (ch === '"') skipString();
    else skipPrimitive();
  }
  map.set("", { start: rootStart, end: pos });
  return map;
}

sourceEditor.addEventListener("input", () => {
  clearTimeout(sourceErrorTimer);
  sourceErrorTimer = setTimeout(() => {
    try {
      const parsed = JSON.parse(sourceEditor.value);
      schema = normalizeSchema(parsed);
      sourceEditor.classList.remove("error");
      const root = document.getElementById("treeBody");
      root.innerHTML = "";
      root.appendChild(renderSchemaNode(schema, { isRoot: true, path: "" }));
      validateSchemaItself();
      runValidation();
      pathRangeMap = buildPathRangeMap(sourceEditor.value);
      commitHistoryDebounced();
    } catch (e) {
      sourceEditor.classList.add("error");
      pathRangeMap = null;
      const pill = document.getElementById("statusPill");
      pill.className = "status-pill err";
      pill.textContent = t("json_invalid_prefix") + e.message;
    }
    refreshSourceSearch();
  }, 300);
});

let cursorSyncTimer = null;
let pendingFocus = false;
function scheduleCursorSync(withFocus) {
  if (withFocus) pendingFocus = true;
  clearTimeout(cursorSyncTimer);
  cursorSyncTimer = setTimeout(() => {
    const doFocus = pendingFocus;
    pendingFocus = false;
    syncCursorToTree(doFocus);
  }, 120);
}
function syncCursorToTree(withFocus) {
  if (document.activeElement !== sourceEditor) return;
  const offset = sourceEditor.selectionStart;
  if (typeof offset !== "number") return;
  syncToPathInTree(pathAtOffset(sourceEditor.value, offset), withFocus);
}
function syncToPathInTree(path, withFocus) {
  updateBreadcrumb(path);
  updateScopeOverlay();

  expandAncestorsOfPath(path); // may re-render

  const target = findClosestSchemaNode(path);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.remove("cursor-target");
  void target.offsetWidth;
  target.classList.add("cursor-target");

  if (withFocus) focusInputForPath(target, path);
}
function findClosestSchemaNode(path) {
  let p = path;
  while (true) {
    const n = document.querySelector(`.schema-node[data-path="${cssAttrEscape(p)}"]`);
    if (n) return n;
    if (!p) return null;
    const i = p.lastIndexOf("/");
    p = i <= 0 ? "" : p.slice(0, i);
  }
}
function cssAttrEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function expandAncestorsOfPath(path) {
  // Walks schema-node hops along the path expanding any ancestor that needs to be
  // open for the target (or the cursor's body position) to be visible.
  const segments = path.split("/").filter(Boolean);
  let needsRender = false;
  let cursor = schema;
  let i = 0;
  while (i < segments.length) {
    const seg = unescapeJsonPointer(segments[i]);
    let next = null;
    let consumed = 0;
    if (seg === "properties" && i + 1 < segments.length) {
      next = cursor && cursor.properties ? cursor.properties[unescapeJsonPointer(segments[i + 1])] : null;
      consumed = 2;
    } else if (seg === "patternProperties" && i + 1 < segments.length) {
      next = cursor && cursor.patternProperties ? cursor.patternProperties[unescapeJsonPointer(segments[i + 1])] : null;
      consumed = 2;
    } else if (seg === "items") {
      next = cursor ? cursor.items : null;
      consumed = 1;
    } else if (COMP_TYPES.includes(seg) && i + 1 < segments.length) {
      const arr = cursor ? cursor[seg] : null;
      next = Array.isArray(arr) ? arr[parseInt(segments[i + 1], 10)] : null;
      consumed = 2;
    } else {
      // Cursor is inside the body of `cursor` (constraint/description/comment/…).
      if (cursor && cursor !== schema && !isExpanded(cursor)) {
        cursor[EXPANDED] = true;
        needsRender = true;
      }
      break;
    }
    if (!next || typeof next !== "object") break;
    // Going deeper into `next` → `cursor` must be expanded.
    if (cursor && cursor !== schema && !isExpanded(cursor)) {
      cursor[EXPANDED] = true;
      needsRender = true;
    }
    cursor = next;
    i += consumed;
  }
  if (needsRender) render();
}
function unescapeJsonPointer(s) {
  return String(s).replace(/~1/g, "/").replace(/~0/g, "~");
}
function focusInputForPath(target, path) {
  const targetPath = target.dataset.path || "";
  if (path === targetPath) return; // cursor on the schema-node itself, no constraint/desc/comment
  // Last segment after the target path tells us which sub-field the cursor is on.
  const tail = path.slice(targetPath.length).replace(/^\//, "");
  const key = unescapeJsonPointer(tail.split("/")[0]);
  let input = null;
  if (key === "description") {
    input = target.querySelector(":scope > .schema-row > .schema-row-bottom .desc-input");
  } else if (key === "$comment") {
    input = target.querySelector(":scope > .schema-row-comment .comment-input");
  } else if (key === "type") {
    input = target.querySelector(":scope > .schema-row > .schema-row-top .type-pill");
  } else if (key === "title" && target.classList.contains("root")) {
    input = target.querySelector(":scope > .schema-row > .schema-row-top .name-input");
  } else if (key) {
    const c = target.querySelector(`:scope > .constraints > .constraint[data-key="${cssAttrEscape(key)}"]`);
    if (c) input = c.querySelector("input, select, textarea");
  }
  if (input) {
    suppressTreeListenerUntil = Date.now() + 250;
    input.focus({ preventScroll: true });
    if (typeof input.select === "function" && input.tagName !== "SELECT") input.select();
  }
}

// ── Tree → source sync ─────────────────────────────────────────
let suppressSourceListenerUntil = 0;
let suppressTreeListenerUntil = 0;

function syncTreeToSource(path, opts = {}) {
  if (!pathRangeMap) return;
  const entry = pathRangeMap.get(path);
  if (!entry) return;
  let start = entry.start, end = entry.end;
  if (opts.useKey && entry.keyStart !== undefined) {
    start = entry.keyStart;
    end = entry.keyEnd;
  }
  suppressSourceListenerUntil = Date.now() + 250;
  try { sourceEditor.setSelectionRange(start, end); } catch (_) {}
  scrollSourceToOffsetIfNeeded(start);
  flashSourceRange(start, end);
}
// Find the enclosing {…} or […] for a given offset. Returns offsets of opening & closing brackets.
function findScope(text, offset) {
  const stack = [];
  let inString = false;
  let i = 0;
  while (i < offset && i < text.length) {
    const c = text[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++; continue;
    }
    if (c === '"') { inString = true; i++; continue; }
    if (c === "{" || c === "[") stack.push({ offset: i, char: c });
    else if (c === "}" || c === "]") stack.pop();
    i++;
  }
  if (stack.length === 0) return null;
  const open = stack[stack.length - 1];
  const expectClose = open.char === "{" ? "}" : "]";
  let depth = 1;
  while (i < text.length) {
    const c = text[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++; continue;
    }
    if (c === '"') { inString = true; i++; continue; }
    if (c === open.char) depth++;
    else if (c === expectClose) {
      depth--;
      if (depth === 0) return { openOffset: open.offset, closeOffset: i };
    }
    i++;
  }
  return null;
}

function updateScopeOverlay() {
  if (document.activeElement !== sourceEditor) {
    sourceScope.style.display = "none";
    return;
  }
  const offset = sourceEditor.selectionStart;
  const text = sourceEditor.value;
  const scope = findScope(text, offset);
  if (!scope) { sourceScope.style.display = "none"; return; }
  let openLine = 0;
  for (let i = 0; i < scope.openOffset; i++) if (text.charCodeAt(i) === 10) openLine++;
  let closeLine = openLine;
  for (let i = scope.openOffset; i < scope.closeOffset; i++) if (text.charCodeAt(i) === 10) closeLine++;
  const cs = getComputedStyle(sourceEditor);
  const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const top = openLine * lh + padTop - sourceEditor.scrollTop;
  const height = (closeLine - openLine + 1) * lh;
  sourceScope.style.top = top + "px";
  sourceScope.style.height = height + "px";
  sourceScope.style.display = "block";
  const adj = (offset > 0 && /[{}\[\]]/.test(text[offset - 1])) ||
              (offset < text.length && /[{}\[\]]/.test(text[offset]));
  sourceScope.classList.toggle("bracket-active", adj);
}

function updateBreadcrumb(path) {
  sourceBreadcrumbCrumbs.innerHTML = "";
  const segs = path ? path.split("/").filter(Boolean) : [];
  const rootCrumb = document.createElement("span");
  rootCrumb.className = "crumb" + (segs.length === 0 ? " crumb-last" : "");
  rootCrumb.textContent = "root";
  sourceBreadcrumbCrumbs.appendChild(rootCrumb);
  segs.forEach((seg, i) => {
    const sep = document.createElement("span");
    sep.className = "crumb-sep";
    sep.textContent = "›";
    sourceBreadcrumbCrumbs.appendChild(sep);
    const c = document.createElement("span");
    const isLast = i === segs.length - 1;
    c.className = "crumb" + (isLast ? " crumb-last" : "");
    c.textContent = unescapeJsonPointer(seg);
    sourceBreadcrumbCrumbs.appendChild(c);
  });
}

// ──────────────────────────────────────────────────────────────
// Source search (find in source editor)
// ──────────────────────────────────────────────────────────────
let searchMatches = [];
let searchIdx = -1;

function findAllMatches(text, query) {
  if (!query) return [];
  const out = [];
  const lc = text.toLowerCase();
  const q = query.toLowerCase();
  const step = Math.max(1, q.length);
  let i = 0;
  while (i <= lc.length) {
    const at = lc.indexOf(q, i);
    if (at === -1) break;
    out.push([at, at + q.length]);
    i = at + step;
  }
  return out;
}

function updateSearchUI() {
  const q = searchInput.value;
  const hasQ = q.length > 0;
  const n = searchMatches.length;
  const noMatch = hasQ && n === 0;
  searchCounter.textContent = hasQ ? `${n === 0 ? 0 : searchIdx + 1}/${n}` : "";
  searchCounter.classList.toggle("no-match", noMatch);
  searchInput.classList.toggle("no-match", noMatch);
  searchPrev.disabled = n === 0;
  searchNext.disabled = n === 0;
}

function refreshSourceSearch(preferIdx = null) {
  const prev = preferIdx != null ? preferIdx : searchIdx;
  searchMatches = findAllMatches(sourceEditor.value, searchInput.value);
  if (searchMatches.length === 0) {
    searchIdx = -1;
  } else if (prev < 0 || prev >= searchMatches.length) {
    searchIdx = 0;
  } else {
    searchIdx = prev;
  }
  updateSearchUI();
}

function gotoSearchMatch(idx, syncTree = true) {
  if (!searchMatches.length) return;
  searchIdx = ((idx % searchMatches.length) + searchMatches.length) % searchMatches.length;
  const [start, end] = searchMatches[searchIdx];
  sourceEditor.setSelectionRange(start, end);
  // Scroll the match into view (without stealing focus from the search box)
  const text = sourceEditor.value;
  let line = 0;
  for (let i = 0; i < start; i++) if (text.charCodeAt(i) === 10) line++;
  const cs = getComputedStyle(sourceEditor);
  const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const lineTop = line * lh + padTop;
  const view = sourceEditor.clientHeight;
  const top = sourceEditor.scrollTop;
  if (lineTop < top + lh || lineTop + lh > top + view - lh) {
    sourceEditor.scrollTop = Math.max(0, lineTop - view / 2 + lh / 2);
  }
  flashSourceRange(start, end);
  updateSearchUI();
  // Mirror the "click on source" flow so the tree expands the corresponding
  // node and focuses its editable input. Skipped while the user is still
  // typing in the search box (would steal focus on every keystroke).
  if (syncTree) {
    setTimeout(() => syncToPathInTree(pathAtOffset(sourceEditor.value, start), true), 0);
  }
}

searchInput.addEventListener("input", () => {
  refreshSourceSearch(0);
  if (searchMatches.length) gotoSearchMatch(0, false);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!searchMatches.length) return;
    gotoSearchMatch(searchIdx + (e.shiftKey ? -1 : 1), true);
  } else if (e.key === "Escape") {
    searchInput.value = "";
    refreshSourceSearch();
  }
});
searchPrev.addEventListener("click", () => gotoSearchMatch(searchIdx - 1, true));
searchNext.addEventListener("click", () => gotoSearchMatch(searchIdx + 1, true));

function flashSourceRange(start, end) {
  const text = sourceEditor.value;
  let startLine = 0;
  for (let i = 0; i < start && i < text.length; i++) if (text.charCodeAt(i) === 10) startLine++;
  let endLine = startLine;
  for (let i = start; i < end && i < text.length; i++) if (text.charCodeAt(i) === 10) endLine++;
  const cs = getComputedStyle(sourceEditor);
  const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const top = startLine * lh + padTop - sourceEditor.scrollTop;
  const height = (endLine - startLine + 1) * lh;
  sourceHighlight.style.top = top + "px";
  sourceHighlight.style.height = height + "px";
  sourceHighlight.classList.remove("flash");
  void sourceHighlight.offsetWidth;
  sourceHighlight.classList.add("flash");
}
function scrollSourceToOffsetIfNeeded(offset) {
  const text = sourceEditor.value;
  let line = 0;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  const cs = getComputedStyle(sourceEditor);
  const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const lineY = line * lh + padTop;
  const viewTop = sourceEditor.scrollTop;
  const viewBottom = viewTop + sourceEditor.clientHeight;
  const margin = lh * 2;
  if (lineY < viewTop + margin || lineY > viewBottom - margin) {
    sourceEditor.scrollTop = lineY - sourceEditor.clientHeight / 3;
  }
}
function pathFromInteraction(target, schemaNode) {
  const basePath = schemaNode.dataset.path || "";
  if (target.classList.contains("desc-input")) return basePath + "/description";
  if (target.classList.contains("comment-input")) return basePath + "/$comment";
  if (target.classList.contains("type-pill")) return basePath + "/type";
  if (target.classList.contains("name-input")) {
    return schemaNode.classList.contains("root") ? basePath + "/title" : basePath;
  }
  const c = target.closest(".constraint[data-key]");
  if (c) return basePath + "/" + escapeJsonPointer(c.dataset.key);
  return basePath;
}
const treeBodyEl = document.getElementById("treeBody");
treeBodyEl.addEventListener("focusin", (e) => {
  if (Date.now() < suppressTreeListenerUntil) return;
  const target = e.target;
  if (!target.matches("input, select, textarea")) return;
  const schemaNode = target.closest(".schema-node");
  if (!schemaNode) return;
  const path = pathFromInteraction(target, schemaNode);
  const useKey = target.classList.contains("name-input") && !schemaNode.classList.contains("root");
  syncTreeToSource(path, { useKey });
});
treeBodyEl.addEventListener("click", (e) => {
  if (Date.now() < suppressTreeListenerUntil) return;
  if (e.target.closest("input, select, textarea, button")) return;
  const schemaNode = e.target.closest(".schema-node");
  if (!schemaNode) return;
  syncTreeToSource(schemaNode.dataset.path || "", {});
});

sourceEditor.addEventListener("click", () => {
  if (Date.now() < suppressSourceListenerUntil) return;
  scheduleCursorSync(true);
});
sourceEditor.addEventListener("keyup", () => {
  if (Date.now() < suppressSourceListenerUntil) return;
  scheduleCursorSync(false);
});
document.addEventListener("selectionchange", () => {
  if (Date.now() < suppressSourceListenerUntil) return;
  if (document.activeElement === sourceEditor) scheduleCursorSync(false);
});
sourceEditor.addEventListener("scroll", updateScopeOverlay);
sourceEditor.addEventListener("blur", () => { sourceScope.style.display = "none"; });
sourceEditor.addEventListener("focus", updateScopeOverlay);

// ──────────────────────────────────────────────────────────────
// Schema self-validation (compiles via Ajv)
// ──────────────────────────────────────────────────────────────
function validateSchemaItself() {
  const pill = document.getElementById("statusPill");
  if (validationState !== "ready" || !ajv) {
    updateStatusPill();
    return;
  }
  pill.title = "";
  pill.disabled = true;
  try {
    ajv.compile(schema);
    pill.className = "status-pill ok";
    pill.textContent = t("schema_valid");
  } catch (e) {
    pill.className = "status-pill err";
    pill.textContent = t("schema_invalid_prefix") + e.message.slice(0, 80);
    pill.title = e.message;
  }
}

// ──────────────────────────────────────────────────────────────
// Validation panel
// ──────────────────────────────────────────────────────────────
const validationPanel = document.getElementById("validationPanel");
document.getElementById("validatePanelHeader").addEventListener("click", () => {
  validationPanel.classList.toggle("open");
});

const testJsonInput = document.getElementById("testJson");
testJsonInput.addEventListener("input", runValidation);

function runValidation() {
  const out = document.getElementById("validationResults");
  const statusEl = document.getElementById("validationStatus");
  const raw = testJsonInput.value.trim();
  let data, parseErr;
  if (raw) {
    try { data = JSON.parse(raw); } catch (e) { parseErr = e; }
  }
  const errorPaths = new Set();

  out.innerHTML = "";
  const setMsg = (html) => { out.innerHTML = html; };

  if (parseErr) {
    setMsg(`<div class="err"><b>${escapeHtml(t("error_invalid_json"))}</b> ${escapeHtml(parseErr.message)}</div>`);
    statusEl.className = "status-pill err";
    statusEl.textContent = t("json_invalid");
  } else if (validationState === "off") {
    setMsg(`<div class="muted"><b>${escapeHtml(t("activate_validation"))}</b><br>${escapeHtml(t("activate_validation_hint"))}</div>`);
    statusEl.className = "status-pill warn";
    statusEl.textContent = t("activate_validation");
  } else if (validationState === "loading") {
    setMsg(`<div class="muted">${escapeHtml(t("loading_validation"))}</div>`);
    statusEl.className = "status-pill warn";
    statusEl.textContent = t("loading_validation");
  } else if (validationState === "error" || !ajv) {
    const msg = (ajvLoadError && (ajvLoadError.message || String(ajvLoadError))) || t("validation_load_failed_hint");
    setMsg(`<div class="err"><b>${escapeHtml(t("validation_load_failed"))}</b><br>${escapeHtml(msg)}</div>`);
    statusEl.className = "status-pill err";
    statusEl.textContent = t("validation_load_failed");
  } else if (!raw) {
    setMsg(`<span class="muted">${escapeHtml(t("edit_test_json"))}</span>`);
    statusEl.className = "status-pill warn";
    statusEl.textContent = t("untested");
  } else {
    let validate;
    try { validate = ajv.compile(schema); }
    catch (e) {
      setMsg(`<div class="err"><b>${escapeHtml(t("error_invalid_schema"))}</b> ${escapeHtml(e.message)}</div>`);
      statusEl.className = "status-pill err";
      statusEl.textContent = t("schema_invalid_short");
      validate = null;
    }
    if (validate) {
      const ok = validate(data);
      if (ok) {
        setMsg(`<div class="ok">${escapeHtml(t("json_meets_schema"))}</div>`);
        statusEl.className = "status-pill ok";
        statusEl.textContent = t("valid");
      } else {
        const n = validate.errors.length;
        statusEl.className = "status-pill err";
        statusEl.textContent = n === 1 ? t("errors_one") : t("errors_many", n);
        setMsg(validate.errors.map(err => {
          const path = err.instancePath || "(root)";
          errorPaths.add(err.instancePath || "");
          return `<div class="err"><b>${escapeHtml(path)}</b> — ${escapeHtml(err.message)}${err.params ? ` <span class="muted">[${escapeHtml(JSON.stringify(err.params))}]</span>` : ""}</div>`;
        }).join(""));
      }
    }
  }

  if (data !== undefined) appendJsonTree(out, data, errorPaths);
}

function appendJsonTree(container, data, errorPaths) {
  const section = el("div", { class: "json-tree-section" });
  section.appendChild(el("div", { class: "json-tree-title" }, t("json_tree_title")));
  const tree = el("div", { class: "json-tree" });
  tree.appendChild(renderJsonTree(data, undefined, "", errorPaths || new Set()));
  section.appendChild(tree);
  container.appendChild(section);
}

function renderJsonTree(value, key, path, errorPaths) {
  const isErr = errorPaths.has(path);
  if (value !== null && typeof value === "object") {
    const isArr = Array.isArray(value);
    const entries = isArr ? value.map((v, i) => [i, v]) : Object.entries(value);
    const sizeLabel = isArr ? `[${entries.length}]` : `{${entries.length}}`;
    const summary = el("summary");
    if (key !== undefined) {
      summary.appendChild(el("span", { class: "json-key" }, String(key)));
      summary.appendChild(document.createTextNode(" "));
    }
    summary.appendChild(el("span", { class: "json-type" }, sizeLabel));
    const details = el("details");
    details.open = key === undefined;
    if (isErr) summary.classList.add("json-error");
    details.appendChild(summary);
    const children = el("div", { class: "json-children" });
    for (const [k, v] of entries) {
      const childPath = path + "/" + String(k).replace(/~/g, "~0").replace(/\//g, "~1");
      children.appendChild(renderJsonTree(v, k, childPath, errorPaths));
    }
    details.appendChild(children);
    return details;
  }
  const leaf = el("div", { class: "json-leaf" + (isErr ? " json-error" : "") });
  if (key !== undefined) {
    leaf.appendChild(el("span", { class: "json-key" }, String(key)));
    leaf.appendChild(document.createTextNode(": "));
  }
  let cls = "json-null", text = "null";
  if (typeof value === "string") { cls = "json-string"; text = JSON.stringify(value); }
  else if (typeof value === "number") { cls = "json-number"; text = String(value); }
  else if (typeof value === "boolean") { cls = "json-boolean"; text = String(value); }
  leaf.appendChild(el("span", { class: cls }, text));
  return leaf;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ──────────────────────────────────────────────────────────────
// Toolbar actions
// ──────────────────────────────────────────────────────────────
document.getElementById("btnNew").addEventListener("click", () => {
  if (confirm(t("confirm_new"))) {
    schema = defaultSchema();
    render();
  }
});

document.getElementById("btnExport").addEventListener("click", () => {
  const blob = new Blob([sourceEditor.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (schema.title || "schema").toLowerCase().replace(/\s+/g, "-") + ".schema.json";
  a.click();
  URL.revokeObjectURL(url);
});

const fileInput = document.getElementById("fileInput");
document.getElementById("btnImport").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    schema = normalizeSchema(JSON.parse(text));
    render();
  } catch (err) { alert(t("file_read_error") + err.message); }
  fileInput.value = "";
});

function parseSourceAsSchema() {
  const raw = sourceEditor.value.trim();
  try { return normalizeSchema(JSON.parse(raw)); } catch (_) {}
  try {
    const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    return normalizeSchema(JSON.parse(new TextDecoder().decode(bytes)));
  } catch (_) {}
  throw new SyntaxError(t("json_invalid_prefix").replace(/:\s*$/, ""));
}

document.getElementById("btnFormat").addEventListener("click", () => {
  try {
    schema = parseSourceAsSchema();
    render();
  } catch (e) { alert(t("json_invalid_prefix") + e.message); }
});

document.getElementById("btnMinify").addEventListener("click", () => {
  try {
    schema = parseSourceAsSchema();
    clearTimeout(sourceErrorTimer);
    sourceEditor.value = JSON.stringify(schema);
    sourceEditor.classList.remove("error");
  } catch (e) { alert(t("json_invalid_prefix") + e.message); }
});

document.getElementById("btnBase64").addEventListener("click", () => {
  try {
    JSON.parse(sourceEditor.value);
    const bytes = new TextEncoder().encode(sourceEditor.value);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    clearTimeout(sourceErrorTimer);
    sourceEditor.value = b64;
    sourceEditor.classList.remove("error");
  } catch (e) { alert(t("json_invalid_prefix") + e.message); }
});

document.getElementById("btnCopy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(sourceEditor.value);
    const b = document.getElementById("btnCopy");
    const orig = b.textContent;
    b.textContent = t("btn_copied");
    setTimeout(() => b.textContent = orig, 1200);
  } catch { alert(t("copy_failed")); }
});

// Infer modal
const inferModal = document.getElementById("inferModal");
document.getElementById("btnInfer").addEventListener("click", () => {
  document.getElementById("inferInput").value = "";
  inferModal.style.display = "flex";
});
document.getElementById("inferCancel").addEventListener("click", () => { inferModal.style.display = "none"; });
document.getElementById("inferGo").addEventListener("click", () => {
  const raw = document.getElementById("inferInput").value.trim();
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    schema = inferSchema(data);
    schema.$schema = "http://json-schema.org/draft-07/schema#";
    schema.title = schema.title || t("inferred_title");
    inferModal.style.display = "none";
    render();
  } catch (e) { alert(t("json_invalid_prefix") + e.message); }
});

function inferSchema(value) {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    const itemSchemas = value.map(inferSchema);
    return { type: "array", items: itemSchemas[0] || { type: "string" } };
  }
  const t = typeof value;
  if (t === "string") return { type: "string" };
  if (t === "boolean") return { type: "boolean" };
  if (t === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  if (t === "object") {
    const props = {};
    const required = [];
    for (const [k, v] of Object.entries(value)) {
      props[k] = inferSchema(v);
      required.push(k);
    }
    return { type: "object", properties: props, required };
  }
  return {};
}

// ──────────────────────────────────────────────────────────────
// Splitter
// ──────────────────────────────────────────────────────────────
const splitter = document.getElementById("splitter");
const mainGrid = document.querySelector("main");
let dragging = false;
splitter.addEventListener("mousedown", (e) => {
  dragging = true;
  splitter.classList.add("dragging");
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
});
window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const total = mainGrid.clientWidth;
  const left = Math.max(200, Math.min(total - 200, e.clientX));
  mainGrid.style.gridTemplateColumns = `${left}px 6px 1fr`;
});
window.addEventListener("mouseup", () => {
  if (!dragging) return;
  dragging = false;
  splitter.classList.remove("dragging");
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
});

// ──────────────────────────────────────────────────────────────
// Locale selector wiring
// ──────────────────────────────────────────────────────────────
const localeSelect = document.getElementById("localeSelect");
for (const [code, dict] of Object.entries(I18N)) {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = dict._label;
  if (code === currentLocale) opt.selected = true;
  localeSelect.appendChild(opt);
}
localeSelect.addEventListener("change", (e) => setLocale(e.target.value));

// ──────────────────────────────────────────────────────────────
// Collapse/Expand all toggle
// ──────────────────────────────────────────────────────────────
document.getElementById("btnToggleAll").addEventListener("click", () => {
  setAllExpanded(!allExpanded);
  refreshToggleAllLabel();
});

// ──────────────────────────────────────────────────────────────
// Compact mode toggle
// ──────────────────────────────────────────────────────────────
function setCompactMode(on) {
  document.body.classList.toggle("compact", !!on);
  localStorage.setItem("jse_compact", on ? "1" : "0");
}
const compactToggle = document.getElementById("compactToggle");
const compactInitial = localStorage.getItem("jse_compact") === "1";
compactToggle.checked = compactInitial;
setCompactMode(compactInitial);
compactToggle.addEventListener("change", (e) => setCompactMode(e.target.checked));

// ──────────────────────────────────────────────────────────────
// Status pill (click to enable Ajv on demand)
// ──────────────────────────────────────────────────────────────
document.getElementById("statusPill").addEventListener("click", () => {
  if (validationState === "off" || validationState === "error") loadAjvOnDemand();
});

// ──────────────────────────────────────────────────────────────
// Help modal
// ──────────────────────────────────────────────────────────────
const helpModal = document.getElementById("helpModal");
function openHelp() {
  document.getElementById("helpContent").innerHTML = HELP_CONTENT[currentLocale] || HELP_CONTENT.es;
  helpModal.style.display = "flex";
}
function closeHelp() { helpModal.style.display = "none"; }
function adjustFontBase(delta) {
  const root = document.documentElement;
  const current = parseFloat(getComputedStyle(root).getPropertyValue("--font-base")) || 12;
  const next = Math.min(24, Math.max(8, current + delta));
  root.style.setProperty("--font-base", next + "px");
}
document.getElementById("btnFontDec").addEventListener("click", () => adjustFontBase(-1));
document.getElementById("btnFontInc").addEventListener("click", () => adjustFontBase(1));
document.getElementById("btnUndo").addEventListener("click", undoHistory);
document.getElementById("btnRedo").addEventListener("click", redoHistory);
document.getElementById("btnHelp").addEventListener("click", openHelp);
document.getElementById("helpClose").addEventListener("click", closeHelp);
helpModal.addEventListener("click", (e) => { if (e.target === helpModal) closeHelp(); });
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && helpModal.style.display === "flex") closeHelp();
  // Schema-level undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+Y).
  // Skipped while focus is on an editable element so the browser's own
  // text-undo still works inside name/description/source inputs.
  if (!(e.metaKey || e.ctrlKey)) return;
  const tag = (document.activeElement && document.activeElement.tagName) || "";
  const isEditable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
    || (document.activeElement && document.activeElement.isContentEditable);
  if (isEditable) return;
  const k = e.key.toLowerCase();
  if (k === "z" && !e.shiftKey) { e.preventDefault(); undoHistory(); }
  else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redoHistory(); }
});

applyStaticTranslations();
refreshToggleAllLabel();
updateStatusPill();
loadSchemaFromUrl();
render();
pushHistoryNow(); // seed history with the initial schema
runValidation();

function loadSchemaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  let b64 = params.get("schema");
  if (!b64 && window.location.hash.startsWith("#")) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    b64 = hashParams.get("schema");
  }
  if (!b64) return;
  try {
    const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    schema = normalizeSchema(JSON.parse(json));
  } catch (e) {
    alert(t("json_invalid_prefix") + e.message);
  }
}
