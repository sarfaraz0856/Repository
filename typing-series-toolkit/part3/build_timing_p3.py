import json, re, sys
LEAD = 2.0
W = json.load(open('words.json'))
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else W[-1]['e']
def norm(w): return re.sub(r'[^\w]', '', w).lower()
def find(word, after=0.0):
    for o in W:
        if o['s'] >= after - 0.01 and norm(o['w']) == word:
            return o['s']
    raise KeyError(word)
A = lambda t: round(t + LEAD, 3)
n = {}
n['wpm'] = A(find('sabse')); n['wordsPer'] = A(find('words')); n['paanch'] = A(find('paanch'))
n['test'] = A(find('test', n['paanch'] - LEAD + 1)); n['oneMin'] = A(find('one')); n['homeRow'] = A(find('ungliyan'))
n['timer'] = A(find('pehla', n['homeRow'] - LEAD)); n['screen'] = A(find('screen'))
n['mistake'] = A(find('agar', n['screen'] - LEAD)); n['keepGoing'] = A(find('bas', n['mistake'] - LEAD))
n['result'] = A(find('minute', n['keepGoing'] - LEAD) - 0.3); n['accuracy'] = A(find('accuracy'))
n['ninety'] = A(find('ninety')); n['noUse'] = A(find('accuracy', n['ninety'] - LEAD + 1))
n['levels'] = A(find('beginners', 20)); n['forty'] = A(find('forty')); n['fiftyUp'] = A(find('fifty', n['forty'] - LEAD))
n['plan'] = A(find('fifty', n['fiftyUp'] - LEAD + 1)); n['daily'] = A(find('roz', n['plan'] - LEAD))
n['note'] = A(find('har', n['daily'] - LEAD)); n['growth'] = A(find('har', n['note'] - LEAD + 0.5))
n['tip'] = A(find('tip')); n['common'] = A(find('the', n['tip'] - LEAD)); n['comment'] = A(find('apna', n['tip'] - LEAD))
n['subscribe'] = A(find('video', n['comment'] - LEAD)); n['end'] = A(DUR)
def type_text(text, start, cps, stop):
    out, t = [], start
    for i, c in enumerate(text):
        if t >= stop: break
        out.append({'t': round(t, 3), 'ch': c})
        t += (0.7 + 0.6 * (((i * 7919) % 17) / 17)) / cps
    return out
TEST_TEXT = 'practice every day and your typing speed will grow step by step'
test_ev = type_text(TEST_TEXT, n['timer'] + 0.4, 3.6, n['result'] - 0.3)
if len(test_ev) > 20: test_ev[20]['ch'] = 't'   # one deliberate mistake: "and" typed as "atd"
common_ev = type_text('the and is the and is', n['common'] + 0.5, 4.2, n['comment'] - 0.3)
json.dump({'lead': LEAD, 'total': round(DUR + LEAD + 3.0, 2), 'anch': n, 'testText': TEST_TEXT,
           'testEv': test_ev, 'commonEv': common_ev, 'ev': test_ev + common_ev}, open('../ui/src/p3timing.json', 'w'), indent=1)
print(json.dumps(n))
