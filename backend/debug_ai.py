import sys
import os
import pathlib

# Add backend to sys.path
current_dir = pathlib.Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

from app.scripts import ai

print("Testing break_down_question...")
try:
    res = ai.break_down_question("How do I write a grant?")
    print("Success:", res)
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
