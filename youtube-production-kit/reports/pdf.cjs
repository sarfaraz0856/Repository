const path=require('path');const {chromium}=require(path.join(require('child_process').execSync('npm root -g').toString().trim(),'playwright'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const p=await b.newPage();await p.goto('file://'+path.resolve(process.argv[2]));await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:process.argv[3],format:'A4',printBackground:true,preferCSSPageSize:true});await b.close();})();
