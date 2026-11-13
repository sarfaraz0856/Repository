# Captions for Bhopal chapter 3, THE ESCAPE.
from titles2 import render
out = 'out/bh3/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE ESCAPE', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('AROUND 1 AM, 3 DECEMBER', SB, 50, 0.3, 22), ('PEOPLE WOKE UP CHOKING, THEIR EYES BURNING', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('THE ROADS FILLED WITH PEOPLE', SB, 50, 0.3, 22), ('MANY RAN WITH THE WIND, STRAIGHT INTO THE CLOUD', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('THE GAS SANK INTO THE LOW GROUND', SB, 50, 0.3, 22), ('THOSE WHO CLIMBED HIGHER HAD A BETTER CHANCE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('THE CLOUD SPREAD OVER THE OLD CITY', SB, 50, 0.3, 22), ('NO PROPER WARNING WAS GIVEN', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
