# Captions for the third chapter (The Liquidators), same style as titles2.py.
from titles2 import render
out = 'out/part3/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('d0', [('THE LIQUIDATORS', SB, 96, 0.22, 0)], 0.5, 5.4, 1.4, 1.1, f'{out}/d0', scale=(1.0, 1.02))
render('d1', [('27 APRIL – 10 MAY 1986', SB, 50, 0.3, 22), ('5,000 TONNES OF SAND, LEAD AND BORON', RG, 30, 0.32, 0)], 0.8, 4.4, 0.9, 0.9, f'{out}/d1', shadow=0.38)
render('d2', [('THE MACHINES THAT FOUGHT IT', SB, 50, 0.28, 22), ('WERE TOO CONTAMINATED TO KEEP', RG, 30, 0.32, 0)], 0.8, 6.8, 1.0, 1.0, f'{out}/d2', shadow=0.38)
render('d3', [('SEPTEMBER 1986, THE ROOF OF UNIT 3', SB, 50, 0.26, 22), ('EACH MAN HAD 90 SECONDS', RG, 30, 0.32, 0)], 0.8, 7.0, 1.0, 1.0, f'{out}/d3', shadow=0.45)
render('d4', [('30 NOVEMBER 1986', SB, 50, 0.3, 22), ('THE SARCOPHAGUS IS COMPLETE', RG, 30, 0.32, 0)], 0.8, 6.5, 1.0, 1.0, f'{out}/d4', shadow=0.38)
render('d5', [('ABOUT 600,000 LIQUIDATORS', SB, 50, 0.28, 22), ('WORKED TO CONTAIN THE DISASTER', RG, 30, 0.32, 0)], 0.8, 6.0, 1.0, 1.0, f'{out}/d5', shadow=0.38)
render('d6', [('PRIPYAT HAS STOOD EMPTY', SB, 72, 0.22, 26), ('EVER SINCE', SB, 72, 0.22, 0)], 0.5, 6.0, 1.6, 1.4, f'{out}/d6', scale=(1.0, 1.025))
