import re
with open("backend/controllers/activity.py", "r") as f:
    content = f.read()

content = content.replace('[:6] + "..."', '[:4] + "..." + (addr[-4:] if "addr" in locals() or "other_address" in locals() else "")')
content = content.replace('other_address[:6] + "..."', 'f"{other_address[:4]}...{other_address[-4:]}"')
content = content.replace('addr[:6] + "..."', 'f"{addr[:4]}...{addr[-4:]}"')
content = content.replace('act.get("to_address", "Unknown")[:6] + "..."', 'act.get("to_address", "Unknown")[:4] + "..." + act.get("to_address", "Unknown")[-4:]')

with open("backend/controllers/activity.py", "w") as f:
    f.write(content)
