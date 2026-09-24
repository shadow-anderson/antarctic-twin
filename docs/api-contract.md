# API Contract — Antarctic Digital Twin

Base URL: 

## GET /stations
Returns list of stations.
Response:
[
  {
    "id": "maitri" | "bharati",
    "name": "Maitri",
    "lat": -70.75,
    "lon": 11.73,
    "capacity_summer": 25,
    "capacity_winter": 25
  }
]

## GET /stations/{id}/current
Response:
{
  "station_id": "maitri",
  "timestamp": "2026-09-26T00:00:00Z",
  "weather": {
    "temperature_c": { "value": -18.2, "source": "real" },
    "wind_speed_ms": { "value": 6.1, "source": "real" },
    "pressure_hpa": { "value": 981.2, "source": "real" }
  },
  "energy": {
    "generation_kw": { "value": 142, "source": "simulated" },
    "consumption_kw": { "value": 119, "source": "simulated" },
    "diesel_pct": { "value": 61, "source": "simulated" }
  },
  "logistics": {
    "food_days_remaining": { "value": 68, "source": "simulated" },
    "diesel_days_remaining": { "value": 42, "source": "simulated" }
  }
}

## GET /stations/{id}/history?variable=temperature&range=...
Response: [{ "timestamp": "...", "value": ... }]

## GET /stations/{id}/anomalies
Response: [{ "variable": "wind_speed", "value": 22.4, "baseline_mean": 6.1, "baseline_stddev": 2.3, "severity": "high" }]

## POST /stations/{id}/simulate
Request: { "trigger": "generator_failure" | "blizzard" | "resupply_delay" }
Response:
{
  "timeline": [{ "day": 3, "event": "diesel below 15% threshold" }],
  "recommendations": ["Shed non-critical load on Lab B", "Activate Generator 2"]
}

## GET /link/status
Response: { "connected": true, "last_synced": "2026-09-26T00:00:00Z" }

## POST /link/toggle
Response: { "connected": false }