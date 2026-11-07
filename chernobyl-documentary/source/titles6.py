# Captions for the sixth chapter (The Long Shadow), same style as titles2.py.
from titles2 import render
out = 'out/part6/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE LONG SHADOW', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('LATE 1980s', SB, 50, 0.3, 22), ('SOME ELDERLY VILLAGERS CAME HOME TO THE ZONE', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('THE 1990s', SB, 50, 0.3, 22), ('THYROID CANCER STRUCK THOUSANDS WHO WERE CHILDREN IN 1986', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('11 OCTOBER 1991', SB, 50, 0.3, 22), ("FIRE IN UNIT 2'S TURBINE HALL. THE UNIT NEVER RAN AGAIN", RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.38)
render('e4', [('DECEMBER 1991', SB, 50, 0.3, 22), ('THE SOVIET UNION CAME TO AN END', RG, 30, 0.3, 14), ('THE ZONE NOW BELONGED TO AN INDEPENDENT UKRAINE', RG, 30, 0.3, 0)], 0.78, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.4)
