import math
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "output" / "assets"
OUTPUT_DIR = ROOT / "output" / "pdf"
SOURCE_IMAGE = ASSET_DIR / "altercraft-standing-banner-kitchen-hero.png"
PRINT_IMAGE = ASSET_DIR / "altercraft-square-kitchen-site-banner-print.jpg"
LOGO_PATH = ROOT / "public" / "altercraft-logo-mark.png"
PDF_PATH = OUTPUT_DIR / "altercraft-modular-kitchen-construction-site-banner-2ft-x-2ft.pdf"

PAGE = 24 * inch


def register_fonts() -> None:
    fonts = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("ACSans", str(fonts / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("ACSansBold", str(fonts / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("ACSerifBold", str(fonts / "georgiab.ttf")))


def tracking_text(c: canvas.Canvas, text: str, x: float, y: float, font: str, size: float, tracking: float, color) -> None:
    c.setFillColor(color)
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(tracking)
    t.textLine(text)
    c.drawText(t)


def draw_burst(c: canvas.Canvas, cx: float, cy: float, outer: float, inner: float, points: int, fill) -> None:
    path = c.beginPath()
    for index in range(points * 2):
        angle = math.pi * index / points - math.pi / 2
        radius = outer if index % 2 == 0 else inner
        x = cx + math.cos(angle) * radius
        y = cy + math.sin(angle) * radius
        if index == 0:
            path.moveTo(x, y)
        else:
            path.lineTo(x, y)
    path.close()
    c.setFillColor(fill)
    c.setStrokeColor(HexColor("#171512"))
    c.setLineWidth(0.12 * inch)
    c.drawPath(path, fill=1, stroke=1)


def prepare_photo() -> None:
    image = Image.open(SOURCE_IMAGE).convert("RGB")
    target_ratio = 10.8 / 13.9
    source_ratio = image.width / image.height
    if source_ratio < target_ratio:
        crop_h = int(image.width / target_ratio)
        top = max(0, (image.height - crop_h) // 2)
        image = image.crop((0, top, image.width, top + crop_h))
    else:
        crop_w = int(image.height * target_ratio)
        left = max(0, (image.width - crop_w) // 2)
        image = image.crop((left, 0, left + crop_w, image.height))

    image = image.resize((1080, 1390), Image.Resampling.LANCZOS)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(0.96)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))
    image.save(PRINT_IMAGE, "JPEG", quality=94, subsampling=0, dpi=(100, 100))


def build() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    register_fonts()
    prepare_photo()

    charcoal = HexColor("#171512")
    yellow = HexColor("#F2B705")
    warm_white = HexColor("#FFF8E7")
    red = HexColor("#CF2E24")

    c = canvas.Canvas(str(PDF_PATH), pagesize=(PAGE, PAGE), pageCompression=1, pdfVersion=(1, 4))
    c.setTitle("AlterCraft Modular Kitchen Construction Site Banner - 2 ft x 2 ft")
    c.setAuthor("AlterCraft")
    c.setSubject("High-visibility square flex banner")

    # High-visibility construction field and heavy flex-style border.
    c.setFillColor(yellow)
    c.rect(0, 0, PAGE, PAGE, fill=1, stroke=0)
    c.setStrokeColor(charcoal)
    c.setLineWidth(0.22 * inch)
    c.rect(0.16 * inch, 0.16 * inch, 23.68 * inch, 23.68 * inch, fill=0, stroke=1)

    # Dense brand header.
    c.setFillColor(charcoal)
    c.rect(0, 20.25 * inch, PAGE, 3.75 * inch, fill=1, stroke=0)
    c.setFillColor(warm_white)
    c.rect(0.55 * inch, 20.56 * inch, 3.0 * inch, 3.0 * inch, fill=1, stroke=0)
    c.drawImage(str(LOGO_PATH), 0.66 * inch, 20.67 * inch, 2.78 * inch, 2.78 * inch, preserveAspectRatio=True, mask="auto")
    tracking_text(c, "ALTERCRAFT", 3.95 * inch, 22.25 * inch, "ACSansBold", 62, 5.0, white)
    tracking_text(c, "FURNITURE  |  INTERIORS  |  MODULAR KITCHEN", 4.0 * inch, 21.15 * inch, "ACSansBold", 18, 1.7, HexColor("#F3C960"))
    c.setFillColor(red)
    c.rect(18.1 * inch, 20.25 * inch, 5.9 * inch, 3.75 * inch, fill=1, stroke=0)
    tracking_text(c, "DESIGN", 19.0 * inch, 22.4 * inch, "ACSansBold", 27, 2.3, white)
    tracking_text(c, "PRODUCE", 19.0 * inch, 21.35 * inch, "ACSansBold", 27, 2.3, white)
    tracking_text(c, "INSTALL", 19.0 * inch, 20.38 * inch, "ACSansBold", 27, 2.3, white)

    # Full body: photo on the right, offer blast on the left.
    c.drawImage(ImageReader(str(PRINT_IMAGE)), 13.2 * inch, 6.35 * inch, width=10.8 * inch, height=13.9 * inch, mask="auto")
    c.setFillColor(red)
    path = c.beginPath()
    path.moveTo(12.75 * inch, 6.35 * inch)
    path.lineTo(14.15 * inch, 6.35 * inch)
    path.lineTo(13.6 * inch, 20.25 * inch)
    path.lineTo(12.2 * inch, 20.25 * inch)
    path.close()
    c.drawPath(path, fill=1, stroke=0)

    tracking_text(c, "MODULAR", 0.72 * inch, 18.85 * inch, "ACSansBold", 55, 1.2, charcoal)
    tracking_text(c, "KITCHEN", 0.72 * inch, 16.95 * inch, "ACSansBold", 68, 1.5, red)
    c.setFillColor(charcoal)
    c.rect(14.05 * inch, 18.45 * inch, 8.8 * inch, 1.2 * inch, fill=1, stroke=0)
    tracking_text(c, "CENTURY MATERIALS", 14.75 * inch, 18.83 * inch, "ACSansBold", 19, 1.5, yellow)

    draw_burst(c, 6.55 * inch, 12.1 * inch, 3.95 * inch, 3.55 * inch, 18, red)
    tracking_text(c, "KITCHEN AT", 4.38 * inch, 13.65 * inch, "ACSansBold", 25, 2.0, white)
    c.setFillColor(white)
    c.setFont("ACSerifBold", 116)
    c.drawCentredString(6.55 * inch, 10.95 * inch, "INR 900")
    tracking_text(c, "PER SQ FT", 4.55 * inch, 9.45 * inch, "ACSansBold", 30, 2.1, white)

    # Useful buying information fills the remaining body like a real flex ad.
    c.setFillColor(charcoal)
    c.rect(0.72 * inch, 6.65 * inch, 11.35 * inch, 1.9 * inch, fill=1, stroke=0)
    feature_rows = (("SITE MEASUREMENT", "STORAGE PLANNING"), ("MATERIAL GUIDANCE", "PRO INSTALLATION"))
    for row_index, row in enumerate(feature_rows):
        y = (7.85 - row_index * 0.78) * inch
        for col_index, feature in enumerate(row):
            x = (1.1 + col_index * 5.55) * inch
            c.setFillColor(yellow)
            c.circle(x, y + 0.08 * inch, 0.10 * inch, fill=1, stroke=0)
            tracking_text(c, feature, x + 0.27 * inch, y - 0.07 * inch, "ACSansBold", 17, 1.0, white)

    c.setFillColor(charcoal)
    c.rect(13.2 * inch, 6.35 * inch, 10.8 * inch, 1.55 * inch, fill=1, stroke=0)
    tracking_text(c, "MEASURED  .  MADE  .  INSTALLED", 14.05 * inch, 6.87 * inch, "ACSansBold", 19, 1.4, yellow)

    # Cross-service band makes the piece feel like a local trade flex.
    c.setFillColor(red)
    c.rect(0, 4.45 * inch, 24 * inch, 1.9 * inch, fill=1, stroke=0)
    tracking_text(c, "KITCHEN  |  WARDROBE  |  BEDS  |  TV UNIT  |  CUSTOM FURNITURE", 0.72 * inch, 5.12 * inch, "ACSansBold", 22, 1.2, white)

    # Phone-first footer.
    c.setFillColor(charcoal)
    c.rect(0, 0, 24 * inch, 4.45 * inch, fill=1, stroke=0)
    tracking_text(c, "CALL / WHATSAPP NOW", 0.75 * inch, 3.55 * inch, "ACSansBold", 24, 2.5, white)
    c.setFillColor(yellow)
    c.setFont("ACSansBold", 94)
    c.drawString(0.7 * inch, 1.35 * inch, "62061 08923")
    tracking_text(c, "ALTERCRAFT.IN", 17.4 * inch, 3.58 * inch, "ACSansBold", 23, 2.0, yellow)
    tracking_text(c, "GHAZIABAD  |  NOIDA  |  GREATER NOIDA  |  DELHI NCR", 0.75 * inch, 0.48 * inch, "ACSansBold", 15, 1.25, white)
    tracking_text(c, "MEASUREMENT  |  QUOTATION  |  EXECUTION", 16.15 * inch, 0.5 * inch, "ACSansBold", 13, 1.0, white)

    c.setFillColor(HexColor("#E8DCC4"))
    c.setFont("ACSans", 8)
    c.drawRightString(23.2 * inch, 0.13 * inch, "Price subject to measurement, configuration, finish and site conditions.")

    c.showPage()
    c.save()
    print(PDF_PATH)


if __name__ == "__main__":
    build()
