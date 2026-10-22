#!/usr/bin/env python3
"""Font-crafting half of scripts/build-iosevka-fonts.ts.

The TypeScript script owns the Iosevka clone, the build plan, the build and the
file placement; everything that needs a font parser lives here, because the repo
deliberately has no Node font library (see scripts/check-font-references.ts).

Run through uv so nothing is installed into the repo:

    uv run --with fonttools==4.67.0 --with brotli==1.2.0 python scripts/iosevka-fonts.py ...

Subcommands
    clear-version <font> <version>
        Reduce nameID 5 to "Version <version>". The hinted builds write
        "Version 28.0.4; ttfautohint (v1.8.4)", which is a false claim once the
        hinting is gone. No-op when the record is already clean.

    head-epoch <font> [<mac-epoch-seconds>]
        Print head.created/modified, or exit 1 unless both equal the pinned
        epoch. Iosevka stamps them from SOURCE_DATE_EPOCH or its own default, so
        a build cached before the epoch was pinned cannot be reused: every build
        of the same sources would otherwise produce different bytes.

    compare <a> <b>
        Content equivalence between two font files (woff2 or ttf), used by
        --check when a rebuild cannot be byte-identical. Compares cmap, every
        glyph outline and advance, and every table a shaper or rasteriser reads;
        tolerates only differences that cannot change rendering: glyf coordinate
        encoding, the inert maxp hint counters, and head timestamps/flags/
        checksum. Exits 2 on a real difference.
"""

import sys

from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

# Tables whose compiled bytes must match exactly: character map, metrics, names
# and the whole OpenType layout the ligatures live in.
BYTE_EQUAL_TABLES = ("GDEF", "GPOS", "GSUB", "cmap", "hhea", "hmtx", "name", "OS/2", "post")

# Glyph-shape counters; the rest of maxp is hinting bookkeeping that a de-hinted
# font leaves stale.
MAXP_SHAPE_FIELDS = (
    "numGlyphs",
    "maxPoints",
    "maxContours",
    "maxCompositePoints",
    "maxCompositeContours",
    "maxComponentElements",
    "maxComponentDepth",
)

HEAD_FIELDS = (
    "unitsPerEm",
    "macStyle",
    "xMin",
    "yMin",
    "xMax",
    "yMax",
    "fontRevision",
    "lowestRecPPEM",
    "indexToLocFormat",
)


def clear_version(path: str, version: str) -> int:
    # fontTools' "version" here is the bare Iosevka version; the name record reads
    # "Version 28.0.4", optionally followed by the processor that hinted it.
    expected = f"Version {version}"
    font = TTFont(path)
    name = font["name"]
    changed = False
    for record in list(name.names):
        if record.nameID != 5:
            continue
        text = record.toUnicode()
        if text.strip() == expected:
            continue
        name.setName(expected, 5, record.platformID, record.platEncID, record.langID)
        print(f"{path}: nameID 5 {text!r} -> {expected!r}")
        changed = True
    if changed:
        font.save(path)
    else:
        print(f"{path}: version record already clean")
    return 0


def head_epoch(path: str, expected: str | None) -> int:
    font = TTFont(path)
    created, modified = font["head"].created, font["head"].modified
    if expected is None:
        print(f"{path}: created {created} modified {modified}")
        return 0
    if created == int(expected) and modified == int(expected):
        return 0
    # Patching the file afterwards would change its table layout, and with it the
    # subset bytes; the only deterministic fix is a rebuild from the pinned env.
    print(
        f"{path}: head timestamps {created}/{modified}, expected {expected}",
        file=sys.stderr,
    )
    return 1


def outline(font: TTFont, glyph_name: str) -> list:
    glyph_set = font.getGlyphSet()
    pen = DecomposingRecordingPen(glyph_set)
    glyph_set[glyph_name].draw(pen)
    points = []
    for operator, arguments in pen.value:
        points.append(operator)
        for point in arguments:
            if hasattr(point, "x"):
                points.append((round(point.x, 6), round(point.y, 6)))
            elif isinstance(point, tuple):
                points.append(tuple(round(value, 6) for value in point))
    return points


