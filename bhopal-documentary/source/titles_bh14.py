# Captions for Bhopal chapter 14, THE LESSON.
from titles2 import render
out = 'out/bh14/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE LESSON', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('NEW LAWS', SB, 50, 0.3, 22), ('INDIA PASSED THE ENVIRONMENT (PROTECTION) ACT IN 1986', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('SAFER PLANTS', SB, 50, 0.3, 22), ('ALARMS, EMERGENCY PLANS, AND THE PUBLIC’S RIGHT TO KNOW', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('BHOPAL TODAY', SB, 50, 0.3, 22), ('THE CITY OF LAKES, HOME TO MORE THAN TWO MILLION PEOPLE', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('THE WORST INDUSTRIAL DISASTER IN HISTORY', SB, 50, 0.3, 22), ('A WARNING THE WORLD MUST NOT FORGET', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
