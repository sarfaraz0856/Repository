# Captions for the tenth chapter (The New Shelter), same style as titles2.py.
from titles2 import render
out = 'out/part10/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE NEW SHELTER', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('2010–2016', SB, 50, 0.3, 22), ('A NEW STEEL ARCH WAS BUILT BESIDE THE RUIN', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('THE NEW SAFE CONFINEMENT', SB, 50, 0.3, 22), ('257 M WIDE, 108 M HIGH, 36,000 TONNES OF STEEL', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('NOVEMBER 2016', SB, 50, 0.3, 22), ('IT WAS SLID 327 METRES ON RAILS, OVER THE OLD SARCOPHAGUS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.4)
render('e4', [('IT IS DESIGNED', SB, 66, 0.22, 24), ('TO LAST 100 YEARS', SB, 66, 0.22, 0)], 0.5, 8.0, 1.6, 1.4, f'{out}/e4', scale=(1.0, 1.025))
