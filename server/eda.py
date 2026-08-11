import polars as pl

# 1. 데이터 로드 및 결합
df1 = pl.read_csv('data/서울특별시 공공자전거 이용정보(월별)_24.1-6.csv', encoding='cp949')
df2 = pl.read_csv('data/서울특별시 공공자전거 이용정보(월별)_24.7-12.csv', encoding='cp949')

df_combined = pl.concat([df1, df2])

# 2. CSV로 저장
df_combined.write_csv('combined_2024_bike_data.csv')

print(f"합쳐진 데이터 총 행 수: {df_combined.height:,}개")

# Pandas에서 Parquet로 저장
df_combined.to_parquet('combined_2024_bike_data.parquet', index=False)