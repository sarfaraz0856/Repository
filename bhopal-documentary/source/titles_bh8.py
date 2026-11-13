# Captions for Bhopal chapter 8, WARREN ANDERSON.
from titles2 import render
out = 'out/bh8/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('WARREN ANDERSON', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('7 DECEMBER 1984', SB, 50, 0.3, 22), ('UNION CARBIDE’S CHAIRMAN ARRIVED IN BHOPAL AND WAS ARRESTED', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('HELD AT THE COMPANY GUEST HOUSE', SB, 50, 0.3, 22), ('FOR ONLY A FEW HOURS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('RELEASED ON BAIL THE SAME DAY', SB, 50, 0.3, 22), ('HE WAS FLOWN OUT ON A STATE GOVERNMENT PLANE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('HE NEVER RETURNED TO FACE TRIAL', SB, 50, 0.3, 22), ('DECLARED AN ABSCONDER, HE DIED IN THE USA IN 2014', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
