import ast

def extract_python_architecture(source: str) -> dict:
    imports: set[str] = set()
    classes: list[str] = []
    functions: list[str] = []
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError):
        return {"imports": [], "classes": [], "functions": []}

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            level = node.level
            module = node.module or ""
            prefix = "." * level
            imports.add(f"{prefix}{module}")
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)

    return {
        "imports": sorted(imports),
        "classes": sorted(classes),
        "functions": sorted(functions)
    }
