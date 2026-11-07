# Captions for Bhopal chapter 9, THE SETTLEMENT.
from titles2 import render
out = 'out/bh9/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE SETTLEMENT', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('14 FEBRUARY 1989', SB, 50, 0.3, 22), ('THE SUPREME COURT APPROVED A SETTLEMENT OF $470 MILLION', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('THE SURVIVORS WERE NEVER ASKED', SB, 50, 0.3, 22), ('THEY TOOK TO THE STREETS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('ABOUT 25,000 RUPEES', SB, 50, 0.3, 22), ('WHAT MOST VICTIMS RECEIVED, YEARS LATER', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('7 JUNE 2010', SB, 50, 0.3, 22), ('SEVEN FORMER EXECUTIVES CONVICTED: TWO YEARS, BAIL THE SAME DAY', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
