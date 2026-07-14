with open("backend/controllers/activity.py", "r") as f:
    content = f.read()

content = content.replace('addr[:6] + "..."', 'f"{addr[:4]}...{addr[-4:]}"')
content = content.replace('other_address[:6] + "..."', 'f"{other_address[:4]}...{other_address[-4:]}"')
content = content.replace('act.get("to_address", "Unknown")[:6] + "..."', 'f"{act.get(\'to_address\', \'Unknown\')[:4]}...{act.get(\'to_address\', \'Unknown\')[-4:]}"')
content = content.replace('caller[:6]..."', 'caller[:4]}...{caller[-4:]}"')

with open("backend/controllers/activity.py", "w") as f:
    f.write(content)
