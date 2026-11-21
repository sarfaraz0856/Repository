# Captions for the seventh chapter (The Zone), same style as titles2.py.
from titles2 import render
out = 'out/part7/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE ZONE', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('THE EXCLUSION ZONE', SB, 50, 0.3, 22), ('2,600 SQUARE KILOMETRES, CLOSED BEHIND CHECKPOINTS', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('THE 1990s', SB, 50, 0.3, 22), ('LOOTERS STRIPPED PRIPYAT OF ALMOST EVERYTHING', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('THE SAME AVENUE', SB, 50, 0.3, 22), ('THE FOREST WAS TAKING BACK THE CITY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.38)
render('e4', [('CHERNOBYL-2', SB, 50, 0.3, 22), ('THE SECRET DUGA RADAR STOOD SILENT IN THE FOREST', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.4)
