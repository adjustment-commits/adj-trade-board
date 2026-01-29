const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

/* ---------- 低位株ユニバース ---------- */
const LOW_PRICE_LIST = [
"2134.T","2315.T","2330.T","2345.T","2370.T",
"2687.T","2929.T","3031.T","3070.T","3315.T",
"3521.T","3664.T","3823.T","3907.T","4180.T",
"4594.T","4764.T","5017.T","5955.T","6298.T",
"6335.T","6731.T","6993.T","7527.T","7615.T",
"7777.T","8013.T","8202.T","8411.T","8746.T",
"8894.T","9424.T","9878.T"
];

const refreshBtn = document.getElementById("refreshBtn");
const autoBtn = document.getElementById("autoBtn");
const rows = document.getElementById("rows");

const scanBtn = document.getElementById("scanBtn");
const scannerList = document.getElementById("scannerList");

const STORAGE_KEY = "adj_trade_board";

let auto=false;
let timer=null;
let scanMode="short";

/* ---------- モード切替 ---------- */
document.getElementById("modeShort").onclick=()=>scanMode="short";
document.getElementById("modeLong").onclick=()=>scanMode="long";

/* ---------- ★評価 ---------- */
function calcStars(d){
  let s=0;

  if(scanMode==="short"){
    if(d.regularMarketChangePercent>=2) s++;
    if(d.regularMarketChangePercent>=5) s++;
    if(d.regularMarketVolume>=1000000) s++;
    if(d.regularMarketVolume>=3000000) s++;
    if(candleScore(d) >= 2) s++;
  }else{
    if(d.regularMarketPrice<=300) s++;
    if(d.regularMarketVolume>=500000) s++;
    if(d.regularMarketChangePercent>-2 &&
       d.regularMarketChangePercent<2) s++;
    if(d.regularMarketChangePercent>0) s++;
  }
  return "★".repeat(s);
}

/* ---------- 初期20行 ---------- */
function buildRows(){
const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
rows.innerHTML="";

for(let i=0;i<20;i++){
const tr=document.createElement("tr");
tr.innerHTML=`
<td><input class="symbol" value="${saved[i]?.symbol||""}"></td>
<td class="name">-</td>
<td class="price">-</td>
<td class="change">-</td>
<td class="status">🫷</td>
<td><input class="entry" type="number" value="${saved[i]?.entry||""}"></td>
<td class="tp">-</td>
<td class="sl">-</td>
<td class="diff">-</td>
<td><input class="note" value="${saved[i]?.note||""}"></td>
<td><button class="delBtn">✖</button></td>
`;
rows.appendChild(tr);
}
}
buildRows();

/* ---------- API ---------- */
async function fetchQuotes(symbols){
const url=`https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbols.join(",")}`;
const res=await fetch(url,{
headers:{
"x-rapidapi-key":API_KEY,
"x-rapidapi-host":API_HOST
}});
const json=await res.json();
return json.quoteResponse?.result||[];
}

/* ---------- 更新 ---------- */
async function refresh(){

const inputs=[...document.querySelectorAll(".symbol")];
const symbols=inputs.map(i=>i.value.trim()).filter(v=>v!=="");
if(symbols.length===0) return;

const data=await fetchQuotes(symbols);

inputs.forEach(input=>{
const row=input.closest("tr");
const d=data.find(x=>x.symbol===input.value.trim().toUpperCase());
if(!d) return;

row.querySelector(".price").textContent =
  d.regularMarketPrice ? d.regularMarketPrice.toFixed(2) : "-";

row.querySelector(".change").textContent =
  d.regularMarketChangePercent !== undefined
    ? d.regularMarketChangePercent.toFixed(2)+"%"
    : "-";
row.querySelector(".name").textContent=d.shortName||"-";

const pct=d.regularMarketChangePercent;
row.className="";

if(pct>=2){row.classList.add("buy");row.querySelector(".status").textContent="🚀";}
else if(pct<=-2){row.classList.add("sl");row.querySelector(".status").textContent="🔥";}
else if(pct>=1){row.classList.add("tp");row.querySelector(".status").textContent="✨";}
else{row.classList.add("wait");row.querySelector(".status").textContent="🫷";}

// TP / SL
const entry=parseFloat(row.querySelector(".entry").value);
if(entry){
row.querySelector(".tp").textContent=(entry*1.02).toFixed(2);
row.querySelector(".sl").textContent=(entry*0.99).toFixed(2);
row.querySelector(".diff").textContent=
(((d.regularMarketPrice-entry)/entry)*100).toFixed(1)+"%";
}else{
row.querySelector(".tp").textContent="-";
row.querySelector(".sl").textContent="-";
row.querySelector(".diff").textContent="-";
}
});

// 保存
saveBoard();
}

