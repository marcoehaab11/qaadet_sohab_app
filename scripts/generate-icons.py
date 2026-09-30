"""Draw the original geometric Qaadet Sohab mark with Pillow (no stock assets)."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
S = 3
SIZE = 1024 * S
NIGHT = "#21152f"
TABLE = "#322344"
GOLD = "#e8bb61"
CREAM = "#fff2d9"


def box(x0, y0, x1, y1):
    return tuple(round(v * S) for v in (x0, y0, x1, y1))


def card(color, angle, offset, symbol):
    layer = Image.new("RGBA", (SIZE, SIZE))
    draw = ImageDraw.Draw(layer)
    dx, dy = offset
    draw.rounded_rectangle(box(361 + dx, 305 + dy, 663 + dx, 718 + dy),
                           radius=42 * S, fill=GOLD)
    draw.rounded_rectangle(box(371 + dx, 315 + dy, 653 + dx, 708 + dy),
                           radius=35 * S, fill=color)
    cx, cy = (512 + dx) * S, (512 + dy) * S
    if symbol == "spark":
        points = [(cx, cy - 108*S), (cx + 27*S, cy - 28*S),
                  (cx + 104*S, cy), (cx + 27*S, cy + 28*S),
                  (cx, cy + 108*S), (cx - 27*S, cy + 28*S),
                  (cx - 104*S, cy), (cx - 27*S, cy - 28*S)]
        draw.polygon(points, fill=CREAM)
        draw.ellipse(box(502 + dx, 502 + dy, 522 + dx, 522 + dy), fill=GOLD)
    else:
        draw.ellipse(box(453 + dx, 449 + dy, 491 + dx, 487 + dy), fill=CREAM)
        draw.ellipse(box(533 + dx, 449 + dy, 571 + dx, 487 + dy), fill=CREAM)
        draw.arc(box(447 + dx, 468 + dy, 577 + dx, 600 + dy), 20, 160,
                 fill=CREAM, width=19*S)
    return layer.rotate(angle, resample=Image.Resampling.BICUBIC)


def mark(monochrome=False):
    image = Image.new("RGBA", (SIZE, SIZE))
    draw = ImageDraw.Draw(image)
    draw.ellipse(box(104, 104, 920, 920), fill=(255, 255, 255, 255) if monochrome else GOLD)
    draw.ellipse(box(128, 128, 896, 896), fill=(0, 0, 0, 0) if monochrome else TABLE)
    if monochrome:
        for x, y in [(512, 205), (819, 512), (512, 819), (205, 512)]:
            draw.ellipse(box(x-54, y-54, x+54, y+54), fill="white")
        for angle, dx in [(-17, -45), (14, 45)]:
            layer = Image.new("RGBA", (SIZE, SIZE))
            ImageDraw.Draw(layer).rounded_rectangle(
                box(372+dx, 314, 652+dx, 710), radius=35*S, fill="white")
            image.alpha_composite(layer.rotate(angle, resample=Image.Resampling.BICUBIC))
        return image
    for x, y, color in [(512, 205, "#f5b2a9"), (819, 512, "#b9e7d6"),
                        (512, 819, "#c9b5ed"), (205, 512, "#f3d68a")]:
        draw.ellipse(box(x-62, y-62, x+62, y+62), fill=color)
        draw.ellipse(box(x-26, y-31, x+26, y+21), fill=TABLE)
        draw.arc(box(x-44, y+4, x+44, y+70), 195, 345, fill=TABLE, width=14*S)
    image.alpha_composite(card("#dc8f91", -17, (-55, -11), "smile"))
    image.alpha_composite(card("#236e66", 14, (56, 13), "spark"))
    return image


def save(image, name, size):
    image.resize((size, size), Image.Resampling.LANCZOS).save(ASSETS / name)


def adaptive_safe(image):
    canvas = Image.new("RGBA", (SIZE, SIZE))
    small = image.resize((round(SIZE * .78), round(SIZE * .78)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(small, ((SIZE - small.width)//2, (SIZE - small.height)//2))
    return canvas


if __name__ == "__main__":
    colored = mark()
    background = Image.new("RGBA", (SIZE, SIZE), NIGHT)
    background.alpha_composite(colored)
    save(background.convert("RGB"), "icon.png", 1024)
    save(adaptive_safe(colored), "android-icon-foreground.png", 1024)
    save(Image.new("RGB", (SIZE, SIZE), NIGHT), "android-icon-background.png", 1024)
    save(adaptive_safe(mark(True)), "android-icon-monochrome.png", 1024)
    save(background.convert("RGB"), "favicon.png", 64)
    save(colored, "splash-icon.png", 512)
