"""Command-line entry point for the bus fare reform pipeline."""

from __future__ import annotations

import argparse

from .pipeline import run


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="bus-fare-cap-build",
        description="Generate dashboard-ready bus fare reform results (£1 cap, free under-25s).",
    )
    parser.add_argument("--year", type=int, default=2027, help="Tax year to cost in.")
    return parser


def main(argv: list[str] | None = None) -> int:
    run(build_parser().parse_args(argv))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
