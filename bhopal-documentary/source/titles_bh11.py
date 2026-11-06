# Captions for Bhopal chapter 11, THE NEXT GENERATION.
from titles2 import render
out = 'out/bh11/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE NEXT GENERATION', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('BORN AFTER THE GAS', SB, 50, 0.3, 22), ('MANY CHILDREN OF SURVIVORS WERE BORN WITH ILLNESSES', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('REHABILITATION CENTRES', SB, 50, 0.3, 22), ('DOCTORS RECORDED MORE CASES OF BIRTH DEFECTS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('A LONG SHADOW', SB, 50, 0.3, 22), ('A NEW GENERATION GROWS UP IN THE SAME COLONIES', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('BESIDE THE PLANT WALL', SB, 50, 0.3, 22), ('ON GROUND THAT HAS NEVER BEEN CLEANED', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
