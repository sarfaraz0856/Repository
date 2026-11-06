# Captions for Bhopal chapter 4, THE STATION.
from titles2 import render
out = 'out/bh4/titles'
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
render('e0', [('THE STATION', SB, 96, 0.24, 0)], 0.5, 4.6, 1.4, 1.1, f'{out}/e0', scale=(1.0, 1.02))
render('e1', [('BHOPAL JUNCTION, AFTER 1 AM', SB, 50, 0.3, 22), ('THE GAS REACHED THE RAILWAY STATION', RG, 30, 0.3, 0)], 0.8, 7.4, 1.0, 1.0, f'{out}/e1', shadow=0.5)
render('e2', [('A CROWDED EXPRESS TRAIN', SB, 50, 0.3, 22), ('WAS WAITING AT THE PLATFORM', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e2', shadow=0.5)
render('e3', [('GHULAM DASTAGIR', SB, 50, 0.3, 22), ('DEPUTY STATION SUPERINTENDENT, ON DUTY THAT NIGHT', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.0, f'{out}/e3', shadow=0.5)
render('e4', [('HE SENT THE TRAIN AWAY AHEAD OF TIME', SB, 50, 0.3, 22), ('AND STAYED AT HIS POST TO WARN OTHER STATIONS', RG, 30, 0.3, 0)], 0.8, 9.0, 1.0, 1.4, f'{out}/e4', shadow=0.5)
