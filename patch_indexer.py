import re

with open("backend/controllers/indexer.py", "r") as f:
    content = f.read()

# Replace [:6] with [:4]...[-4:]
content = re.sub(r'\{([A-Za-z0-9_]+)\[:6\]\}\.\.\.', r'{\1[:4]}...{\1[-4:]}', content)

with open("backend/controllers/indexer.py", "w") as f:
    f.write(content)
