from pathlib import Path

ROOT_DIR = Path(".")
OUTPUT_FILE = "codebase_dump.txt"

# -------------------------------
# CONFIG (YOU CONTROL EVERYTHING)
# -------------------------------

EXCLUDE_FROM_TREE = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "code_dump.py",
}

EXCLUDE_FROM_CONTENT = {
    "node_modules",
    ".git",
    ".env",
    "package-lock.json",
    "code_dump.py",
    "pnpm-lock.yaml",
}

# -------------------------------
# TREE
# -------------------------------


def build_tree(root: Path):
    lines = []

    def _tree(dir_path: Path, prefix=""):
        entries = sorted(dir_path.iterdir(), key=lambda x: (
            x.is_file(), x.name.lower()))

        # Exclude anything listed
        entries = [e for e in entries if e.name not in EXCLUDE_FROM_TREE]

        for i, entry in enumerate(entries):
            connector = "└── " if i == len(entries) - 1 else "├── "
            lines.append(f"{prefix}{connector}{entry.name}")

            if entry.is_dir():
                extension = "    " if i == len(entries) - 1 else "│   "
                _tree(entry, prefix + extension)

    lines.append(str(root.resolve()))
    _tree(root)
    return "\n".join(lines)

# -------------------------------
# CONTENT
# -------------------------------


def is_in_excluded_path(path: Path, root: Path):
    """Skip file if it or any parent folder is excluded"""
    relative = path.relative_to(root)

    # check file itself
    if relative.name in EXCLUDE_FROM_CONTENT:
        return True

    # check parent folders
    for parent in relative.parents:
        if parent.name in EXCLUDE_FROM_CONTENT:
            return True

    return False


def dump_file_contents(root: Path):
    content_lines = []

    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue

        if is_in_excluded_path(path, root):
            continue

        try:
            relative_path = path.relative_to(root)

            content_lines.append(f"\n===== FILE: {relative_path} =====\n")

            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content_lines.append(f.read())

        except Exception as e:
            content_lines.append(f"\n===== {path} (ERROR: {str(e)}) =====\n")

    return "\n".join(content_lines)

# -------------------------------
# MAIN
# -------------------------------


def main():
    print("Generating directory tree...")
    tree = build_tree(ROOT_DIR)

    print("Dumping file contents...")
    contents = dump_file_contents(ROOT_DIR)

    print(f"Writing to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("=========== DIRECTORY STRUCTURE ===========\n\n")
        f.write(tree)
        f.write("\n\n=========== FILE CONTENTS ===========\n")
        f.write(contents)

    print("Done! codebase_dump.txt created.")


if __name__ == "__main__":
    main()
