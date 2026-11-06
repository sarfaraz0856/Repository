# BHOPAL — 15 x 60 s chapters (shots 4 x 15 s unless noted), Hindi narration in the cloned voice

1  THE NIGHT (done)            BH1 city aerial, BH2 plant, BH3 gas escapes, BH4 JP Nagar lane
2  WHAT WENT WRONG            C1 control room, gauge needle climbing ("11 PM: PRESSURE IN TANK 610 BEGAN TO RISE")
                              C2 refrigeration unit idle ("SHUT DOWN IN JUNE 1984, ITS COOLANT REMOVED")
                              C3 flare tower with a missing pipe section + scrubber ("THE FLARE TOWER WAS DOWN FOR REPAIR / THE SCRUBBER WAS ON STANDBY")
                              C4 water curtain falling short of the stack top ("THE WATER SPRAY COULD NOT REACH THE TOP OF THE STACK")
3  THE ESCAPE                 people pouring out of lanes in the gas; a road full of people running, a truck; uphill; aerial of the cloud over the old city
4  THE STATION                Bhopal Junction at night in gas; platform with a waiting train; the station master's office; the train pulling out (Ghulam Dastagir)
5  THE HOSPITAL               Hamidia Hospital at dawn, crowds; corridor; washing eyes; doctors did not know the antidote
6  THE MORNING                dawn haze; empty streets, abandoned shoes and bicycles; dead cattle; yellowed trees
7  THE TOLL                   pyres at the ghat (smoke), many fresh graves; figures: 3,787 official / 8,000 first weeks / 500,000+ injured
8  WARREN ANDERSON            7 Dec 1984 arrest; bail the same day; state plane leaves; never returned; died 2014
9  THE SETTLEMENT             Feb 1989, $470 million; about Rs 25,000 for most; 2010: 7 Indian executives convicted (2 years)
10 THE POISON STAYS           abandoned plant by day, rust and weeds; evaporation ponds; hand pump in a colony; contaminated water
11 THE NEXT GENERATION        colony lane by day; clinic queue; chronic illness; birth defects studies
12 THE FIGHT                  survivors' marches; women's groups (Rashida Bee, Champa Devi Shukla, Goldman Prize 2004); candle march on 3 December
13 THE MEMORIAL               mother-and-child statue (Ruth Kupferschmidt, 1985) outside the plant; wall murals; the plant behind trees
14 THE LESSON                 Environment Protection Act 1986; "the world's worst industrial disaster"; modern Bhopal by day, lakes
15 EPILOGUE                   Bhopal at dusk over the Upper Lake; the plant ruin at night; cards; THE END (no credits)

Render: queue_runner.sh with out/bhN; ~2.5-4.5 h per chapter. Narration: doc/lines.json section bhN, qf voice (Piper 0.90, PZ 0.833) -> FreeVC -> G chain -> mix.py.
Final: join 15 chapters, loudness-matched, 1080p upload file + 720p < 100 MB for the repo.
