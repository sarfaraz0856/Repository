EN = """Imagine you're driving on a highway, a toll plaza comes up, and you pass through without stopping.
Within seconds, an SMS arrives on your phone saying the toll has been deducted.
But with no cash, no card and no stopping, how was the money deducted?
What does this small sticker on your windshield actually do?
Today, let's understand the technology behind FASTag, step by step.
First, let's understand what FASTag actually is.
FASTag is a small RFID sticker that is fixed on the vehicle's windshield.
It links your vehicle to a prepaid wallet or a bank account.
Its job is to pay the toll automatically, without stopping at the toll plaza.
FASTag is part of the National Electronic Toll Collection, or NETC, programme.
The NETC system was developed by NPCI, the same NPCI that runs UPI.
In India, FASTag was made mandatory for most vehicles from February 2021.
Queues got shorter, and the cash hassle went away.
To get a FASTag, you need the vehicle's RC and KYC documents.
Let's first understand the main parts of the FASTag system.
First, the FASTag itself, with a unique Tag ID.
Second is the toll plaza's RFID reader and antenna, fixed above the lane.
Third is the toll plaza's computer system, which handles the data of every lane.
Fourth is the acquirer bank, the bank that collects payment on behalf of the toll plaza.
Fifth is the issuer bank, the bank that issued your FASTag and holds your wallet.
And between them all is NPCI's NETC system, which routes messages to the right bank.
Different banks issue FASTags, but thanks to NETC, your tag works at every FASTag toll plaza in India.
Now the most interesting question. This small sticker has no battery, so how does it work?
FASTag uses RFID technology, which means Radio Frequency Identification.
Inside the sticker there is a tiny chip, with a thin antenna around it.
When the vehicle comes near the reader, the reader sends out radio waves.
These radio waves give the tag's chip a little energy, and it becomes active.
The tag then sends its unique ID back to the reader as a radio signal.
This is called passive RFID, so FASTag needs no battery or charging.
Note that your money or bank details are not stored inside the tag.
The tag only tells its ID; all the other work happens on the servers of the banks and the NETC system.
In India, FASTag works on a UHF radio frequency band, so the reader can read the tag from a few metres away.
If the sticker gets bent or torn, its antenna can be damaged, and the reader may not be able to read it.
Now let's see what actually happens at the toll plaza, step by step.
Suppose your FASTag wallet has five hundred rupees, and the toll is ninety-five rupees.
As soon as the car enters the FASTag lane, the reader reads the tag's ID.
The toll plaza system uses this ID to check the tag's details and status.
The plaza keeps an updated status list of tags, so the check can happen very quickly.
If the tag is valid, the toll amount is set by the vehicle's class, and the barrier opens.
Then the toll plaza sends the transaction to its acquirer bank.
The acquirer bank passes this request to your issuer bank through NPCI's NETC system.
The issuer bank debits ninety-five rupees from your FASTag wallet.
After that, through settlement, the money reaches the toll plaza's account.
And a debit SMS arrives on your phone.
Note that the barrier can open immediately, but the debit SMS may sometimes come a little later.
At many toll plazas, cameras also check the vehicle's number plate and class.
And this whole process is usually completed in just a few seconds.
Now the question is, how is the toll amount decided?
Every FASTag is linked to a vehicle class, like car, light commercial vehicle, bus or truck.
Every toll plaza has its own fee rate, which differs by vehicle class.
That's why a truck pays more toll than a car.
Many plazas may also offer options like return journey or monthly passes.
If you are ever charged for the wrong class, you can complain to your issuer bank.
Toll rates are updated from time to time, as per government rules.
Every toll plaza's fee rate can be checked on NHAI's official website or app.
Sometimes a vehicle gets stopped at the toll plaza even with a FASTag. Why?
The most common reason is low balance.
If the wallet doesn't have enough balance, the tag can go into low-balance or blacklist status.
Incomplete KYC, or vehicle details that don't match, can also be a reason.
Under the One Vehicle One FASTag policy of NHAI, a vehicle should have only one active FASTag.
Without a valid FASTag, you may have to pay more than the normal toll.
So check your balance and tag status before a trip.
After you recharge, the tag's status becomes active again within some time.
Now, let's talk about recharging your FASTag.
Most FASTags work like a prepaid wallet that you recharge in advance.
You can recharge through the issuer bank's app, net banking, or UPI payment apps.
Some banks also give the option to link FASTag directly to your bank account.
After a recharge, the balance can sometimes take a little time to update.
So before a long journey, it's better to recharge a little in advance.
Many banks also send an SMS alert when the balance is low.
Some apps also have an auto-recharge option, which tops up the wallet as soon as the balance runs low.
Got a FASTag problem? Here's what to do.
Sometimes the tag is not read, because it's damaged or fixed in the wrong place.
FASTag should be fixed on the windshield, behind the rear-view mirror, in the centre.
Sometimes the same toll is deducted twice, or a wrong amount is deducted.
In that case, keep the SMS and transaction details, and complain to your issuer bank.
For highway-related help, there is also NHAI's helpline number, 1033.
After checking, if the deduction is found to be wrong, you can get a refund.
When you complain, be sure to mention the vehicle number, date, time and toll plaza name.
FASTag is safe, but it's important to keep a few things in mind.
Buy FASTag only from a bank or an official app.
Never share your OTP or PIN on calls or links about FASTag or KYC.
Don't remove the tag and stick it on another vehicle, because a tag is for one vehicle only.
Selling your car? Close the old FASTag.
And always keep SMS alerts on, so you know about every deduction.
If your FASTag is lost or stolen, inform your issuer bank right away and get the tag blocked.
In future, toll collection is going to get even smarter.
Work is going on on satellite or GNSS-based tolling, where toll could be charged by the distance travelled.
Cameras that recognise number plates can also make this system faster.
So, to recap: the reader reads your tag's ID, the plaza system checks the status, and the barrier opens.
Then the acquirer bank, the NETC system and the issuer bank together debit the toll from your wallet.
A small sticker is really the story of a big connected payment network.
If you enjoy understanding the systems behind technology, please like this video and subscribe to the channel.
See you in the next video. Thank you!""".split('\n')
HG = """Imagine kijiye, aap highway par car chala rahe hain, saamne toll plaza aata hai, aur aap bina ruke nikal jaate hain.
Kuch hi seconds mein aapke phone par SMS aata hai, ki toll ka paisa kat gaya.
Lekin bina cash, bina card, aur bina ruke, ye paisa kata kaise?
Windshield par laga ye chhota sa sticker, aakhir karta kya hai?
Aaj hum FASTag ke peeche ki technology ko, step by step samjhenge.
Sabse pehle samajhte hain ki FASTag actually hai kya.
FASTag ek chhota sa RFID sticker hai, jo gaadi ki windshield par lagaya jaata hai.
Ye aapki gaadi ko ek prepaid wallet ya bank account se link karta hai.
Iska kaam hai, toll plaza par bina ruke, automatically toll payment karna.
FASTag, National Electronic Toll Collection, yaani NETC program ka hissa hai.
Is NETC system ko NPCI ne develop kiya hai, wahi NPCI jo UPI bhi chalata hai.
India mein February 2021 se, zyaadatar gaadiyon ke liye FASTag zaroori kar diya gaya.
Isse toll plaza par lambi lines kam huin, aur cash ka jhanjhat bhi.
FASTag lete samay, gaadi ki RC aur KYC documents ki zaroorat hoti hai.
Chaliye, pehle FASTag system ke main parts ko samajhte hain.
Pehla hai FASTag tag, jismein ek unique Tag ID hoti hai.
Doosra hai toll plaza ka RFID reader aur antenna, jo lane ke upar lage hote hain.
Teesra hai toll plaza ka computer system, jo har lane ka data sambhaalta hai.
Chautha hai Acquirer Bank, yaani wo bank jo toll plaza ki taraf se payment leta hai.
Paanchvaan hai Issuer Bank, yaani wo bank jisne aapko FASTag diya hai, aur jahan aapka wallet hai.
Aur in sabke beech hai NPCI ka NETC system, jo messages ko sahi bank tak route karta hai.
Alag-alag banks tag issue karte hain, lekin NETC ki wajah se, aapka tag desh ke har FASTag toll plaza par kaam karta hai.
Ab sabse interesting sawaal. Is chhote se sticker mein to battery bhi nahi hoti, phir ye kaam kaise karta hai?
FASTag mein RFID technology hoti hai, yaani Radio Frequency Identification.
Sticker ke andar ek chhoti si chip, aur uske chaaron taraf ek patla antenna hota hai.
Jab gaadi reader ke paas aati hai, to reader radio waves bhejta hai.
Inhi radio waves se tag ki chip ko thodi si energy milti hai, aur wo active ho jaati hai.
Phir tag apni unique ID, radio signal ke zariye wapas reader ko bhej deta hai.
Ise passive RFID kehte hain, isliye FASTag ko battery ya charging ki zaroorat nahi hoti.
Dhyaan dijiye, tag ke andar aapka paisa ya bank details nahi hoti.
Tag sirf ek ID batata hai, aur baaki saara kaam banks aur NETC system ke servers par hota hai.
India mein FASTag, UHF band ki radio frequency par kaam karta hai, isliye reader kuch meter door se bhi tag read kar sakta hai.
Agar sticker mud jaaye ya phat jaaye, to uska antenna kharaab ho sakta hai, aur reader use read nahi kar paata.
Ab dekhte hain, toll plaza par step by step asal mein kya hota hai.
Maan lijiye aapke FASTag wallet mein paanch sau rupaye hain, aur toll pachaanve rupaye ka hai.
Jaise hi car FASTag lane mein aati hai, reader tag ki ID read kar leta hai.
Toll plaza ka system is ID se tag ki details aur status check karta hai.
Plaza ke paas tags ki ek updated status list rehti hai, taaki check bahut jaldi ho sake.
Agar tag valid hai, to gaadi ki class ke hisaab se toll amount tay hota hai, aur barrier khul jaata hai.
Phir toll plaza, transaction ko apne Acquirer Bank ko bhejta hai.
Acquirer Bank, NPCI ke NETC system ke zariye, ye request aapke Issuer Bank tak pahunchata hai.
Issuer Bank aapke FASTag wallet se pachaanve rupaye debit kar deta hai.
Iske baad settlement ke zariye, ye paisa toll plaza waale account tak pahunchta hai.
Aur aapke phone par debit ka SMS aa jaata hai.
Dhyaan dijiye, barrier turant khul sakta hai, lekin debit ka SMS kabhi-kabhi thodi der baad bhi aa sakta hai.
Kai toll plazas par cameras bhi, gaadi ki number plate aur class ko check karte hain.
Aur ye poora process, zyaadatar bas kuch hi seconds mein poora ho jaata hai.
Ab sawaal ye hai, toll amount kaise tay hota hai?
Har FASTag gaadi ki class se link hota hai, jaise car, light commercial vehicle, bus ya truck.
Har toll plaza ka apna fee rate hota hai, jo vehicle class ke hisaab se alag-alag hota hai.
Isliye truck ka toll, car se zyaada hota hai.
Kai plazas par return journey ya monthly pass jaise options bhi mil sakte hain.
Agar kabhi galat class ka toll kate, to apne Issuer Bank se complaint kar sakte hain.
Toll rates, sarkaar ke tay rules ke hisaab se, samay-samay par update hote hain.
Har toll plaza ka fee rate, NHAI ki official website ya app par dekha ja sakta hai.
Kabhi-kabhi FASTag hote hue bhi, toll plaza par gaadi ruk jaati hai. Aisa kyon?
Iska sabse common reason hai low balance.
Agar wallet mein zaroori balance nahi hai, to tag low balance ya blacklist status mein ja sakta hai.
KYC poori na hona, ya vehicle details ka match na hona bhi ek reason ho sakta hai.
NHAI ki One Vehicle One FASTag policy ke tahat, ek gaadi par ek hi active FASTag hona chahiye.
Valid FASTag na hone par, aapko normal se zyaada toll dena pad sakta hai.
Isliye trip se pehle balance aur tag status zaroor check kar lein.
Recharge karne ke baad, tag ka status kuch samay mein phir se active ho jaata hai.
Ab baat karte hain recharge ki.
Zyaadatar FASTag, prepaid wallet ki tarah kaam karte hain, jise aap pehle se recharge karte hain.
Aap Issuer Bank ki app, net banking, ya UPI waale payment apps se recharge kar sakte hain.
Kuch banks, FASTag ko seedhe aapke bank account se link karne ka option bhi dete hain.
Recharge ke baad balance update hone mein, kabhi-kabhi thoda time lag sakta hai.
Isliye lambe safar se pehle, recharge thoda pehle kar lena behtar hai.
Kai banks, balance kam hone par SMS alert bhi bhejte hain.
Kuch apps mein auto recharge ka option bhi hota hai, jisse balance kam hote hi wallet apne aap recharge ho jaata hai.
Agar FASTag se judi koi problem ho, to kya karein?
Kabhi tag read nahi hota, kyonki wo kharaab ho gaya hai, ya galat jagah laga hai.
FASTag ko windshield par, rear view mirror ke peeche, beech mein lagana chahiye.
Kabhi-kabhi ek hi toll do baar kat jaata hai, ya galat amount kat jaata hai.
Aise mein SMS aur transaction details sambhaal kar rakhein, aur apne Issuer Bank mein complaint karein.
Highway se judi madad ke liye, NHAI ka helpline number 1033 bhi hai.
Check karne ke baad, agar deduction galat paaya gaya, to refund mil sakta hai.
Complaint karte samay, vehicle number, date, time aur toll plaza ka naam zaroor bataayein.
FASTag safe hai, lekin kuch baaton ka dhyaan rakhna zaroori hai.
FASTag sirf bank, official app ya authorized point se hi lein.
FASTag ya KYC ke naam par aaye call ya link par, apna OTP ya PIN share mat kijiye.
Tag ko nikaal kar doosri gaadi par mat lagaiye, kyonki tag ek hi gaadi ke liye hota hai.
Gaadi bechte samay puraana FASTag close karwana na bhoolein.
Aur SMS alerts hamesha on rakhein, taaki har deduction ki jaankaari milti rahe.
Agar FASTag kho jaaye ya chori ho jaaye, to turant apne Issuer Bank ko bata kar tag block karwaayein.
Aage chal kar toll collection aur bhi smart hone waala hai.
Satellite yaani GNSS based tolling par kaam chal raha hai, jismein toll tay ki gayi doori ke hisaab se kat sakta hai.
Number plate pehchaanne waale cameras bhi, is system ko aur fast bana sakte hain.
To recap karein, reader aapke tag ki ID read karta hai, plaza system status check karta hai, aur barrier khul jaata hai.
Phir Acquirer Bank, NETC system aur Issuer Bank milkar, aapke wallet se toll debit karte hain.
Ek chhota sa sticker, asal mein ek bade connected payment network ki kahaani hai.
Agar aapko technology ke peeche ke aise systems samajhna achha lagta hai, to video ko like kijiye, aur channel ko subscribe kijiye.
Milte hain agle video mein. Thank you!""".split('\n')
