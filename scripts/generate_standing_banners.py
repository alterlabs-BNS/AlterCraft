from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter
from reportlab.lib.colors import CMYKColor, HexColor, white
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "output" / "assets"
OUTPUT_DIR = ROOT / "output" / "pdf"
LOGO_PATH = ROOT / "public" / "altercraft-logo-mark.png"

PAGE_W = 36 * inch
PAGE_H = 120 * inch


BANNERS = (
    {
        "slug": "modular-kitchen",
        "sequence": "01",
        "eyebrow": "CENTURY MATERIALS",
        "title": "MODULAR KITCHEN",
        "price": "INR 900",
        "unit": "/ SQ FT",
        "strapline": "A practical kitchen, measured for your home.",
        "features": ("Century materials", "Smart storage planning", "Professional installation"),
        "image": ASSET_DIR / "altercraft-standing-banner-kitchen-hero.png",
    },
    {
        "slug": "custom-wardrobe",
        "sequence": "02",
        "eyebrow": "MADE TO MEASURE",
        "title": "CUSTOM WARDROBE",
        "price": "INR 780",
        "unit": "/ SQ FT",
        "strapline": "Storage designed around your room and routine.",
        "features": ("Measured for your wall", "Practical internal storage", "Premium finish and fitting"),
        "image": ASSET_DIR / "altercraft-standing-banner-wardrobe-hero.png",
    },
)


