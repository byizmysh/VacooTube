from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import sys
# Fixed ASCII atlas: no UTF-8 byte splitting and no shell-specific glyph offsets.
font=ImageFont.truetype(str(Path(__file__).resolve().parents[1]/'assets/fonts/DejaVuSansMono.ttf'),25)
im=Image.new('L',(512,192));d=ImageDraw.Draw(im)
for i in range(96):
 x=(i%16)*32;y=(i//16)*32
 d.text((x,y-3),chr(i+32),font=font,fill=255)
Path(sys.argv[1]).write_bytes(im.tobytes())
