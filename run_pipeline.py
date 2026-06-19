"""Shim: prefer `python -m bus_fare_cap` or the `bus-fare-cap-build` script."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from bus_fare_cap.cli import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
