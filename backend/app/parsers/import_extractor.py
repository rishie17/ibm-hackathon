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
    except SyntaxError:
        return [], []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module.split(".")[0])
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)

    return sorted(imports), sorted(functions)


def extract_js_ts_imports(source: str) -> tuple[list[str], list[str]]:
    imports = {
        match.group("import") or match.group("require")
        for match in JS_IMPORT_RE.finditer(source)
        if match.group("import") or match.group("require")
    }
    functions = {
        match.group("fn") or match.group("const") or match.group("export")
        for match in FUNCTION_RE.finditer(source)
        if match.group("fn") or match.group("const") or match.group("export")
    }
    return sorted(imports), sorted(functions)

