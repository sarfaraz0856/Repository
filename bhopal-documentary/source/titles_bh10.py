# Captions for Bhopal chapter 10, THE POISON STAYS.
from titles2 import render
out = 'out/bh10/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE POISON STAYS', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('THE PLANT WAS ABANDONED', SB, 50, 0.3, 22), ('HUNDREDS OF TONNES OF TOXIC WASTE WERE LEFT BEHIND', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('THE SOLAR EVAPORATION PONDS', SB, 50, 0.3, 22), ('YEARS OF CHEMICAL WASTE SEEPED INTO THE GROUND', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('CONTAMINATED GROUNDWATER', SB, 50, 0.3, 22), ('TOXIC CHEMICALS WERE FOUND IN WATER AROUND THE PLANT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('JANUARY 2025', SB, 50, 0.3, 22), ('337 TONNES OF WASTE WERE FINALLY TAKEN AWAY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
