const buttons = document.querySelectorAll("button");

buttons.forEach((btn,i)=>{

btn.addEventListener("click",()=>{

console.log("プログラム"+(i+1)+"回答");

});

});
