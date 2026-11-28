# Captions for Bhopal chapter 12, THE FIGHT.
from titles2 import render
out = 'out/bh12/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE FIGHT', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('RASHIDA BEE AND CHAMPA DEVI SHUKLA', SB, 50, 0.3, 22), ('WOMEN SURVIVORS LED THE MOVEMENT', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('ON FOOT TO DELHI', SB, 50, 0.3, 22), ('SURVIVORS WALKED ABOUT 800 KM TO BE HEARD', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('2004 GOLDMAN ENVIRONMENTAL PRIZE', SB, 50, 0.3, 22), ('CLEAN WATER, MEDICAL CARE, JUSTICE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('3 DECEMBER, EVERY YEAR', SB, 50, 0.3, 22), ('BHOPAL STILL MARCHES WITH CANDLES', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
