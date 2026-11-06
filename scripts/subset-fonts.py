"""Rozdelí latin-ext písma na malý „sk“ súbor (slovenská/česká diakritika) a zvyšok.
Slovenská stránka potom stiahne iba latin + sk (~60 kB namiesto ~180 kB).

Zdroj: woff2 z @fontsource-variable/{inter,syne} (OFL) v src/assets/fonts.
Spustenie: python3 scripts/subset-fonts.py   (vyžaduje: pip install fonttools brotli)
Výstup: src/assets/fonts/*-sk-wght-normal.woff2 + vypíše unicode-range pre tokens.css
"""
from fontTools import subset

SK = [0x010C, 0x010D, 0x010E, 0x010F, 0x011A, 0x011B, 0x0139, 0x013A, 0x013D, 0x013E, 0x0147, 0x0148,
      0x0154, 0x0155, 0x0158, 0x0159, 0x0160, 0x0161, 0x0164, 0x0165, 0x016E, 0x016F, 0x017D, 0x017E]
EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'


def parse(ranges):
    out = set()
    for r in ranges.split(','):
        a, _, b = r.strip()[2:].partition('-')
        out.update(range(int(a, 16), int(b or a, 16) + 1))
    return out


def fmt(cps):
    cps, out, i = sorted(cps), [], 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        out.append(f'U+{cps[i]:04X}' + (f'-{cps[j]:04X}' if j > i else ''))
        i = j + 1
    return ','.join(out)


for name in ['inter', 'syne']:
    src = f'src/assets/fonts/{name}-latin-ext-wght-normal.woff2'
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=SK)
    sub.subset(font)
    subset.save_font(font, f'src/assets/fonts/{name}-sk-wght-normal.woff2', opts)

print('sk  :', fmt(SK))
print('ext :', fmt(parse(EXT) - set(SK)))
