import sys
import json
import io
import sajupy

# Set encoding to UTF-8 for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

def main():
    try:
        if len(sys.argv) < 6:
            print(json.dumps({"error": "Insufficient arguments. Usage: year month day hour minute"}))
            sys.exit(1)
            
        year = int(sys.argv[1])
        month = int(sys.argv[2])
        day = int(sys.argv[3])
        hour = int(sys.argv[4])
        minute = int(sys.argv[5])
        
        calendar_type = sys.argv[6] if len(sys.argv) > 6 else "solar"
        is_leap_month = sys.argv[7].lower() == "true" if len(sys.argv) > 7 else False
        
        # If lunar, convert to solar first
        if calendar_type == "lunar":
            solar_data = sajupy.lunar_to_solar(year, month, day, is_leap_month)
            year = solar_data['solar_year']
            month = solar_data['solar_month']
            day = solar_data['solar_day']

        saju_data = sajupy.calculate_saju(
            year=year,
            month=month,
            day=day,
            hour=hour,
            minute=minute
        )
        
        # Ensure ASCII is false to keep Korean/Chinese characters
        print(json.dumps(saju_data, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
