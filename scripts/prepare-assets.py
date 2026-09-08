"""Prepare portrait crops and self-hosted fonts from the original source assets."""
from pathlib import Path
import sys
import shutil
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
group = Image.open(source / 'exec-bc50b84d-02c8-4e41-86b8-f150033db6b6.png').convert('RGB')
crops = [
    ('andrei-popescu', (20, 35, 400, 510)),
    ('elena-marinescu', (360, 105, 736, 575)),
    ('radu-ionescu', (668, 55, 1052, 535)),
    ('maria-dumitru', (1040, 115, 1384, 545)),
    ('ioana-stan', (1344, 125, 1672, 535)),
]
for name, box in crops:
    group.crop(box).save(root / f'assets/images/team/{name}.webp', 'WEBP', quality=88, method=6)

fontdir = root / 'assets/fonts'
fontdir.mkdir(parents=True, exist_ok=True)
package = root / 'node_modules/@fontsource-variable/manrope'
for subset in ['latin', 'latin-ext']:
    shutil.copyfile(package / f'files/manrope-{subset}-wght-normal.woff2', fontdir / f'manrope-{subset}.woff2')
shutil.copyfile(package / 'LICENSE', fontdir / 'OFL.txt')
print('Prepared five portrait crops and self-hosted Romanian-capable fonts.')
