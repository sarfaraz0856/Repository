# Captions, closing cards and credits for the epilogue, same style as titles2.py.
from titles2 import render
out = 'out/part13/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('EPILOGUE', SB, 96, 0.24, 0)], 0.5, 4.0, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('TODAY', SB, 50, 0.3, 22), ('THE NEW ARCH STANDS OVER THE RUINS OF UNIT 4', RG, 30, 0.3, 0)], 0.8, 8.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('PRIPYAT', SB, 50, 0.3, 22), ('ONCE HOME TO 49,360 PEOPLE. TODAY, TO NO ONE', RG, 30, 0.3, 0)], 0.8, 11.0, 1.0, 1.6, f'{out}/e2', shadow=0.4)
render('c1', [('PARTS OF THE ZONE WILL STAY CONTAMINATED', SB, 54, 0.22, 22), ('FOR THOUSANDS OF YEARS', SB, 54, 0.22, 0)], 0.5, 5.4, 1.2, 1.2, f'{out}/c1', scale=(1.0, 1.02))
render('c2', [('IN MEMORY OF ALL', SB, 54, 0.22, 22), ('WHO PAID THE PRICE', SB, 54, 0.22, 0)], 0.5, 5.4, 1.2, 1.2, f'{out}/c2', scale=(1.0, 1.02))
render('end', [('THE END', SB, 110, 0.3, 0)], 0.5, 4.0, 1.4, 1.4, f'{out}/end', scale=(1.0, 1.03))
render('cr1', [('CHERNOBYL 1986', SB, 72, 0.26, 26), ('A DOCUMENTARY IN THIRTEEN CHAPTERS', RG, 30, 0.3, 0)], 0.5, 5.6, 1.0, 1.0, f'{out}/cr1')
render('cr2', [('EVERY FRAME RENDERED IN CODE WITH THREE.JS AND WEBGL', RG, 28, 0.25, 18), ('MUSIC AND SOUND SYNTHESISED IN CODE', RG, 28, 0.25, 18),
               ('TYPEFACE: INTER DISPLAY (SIL OPEN FONT LICENSE)', RG, 28, 0.25, 18), ('MOTION CAPTURE: MIXAMO CLIPS FROM THE THREE.JS EXAMPLES', RG, 28, 0.25, 30),
               ('MADE WITH CLAUDE CODE', MD, 34, 0.28, 0)], 0.5, 6.6, 1.0, 1.6, f'{out}/cr2')
