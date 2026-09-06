"""WebP compression and editorial crops of the original generated assets.

Run with the folder of the five imagegen outputs as the first argument.
This is asset packaging only; the artwork itself was produced by imagegen.
"""
from pathlib import Path
import sys
import shutil
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
assets = {
    'exec-fab62540-cee9-4550-90d1-983f592cb0c6.png': ['assets/images/hero-poster.webp', 'assets/images/clinic/interior.webp', 'assets/video/hero-poster.webp'],
    'exec-77f8f7e3-e1e6-4214-b28a-2b9aad6e7f0e.png': ['assets/images/services/precision.webp'],
    'exec-bc50b84d-02c8-4e41-86b8-f150033db6b6.png': ['assets/images/team/echipa.webp'],
    'exec-1a99ac54-4550-4c06-8715-c97c75e8fa37.png': ['assets/images/results/inainte.webp'],
    'exec-173ed29a-851a-4b14-9905-1b74ceedf4d7.png': ['assets/images/results/dupa.webp'],
}
for filename, destinations in assets.items():
    image = Image.open(source / filename).convert('RGB')
    for destination in destinations:
        output = root / destination
        output.parent.mkdir(parents=True, exist_ok=True)
        image.save(output, 'WEBP', quality=84, method=6)
        if 'assets/video/' not in destination:
            small = image.copy()
            small.thumbnail((840, 600), Image.Resampling.LANCZOS)
            small.save(output.with_stem(output.stem + '-small'), 'WEBP', quality=82, method=6)

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
print('Prepared 18 local WebP files, five portrait crops, and self-hosted Romanian-capable fonts.')
