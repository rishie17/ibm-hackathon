import ast
import re


JS_IMPORT_RE = re.compile(
    r"(?:import\s+(?:.+?\s+from\s+)?[\"'](?P<import>[^\"']+)[\"']|require\([\"'](?P<require>[^\"']+)[\"']\))"
)
FUNCTION_RE = re.compile(
    r"(?:function\s+(?P<fn>[A-Za-z_$][\w$]*)|const\s+(?P<const>[A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(|export\s+function\s+(?P<export>[A-Za-z_$][\w$]*))"
)


def extract_python_imports(source: str) -> tuple[list[str], list[str]]:
    imports: set[str] = set()
    functions: list[str] = []
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError):
        return [], []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            level = node.level
            module = node.module or ""
            prefix = "." * level
            imports.add(f"{prefix}{module}")
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)

    return sorted(imports), sorted(functions)


def extract_js_ts_imports(source: str) -> tuple[list[str], list[str]]:
    # Improved regex to handle various import styles
    # Captures: import 'x', import x from 'y', import {x} from 'y', require('z')
    imports = set()
    
    # Standard ES6 imports
    es6_matches = re.finditer(r"import\s+(?:[^\"']+\s+from\s+)?[\"']([^\"']+)[\"']", source)
    for m in es6_matches:
        imports.add(m.group(1))
        
    # CommonJS require
    cjs_matches = re.finditer(r"require\([\"']([^\"']+)[\"']\)", source)
    for m in cjs_matches:
        imports.add(m.group(1))

    # Dynamic imports
    dynamic_matches = re.finditer(r"import\([\"']([^\"']+)[\"']\)", source)
    for m in dynamic_matches:
        imports.add(m.group(1))

    functions = {
        match.group("fn") or match.group("const") or match.group("export")
        for match in FUNCTION_RE.finditer(source)
        if match.group("fn") or match.group("const") or match.group("export")
    }
    return sorted(imports), sorted(functions)

