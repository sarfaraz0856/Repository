# Captions for the fourth chapter (The Silence), same style as titles2.py.
from titles2 import render
out = 'out/part4/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE SILENCE', SB, 96, 0.24, 0)], 0.5, 5.0, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('28 APRIL 1986, 21:00', SB, 50, 0.3, 22), ('SOVIET TELEVISION GAVE THE NEWS 20 SECONDS', RG, 30, 0.3, 0)], 0.8, 4.4, 0.9, 0.9, f'{out}/e1', shadow=0.38)
render('e2', [('1 MAY 1986', SB, 50, 0.3, 22), ('MAY DAY PARADES WENT AHEAD UNDER THE FALLOUT', RG, 30, 0.3, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e2', shadow=0.38)
render('e3', [('MAY 1986', SB, 50, 0.3, 22), ('THREE VOLUNTEERS WADED INTO THE FLOODED BASEMENT', RG, 30, 0.3, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e3', shadow=0.45)
render('e4', [('THE 30 KM ZONE', SB, 50, 0.3, 22), ('116,000 PEOPLE WERE EVACUATED', RG, 30, 0.32, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/e4', shadow=0.38)
render('e5', [('10 MAY 1986', SB, 50, 0.3, 22), ('THE FIRE IN THE CORE WAS FINALLY OUT', RG, 30, 0.32, 0)], 0.8, 6.6, 1.0, 1.4, f'{out}/e5', shadow=0.38)
render('e6', [('BY THEN THE FALLOUT HAD', SB, 66, 0.22, 24), ('SPREAD ACROSS EUROPE', SB, 66, 0.22, 0)], 0.5, 6.0, 1.6, 1.4, f'{out}/e6', scale=(1.0, 1.025))