def compare(a_path: str, b_path: str) -> int:
    a = TTFont(a_path)
    b = TTFont(b_path)
    problems: list[str] = []
    tolerated: list[str] = []

    def report(ok: bool, label: str, detail: str = "") -> None:
        print(f"  {'ok  ' if ok else 'FAIL'} {label}{(' — ' + detail) if detail else ''}")
        if not ok:
            problems.append(label if not detail else f"{label}: {detail}")

    print(f"comparing\n  a = {a_path}\n  b = {b_path}")

    for tag in BYTE_EQUAL_TABLES:
        if tag not in a or tag not in b:
            report(False, f"table {tag}", "absent in one file")
            continue
        same = a[tag].compile(a) == b[tag].compile(b)
        report(same, f"table {tag}", "" if same else "compiled bytes differ")

    order_a = a.getGlyphOrder()
    order_b = b.getGlyphOrder()
    if order_a != order_b:
        problems.append("glyph order differs")
        report(False, "glyph order", f"{len(order_a)} vs {len(order_b)} glyphs")
    else:
        report(True, "glyph order", f"{len(order_a)} glyphs")

    a_cmap, b_cmap = a.getBestCmap(), b.getBestCmap()
    same_cmap = a_cmap == b_cmap
    report(same_cmap, "cmap mapping", f"{len(a_cmap)} vs {len(b_cmap)} codepoints")
    if not same_cmap:
        missing = sorted(set(a_cmap) - set(b_cmap))
        extra = sorted(set(b_cmap) - set(a_cmap))
        if missing:
            print(f"       missing codepoints: {[f'U+{cp:04X}' for cp in missing[:10]]}")
        if extra:
            print(f"       extra codepoints: {[f'U+{cp:04X}' for cp in extra[:10]]}")

    differing = []
    if order_a == order_b:
        hmtx_a, hmtx_b = a["hmtx"], b["hmtx"]
        for glyph_name in order_a:
            if outline(a, glyph_name) != outline(b, glyph_name):
                differing.append(f"{glyph_name} (outline)")
            elif hmtx_a[glyph_name] != hmtx_b[glyph_name]:
                differing.append(f"{glyph_name} (advance)")
    report(not differing, "glyph outlines + advances", "; ".join(differing[:8]))

    for field in MAXP_SHAPE_FIELDS:
        value_a, value_b = getattr(a["maxp"], field, None), getattr(b["maxp"], field, None)
        report(value_a == value_b, f"maxp.{field}", f"{value_a} vs {value_b}")
    hint_fields = [f for f in ("maxZones", "maxTwilightPoints", "maxStorage", "maxFunctionDefs",
                              "maxStackElements") if getattr(a["maxp"], f, 0) != getattr(b["maxp"], f, 0)]
    if hint_fields:
        tolerated.append(f"maxp hint counters differ ({', '.join(hint_fields)})")

    for field in HEAD_FIELDS:
        value_a, value_b = getattr(a["head"], field), getattr(b["head"], field)
        report(value_a == value_b, f"head.{field}", f"{value_a} vs {value_b}")
    head_meta = [f for f in ("flags", "created", "modified", "checkSumAdjustment")
                 if getattr(a["head"], f) != getattr(b["head"], f)]
    if head_meta:
        tolerated.append(f"head write-time fields differ ({', '.join(head_meta)})")

    glyf_a, glyf_b = a["glyf"], b["glyf"]
    if order_a == order_b:
        encoded = [n for n in order_a if glyf_a[n].compile(glyf_a) != glyf_b[n].compile(glyf_b)]
        if encoded:
            tolerated.append(f"glyf bytes differ for {len(encoded)} glyphs (coordinate encoding)")

    for note in tolerated:
        print(f"  note {note}")

    if problems:
        print(f"RESULT different ({len(problems)} problem(s))")
        return 2
    print("RESULT content-equivalent")
    return 0


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 64
    command, arguments = argv[1], argv[2:]
    if command == "clear-version" and len(arguments) == 2:
        return clear_version(arguments[0], arguments[1])
    if command == "head-epoch" and len(arguments) in (1, 2):
        return head_epoch(arguments[0], arguments[1] if len(arguments) == 2 else None)
    if command == "compare" and len(arguments) == 2:
        return compare(arguments[0], arguments[1])
    print(__doc__)
    return 64


if __name__ == "__main__":
    sys.exit(main(sys.argv))
