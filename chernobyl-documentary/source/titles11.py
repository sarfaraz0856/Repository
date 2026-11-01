# Captions for the eleventh chapter (The Cost), same style as titles2.py.
from titles2 import render
out = 'out/part11/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE COST', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('"TO THOSE WHO SAVED THE WORLD"', SB, 50, 0.3, 22), ('THE MEMORIAL TO THE FIREFIGHTERS AND LIQUIDATORS', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.45)
render('e2', [('MITINO CEMETERY, MOSCOW', SB, 50, 0.3, 22), ('31 DIED IN THE FIRST WEEKS, 28 OF THEM FROM RADIATION SICKNESS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('THE ALLEY OF VANISHED VILLAGES', SB, 50, 0.3, 22), ('ABOUT 350,000 PEOPLE WERE RESETTLED', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.45)
render('e4', [('THE FULL TOLL IS STILL DEBATED', SB, 50, 0.3, 22), ('ESTIMATES RANGE FROM 4,000 TO 60,000 DEATHS OR MORE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.4)
