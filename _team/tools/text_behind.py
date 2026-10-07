"""Text-behind-person (C6 / F3): RVM person matte -> background | animated text | person.
Usage: python text_behind.py <in.mp4> <out.mp4> "WORD" [y_frac=0.30] [start_s=0.4] [stretch=1.35]
Default font: tall condensed Anton (_team/fonts). Shadly 2026-10-06: big, tall, slightly ABOVE the head so most letters stay readable and only the lower part hides behind the head."""
import os, sys, subprocess, numpy as np, torch
from PIL import Image, ImageDraw, ImageFont

src, out, word = sys.argv[1], sys.argv[2], sys.argv[3]
yf = float(sys.argv[4]) if len(sys.argv) > 4 else 0.30
t0 = float(sys.argv[5]) if len(sys.argv) > 5 else 0.4
ST = float(sys.argv[6]) if len(sys.argv) > 6 else 1.35
os.environ.setdefault("TORCH_HOME", os.path.join(os.path.dirname(__file__), "..", "..", "_engine", "models", "torch"))
model = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3", trust_repo=True).eval()

pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip().split(",")
W, Hh = int(pr[0]), int(pr[1]); fps = eval(pr[2])
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{Hh}", "-r", str(fps), "-i", "-",
                        "-i", src, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-shortest", out], stdin=subprocess.PIPE)

font = ImageFont.truetype(os.path.join(os.path.dirname(__file__), "..", "fonts", "Anton-Regular.ttf"), 400)
_d = ImageDraw.Draw(Image.new("L", (10, 10)))
font = font.font_variant(size=int(400 * W * 0.92 / _d.textlength(word, font=font)))   # fit 86% of width
def text_layer(t):
    a = min(max((t - t0) / 0.35, 0), 1); e = 1 - (1 - a) ** 3          # ease-out
    s = 0.85 + 0.15 * e
    f = font.font_variant(size=max(8, int(font.size * s)))
    l, t, r, b = f.getbbox(word)
    tile = Image.new("RGBA", (r - l + 4, b - t + 4), (0, 0, 0, 0))
    ImageDraw.Draw(tile).text((2 - l, 2 - t), word, font=f, fill=(255, 255, 255, int(255 * e)))
    tile = tile.resize((tile.width, int(tile.height * ST)), Image.LANCZOS)          # tall
    img = Image.new("RGBA", (W, Hh), (0, 0, 0, 0))
    img.alpha_composite(tile, (int((W - tile.width) / 2), int(Hh * yf - tile.height / 2 + (1 - e) * 40)))
    return np.asarray(img).astype(np.float32) / 255

rec = [None] * 4; i = 0
with torch.no_grad():
    while True:
        buf = dec.stdout.read(W * Hh * 3)
        if len(buf) < W * Hh * 3: break
        fr = np.frombuffer(buf, np.uint8).reshape(Hh, W, 3).astype(np.float32) / 255
        x = torch.from_numpy(fr).permute(2, 0, 1)[None]
        fgr, pha, *rec = model(x, *rec, downsample_ratio=0.4)
        alpha = pha[0, 0].numpy()[..., None]
        tl = text_layer(i / fps)
        comp = fr * (1 - tl[..., 3:]) + tl[..., :3] * tl[..., 3:]          # text over background
        comp = comp * (1 - alpha) + fr * alpha                               # person back on top
        enc.stdin.write((comp * 255).clip(0, 255).astype(np.uint8).tobytes()); i += 1
enc.stdin.close(); enc.wait(); print("frames", i)
