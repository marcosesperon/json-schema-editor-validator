#!/usr/bin/env python3
"""Genera un JSON Schema (Draft-07) a partir de uno o varios JSON de ejemplo.

Usage:
  python tools/get_json_schema.py muestra1.json muestra2.json ... [opciones]

Opciones principales:
  -o, --output PATH       Escribe el schema en PATH (por defecto: stdout).
  --title TXT             Título del schema (por defecto: "Inferred").
  --enum-threshold N      Umbral de valores únicos para proponer enum (por defecto 10).
  --with-ranges           Añade minLength/maxLength/minimum/maximum observados.
  --strict                Marca `additionalProperties: false` en cada objeto.
  --no-format             Desactiva detección de format (date/email/uri/uuid/…).
  --no-enum               Desactiva detección de enum.

Sin dependencias externas: `genson` viene vendorizado en `tools/vendor/`.
"""
from __future__ import annotations
import argparse
import base64
import binascii
import json
import os
import re
import sys
from pathlib import Path

# Vendor: añade tools/vendor/ al sys.path antes del import de genson.
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_HERE, "vendor"))
from genson import SchemaBuilder  # noqa: E402

# Patrones para detección de `format` (Draft-07). Un campo recibe `format` solo
# si TODAS las muestras observadas en ese path lo cumplen.
FORMAT_PATTERNS = {
    "date-time": re.compile(r"^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:?\d{2})?$"),
    "date":      re.compile(r"^\d{4}-\d{2}-\d{2}$"),
    "time":      re.compile(r"^\d{2}:\d{2}:\d{2}(\.\d+)?$"),
    "email":     re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$"),
    "uuid":      re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"),
    "ipv4":      re.compile(r"^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$"),
    "ipv6":      re.compile(r"^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1?|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7})$"),
    "uri":       re.compile(r"^[a-zA-Z][a-zA-Z0-9+.\-]*:\S+$"),
    # hostname: exige al menos un punto separador para evitar matchear cualquier palabra suelta.
    "hostname":  re.compile(r"^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)+$"),
}

# ─────────────────────────────────────────────────────────────────────────────
# Recolección de valores por JSON Pointer

def _esc(seg: str) -> str:
    return seg.replace("~", "~0").replace("/", "~1")


def collect_values(sample, path: str = "", acc=None):
    """Recorre el sample y agrupa los valores hoja por JSON Pointer.

    Importante: para los elementos de un array NO usamos el índice como segmento
    final (queremos agrupar todos los items bajo el mismo path para que enum
    y format se evalúen sobre el conjunto). Usamos `/[]` como marcador.
    """
    if acc is None:
        acc = {}
    if isinstance(sample, dict):
        for k, v in sample.items():
            collect_values(v, f"{path}/{_esc(str(k))}", acc)
    elif isinstance(sample, list):
        for v in sample:
            collect_values(v, f"{path}/[]", acc)
    else:
        acc.setdefault(path, []).append(sample)
    return acc


# ─────────────────────────────────────────────────────────────────────────────
# Detección de pistas: format, enum, ranges

def detect_format(values):
    strs = [v for v in values if isinstance(v, str) and v != ""]
    if not strs:
        return None
    # Orden importa: probar el más específico primero (date-time antes que date,
    # ipv4 antes que hostname, etc.). FORMAT_PATTERNS ya está ordenado así.
    for fmt, rx in FORMAT_PATTERNS.items():
        if all(rx.match(v) for v in strs):
            return fmt
    return None


def detect_enum(values, threshold: int, min_samples: int = 3):
    if not values or len(values) < min_samples:
        return None
    # Solo proponemos enum para tipos hashables y "discretos".
    try:
        unique = sorted(set(values), key=lambda x: (isinstance(x, str), x))
    except TypeError:
        return None
    if not unique or len(unique) > threshold:
        return None
    # Si todos los valores son el mismo, mejor `const` que `enum`.
    if len(unique) == 1:
        return ("const", unique[0])
    return ("enum", unique)


def detect_string_lengths(values):
    strs = [v for v in values if isinstance(v, str)]
    if not strs:
        return None, None
    lens = [len(s) for s in strs]
    return min(lens), max(lens)


def detect_numeric_range(values):
    nums = [v for v in values if isinstance(v, (int, float)) and not isinstance(v, bool)]
    if not nums:
        return None, None
    return min(nums), max(nums)


# ─────────────────────────────────────────────────────────────────────────────
# Enriquecimiento del schema generado por genson

