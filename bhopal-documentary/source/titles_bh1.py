# Captions for Bhopal chapter 1, THE NIGHT (same style as the Chernobyl film).
from titles2 import render
out = 'out/bh1/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('BHOPAL', SB, 110, 0.3, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('2 DECEMBER 1984', SB, 50, 0.3, 22), ('A CITY OF NEARLY 900,000 PEOPLE WAS ASLEEP', RG, 30, 0.3, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e1', shadow=0.45)
render('e2', [('THE UNION CARBIDE PESTICIDE PLANT', SB, 50, 0.3, 22), ('TANK 610 HELD 42 TONNES OF METHYL ISOCYANATE (MIC)', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('AFTER MIDNIGHT, 3 DECEMBER', SB, 50, 0.3, 22), ('THE GAS ESCAPED FROM THE VENT STACK', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('HEAVIER THAN AIR', SB, 50, 0.3, 22), ('IT CREPT INTO THE HOMES OF THE SLEEPING CITY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
