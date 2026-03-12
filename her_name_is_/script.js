document.addEventListener("DOMContentLoaded",()=>{

const mainPage=document.getElementById("mainPage");
const visitorCounter=document.getElementById("visitorCounter");
const updateButton=document.getElementById("updateButton");
const effectLayer=document.getElementById("effectLayer");
const effectContent=document.getElementById("effectContent");
const girlStage=document.getElementById("girlStage");
const sayaImage=document.getElementById("sayaImage");
const dialogWindow=document.getElementById("dialogWindow");
const dialogText=document.getElementById("dialogText");
const dialogHint=document.getElementById("dialogHint");

const counterDigits=visitorCounter.querySelectorAll("span");

function setCounter(num){
const padded=String(num).padStart(4,"0").split("");
counterDigits.forEach((el,i)=>el.textContent=padded[i]);
}

function wait(ms){
return new Promise(r=>setTimeout(r,ms));
}

function showWordArt(){
return new Promise(resolve=>{

effectLayer.classList.remove("hidden");

effectContent.innerHTML=`
<div class="wordart-popup">
<p class="wordart-title">おめでとうございます！</p>
<p class="wordart-subtitle">100人目の訪問者です。</p>
</div>
`;

effectLayer.onclick=()=>{
effectLayer.onclick=null;
resolve();
}

});
}

function systemPopup(msg,buttons){
return new Promise(resolve=>{

effectContent.innerHTML=`
<div class="system-popup">
<div class="system-popup-header">System</div>
<div class="system-popup-body">
<p>${msg}</p>
<div class="system-popup-buttons">
${buttons.map(b=>`<button class="system-popup-button">${b}</button>`).join("")}
</div>
</div>
</div>
`;

document.querySelectorAll(".system-popup-button")
.forEach(btn=>btn.onclick=resolve);

});
}

function progressPopup(msg,duration,stopAt=100){
return new Promise(resolve=>{

effectContent.innerHTML=`
<div class="progress-popup">
<div class="progress-popup-header">System</div>
<div class="progress-popup-body">
<p>${msg}</p>
<div class="progress-bar-track">
<div class="progress-bar-fill"></div>
</div>
<p id="progressPercent">0%</p>
</div>
</div>
`;

const bar=document.querySelector(".progress-bar-fill");
const percent=document.getElementById("progressPercent");

let start=performance.now();

function frame(now){

let progress=(now-start)/duration;
let p=Math.min(progress*100,stopAt);

bar.style.width=p+"%";
percent.textContent=Math.floor(p)+"%";

if(p>=stopAt){
resolve();
return;
}

requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

});
}

function typeText(text){
return new Promise(resolve=>{

dialogWindow.classList.remove("hidden");
dialogHint.classList.add("hidden");

dialogText.textContent="";

let i=0;

function type(){
if(i<text.length){
dialogText.textContent+=text[i];
i++;
setTimeout(type,35);
}else{

dialogHint.classList.remove("hidden");

effectLayer.onclick=()=>{
effectLayer.onclick=null;
resolve();
};

}

}

type();

});
}

function playerPopup(text){

return new Promise(resolve=>{

const overlay=document.createElement("div");

overlay.className="player-overlay";

overlay.innerHTML=`
<div class="player-mask"></div>
<div class="player-popup">
<p class="player-popup-message">${text}</p>
</div>
`;

document.body.appendChild(overlay);

overlay.onclick=()=>{
overlay.remove();
resolve();
};

});
}

async function glitchSoft(t=3000){
mainPage.classList.add("glitch-soft");
await wait(t);
mainPage.classList.remove("glitch-soft");
}

async function glitchHard(t=3000){
mainPage.classList.add("glitch-hard");
await wait(t);
mainPage.classList.remove("glitch-hard");
}

async function showGirl(){

effectContent.innerHTML="";
girlStage.classList.remove("hidden");

await wait(100);

sayaImage.classList.add("visible");

}

async function start(){

updateButton.disabled=true;

await wait(300);

setCounter(100);

await showWordArt();

await systemPopup("生体転移プログラムを実行しますか？",["はい","YES"]);

await progressPopup("生体データを読み込み中",3000,100);

await progressPopup("対象の精神を転移中",8000,95);

await glitchSoft(1200);

await showGirl();

await typeText("ふー危なかった！あと少しであなたも電子の海に取り込まれるところだったわ！");

await playerPopup("電子の海？");

await typeText("あーいきなり言われてもわからないわよね。信じられないと思うけど、このサイトはあなたの体から精神を取り込んで、ネットの世界の住人にしちゃうの。");

await typeText("精神が抜き取られた体はおそらくだけど昏睡状態になってしまう。");

await playerPopup("そんなバカな？");

await typeText("まぁーそうよね。そんな話わたしもいきなり言われたら信じないけど、実際わたしが精神を奪われてしまったから。");

await playerPopup("え！？");

await typeText("わたしもあなたのようにあのサイトでキリ番の訪問者だったわ。おめでとうって言われてポチポチしてたらいつの間にか電子の世界に取り込まれたってわけ。");

await typeText("ちゃんとメッセージは読むべきって勉強にはなったわ。");

await glitchSoft(3000);

await typeText("チッ！管理者に見つかったか！？ごめん！ここからはLINEで会話しましょう。");

await glitchHard(3000);

showLinePopup();

}

function showLinePopup(){

effectContent.innerHTML=`
<div class="line-popup">
<div class="system-popup-header">Link</div>
<div class="system-popup-body">
<p>LINEの友だちになる</p>
<button id="lineBtn">はい</button>
</div>
</div>
`;

document.getElementById("lineBtn").onclick=()=>{
window.open("https://lin.ee/OAd6OLo","_blank");
};

}

updateButton.onclick=start;

});
