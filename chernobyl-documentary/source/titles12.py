# Captions for the twelfth chapter (The Zone Today), same style as titles2.py.
from titles2 import render
out = 'out/part12/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE ZONE TODAY', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('2011', SB, 50, 0.3, 22), ('THE ZONE WAS OPENED TO VISITORS', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('THE AZURE SWIMMING POOL', SB, 50, 0.3, 22), ('LIQUIDATORS STILL SWAM HERE UNTIL 1996', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [("THE ELEPHANT'S FOOT", SB, 50, 0.3, 22), ('MOLTEN FUEL BENEATH THE REACTOR, STILL DEADLY TODAY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('2019', SB, 50, 0.3, 22), ('124,000 PEOPLE VISITED THE EXCLUSION ZONE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.4)
