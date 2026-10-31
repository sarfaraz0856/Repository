# Captions for the fifth chapter (The Reckoning), same style as titles2.py.
from titles2 import render
out = 'out/part5/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE RECKONING', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('AUTUMN 1986', SB, 50, 0.3, 22), ('THE DEAD RED FOREST WAS BULLDOZED AND BURIED', RG, 30, 0.3, 0)], 0.8, 5.4, 0.9, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('PRIPYAT', SB, 50, 0.3, 22), ('THE CLASSROOMS WERE LEFT AS THEY WERE', RG, 30, 0.3, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('1 OCTOBER 1986', SB, 50, 0.3, 22), ('UNIT 1 WAS RESTARTED, BESIDE THE RUIN', RG, 30, 0.3, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e3', shadow=0.38)
render('e4', [('JULY 1987, CHERNOBYL', SB, 50, 0.3, 22), ('THREE PLANT MANAGERS WERE SENTENCED TO 10 YEARS', RG, 30, 0.32, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e4', shadow=0.4)
render('e5', [("PRIPYAT'S LIGHTS", SB, 66, 0.22, 24), ('NEVER CAME BACK ON', SB, 66, 0.22, 0)], 0.5, 6.4, 1.6, 1.4, f'{out}/e5', scale=(1.0, 1.025))
