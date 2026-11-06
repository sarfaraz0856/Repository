# Captions for Bhopal chapter 7, THE TOLL.
from titles2 import render
out = 'out/bh7/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE TOLL', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('CHHOLA VISHRAM GHAT', SB, 50, 0.3, 22), ('THE PYRES BURNED FOR DAYS', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('JHADA KABRISTAN', SB, 50, 0.3, 22), ('GRAVES WERE DUG IN LONG ROWS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('3,787 DEAD', SB, 60, 0.3, 22), ('THE OFFICIAL FIGURE OF THE MADHYA PRADESH GOVERNMENT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('ABOUT 8,000 IN THE FIRST WEEKS, BY OTHER ESTIMATES', SB, 46, 0.26, 22), ('MORE THAN 500,000 PEOPLE WERE INJURED', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
