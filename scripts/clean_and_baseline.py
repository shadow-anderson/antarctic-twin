"""
Clean raw AWS CSVs for Maitri and Bharati stations, then compute
month-hour baseline statistics (mean & stddev per variable per station).
"""

import json
import os
import pandas as pd
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW_DIR = os.path.join(ROOT, "data", "raw")
PROC_DIR = os.path.join(ROOT, "data", "processed")
BASELINE_PATH = os.path.join(ROOT, "data", "baseline_stats.json")

VARIABLES = ["tempr", "ap", "ws", "wd", "rh"]


def load_and_clean(filepath: str, station: str) -> pd.DataFrame:
    """Load a raw CSV, replace -999 sentinels with NaN, add station tag."""
    df = pd.read_csv(filepath, parse_dates=["obstime"])

    # Replace -999 across all numeric columns (Maitri uses it for wd, rh;
    # safe to apply universally — real values are never -999).
    for col in VARIABLES:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df.loc[df[col] == -999, col] = np.nan

    df["station"] = station

    # Sort chronologically and reset index
    df = df.sort_values("obstime").reset_index(drop=True)
    return df


def compute_baseline(df: pd.DataFrame) -> dict:
    """Return {variable: { "month_hour": {"mean": ..., "std": ...} } }."""
    df = df.copy()
    df["month"] = df["obstime"].dt.month
    df["hour"] = df["obstime"].dt.hour

    stats: dict = {}
    for var in VARIABLES:
        grouped = df.groupby(["month", "hour"])[var]
        mean = grouped.mean()
        std = grouped.std()

        var_stats: dict = {}
        for (month, hour), m in mean.items():
            key = f"{month:02d}_{hour:02d}"
            s = std.loc[(month, hour)]
            var_stats[key] = {
                "mean": round(m, 4) if pd.notna(m) else None,
                "std": round(s, 4) if pd.notna(s) else None,
            }
        stats[var] = var_stats
    return stats


def main():
    os.makedirs(PROC_DIR, exist_ok=True)

    # --- Maitri ---
    maitri_raw = os.path.join(RAW_DIR, "maitri_aws_imd.csv")
    maitri = load_and_clean(maitri_raw, station="maitri")
    maitri_out = os.path.join(PROC_DIR, "maitri_clean.csv")
    maitri.to_csv(maitri_out, index=False)
    print(f"[OK] Wrote {maitri_out}  ({len(maitri):,} rows, "
          f"{maitri.isna().sum().sum():,} null cells)")

    # --- Bharati ---
    bharati_raw = os.path.join(RAW_DIR, "bharati_aws_iig.csv")
    bharati = load_and_clean(bharati_raw, station="bharati")
    bharati_out = os.path.join(PROC_DIR, "bharati_clean.csv")
    bharati.to_csv(bharati_out, index=False)
    print(f"[OK] Wrote {bharati_out}  ({len(bharati):,} rows, "
          f"{bharati.isna().sum().sum():,} null cells)")

    # --- Baseline stats ---
    baseline = {}
    baseline["maitri"] = compute_baseline(maitri)
    baseline["bharati"] = compute_baseline(bharati)

    with open(BASELINE_PATH, "w") as f:
        json.dump(baseline, f, indent=2)
    print(f"[OK] Wrote {BASELINE_PATH}")


if __name__ == "__main__":
    main()