/* ---------- 自動更新 ---------- */
function toggleAuto(){
if(auto){clearInterval(timer);auto=false;autoBtn.textContent="自動更新 OFF";}
else{timer=setInterval(refresh,5000);auto=true;autoBtn.textContent="自動更新 ON";}
}

refreshBtn.onclick=refresh;
autoBtn.onclick=toggleAuto;

/* ---------- スキャン ---------- */
async function scanLowStocks(){

scannerList.innerHTML="スキャン中...";
const data=await fetchQuotes(LOW_PRICE_LIST);

let rockets=data.filter(d=>{
if(scanMode==="short"){

  const candle = candleScore(d);

  return d.regularMarketPrice<=300 &&
         d.regularMarketChangePercent>=2 &&
         d.regularMarketVolume>=1000000 &&
         candle >= 2;
}
else{
return d.regularMarketPrice<=300 &&
d.regularMarketVolume>=500000;
}});

// ★順ソート
rockets.sort((a,b)=>calcStars(b).length-calcStars(a).length);

scannerList.innerHTML="";
rockets.forEach(d=>{
const stars=calcStars(d);
const div=document.createElement("div");
div.className="scanItem";
if(stars.length>=4) div.classList.add("strong");

div.innerHTML=`
<div>${d.symbol}</div>
<div>${d.shortName||""}</div>
<div>🚀 ${stars}</div>
`;

div.onclick=()=>insertSymbolToBoard(d.symbol);
scannerList.appendChild(div);
});
}

scanBtn.onclick=scanLowStocks;

function saveBoard(){

  const saveData = [...document.querySelectorAll("#rows tr")]
    .map(tr => ({
      symbol: tr.querySelector(".symbol").value,
      entry:  tr.querySelector(".entry").value,
      note:   tr.querySelector(".note").value
    }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}

/* ---------- 表へ転記 ---------- */
function insertSymbolToBoard(symbol){
const inputs=[...document.querySelectorAll(".symbol")];
if(inputs.some(i=>i.value===symbol)) return;

const empty=inputs.find(i=>i.value==="");
if(empty){empty.value=symbol;refresh();}
else alert("空き行なし");
}

/* ---------- 削除 ---------- */
document.addEventListener("click",(e)=>{

  if(!e.target.classList.contains("delBtn")) return;

  const row = e.target.closest("tr");

  // 入力欄
  row.querySelector(".symbol").value = "";
  row.querySelector(".entry").value  = "";
  row.querySelector(".note").value   = "";

  // 表示セル
  row.querySelector(".name").textContent   = "-";
  row.querySelector(".price").textContent  = "-";
  row.querySelector(".change").textContent = "-";
  row.querySelector(".status").textContent = "🫷";
  row.querySelector(".tp").textContent     = "-";
  row.querySelector(".sl").textContent     = "-";

  // クラスと履歴
  row.className = "";
  row.dataset.prevStatus = "";

  saveBoard();   // ← 即保存
});

function candleScore(d){

  const open  = d.regularMarketOpen;
  const high  = d.regularMarketDayHigh;
  const low   = d.regularMarketDayLow;
  const close = d.regularMarketPrice;

  if(!open || !high || !low || !close) return 0;

  const body = Math.abs(close - open);
  const range = high - low;
  const lowerWick = Math.min(open, close) - low;

  let score = 0;

  // 陽線
  if(close > open) score++;

  // 実体がレンジの30%以上
  if(body / range >= 0.3) score++;

  // 下ヒゲがレンジの25%以上
  if(lowerWick / range >= 0.25) score++;

  return score; // 0〜3
}
