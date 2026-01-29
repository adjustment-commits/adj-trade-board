const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

const refreshBtn = document.getElementById("refreshBtn");
const autoBtn = document.getElementById("autoBtn");
const rows = document.getElementById("rows");

let auto=false;
let timer=null;

/* ---------- 初期20行 ---------- */
function buildRows(){
rows.innerHTML="";
for(let i=0;i<20;i++){
const tr=document.createElement("tr");
tr.innerHTML=`
<td><input class="symbol"></td>
<td class="price">-</td>
<td class="change">-</td>
<td class="status">🫷</td>
<td><input class="note"></td>
`;
rows.appendChild(tr);
}
}
buildRows();

/* ---------- データ取得 ---------- */
async function fetchQuotes(symbols){
try{
const url=`https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbols.join(",")}`;

const res=await fetch(url,{
headers:{
"x-rapidapi-key":API_KEY,
"x-rapidapi-host":API_HOST
}
});

const json=await res.json();
if(!json.quoteResponse) return [];
return json.quoteResponse.result;

}catch(e){
console.log(e);
return [];
}
}

/* ---------- 更新処理 ---------- */
async function refresh(){

const symbolInputs=[...document.querySelectorAll(".symbol")];
const symbols=symbolInputs
.map(i=>i.value.trim())
.filter(v=>v!=="");

if(symbols.length===0) return;

const data=await fetchQuotes(symbols);

symbolInputs.forEach((input,i)=>{
const row=input.closest("tr");
const priceCell=row.querySelector(".price");
const changeCell=row.querySelector(".change");
const statusCell=row.querySelector(".status");

const d=data.find(x=>x.symbol===input.value);

if(!d){
priceCell.textContent="-";
changeCell.textContent="-";
statusCell.textContent="🫷";
return;
}

priceCell.textContent=d.regularMarketPrice?.toFixed(2);
changeCell.textContent=d.regularMarketChangePercent?.toFixed(2)+"%";

if(d.regularMarketChangePercent>2){
statusCell.textContent="🚀";
}else if(d.regularMarketChangePercent<-2){
statusCell.textContent="🔥";
}else{
statusCell.textContent="🫷";
}
});
}

/* ---------- Auto ---------- */
function toggleAuto(){
if(auto){
clearInterval(timer);
auto=false;
autoBtn.textContent="自動更新 OFF";
}else{
timer=setInterval(refresh,5000);
auto=true;
autoBtn.textContent="自動更新 ON";
}
}

refreshBtn.onclick=refresh;
autoBtn.onclick=toggleAuto;