def register_fonts() -> None:
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("ACSans", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("ACSansBold", str(font_dir / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("ACSerifBold", str(font_dir / "georgiab.ttf")))


def tracking_text(c: canvas.Canvas, text: str, x: float, y: float, font: str, size: float, tracking: float, color) -> None:
    c.setFillColor(color)
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(tracking)
    t.textLine(text)
    c.drawText(t)


def prepare_photo(source_path: Path, slug: str) -> Path:
    source = Image.open(source_path).convert("RGB")
    target_ratio = 36 / 61
    source_ratio = source.width / source.height
    if source_ratio > target_ratio:
        crop_w = int(source.height * target_ratio)
        left = (source.width - crop_w) // 2
        source = source.crop((left, 0, left + crop_w, source.height))
    else:
        crop_h = int(source.width / target_ratio)
        top = max(0, (source.height - crop_h) // 2)
        source = source.crop((0, top, source.width, top + crop_h))

    source = source.resize((3600, 6100), Image.Resampling.LANCZOS)
    source = ImageEnhance.Contrast(source).enhance(1.05)
    source = ImageEnhance.Color(source).enhance(0.95)
    source = source.filter(ImageFilter.UnsharpMask(radius=1.3, percent=110, threshold=3))
    output = ASSET_DIR / f"altercraft-standing-banner-{slug}-print.jpg"
    source.save(output, "JPEG", quality=94, subsampling=0, dpi=(100, 100))
    return output


def draw_brand(c: canvas.Canvas, ink, brown, gold) -> None:
    c.drawImage(str(LOGO_PATH), 2.2 * inch, 110.0 * inch, 7.3 * inch, 7.3 * inch, preserveAspectRatio=True, mask="auto")
    tracking_text(c, "ALTERCRAFT", 10.0 * inch, 115.6 * inch, "ACSansBold", 108, 9.5, ink)
    tracking_text(c, "WOODS  |  FURNITURE  |  INTERIORS", 10.1 * inch, 112.55 * inch, "ACSansBold", 27, 3.4, brown)
    tracking_text(c, "DESIGN  |  PLAN  |  PRODUCE  |  EXECUTE", 10.1 * inch, 110.35 * inch, "ACSansBold", 22, 2.6, brown)
    c.setStrokeColor(gold)
    c.setLineWidth(4)
    c.line(2.2 * inch, 108.3 * inch, 33.8 * inch, 108.3 * inch)


def draw_banner(spec: dict) -> Path:
    cream = CMYKColor(0.03, 0.04, 0.10, 0.00)
    ink = CMYKColor(0.46, 0.58, 0.66, 0.74)
    brown = CMYKColor(0.15, 0.53, 0.80, 0.43)
    gold = CMYKColor(0.17, 0.44, 0.80, 0.10)
    muted = HexColor("#6F5D4C")
    pale_gold = HexColor("#E8C17A")

    photo_path = prepare_photo(spec["image"], spec["slug"])
    pdf_path = OUTPUT_DIR / f"altercraft-standing-banner-{spec['slug']}-10ft-x-3ft.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=(PAGE_W, PAGE_H), pageCompression=1, pdfVersion=(1, 4))
    c.setTitle(f"AlterCraft {spec['title'].title()} Standing Banner - 10 ft x 3 ft")
    c.setAuthor("AlterCraft")
    c.setSubject("Print-ready standing flex banner")

    c.setFillColor(cream)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # Subtle architectural rhythm on the offer area.
    c.setStrokeColor(HexColor("#DDC69E"))
    c.setLineWidth(1.2)
    for offset in range(-8, 36, 5):
        c.line(offset * inch, 82 * inch, (offset + 18) * inch, 108 * inch)

    draw_brand(c, ink, brown, gold)

    tracking_text(c, spec["eyebrow"], 2.3 * inch, 104.4 * inch, "ACSansBold", 34, 4.2, brown)
    tracking_text(c, spec["sequence"] + " / 02", 29.0 * inch, 104.4 * inch, "ACSansBold", 27, 2.5, brown)
    tracking_text(c, spec["title"], 2.3 * inch, 99.7 * inch, "ACSansBold", 82, 1.7, ink)

    c.setFillColor(ink)
    c.setFont("ACSerifBold", 246)
    c.drawString(2.0 * inch, 90.1 * inch, spec["price"])
    tracking_text(c, spec["unit"], 21.8 * inch, 91.3 * inch, "ACSansBold", 59, 2.8, brown)
    c.setFillColor(muted)
    c.setFont("ACSans", 33)
    c.drawString(2.3 * inch, 86.7 * inch, spec["strapline"])

    # Gold service promise ribbon.
    c.setFillColor(HexColor("#BC7A2B"))
    c.roundRect(2.2 * inch, 82.8 * inch, 31.6 * inch, 2.65 * inch, 1.25 * inch, fill=1, stroke=0)
    promise = "BUILT FOR YOUR SPACE  |  QUOTED AFTER MEASUREMENT"
    tracking_text(c, promise, 3.35 * inch, 83.62 * inch, "ACSansBold", 24, 1.6, white)

    # Product photography.
    c.drawImage(ImageReader(str(photo_path)), 0, 21 * inch, width=36 * inch, height=61 * inch, mask="auto")

    # Image footer label keeps the pair visually coordinated.
    c.setFillColor(cream)
    c.rect(0, 21 * inch, 36 * inch, 4.4 * inch, fill=1, stroke=0)
    tracking_text(c, "MEASURED  .  MADE  .  INSTALLED", 4.2 * inch, 22.55 * inch, "ACSansBold", 34, 3.8, ink)

    # Feature band.
    c.setFillColor(HexColor("#2D2018"))
    c.rect(0, 11.5 * inch, 36 * inch, 9.5 * inch, fill=1, stroke=0)
    y_positions = (18.4, 15.5, 12.6)
    for feature, y in zip(spec["features"], y_positions):
        c.setFillColor(pale_gold)
        c.circle(3.0 * inch, (y + 0.15) * inch, 0.13 * inch, fill=1, stroke=0)
        tracking_text(c, feature.upper(), 4.1 * inch, y * inch, "ACSansBold", 34, 2.6, white)

    # Strong contact footer.
    c.setFillColor(HexColor("#B87629"))
    c.rect(0, 0, 36 * inch, 11.5 * inch, fill=1, stroke=0)
    tracking_text(c, "CALL OR WHATSAPP", 2.25 * inch, 8.8 * inch, "ACSansBold", 35, 4.4, white)
    c.setFillColor(white)
    c.setFont("ACSansBold", 148)
    c.drawString(2.15 * inch, 4.15 * inch, "62061 08923")
    tracking_text(c, "WWW.ALTERCRAFT.IN", 2.3 * inch, 1.9 * inch, "ACSansBold", 30, 3.4, white)
    c.setFillColor(HexColor("#F4DEC0"))
    c.setFont("ACSans", 18)
    c.drawRightString(33.7 * inch, 1.95 * inch, "Shop No. 7, J.S. Plaza, Chipiyana Buzurg, Ghaziabad")

    c.setFillColor(HexColor("#EEE3D3"))
    c.setFont("ACSans", 16)
    c.drawCentredString(18 * inch, 11.82 * inch, "Price subject to final measurement, configuration, finish and site conditions.")

    c.showPage()
    c.save()
    return pdf_path


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    register_fonts()
    for banner in BANNERS:
        print(draw_banner(banner))


if __name__ == "__main__":
    main()
