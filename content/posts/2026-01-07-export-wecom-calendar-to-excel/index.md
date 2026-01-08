---
title: 企微日程导出到 Excel
author: 吴诗涛
date: '2026-01-07'
slug: export-wecom-calendar-to-excel
---

现在年度总结流行得很，老板也想看看去年的日程总结。那么问题来了：如何把企微日程给导出来？

找到还算快捷的方法：

1. 将企微日程同步到 MacOS 日历，会把企微所有的日程同步过来，方法参考[企微帮助文档](https://open.work.weixin.qq.com/help2/pc/20223)。小弟说他试了导出到手机，没法同步以前的日程，具体没有测试。
2. MacOS 日历 -> 文件 -> 导出，默认导出为 `ics` 格式，是一种日历交换文件格式。
3. 用 Python 把 `ics` 转为 `Excel`，方便起间，我还添加了一列展示星期。

代码是亲爱的 Codex 写的，保存为 `convert_ics_to_excel.py`，执行下 `python convert_ics_to_excel.py xxx日程.ics` 就转成 Excel 了：

<details>
  <summary>查看 convert_ics_to_excel.py</summary>
  
```python
#!/usr/bin/env python3
import argparse
import os
import re
from datetime import datetime, timedelta

import pandas as pd


def unfold_lines(raw_text):
    lines = raw_text.splitlines()
    unfolded = []
    current = None
    for line in lines:
        if line.startswith(" ") or line.startswith("\t"):
            if current is None:
                current = line.lstrip()
            else:
                current += line[1:]
        else:
            if current is not None:
                unfolded.append(current)
            current = line
    if current is not None:
        unfolded.append(current)
    return unfolded


def parse_duration(value):
    # Supports basic RFC5545 duration like PnDTnHnMnS or PTnHnM
    match = re.fullmatch(r"P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?", value)
    if not match:
        return None
    days = int(match.group(1) or 0)
    hours = int(match.group(2) or 0)
    minutes = int(match.group(3) or 0)
    seconds = int(match.group(4) or 0)
    return timedelta(days=days, hours=hours, minutes=minutes, seconds=seconds)


def parse_dt(value, params):
    tz = params.get("TZID", "")
    if value.endswith("Z"):
        tz = "UTC"
        value = value[:-1]
    is_date = len(value) == 8 and value.isdigit()
    if is_date:
        dt = datetime.strptime(value, "%Y%m%d").date()
        return dt, tz, True
    fmt = "%Y%m%dT%H%M%S" if len(value) == 15 else "%Y%m%dT%H%M"
    dt = datetime.strptime(value, fmt)
    return dt, tz, False


def merge_value(existing, new_value):
    if existing is None:
        return new_value
    if isinstance(existing, list):
        existing.append(new_value)
        return existing
    return [existing, new_value]


def parse_ics(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        unfolded = unfold_lines(f.read())

    events = []
    current = None

    for line in unfolded:
        if line == "BEGIN:VEVENT":
            current = {}
            continue
        if line == "END:VEVENT":
            if current is not None:
                events.append(current)
            current = None
            continue
        if current is None:
            continue
        if ":" not in line:
            continue

        left, value = line.split(":", 1)
        parts = left.split(";")
        name = parts[0].upper()
        params = {}
        for part in parts[1:]:
            if "=" in part:
                k, v = part.split("=", 1)
                params[k.upper()] = v.strip("\"")

        if name in {"DTSTART", "DTEND", "CREATED", "LAST-MODIFIED", "DTSTAMP"}:
            dt_value, tz, is_all_day = parse_dt(value, params)
            current[name] = merge_value(current.get(name), dt_value)
            if tz:
                current[f"{name}_TZ"] = merge_value(current.get(f"{name}_TZ"), tz)
            if name in {"DTSTART", "DTEND"}:
                current["ALL_DAY"] = current.get("ALL_DAY", False) or is_all_day
        else:
            current[name] = merge_value(current.get(name), value)

    # Normalize and handle duration
    normalized = []
    for event in events:
        row = {}
        for key, value in event.items():
            if isinstance(value, list):
                row[key] = " | ".join(str(v) for v in value)
            else:
                row[key] = value

        if "DTEND" not in row and "DURATION" in row and "DTSTART" in row:
            duration = parse_duration(row["DURATION"])
            if duration:
                dtstart = row["DTSTART"]
                if isinstance(dtstart, datetime):
                    row["DTEND"] = dtstart + duration
                else:
                    row["DTEND"] = dtstart + duration
        normalized.append(row)

    return normalized


def write_excel(events, output_path):
    df = pd.DataFrame(events)
    if "DTSTART" in df.columns:
        dt_series = pd.to_datetime(df["DTSTART"], errors="coerce")
        weekday_map = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        df["星期"] = dt_series.dt.weekday.map(lambda x: weekday_map[x] if pd.notna(x) else "")
    preferred = [
        "SUMMARY",
        "DTSTART",
        "星期",
        "DTEND",
        "ALL_DAY",
        "DTSTART_TZ",
        "DTEND_TZ",
        "LOCATION",
        "DESCRIPTION",
        "ORGANIZER",
        "ATTENDEE",
        "UID",
        "CREATED",
        "LAST-MODIFIED",
        "DTSTAMP",
    ]
    columns = []
    for col in preferred:
        if col in df.columns:
            columns.append(col)
    for col in df.columns:
        if col not in columns:
            columns.append(col)
    df = df.reindex(columns=columns)
    df.to_excel(output_path, index=False)


def main():
    parser = argparse.ArgumentParser(description="Convert .ics files to Excel.")
    parser.add_argument("ics_files", nargs="+", help="One or more .ics files")
    args = parser.parse_args()

    for ics_path in args.ics_files:
        events = parse_ics(ics_path)
        base, _ = os.path.splitext(ics_path)
        output_path = base + ".xlsx"
        write_excel(events, output_path)
        print(f"Wrote: {output_path}")


if __name__ == "__main__":
    main()
```

</details>





