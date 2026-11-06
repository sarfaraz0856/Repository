# Captions for Bhopal chapter 5, THE HOSPITAL.
from titles2 import render
out = 'out/bh5/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE HOSPITAL', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('HAMIDIA HOSPITAL, 3 DECEMBER', SB, 50, 0.3, 22), ('BY MORNING, THOUSANDS HAD ARRIVED', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('NO ROOM LEFT', SB, 50, 0.3, 22), ('PATIENTS LAY IN THE CORRIDORS AND ON THE FLOORS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('THE DOCTORS DID NOT KNOW WHICH GAS IT WAS', SB, 50, 0.3, 22), ('OR HOW TO TREAT IT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('IN THE FIRST FEW DAYS', SB, 50, 0.3, 22), ('TENS OF THOUSANDS NEEDED TREATMENT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
