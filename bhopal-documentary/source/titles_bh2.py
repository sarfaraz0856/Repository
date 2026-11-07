# Captions for Bhopal chapter 2, WHAT WENT WRONG.
from titles2 import render
out = 'out/bh2/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('WHAT WENT WRONG', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('AROUND 11 PM, 2 DECEMBER', SB, 50, 0.3, 22), ('THE PRESSURE IN TANK 610 BEGAN TO RISE', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('THE REFRIGERATION UNIT', SB, 50, 0.3, 22), ('SHUT DOWN SINCE JUNE 1984 TO SAVE MONEY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('THE FLARE TOWER WAS DOWN FOR REPAIR', SB, 50, 0.3, 22), ('THE VENT GAS SCRUBBER WAS ON STANDBY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('THE WATER CURTAIN', SB, 50, 0.3, 22), ('IT COULD NOT REACH THE TOP OF THE VENT STACK', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
