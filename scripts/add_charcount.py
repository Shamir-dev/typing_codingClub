"""
Adds/updates the charCount field on every lesson in a batch file.
Run this on any new batch BEFORE merging it into lessons.json.

Usage:
  python3 add_charcount.py batch.json
Overwrites the same file in place with charCount added.
"""
import json
import sys

path = sys.argv[1]
with open(path) as f:
    lessons = json.load(f)

for lesson in lessons:
    lesson["charCount"] = len(lesson["code"])

with open(path, "w") as f:
    json.dump(lessons, f, indent=2)

print(f"Updated {len(lessons)} lessons in {path}")
for l in lessons:
    print(f"  {l['id']}: {l['charCount']} chars")



# lopment\custonCodingSite_for_dsa\typing-club4> python scripts/add_charcount.py src/content/python/lessons.json
# Updated 35 lessons in src/content/python/lessons.json
#   py-easy-001: 39 chars
#   py-easy-002: 263 chars
#   py-easy-003: 193 chars
#   py-easy-004: 134 chars