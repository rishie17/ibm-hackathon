from pathlib import Path

from app.models.schemas import DependencyEdge, FileNode, RepositoryAnalysis, SupportedLanguage
from app.parsers.import_extractor import extract_js_ts_imports, extract_python_imports

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
}


class RepositoryParser:
    """Traverses source files and extracts initial module intelligence."""

    def parse(self, repository_path: str) -> RepositoryAnalysis:
        root = Path(repository_path).expanduser().resolve()
        if not root.exists():
            raise FileNotFoundError(f"Repository path does not exist: {root}")
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
        if language == "python":
            imports, functions = extract_python_imports(source)
        else:
            imports, functions = extract_js_ts_imports(source)

        relative_path = path.relative_to(root).as_posix()
        return FileNode(
            path=relative_path,
            language=language,
            size_bytes=path.stat().st_size,
            lines=source.count("\n") + 1 if source else 0,
            imports=imports,
            functions=functions,
        )

    def _resolve_dependencies(self, files: list[FileNode]) -> list[DependencyEdge]:
        module_index = {self._module_name(file.path): file.path for file in files}
        dependencies: list[DependencyEdge] = []

        for file in files:
            for imported in file.imports:
                target = self._match_import(imported, module_index)
                if target and target != file.path:
                    dependencies.append(DependencyEdge(source=file.path, target=target))

        return dependencies

    def _match_import(self, imported: str, module_index: dict[str, str]) -> str | None:
        normalized = imported.replace("/", ".").replace("\\", ".").strip(".")
        candidates = [normalized, normalized.split(".")[0], normalized.split(".")[-1]]
        for candidate in candidates:
            if candidate in module_index:
                return module_index[candidate]
        return None

    def _module_name(self, path: str) -> str:
        without_suffix = str(Path(path).with_suffix(""))
        return without_suffix.replace("/", ".").replace("\\", ".")

    def _is_ignored(self, path: Path, root: Path) -> bool:
        relative_parts = path.relative_to(root).parts
        return any(part in IGNORED_DIRS for part in relative_parts)

