# Captions for the eighth chapter (The Last Reactor), same style as titles2.py.
from titles2 import render
out = 'out/part8/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE LAST REACTOR', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('THE 1990s', SB, 50, 0.3, 22), ('THE HASTILY BUILT SARCOPHAGUS WAS CRACKING', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.4)
render('e2', [('30 NOVEMBER 1996', SB, 50, 0.3, 22), ('UNIT 1 WAS SHUT DOWN', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.45)
render('e3', [('15 DECEMBER 2000, 13:17', SB, 50, 0.3, 22), ('THE LAST REACTOR, UNIT 3, WAS SHUT DOWN', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('AFTER 23 YEARS', SB, 50, 0.3, 22), ('THE CHERNOBYL PLANT FELL SILENT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.4)
