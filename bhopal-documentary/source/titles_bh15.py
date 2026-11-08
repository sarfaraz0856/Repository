# Captions for Bhopal chapter 15, EPILOGUE (e4 "THE END" is placed at 54.0 s by the assembly: CAPS env).
from titles2 import render
out = 'out/bh15/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('EPILOGUE', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('2–3 DECEMBER 1984', SB, 50, 0.3, 22), ('THE NIGHT BHOPAL CAN NEVER FORGET', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('THE PLANT STILL STANDS', SB, 50, 0.3, 22), ('A SILENT WITNESS TO THAT NIGHT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('THOUSANDS DIED IN ONE NIGHT', SB, 50, 0.3, 22), ('HUNDREDS OF THOUSANDS STILL WAIT FOR JUSTICE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('THE END', SB, 96, 0.24, 0)], 0.5, 6.0, 1.6, 0.05, f'{out}/e4', scale=(1.0, 1.02))
