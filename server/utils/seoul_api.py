import os
import httpx
import asyncio

SEOUL_API_KEY = os.getenv("SEOUL_API_KEY", "seoul-api-key-default")
BASE_URL = f"http://openapi.seoul.go.kr:8088/{SEOUL_API_KEY}/json/bikeList"

async def fetch_bike_range(client: httpx.AsyncClient, start: int, end: int) -> list:
    url = f"{BASE_URL}/{start}/{end}/"
    try:
        response = await client.get(url, timeout=5.0)
        res_data = response.json()
        return res_data.get("rentBikeStatus", {}).get("row", [])
    except Exception as e:
        print(f"API 호출 오류 ({start}~{end}): {e}")
        return []

async def fetch_all_bike_stations(client: httpx.AsyncClient) -> list:
    ranges = [(1, 1000), (1001, 2000), (2001, 3000)]
    tasks = [fetch_bike_range(client, s, e) for s, e in ranges]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    stations = []
    for res in results:
        if isinstance(res, list):
            stations.extend(res)
    return stations