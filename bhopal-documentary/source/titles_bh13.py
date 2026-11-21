# Captions for Bhopal chapter 13, THE MEMORIAL.
from titles2 import render
out = 'out/bh13/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE MEMORIAL', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('MOTHER AND CHILD, 1985', SB, 50, 0.3, 22), ('A STATUE BY THE DUTCH SCULPTOR RUTH KUPFERSCHMIDT', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('THE WALLS REMEMBER', SB, 50, 0.3, 22), ('MURALS ON THE WALLS AROUND THE PLANT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('WHAT THEY LEFT BEHIND', SB, 50, 0.3, 22), ('BELONGINGS OF THE VICTIMS, KEPT IN A MUSEUM', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('“NO HIROSHIMA, NO BHOPAL”', SB, 50, 0.3, 22), ('“WE WANT TO LIVE”', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
