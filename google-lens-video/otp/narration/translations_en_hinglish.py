EN = """Imagine you're paying online, and the moment you tap Pay, an SMS arrives on your phone.
It has a 6-digit code that's valid for only a few minutes.
You enter this OTP, and the payment is confirmed instantly.
But where is this code made, how does it reach your phone, and how does the bank know the code is right?
Today, let's understand the technology behind OTP, step by step.
First, let's understand what an OTP actually is.
OTP stands for One-Time Password, a password that works only once.
Your normal password stays the same for a long time, but an OTP is new every time.
And it expires within a few minutes.
OTPs are used for online payments, bank logins, app sign-ups and password resets.
It's considered part of two-factor authentication.
That means you need not just your password, but your phone as well.
So even if someone learns your password, they can't get in without the OTP.
Many apps also send OTPs by email, but banking mostly uses SMS OTPs.
To understand the OTP system, let's first look at its main parts.
First is your app or website, where you're logging in or paying.
Second is the bank's or company's authentication server, which creates and checks the OTP.
Third is the SMS gateway, which takes the message from the server and passes it on.
Fourth is your telecom operator, whose network carries the SMS to your phone.
And fifth is your phone, where the OTP arrives.
At every step in between, there's an effort to keep the data secure.
Now let's go through these steps one by one.
So the question is, how is an OTP created?
When you tap Pay or Login, the server creates a random number.
It's a number that's very hard to predict in advance.
A secure random number generator is used for this.
An OTP is usually four to eight digits long, and most often six.
Six digits give one million possible combinations, so guessing is very hard.
Then the server saves this OTP along with some details.
Like which user and which transaction this OTP is for, and when it will expire.
Many systems don't store the OTP directly, but store its hash instead.
A hash is like a digital fingerprint, and it's very hard to get the original number back from it.
So even if someone reaches the database, they can't easily find the real OTP.
An OTP usually expires in a few minutes, like five or ten minutes.
Now let's see how the OTP reaches your phone.
The server sends the OTP message to an SMS gateway.
The SMS gateway passes this message to your telecom operator's network.
The operator's SMS center stores the message and delivers it to your phone.
Your phone is connected to the network, so the message arrives within seconds.
Banks use a registered sender ID in the message, so you can recognise that the SMS is genuine.
Many phones have OTP autofill, where the phone reads the code from the SMS and fills it in.
Sometimes, when the network is busy, the OTP can take a little longer.
In roaming too, an OTP can sometimes take longer to arrive.
That's why apps have a Resend OTP option, which becomes active after a few seconds.
Now when you enter the OTP, what happens next?
The app sends the OTP you entered to the server over a secure connection.
The server checks whether the OTP is correct.
It also checks that the OTP hasn't expired and hasn't been used before.
In most systems, the number of wrong attempts is also limited.
After a few wrong attempts, the OTP may be blocked, or you may have to wait a while.
If everything is correct, the server approves, and your payment or login is completed.
And once it's used, the same OTP won't work again.
A payment OTP is tied to that one transaction, so it won't work for any other payment.
In card payments, this verification often happens on your bank's secure page.
In the same way, a login OTP is tied to that login session.
Now something interesting. Some OTPs don't come by SMS, but are created in an authenticator app.
These apps make a new code every thirty seconds, and they work even without the internet.
This works with the TOTP method, a Time-based One-Time Password.
During setup, the website and your app share one secret key.
This secret key is usually saved in the app by scanning a QR code.
Then the app combines the secret key with the current time to calculate a code.
The server does the same calculation with the same secret key and the same time.
If both codes match, the login is approved.
These codes depend on time, so your phone's time setting must be correct.
The server also accepts a small time difference, so a small delay doesn't make the login fail.
And it isn't tied to your SIM, so it's considered safer against frauds like SIM swap.
OTPs are very useful, but fraudsters target them too.
The most common trick is to call and ask for your OTP.
Someone pretends to be from the bank, a delivery company or a KYC team, and asks you to share the OTP.
Remember, a bank never asks for your OTP by call or message.
The second trick is a fake link, where a fake website gets you to enter your OTP.
The third trick is SIM swap, where a new SIM for your number is obtained by deception.
Then your OTPs start going to the fraudster's phone.
If your phone's network suddenly disappears for no clear reason, contact your operator right away.
Fraudsters can also see your OTP through screen-sharing apps.
So never install a remote-access app just because a stranger asked you to.
Some people even post fake customer care numbers online, so always take numbers from the official website.
Now a few simple safety tips.
Never share your OTP with anyone, whoever they may be.
Read the OTP SMS carefully, and check the amount and the merchant's name.
If you didn't start any transaction and an OTP arrives, ignore it and tell your bank.
Keep a screen lock on your phone, so no one else can read the OTP shown in a notification.
Always keep your registered mobile number updated with your bank.
Where the option exists, you can also turn on authenticator-app two-factor for important accounts.
And if fraud happens, tell your bank immediately and call the Cyber Crime Helpline, 1930.
And never turn off the alerts from your bank.
In the future, even newer ways to log in are coming.
Like passkeys and biometric login, where verification is done with a fingerprint or face.
With passkeys, it becomes very hard to trick you into logging in on a fake website.
But even today, OTP is an important layer of security.
So, to recap: the server creates a random OTP and saves it with an expiry time.
The SMS gateway and the telecom network deliver it to your phone.
You enter the OTP, the server checks it, and approves it.
If you enjoy understanding the systems behind technology, please like this video and subscribe to the channel.
See you in the next video. Thank you!""".split('\n')
HG = """Imagine kijiye, aap online payment kar rahe hain, aur Pay par tap karte hi aapke phone par ek SMS aata hai.
Usmein ek 6-digit code hai, jo sirf kuch minutes ke liye valid hai.
Aap ye OTP enter karte hain, aur payment turant confirm ho jaata hai.
Lekin ye code banta kahan hai, aapke phone tak kaise pahunchta hai, aur bank ko kaise pata chalta hai ki code sahi hai?
Aaj hum OTP ke peeche ki technology ko, step by step samjhenge.
Sabse pehle samajhte hain ki OTP actually hai kya.
OTP ka full form hai One-Time Password, yaani aisa password jo sirf ek baar kaam karta hai.
Aapka normal password lambe samay tak same rehta hai, lekin OTP har baar naya banta hai.
Aur ye kuch hi minutes mein expire bhi ho jaata hai.
OTP ka use online payment, bank login, app sign up, aur password reset jaisi jagahon par hota hai.
Ise two-factor authentication ka hissa maana jaata hai.
Matlab, aapke paas sirf password hi nahi, balki apna phone bhi hona chahiye.
Isliye agar kisi ko aapka password pata bhi chal jaaye, to bhi OTP ke bina wo aage nahi badh paata.
Kai apps mein OTP email par bhi aata hai, lekin banking mein zyaadatar SMS OTP hi use hota hai.
OTP system ko samajhne ke liye, pehle iske main parts ko samajhte hain.
Pehla hai aapka app ya website, jahan aap login ya payment kar rahe hain.
Doosra hai bank ya company ka authentication server, jo OTP banata aur check karta hai.
Teesra hai SMS gateway, jo server se message lekar aage bhejta hai.
Chautha hai aapka telecom operator, jiska network SMS ko aapke phone tak pahunchata hai.
Aur paanchvaan hai aapka phone, jahan OTP aata hai.
In sabke beech har step par, data ko secure rakhne ki koshish ki jaati hai.
Chaliye ab in steps ko ek-ek karke samajhte hain.
Ab sawaal ye hai, OTP banta kaise hai?
Jab aap Pay ya Login par tap karte hain, to server ek random number banata hai.
Ye number aisa hota hai, jiska pehle se andaaza lagana bahut mushkil ho.
Iske liye secure random number generator ka use hota hai.
OTP aamtaur par chaar se aath digits ka hota hai, aur zyaadatar chhah digits ka.
Chhah digits mein kul das lakh combinations bante hain, isliye guess karna bahut mushkil hai.
Phir server is OTP ko kuch details ke saath save karta hai.
Jaise, ye OTP kis user aur kis transaction ke liye hai, aur kab expire hoga.
Kai systems OTP ko seedhe save karne ki jagah, uska hash save karte hain.
Hash ek tarah ka digital fingerprint hai, jisse original number wapas nikaalna bahut mushkil hota hai.
Isse agar database tak koi pahunch bhi jaaye, to use asli OTP aasaani se nahi milta.
OTP ki expiry aamtaur par kuch minutes ki hoti hai, jaise paanch ya das minutes.
Ab dekhte hain, OTP aapke phone tak kaise pahunchta hai.
Server, OTP waala message ek SMS gateway ko bhejta hai.
SMS gateway is message ko aapke telecom operator ke network tak pahunchata hai.
Operator ka SMS center, message ko store karke aapke phone ko deliver karta hai.
Aapka phone network se connected hai, isliye message kuch hi seconds mein aa jaata hai.
Banks message mein ek registered sender ID use karte hain, taaki aap pehchaan sakein ki SMS asli hai.
Kai phones mein OTP autofill hota hai, jismein phone khud SMS se code padhkar bhar deta hai.
Kabhi-kabhi network busy hone par, OTP aane mein thodi der bhi lag sakti hai.
Roaming mein bhi, OTP aane mein kabhi-kabhi zyaada time lag sakta hai.
Isiliye apps mein Resend OTP ka option hota hai, jo kuch seconds baad active hota hai.
Ab aap OTP enter karte hain, to aage kya hota hai?
App aapka daala hua OTP, secure connection ke zariye server ko bhejta hai.
Server check karta hai ki OTP sahi hai ya nahi.
Saath hi ye bhi dekhta hai ki OTP expire to nahi hua, aur pehle use to nahi hua.
Zyaadatar systems mein, galat OTP daalne ke attempts bhi limited hote hain.
Kuch galat attempts ke baad, OTP block ho sakta hai, ya thodi der intezaar karna pad sakta hai.
Agar sab sahi hai, to server approve karta hai, aur aapka payment ya login poora ho jaata hai.
Aur ek baar use hone ke baad, wahi OTP dobaara kaam nahi karta.
Payment waala OTP usi transaction se juda hota hai, isliye kisi doosre payment mein kaam nahi aata.
Card payments mein, ye verification aksar aapke bank ke secure page par hota hai.
Isi tarah login waala OTP bhi, usi login session se juda hota hai.
Ab ek interesting baat. Kuch OTP SMS se nahi, balki authenticator app mein bante hain.
In apps mein har tees seconds mein ek naya code banta hai, aur ye internet ke bina bhi kaam karte hain.
Ye TOTP method se chalta hai, yaani Time-based One-Time Password.
Setup ke samay, website aur aapki app, dono ek secret key share karte hain.
Aksar ye secret key, ek QR code scan karke app mein save hoti hai.
Phir app, secret key aur current time ko milakar, ek code calculate karta hai.
Server bhi usi secret key aur usi time se, same calculation karta hai.
Agar dono codes match ho jaayein, to login approve ho jaata hai.
Ye codes time par depend karte hain, isliye phone ki time setting sahi hona zaroori hai.
Server thode time difference ko bhi accept kar leta hai, taaki chhoti si deri se login fail na ho.
Aur ye SIM se juda nahi hota, isliye SIM swap jaise fraud mein bhi zyaada safe maana jaata hai.
OTP bahut useful hai, lekin fraud karne waale bhi ise nishaana banaate hain.
Sabse common tareeka hai, call karke OTP maangna.
Koi khud ko bank, delivery ya KYC team ka batakar, OTP share karne ko kehta hai.
Yaad rakhiye, bank kabhi bhi call ya message karke aapka OTP nahi maangta.
Doosra tareeka hai fake link, jahan ek nakli website aapse OTP dalwaati hai.
Teesra tareeka hai SIM swap, jismein dhokhe se aapke number ki nayi SIM nikalwaai jaati hai.
Aise mein aapke OTP, fraud karne waale ke phone par jaane lagte hain.
Agar achaanak aapke phone ka network chala jaaye, aur koi wajah na dikhe, to turant apne operator se contact karein.
Screen share waale apps se bhi, fraud karne waale aapka OTP dekh sakte hain.
Isliye kisi anjaan ke kehne par, koi remote access app install mat kijiye.
Kuch log internet par fake customer care number bhi daal dete hain, isliye number hamesha official website se hi lein.
Ab kuch aasaan safety tips.
OTP kabhi kisi ke saath share mat kijiye, chahe saamne waala koi bhi ho.
OTP SMS ko dhyaan se padhiye, usmein amount aur merchant ka naam check kijiye.
Agar aapne koi transaction shuru hi nahi kiya, aur OTP aaya hai, to use ignore kijiye, aur bank ko bataiye.
Phone mein screen lock rakhiye, taaki notification mein dikhne waala OTP koi aur na padh sake.
Apne bank account mein, registered mobile number hamesha updated rakhiye.
Jahan option ho, important accounts mein authenticator app waala two-factor bhi on kar sakte hain.
Aur fraud hone par, turant bank ko bataiye, aur Cyber Crime Helpline 1930 par call kijiye.
Aur bank ki taraf se aane waale alerts ko, kabhi off mat kijiye.
Aage chalkar, login ke aur bhi naye tareeke aa rahe hain.
Jaise passkeys aur biometric login, jinmein fingerprint ya face se verification hota hai.
Passkeys mein, fake website par login karwana bahut mushkil ho jaata hai.
Lekin aaj bhi, OTP security ki ek important layer hai.
To recap karein, server ek random OTP banata hai, aur use expiry ke saath save karta hai.
SMS gateway aur telecom network, use aapke phone tak pahunchaate hain.
Aap OTP enter karte hain, server use check karta hai, aur approve kar deta hai.
Agar aapko technology ke peeche ke aise systems samajhna achha lagta hai, to video ko like kijiye, aur channel ko subscribe kijiye.
Milte hain agle video mein. Thank you!""".split('\n')
