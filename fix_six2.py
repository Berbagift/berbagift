import re
with open("backend/controllers/activity.py", "r") as f:
    content = f.read()

# Replace any [:6] + "..." with the new format if it exists, otherwise use regex
content = re.sub(r'(\w+)\[:6\] \+ "\.\.\."', r'f"{\1[:4]}...{\1[-4:]}"', content)
content = re.sub(r'(\w+)\.get\("to_address", "Unknown"\)\[:6\] \+ "\.\.\."', r'f"{\1.get(\"to_address\", \"Unknown\")[:4]}...{\1.get(\"to_address\", \"Unknown\")[-4:]}"', content)

with open("backend/controllers/activity.py", "w") as f:
    f.write(content)

with open("backend/controllers/indexer.py", "r") as f:
    idx = f.read()
idx = re.sub(r'\{caller\[:6\]\}\.\.\.', r'{caller[:4]}...{caller[-4:]}', idx)
idx = re.sub(r'\{recipient_addr\[:6\]\}\.\.\.', r'{recipient_addr[:4]}...{recipient_addr[-4:]}', idx)
idx = re.sub(r'\{sender_addr\[:6\]\}\.\.\.', r'{sender_addr[:4]}...{sender_addr[-4:]}', idx)
idx = re.sub(r'\{token_address\[:6\]\}\.\.\.', r'{token_address[:4]}...{token_address[-4:]}', idx)
with open("backend/controllers/indexer.py", "w") as f:
    f.write(idx)
