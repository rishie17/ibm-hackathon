import re

def extract_verilog_architecture(source: str) -> dict:
    # Remove comments to avoid false positives
    source_no_comments = re.sub(r'//.*', '', source)
    source_no_comments = re.sub(r'/\*.*?\*/', '', source_no_comments, flags=re.DOTALL)
    
    module_defs = set()
    instantiations = set()
    imports = set()
    
    # Module definitions
    for m in re.finditer(r"\bmodule\s+([A-Za-z_][\w]*)\b", source_no_comments):
        module_defs.add(m.group(1))
        
    # Instantiations heuristic
    keywords = {
        "module", "always", "always_ff", "always_comb", "always_latch", "initial", 
        "if", "else", "for", "while", "case", "function", "task", "wire", "reg", 
        "logic", "assign", "parameter", "localparam", "input", "output", "inout",
        "endmodule", "end", "endcase", "endfunction", "endtask", "begin", "generate",
        "endgenerate", "genvar", "integer", "string", "real", "time", "typedef", "struct", "enum"
    }
    
    inst_pattern = r"\b([A-Za-z_][\w]*)\s*(?:#\s*\([^)]*\)\s*)?([A-Za-z_][\w]*)\s*\("
    for m in re.finditer(inst_pattern, source_no_comments):
        type_name = m.group(1)
        if type_name not in keywords:
            instantiations.add(type_name)
            
    # Includes
    for m in re.finditer(r"`include\s+[\"']([^\"']+)[\"']", source_no_comments):
        imports.add(m.group(1))

    return {
        "module_defs": sorted(module_defs),
        "instantiations": sorted(instantiations),
        "imports": sorted(imports)
    }
