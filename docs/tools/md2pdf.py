#!/usr/bin/env python
"""Convert a Markdown file to a styled standalone HTML and then to PDF via headless Chrome.

Usage: python md2pdf.py <input.md> <output_basename_without_ext> "<Doc Title>" "<Subtitle>"
Writes <output_basename>.html and <output_basename>.pdf
"""
import sys, subprocess, pathlib, time, html as _html
from datetime import date
import markdown

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

CSS = r"""
:root{
  --ink:#1a1a22; --muted:#5b5b6b; --line:#e4e4ec; --soft:#f6f6fa;
  --accent:#6d5cf6; --accent-2:#8b7cf8; --code-bg:#f4f4f8; --ok:#17885c; --warn:#b4452c;
}
*{box-sizing:border-box;}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{
  font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink); line-height:1.62; font-size:11pt; margin:0;
  overflow-wrap:anywhere;
}
.cover{
  padding:46px 54px 40px; border-bottom:3px solid var(--accent);
  background:linear-gradient(135deg,#f7f6ff 0%,#eef0ff 100%);
}
.cover .kicker{font-size:10pt;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700;margin:0 0 10px;}
.cover h1{font-size:25pt;line-height:1.15;margin:0 0 10px;font-weight:800;letter-spacing:-.01em;}
.cover .sub{font-size:12pt;color:var(--muted);margin:0;max-width:52em;}
.cover .meta{margin-top:18px;font-size:9.5pt;color:var(--muted);}
.wrap{padding:30px 54px 60px;}
h1,h2,h3,h4{line-height:1.25;font-weight:700;}
.wrap h1{font-size:19pt;margin:30px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--line);}
.wrap h2{font-size:15pt;margin:26px 0 8px;color:#2a2a38;}
.wrap h3{font-size:12.5pt;margin:20px 0 6px;color:#33333f;}
.wrap h4{font-size:11pt;margin:16px 0 4px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;}
p{margin:8px 0;}
a{color:var(--accent);text-decoration:none;overflow-wrap:anywhere;}
ul,ol{margin:8px 0 8px 2px;padding-left:22px;}
li{margin:3px 0;}
code{font-family:"SF Mono",Consolas,"Liberation Mono",Menlo,monospace;font-size:9.5pt;background:var(--code-bg);padding:1.5px 5px;border-radius:4px;color:#4a3bd6;overflow-wrap:anywhere;word-break:break-word;}
pre{background:#1d1d27;color:#e8e8f2;padding:14px 16px;border-radius:8px;overflow-x:auto;font-size:9pt;line-height:1.5;border:1px solid #2a2a38;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;}
pre code{background:none;color:inherit;padding:0;font-size:9pt;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;}
blockquote{margin:12px 0;padding:8px 16px;border-left:4px solid var(--accent-2);background:var(--soft);color:#3a3a48;border-radius:0 6px 6px 0;}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:9.5pt;}
th,td{border:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top;overflow-wrap:break-word;}
th{background:#f0f0f7;font-weight:700;color:#2a2a38;}
tr:nth-child(even) td{background:#fafafd;}
hr{border:none;border-top:1px solid var(--line);margin:22px 0;}
img{max-width:100%;border:1px solid var(--line);border-radius:8px;margin:10px 0;}
.codehilite{background:#1d1d27;border-radius:8px;}
.codehilite pre{border:none;margin:0;}
h1,h2,h3,h4{break-after:avoid;}
pre,table,blockquote,img{break-inside:avoid;}
@page{size:A4;margin:14mm 0;}
@media print{.cover{break-after:avoid;}}
"""

def main():
    src = pathlib.Path(sys.argv[1]).resolve()
    out = pathlib.Path(sys.argv[2]).resolve()
    title = sys.argv[3] if len(sys.argv) > 3 else src.stem
    subtitle = sys.argv[4] if len(sys.argv) > 4 else ""

    text = src.read_text(encoding="utf-8")
    # Drop a leading H1 if it duplicates the cover title (first non-empty line starting with "# ")
    lines = text.split("\n")
    for i, ln in enumerate(lines):
        if ln.strip() == "":
            continue
        if ln.lstrip().startswith("# "):
            lines = lines[:i] + lines[i+1:]
        break
    text = "\n".join(lines)

    body = markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "codehilite", "toc", "sane_lists", "attr_list"],
        extension_configs={"codehilite": {"guess_lang": False, "noclasses": False}},
    )

    doc = f"""<!doctype html><html><head><meta charset="utf-8">
<title>{_html.escape(title)}</title>
<style>{CSS}
.codehilite .hll{{background:#2a2a38}} .codehilite .k{{color:#c792ea}} .codehilite .s,.codehilite .s1,.codehilite .s2{{color:#c3e88d}} .codehilite .c,.codehilite .c1{{color:#7a7a90;font-style:italic}} .codehilite .nf,.codehilite .nb{{color:#82aaff}} .codehilite .mi,.codehilite .mf{{color:#f78c6c}} .codehilite .o{{color:#89ddff}}
</style></head>
<body>
<div class="cover">
  <p class="kicker">Arc UI &middot; uiarc.dev &middot; Proof of Concept</p>
  <h1>{_html.escape(title)}</h1>
  <p class="sub">{_html.escape(subtitle)}</p>
  <p class="meta">Generated {date.today().isoformat()}</p>
</div>
<div class="wrap">
{body}
</div>
</body></html>"""

    html_path = out.with_suffix(".html")
    pdf_path = out.with_suffix(".pdf")
    html_path.write_text(doc, encoding="utf-8")

    subprocess.run([
        CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}", html_path.as_uri(),
    ], check=True, timeout=120)

    # Chrome can return before the PDF is flushed to disk; poll briefly instead
    # of trusting the exit status.
    size = None
    for _ in range(20):
        if pdf_path.exists():
            size = pdf_path.stat().st_size
            break
        time.sleep(0.25)
    if size is None:
        raise SystemExit(f"PDF did not appear at {pdf_path}")
    print(f"OK  {pdf_path}  ({size} bytes)")

if __name__ == "__main__":
    main()
