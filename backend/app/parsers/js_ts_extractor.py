import re

def extract_js_ts_architecture(source: str) -> dict:
    imports = set()
    exports = set()
    classes = set()
    functions = set()
    
    # Imports
    for m in re.finditer(r"import\s+(?:[^\"']+\s+from\s+)?[\"']([^\"']+)[\"']", source):
        imports.add(m.group(1))
    for m in re.finditer(r"require\([\"']([^\"']+)[\"']\)", source):
        imports.add(m.group(1))
    for m in re.finditer(r"import\([\"']([^\"']+)[\"']\)", source):
        imports.add(m.group(1))
        
    # Exports
    for m in re.finditer(r"export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([A-Za-z_$][\w$]*)", source):
        exports.add(m.group(1))
    for m in re.finditer(r"export\s+\{([^}]+)\}", source):
        for exp in m.group(1).split(","):
            ex = exp.strip().split(" as ")[0].strip()
            if ex:
                exports.add(ex)
                
    # Classes
    for m in re.finditer(r"class\s+([A-Za-z_$][\w$]*)", source):
        classes.add(m.group(1))
        
    # Functions
    for m in re.finditer(r"function\s+([A-Za-z_$][\w$]*)", source):
        functions.add(m.group(1))
    for m in re.finditer(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>", source):
        functions.add(m.group(1))

    return {
        "imports": sorted(imports),
        "exports": sorted(exports),
        "classes": sorted(classes),
        "functions": sorted(functions)
    }