def enrich(schema, by_path, *, path: str, args):
    """Recorre el schema mutándolo con las pistas inferidas de las muestras."""
    if not isinstance(schema, dict):
        return

    if args.strict and schema.get("type") == "object" and "additionalProperties" not in schema:
        schema["additionalProperties"] = False

    # Recurse first so children inherit the right path.
    if schema.get("type") == "object" and isinstance(schema.get("properties"), dict):
        for prop, sub in schema["properties"].items():
            enrich(sub, by_path, path=f"{path}/{_esc(prop)}", args=args)

    if schema.get("type") == "array" and isinstance(schema.get("items"), dict):
        enrich(schema["items"], by_path, path=f"{path}/[]", args=args)

    # anyOf/oneOf/allOf: recursar en cada alternativa con el MISMO path.
    for comp in ("anyOf", "oneOf", "allOf"):
        if isinstance(schema.get(comp), list):
            for sub in schema[comp]:
                enrich(sub, by_path, path=path, args=args)

    # Pistas en hojas (cualquier tipo escalar, o también permitidas en object/array).
    values = by_path.get(path, [])
    if not values:
        return

    # `format` (solo si el schema es string-only o lo incluye y todos los samples cumplen).
    if not args.no_format and _is_string_typed(schema):
        fmt = detect_format(values)
        if fmt and "format" not in schema:
            schema["format"] = fmt

    # `enum` / `const`.
    if not args.no_enum:
        result = detect_enum(values, args.enum_threshold)
        if result:
            kind, val = result
            if kind == "const" and "const" not in schema and "enum" not in schema:
                schema["const"] = val
            elif kind == "enum" and "enum" not in schema and "const" not in schema:
                schema["enum"] = val

    # Rangos opcionales.
    if args.with_ranges:
        if _is_string_typed(schema):
            lo, hi = detect_string_lengths(values)
            if lo is not None:
                schema.setdefault("minLength", lo)
                schema.setdefault("maxLength", hi)
        if _is_numeric_typed(schema):
            lo, hi = detect_numeric_range(values)
            if lo is not None:
                schema.setdefault("minimum", lo)
                schema.setdefault("maximum", hi)


def _is_string_typed(schema) -> bool:
    t = schema.get("type")
    return t == "string" or (isinstance(t, list) and "string" in t)


def _is_numeric_typed(schema) -> bool:
    t = schema.get("type")
    if t in ("number", "integer"):
        return True
    if isinstance(t, list) and ({"number", "integer"} & set(t)):
        return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
# Loaders

def _decode_b64(s: str) -> str:
    s = s.strip()
    s = s.replace("-", "+").replace("_", "/")
    s += "=" * ((4 - len(s) % 4) % 4)
    try:
        return base64.b64decode(s).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError) as e:
        raise ValueError(f"invalid base64: {e}")


def load_multi(path: str):
    """Load a file containing multiple JSON samples (top-level array or JSONL)."""
    text = Path(path).read_text(encoding="utf-8").strip()
    if not text:
        return []
    # Try as a JSON array first.
    try:
        data = json.loads(text)
        return data if isinstance(data, list) else [data]
    except json.JSONDecodeError:
        pass
    # Fall back to JSONL (one JSON per non-empty line).
    samples = []
    for ln, raw in enumerate(text.splitlines(), 1):
        raw = raw.strip()
        if not raw:
            continue
        try:
            samples.append(json.loads(raw))
        except json.JSONDecodeError as e:
            raise SystemExit(f"Error parsing {path}:{ln}: {e}")
    return samples


# ─────────────────────────────────────────────────────────────────────────────
# CLI

def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Infer a JSON Schema (Draft-07) from one or more JSON samples.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("files", nargs="*", help="Sample JSON file(s), one JSON per file.")
    ap.add_argument("-j", "--json", action="append", default=[], help="Inline JSON sample (can be repeated).")
    ap.add_argument("--json-b64", action="append", default=[], dest="json_b64",
                    help="Base64-encoded JSON sample, URL-safe accepted (can be repeated).")
    ap.add_argument("--multi", action="append", default=[],
                    help="File containing multiple samples (JSON array at root, or JSONL — one JSON per line). Can be repeated.")
    ap.add_argument("-o", "--output", help="Write schema to this file (default: stdout).")
    ap.add_argument("--title", default="Inferred", help="Schema title (default: Inferred).")
    ap.add_argument("--enum-threshold", type=int, default=10, help="Max unique values to propose an enum (default: 10).")
    ap.add_argument("--with-ranges", action="store_true", help="Include minLength/maxLength/minimum/maximum observed in samples.")
    ap.add_argument("--strict", action="store_true", help="Mark every object with additionalProperties: false.")
    ap.add_argument("--no-format", action="store_true", help="Disable format detection.")
    ap.add_argument("--no-enum", action="store_true", help="Disable enum/const detection.")
    args = ap.parse_args(argv)

    samples = []
    for f in args.files:
        try:
            samples.append(json.loads(Path(f).read_text(encoding="utf-8")))
        except json.JSONDecodeError as e:
            sys.exit(f"Error parsing {f}: {e}")
    for i, raw in enumerate(args.json, 1):
        try:
            samples.append(json.loads(raw))
        except json.JSONDecodeError as e:
            sys.exit(f"Error parsing --json #{i}: {e}")
    for i, b in enumerate(args.json_b64, 1):
        try:
            samples.append(json.loads(_decode_b64(b)))
        except (ValueError, json.JSONDecodeError) as e:
            sys.exit(f"Error parsing --json-b64 #{i}: {e}")
    for f in args.multi:
        samples.extend(load_multi(f))

    if not samples:
        sys.exit("No samples provided. Pass at least one file, --json, --json-b64, or --multi.")

    builder = SchemaBuilder(schema_uri="http://json-schema.org/draft-07/schema#")
    for s in samples:
        builder.add_object(s)
    schema = builder.to_schema()
    if args.title:
        # Keep $schema first, then title near the top.
        new_schema = {"$schema": schema.pop("$schema", "http://json-schema.org/draft-07/schema#"), "title": args.title}
        new_schema.update(schema)
        schema = new_schema

    by_path = {}
    for s in samples:
        collect_values(s, "", by_path)
    enrich(schema, by_path, path="", args=args)

    out = json.dumps(schema, indent=2, ensure_ascii=False)
    if args.output:
        Path(args.output).write_text(out + "\n", encoding="utf-8")
    else:
        print(out)


if __name__ == "__main__":
    main()
