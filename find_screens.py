import os

with open('App.tsx', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'Screen' in line or 'screen' in line or '第' in line:
            if 'import' not in line:
                print(f"Line {i}: {line.strip()[:100]}")
