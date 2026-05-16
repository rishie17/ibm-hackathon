from pathlib import Path

from app.models.schemas import DependencyEdge, FileNode, RepositoryAnalysis, SupportedLanguage
from app.parsers.python_extractor import extract_python_architecture
from app.parsers.js_ts_extractor import extract_js_ts_architecture
from app.parsers.verilog_extractor import extract_verilog_architecture

IGNORED_DIRS = {
    ".git",
    ".next",
    ".venv",
    "__pycache__",
    "dist",
    "build",
    "node_modules",
    "venv",
}

LANGUAGE_BY_SUFFIX: dict[str, SupportedLanguage] = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".v": "verilog",
    ".sv": "systemverilog",
}


class RepositoryParser:
    """Traverses source files and extracts initial module intelligence."""

    def parse(self, repository_path: str) -> RepositoryAnalysis:
        if repository_path.startswith(("http://", "https://", "git@")):
            raise ValueError(
                "Remote URLs are not supported in the MVP. Please provide a local path to a cloned repository."
            )

        root = Path(repository_path).expanduser().resolve()
        if not root.exists():
            raise FileNotFoundError(f"Local repository path not found: {repository_path}")
        if not root.is_dir():
            raise ValueError(f"Repository path must be a directory: {root}")

        files: list[FileNode] = []
        for path in root.rglob("*"):
            if not path.is_file() or self._is_ignored(path, root):
                continue
            language = LANGUAGE_BY_SUFFIX.get(path.suffix.lower())
            if language is None:
                continue
            files.append(self._parse_file(path, root, language))

        dependencies = self._resolve_dependencies(files)
        return RepositoryAnalysis(root=root, files=files, dependencies=dependencies)

    def _parse_file(self, path: Path, root: Path, language: SupportedLanguage) -> FileNode:
        source = path.read_text(encoding="utf-8", errors="ignore")
        
        extracted = {
            "imports": [], "exports": [], "classes": [], 
            "functions": [], "instantiations": [], "module_defs": []
        }
        
        if language == "python":
            extracted.update(extract_python_architecture(source))
        elif language in ("javascript", "typescript"):
            extracted.update(extract_js_ts_architecture(source))
        elif language in ("verilog", "systemverilog"):
            extracted.update(extract_verilog_architecture(source))

        relative_path = path.relative_to(root).as_posix()
        return FileNode(
            path=relative_path,
            language=language,
            size_bytes=path.stat().st_size,
            lines=source.count("\n") + 1 if source else 0,
            imports=extracted.get("imports", []),
            exports=extracted.get("exports", []),
            classes=extracted.get("classes", []),
            functions=extracted.get("functions", []),
            instantiations=extracted.get("instantiations", []),
            module_defs=extracted.get("module_defs", []),
        )

    def _resolve_dependencies(self, files: list[FileNode]) -> list[DependencyEdge]:
        # Create a lookup for fast path existence checks
        file_paths = {file.path for file in files}
        
        # Create a lookup for verilog module name -> file.path
        verilog_modules = {}
        for file in files:
            if file.language in ("verilog", "systemverilog"):
                for mod in file.module_defs:
                    verilog_modules[mod] = file.path
                    
        dependencies: list[DependencyEdge] = []

        for file in files:
            # 1. Resolve imports
            for imported in file.imports:
                target = None
                if file.language == "python":
                    target = self._resolve_python_import(imported, file.path, file_paths)
                elif file.language in ("javascript", "typescript"):
                    target = self._resolve_js_ts_import(imported, file.path, file_paths)
                elif file.language in ("verilog", "systemverilog"):
                    # Verilog imports (includes) are typically just file names
                    target = self._resolve_verilog_include(imported, file.path, file_paths)

                if target and target != file.path:
                    dependencies.append(DependencyEdge(
                        source=file.path, 
                        target=target, 
                        relationship="imports"
                    ))

            # 2. Resolve instantiations (mainly Verilog)
            for inst in file.instantiations:
                target = verilog_modules.get(inst)
                if target and target != file.path:
                    dependencies.append(DependencyEdge(
                        source=file.path, 
                        target=target, 
                        relationship="instantiates"
                    ))

        return dependencies

    def _resolve_python_import(self, imported: str, source_path: str, file_paths: set[str]) -> str | None:
        """Resolves a Python import to a file path."""
        # Handle relative imports
        if imported.startswith("."):
            level = 0
            while level < len(imported) and imported[level] == ".":
                level += 1
            
            module_path = imported[level:].replace(".", "/")
            source_parts = source_path.split("/")
            # level 1 means same directory, level 2 means parent, etc.
            base_parts = source_parts[:-(level)]
            
            if module_path:
                target_base = "/".join(base_parts + [module_path])
            else:
                target_base = "/".join(base_parts)
        else:
            # Absolute import
            target_base = imported.replace(".", "/")

        # Try .py and __init__.py
        candidates = [
            f"{target_base}.py",
            f"{target_base}/__init__.py"
        ]
        
        for candidate in candidates:
            if candidate in file_paths:
                return candidate
        
        # Also try partial matches for common patterns (e.g. from x.y import z where z is a class/fn)
        # If x/y.py exists, return it.
        parts = target_base.split("/")
        while len(parts) > 1:
            parts.pop()
            parent_base = "/".join(parts)
            for candidate in [f"{parent_base}.py", f"{parent_base}/__init__.py"]:
                if candidate in file_paths:
                    return candidate

        return None

    def _resolve_js_ts_import(self, imported: str, source_path: str, file_paths: set[str]) -> str | None:
        """Resolves a JS/TS import to a file path."""
        if imported.startswith("."):
            # Relative import
            source_dir = "/".join(source_path.split("/")[:-1])
            target_base = Path(source_dir) / imported
            target_base = target_base.as_posix()
        else:
            # Might be an absolute path from root or a node_module
            target_base = imported

        # Normalize target_base (remove redundant ./ and ../)
        # We can use Path for this
        target_base = str(Path(target_base))
        target_base = target_base.replace("\\", "/")
        if target_base.startswith("./"):
            target_base = target_base[2:]

        # Candidates for JS/TS
        extensions = [".ts", ".tsx", ".js", ".jsx"]
        candidates = []
        
        # Direct file
        for ext in extensions:
            candidates.append(f"{target_base}{ext}")
        
        # Index files
        for ext in extensions:
            candidates.append(f"{target_base}/index{ext}")
            
        # Exact match (if they included extension)
        candidates.append(target_base)

        for candidate in candidates:
            if candidate in file_paths:
                return candidate
                
        return None

    def _resolve_verilog_include(self, imported: str, source_path: str, file_paths: set[str]) -> str | None:
        # Includes can be relative to the file or just globally in the repo
        # Try relative first
        source_dir = "/".join(source_path.split("/")[:-1])
        if source_dir:
            target_base = f"{source_dir}/{imported}"
        else:
            target_base = imported
            
        if target_base in file_paths:
            return target_base
            
        # Try globally (any file with this exact name)
        # Assuming include names are unique enough
        for f in file_paths:
            if f.endswith(f"/{imported}") or f == imported:
                return f
        
        return None

    def _module_name(self, path: str) -> str:
        without_suffix = str(Path(path).with_suffix(""))
        return without_suffix.replace("/", ".").replace("\\", ".")

    def _is_ignored(self, path: Path, root: Path) -> bool:
        relative_parts = path.relative_to(root).parts
        return any(part in IGNORED_DIRS for part in relative_parts)
