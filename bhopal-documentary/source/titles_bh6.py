# Captions for Bhopal chapter 6, THE MORNING.
from titles2 import render
out = 'out/bh6/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE MORNING', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('3 DECEMBER, DAWN', SB, 50, 0.3, 22), ('THE LANES HAD FALLEN SILENT', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('SHOES, BUNDLES, BICYCLES', SB, 50, 0.3, 22), ('LEFT BEHIND WHERE PEOPLE HAD FLED OR FALLEN', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('BY THEN THE CLOUD HAD DRIFTED AWAY', SB, 50, 0.3, 22), ('ABOUT 40 TONNES OF GAS HAD ESCAPED IN ROUGHLY TWO HOURS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('THOUSANDS OF ANIMALS DIED TOO', SB, 50, 0.3, 22), ('THE LEAVES ON THE TREES TURNED YELLOW AND FELL', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
