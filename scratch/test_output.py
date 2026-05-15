import sajupy
import json

data = sajupy.calculate_saju(1995, 1, 1, 12, 0)
print(json.dumps(data, ensure_ascii=False, indent=2))
