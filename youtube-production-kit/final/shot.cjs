const path=require('path');const {chromium}=require(path.join(require('child_process').execSync('npm root -g').toString().trim(),'playwright'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:+process.argv[3],height:+process.argv[4]}});await p.goto('file://'+path.resolve(process.argv[2]));
await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:process.argv[5]});await b.close();})();
