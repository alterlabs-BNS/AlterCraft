from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter
from reportlab.lib.colors import CMYKColor, Color, HexColor, white
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
ASSET_DIR = ROOT / "output" / "assets"
PDF_PATH = OUTPUT_DIR / "altercraft-shop-front-banner-10ft-x-3ft.pdf"
PREVIEW_PATH = ASSET_DIR / "altercraft-shop-front-banner-preview-source.png"
HERO_PATH = ASSET_DIR / "altercraft-shop-banner-kitchen-hero.png"
LOGO_PATH = ROOT / "public" / "altercraft-logo-mark.png"

PAGE_W = 120 * inch
PAGE_H = 36 * inch


def register_fonts() -> None:
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("ACSans", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("ACSansBold", str(font_dir / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("ACSerif", str(font_dir / "georgia.ttf")))
    pdfmetrics.registerFont(TTFont("ACSerifBold", str(font_dir / "georgiab.ttf")))


def prepare_hero() -> Path:
    """Prepare a print-friendly CMYK hero without changing the source asset."""
    source = Image.open(HERO_PATH).convert("RGB")
    # The hero occupies roughly 58 x 36 inches. A 5800 x 3600 working image
    # gives the flex printer a clean file while preserving the generated source.
    target_ratio = 58 / 36
    source_ratio = source.width / source.height
    if source_ratio > target_ratio:
        crop_w = int(source.height * target_ratio)
        left = (source.width - crop_w) // 2
        source = source.crop((left, 0, left + crop_w, source.height))
    else:
        crop_h = int(source.width / target_ratio)
        top = (source.height - crop_h) // 2
        source = source.crop((0, top, source.width, top + crop_h))

    source = source.resize((5800, 3600), Image.Resampling.LANCZOS)
    source = ImageEnhance.Contrast(source).enhance(1.07)
    source = ImageEnhance.Color(source).enhance(0.94)
    source = source.filter(ImageFilter.UnsharpMask(radius=1.4, percent=115, threshold=3))
    prepared = ASSET_DIR / "altercraft-shop-banner-kitchen-hero-print.jpg"
    # Keep the placed photograph RGB. The typography and graphic shapes remain
    # vector CMYK in the PDF, while RGB avoids RIP-specific CMYK JPEG inversion.
    source.save(prepared, "JPEG", quality=94, subsampling=0, dpi=(100, 100))
    return prepared


def draw_tracking_text(c: canvas.Canvas, text: str, x: float, y: float, font: str, size: float, tracking: float, color) -> None:
    c.setFillColor(color)
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(tracking)
    t.textLine(text)
    c.drawText(t)


def draw_label(c: canvas.Canvas, text: str, x: float, y: float, w: float) -> None:
    c.setFillColor(HexColor("#BC7A2B"))
    c.roundRect(x, y, w, 1.55 * inch, 0.75 * inch, fill=1, stroke=0)
    draw_tracking_text(c, text, x + 0.65 * inch, y + 0.45 * inch, "ACSansBold", 45, 3.2, white)


def build_banner() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    register_fonts()
    hero = prepare_hero()

    c = canvas.Canvas(str(PDF_PATH), pagesize=(PAGE_W, PAGE_H), pageCompression=1, pdfVersion=(1, 4))
    c.setTitle("AlterCraft Shop Front Banner - 10 ft x 3 ft")
    c.setAuthor("AlterCraft")
    c.setSubject("Print-ready storefront flex banner")

    cream = CMYKColor(0.03, 0.04, 0.10, 0.00)
    ink = CMYKColor(0.46, 0.58, 0.66, 0.74)
    brown = CMYKColor(0.15, 0.53, 0.80, 0.43)
    muted = CMYKColor(0.20, 0.25, 0.34, 0.30)
    gold = CMYKColor(0.17, 0.44, 0.80, 0.10)

    # Base and hero image.
    c.setFillColor(cream)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    hero_x = 62 * inch
    c.drawImage(ImageReader(str(hero)), hero_x, 0, width=58 * inch, height=36 * inch, mask="auto")

    # Crisp image transition. Transparency is intentionally avoided because
    # many flex-printer RIPs flatten it inconsistently.
    c.setFillColor(cream)
    c.rect(58 * inch, 0, 4 * inch, PAGE_H, fill=1, stroke=0)

    # Architectural line texture on the brand panel.
    c.saveState()
    clip = c.beginPath()
    clip.rect(0, 0, 62 * inch, PAGE_H)
    c.clipPath(clip, stroke=0, fill=0)
    c.setStrokeColor(HexColor("#D9BE94"))
    c.setLineWidth(1.2)
    for offset in range(0, 62, 4):
        c.line(offset * inch, 0, (offset + 24) * inch, PAGE_H)
    c.restoreState()

    safe = 2.4 * inch

    # Brand lock-up.
    c.drawImage(str(LOGO_PATH), safe, 25.4 * inch, width=7.1 * inch, height=7.1 * inch, preserveAspectRatio=True, mask="auto")
    draw_tracking_text(c, "ALTERCRAFT", 10.2 * inch, 29.1 * inch, "ACSansBold", 134, 15, ink)
    draw_tracking_text(c, "DESIGN  |  PLAN  |  PRODUCE  |  EXECUTE", 10.35 * inch, 26.85 * inch, "ACSansBold", 39, 5.2, brown)
    c.setStrokeColor(gold)
    c.setLineWidth(5)
    c.line(2.6 * inch, 24.9 * inch, 59.6 * inch, 24.9 * inch)

    # Lead offer.
    draw_label(c, "MADE WITH CENTURY MATERIALS", safe, 21.8 * inch, 26.3 * inch)
    draw_tracking_text(c, "MODULAR KITCHEN", safe, 18.2 * inch, "ACSansBold", 86, 3.6, ink)
    c.setFillColor(ink)
    c.setFont("ACSerifBold", 234)
    c.drawString(safe, 10.65 * inch, "INR 900")
    draw_tracking_text(c, "/ SQ FT", 28.2 * inch, 12.1 * inch, "ACSansBold", 78, 3.5, brown)
    c.setFillColor(HexColor("#6F5D4C"))
    c.setFont("ACSans", 44)
    c.drawString(safe, 8.8 * inch, "Elegant layouts. Practical storage. Professional installation.")

    # Supporting price strip.
    strip_y = 3.45 * inch
    c.setFillColor(ink)
    c.roundRect(safe, strip_y, 55.6 * inch, 3.65 * inch, 0.5 * inch, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#9A6B3A"))
    c.setLineWidth(2)
    c.line(30.35 * inch, strip_y + 0.55 * inch, 30.35 * inch, strip_y + 3.1 * inch)
    draw_tracking_text(c, "DESIGNER BEDS", 3.7 * inch, strip_y + 2.25 * inch, "ACSansBold", 45, 2.2, white)
    c.setFillColor(HexColor("#E6B866"))
    c.setFont("ACSerifBold", 64)
    c.drawString(3.7 * inch, strip_y + 0.75 * inch, "FROM INR 13,500")
    draw_tracking_text(c, "WARDROBES", 32.1 * inch, strip_y + 2.25 * inch, "ACSansBold", 45, 2.2, white)
    c.setFillColor(HexColor("#E6B866"))
    c.setFont("ACSerifBold", 64)
    c.drawString(32.1 * inch, strip_y + 0.75 * inch, "INR 780 / SQ FT")

    # Phone card over the image.
    c.setFillColor(ink)
    c.roundRect(80.5 * inch, 24.9 * inch, 36.6 * inch, 7.9 * inch, 1.0 * inch, fill=1, stroke=0)
    draw_tracking_text(c, "CALL OR WHATSAPP", 83 * inch, 30.2 * inch, "ACSansBold", 46, 4.5, HexColor("#E8C17A"))
    c.setFillColor(white)
    c.setFont("ACSansBold", 144)
    c.drawString(82.8 * inch, 26.65 * inch, "62061 08923")

    # Service ribbon for a quick roadside scan.
    c.setFillColor(HexColor("#F4EBDD"))
    c.roundRect(69 * inch, 15.9 * inch, 48.2 * inch, 5.6 * inch, 0.7 * inch, fill=1, stroke=0)
    draw_tracking_text(c, "KITCHENS  |  WARDROBES  |  BEDS  |  DOORS", 70.5 * inch, 19.15 * inch, "ACSansBold", 43, 2.0, ink)
    draw_tracking_text(c, "CUSTOM FURNITURE  |  INTERIORS  |  EXECUTION", 71.55 * inch, 17.15 * inch, "ACSansBold", 37, 1.7, brown)

    # Web, location and statutory details.
    c.setFillColor(ink)
    c.rect(62 * inch, 0, 58 * inch, 5.1 * inch, fill=1, stroke=0)
    draw_tracking_text(c, "WWW.ALTERCRAFT.IN", 65.1 * inch, 3.05 * inch, "ACSansBold", 55, 4.3, white)
    c.setFillColor(HexColor("#E8C17A"))
    c.setFont("ACSansBold", 23)
    c.drawString(65.1 * inch, 1.52 * inch, "Shop No. 7, J.S. Plaza, Near Zero Gravity Sports Complex, Chipiyana Road, Chipiyana Buzurg, Ghaziabad - 201009")
    c.setFillColor(white)
    c.setFont("ACSans", 24)
    c.drawRightString(117 * inch, 2.95 * inch, "support@altercraft.in")
    c.drawRightString(117 * inch, 1.62 * inch, "GSTIN 09DPRPR7653F1Z2  |  UDYAM-UP-29-0218457")

    # Small qualification line, kept inside safe area.
    c.setFillColor(HexColor("#6F5D4C"))
    c.setFont("ACSans", 20)
    c.drawString(safe, 1.15 * inch, "Prices shown are subject to measurement, configuration, finish and site conditions. Material details available at the showroom.")

    c.showPage()
    c.save()
    print(PDF_PATH)


if __name__ == "__main__":
    build_banner()
