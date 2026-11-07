# Captions for the ninth chapter (Nature Returns), same style as titles2.py.
from titles2 import render
out = 'out/part9/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('NATURE RETURNS', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('1998', SB, 50, 0.3, 22), ("PRZEWALSKI'S HORSES WERE RELEASED INTO THE ZONE", RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('WITHOUT PEOPLE', SB, 50, 0.3, 22), ('WOLVES, ELK AND DEER MULTIPLIED', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('PRIPYAT', SB, 50, 0.3, 22), ('THE CITY WAS DISAPPEARING INTO THE FOREST', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.4)
render('e4', [('THE COOLING POND', SB, 50, 0.3, 22), ('THE ZONE BECAME AN ACCIDENTAL WILDLIFE REFUGE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.4)
