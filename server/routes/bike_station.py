import httpx
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request

from core import ml_loader
from utils.helpers import calculate_distance, format_distance, get_station_status
from utils.seoul_api import fetch_all_bike_stations

router = APIRouter(prefix="/api", tags=["Bike Stations"])

@router.get("/top-stations")
def get_top_stations():
    return {"data": ml_loader.top_stations_data}

@router.get("/stations_info")
def get_stations_info():
    station_names = {k: v['대여소명'] for k, v in ml_loader.STATION_METADATA.items()}
    return {"stations": station_names}

@router.get("/stations/{station_id}")
def get_station_info(station_id: int, dayofweek: int = 0, hour: int = 12):
    station = ml_loader.STATION_METADATA.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="존재하지 않는 대여소입니다.")

    key = f"{dayofweek}_{hour}"
    rolling_avg = station["station_hour_mean"].get(key, 0.0)

    return {
        "station_id": station_id,
        "district": station["자치구"],
        "rack_count": station["거치대수"],
        "rolling_7d_same_hour_avg": rolling_avg,
    }

@router.get("/bike/seoul/stations")
async def get_nearby_stations(request: Request):
    params = dict(request.query_params)
    lat = float(params.get("lat", 37.4979))
    lng = float(params.get("lng", 127.0276))
    limit = int(params.get("limit", 6))

    async with httpx.AsyncClient() as client:
        raw_stations = await fetch_all_bike_stations(client)


    parsed_stations = []
    for item in raw_stations:
        if not item.get("stationLatitude") or not item.get("stationLongitude"):
            continue

        dist_km = calculate_distance(lat, lng, float(item["stationLatitude"]), float(item["stationLongitude"]))
        available = int(item["parkingBikeTotCnt"])
        
        raw_name = item["stationName"]
        clean_name = raw_name.split(".", 1)[-1].strip() if "." in raw_name else raw_name

        parsed_stations.append({
            "id": item["stationId"],
            "name": clean_name,
            "distance": format_distance(dist_km),
            "available": available,
            "total": int(item["rackTotCnt"]),
            "status": get_station_status(available),
            "_sort_dist": dist_km,
        })

    parsed_stations.sort(key=lambda x: x["_sort_dist"])
    result_stations = [{k: v for k, v in st.items() if k != "_sort_dist"} for st in parsed_stations[:limit]]

    
    return {"stations": result_stations, "hourlyUsage": ml_loader.get_actual_hourly_usage()}


# 서울시 총 따릉이 운영 대수 (필요에 따라 최신 수치로 조정)
TOTAL_BIKES = 45000

@router.get("/bike/summary")
async def get_dashboard_summary():
    async with httpx.AsyncClient() as client:
        raw_stations = await fetch_all_bike_stations(client)

    operating_stations = len(raw_stations)
    
    # 1. 주차된 자전거의 총합 구하기
    total_available = sum(int(st.get("parkingBikeTotCnt", 0)) for st in raw_stations)
    
    # 2. 수정된 로직: (총 자전거 대수) - (현재 주차된 자전거 총합)
    currently_active = max(0, TOTAL_BIKES - total_available)

    # 3. 예측치 계산
    current_hour = datetime.now().hour
    
    # ml_loader 캐시 리스트 길이 체크 안전하게 처리
    if "hourly_ratio" in ml_loader.STAT_CACHE and len(ml_loader.STAT_CACHE["hourly_ratio"]) > current_hour:
        cum_ratio = ml_loader.STAT_CACHE["hourly_ratio"][current_hour]
    else:
        cum_ratio = 0.0

    estimated_today_total = round((currently_active * 3) / max(0.01, cum_ratio)) if cum_ratio > 0 else 0

    print(f"Total Available: {total_available}, Currently Active: {currently_active}")

    return {
        "operatingStations": operating_stations,
        "currentlyActive": currently_active,
        "avgUseTime": ml_loader.STAT_CACHE.get("avg_use_time", 0),
        "estimatedTodayTotal": estimated_today_total,
    }