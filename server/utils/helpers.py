import math
import holidays
from datetime import datetime, timedelta

kr_holidays = holidays.KR()

def get_special_day_features(date_str: str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    dt_date = dt.date()
    
    is_public_holiday = 1 if dt_date in kr_holidays else 0
    
    h_name = str(kr_holidays.get(dt_date, ""))
    is_major_holiday = 1 if any(m in h_name for m in ["Lunar New Year", "Chuseok", "설날", "추석"]) else 0
    
    is_weekday = 1 if (dt.weekday() < 5 and is_public_holiday == 0) else 0
    next_dt = dt + timedelta(days=1)
    next_is_weekend = 1 if next_dt.weekday() >= 5 else 0
    next_is_pub = 1 if next_dt.date() in kr_holidays else 0
    
    is_day_before_holiday = 1 if (is_weekday and (next_is_weekend or next_is_pub)) else 0
    
    return is_public_holiday, is_major_holiday, is_day_before_holiday

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def format_distance(dist_km: float) -> str:
    if dist_km < 1.0:
        return f"{int(dist_km * 1000)}m"
    return f"{dist_km:.1f}km"

def get_station_status(available: int) -> str:
    if available == 0:
        return "EMPTY"
    elif available <= 3:
        return "LOW"
    return "GOOD"