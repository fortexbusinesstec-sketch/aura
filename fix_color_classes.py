import re
import os

color_map = {
    r'#1a1b26': 'background',
    r'#a9b1d6': 'foreground',
    r'#7dcfff': 'accent',
    r'#bb9af7': 'secondary',
    r'#1f2335': 'card',
    r'#414868': 'border',
    r'#565f89': 'muted',
    r'#ff9e64': 'warning',
    r'#f7768e': 'danger',
    r'#24283b': 'border',
}

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    for hex_val, tw_var in color_map.items():
        pattern = r'(bg|text|border|from|to|via|ring|shadow|stroke|fill)-\[' + hex_val + r'\](?:/(\d+))?'
        def repl(m):
            prefix = m.group(1)
            opacity = m.group(2)
            res = f"{prefix}-{tw_var}"
            if opacity:
                # keep opacity
                res += f"/{opacity}"
            return res
            
        content = re.sub(pattern, repl, content, flags=re.IGNORECASE)
        
    if original != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

for root, _, files in os.walk('/home/fabrizio/Escritorio/AuraEnv/src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
