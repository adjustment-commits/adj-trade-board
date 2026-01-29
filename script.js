/* ===========================
   PASSWORD LOCK
=========================== */

const app = document.getElementById("app");
const headerEl = document.querySelector("header");

app.style.display = "none";
headerEl.style.display = "none";

const PW_KEY = "adj_trade_password";

const lockScreen = document.getElementById("lockScreen");
const pwInput = document.getElementById("pwInput");
const pwBtn = document.getElementById("pwBtn");
const pwMsg = document.getElementById("pwMsg");

(function(){
  if(!localStorage.getItem(PW_KEY)){
    pwMsg.textContent="新しいパスワードを設定してください";
  }else{
    pwMsg.textContent="パスワードを入力してください";
  }
})();

pwBtn.onclick = ()=>{
  const input = pwInput.value.trim();
  if(!input) return;

  if(!localStorage.getItem(PW_KEY)){
    localStorage.setItem(PW_KEY,input);
    lockScreen.style.display="none";
    app.style.display="flex";
    headerEl.style.display="flex";
    return;
  }

  if(input === localStorage.getItem(PW_KEY)){
    lockScreen.style.display="none";
    app.style.display="flex";
    headerEl.style.display="flex";
  }else{
    pwMsg.textContent="パスワードが違います";
  }
};


/* ===========================
   API SETTINGS
=========================== */

const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";


/* ===========================
   LOW PRICE LIST
=========================== */

const LOW_PRICE_LIST = [
"2134.T","2315.T","2330.T","2345.T","2370.T",
"2687.T","2929.T","3031.T","3070.T","3315.T",
"3521.T","3664.T","3823.T","3907.T","4180.T",
"4594.T","4764.T","5017.T","5955.T","6298.T",
"6335.T","6731.T","6993.T","7527.T","7615.T",
"7777.T","8013.T","8202.T","8411.T","8746.T",
"8894.T","9424.T","9878.T"
];


/* ===========================
   MODE SWITCH
=========================== */

let scanMode="short";

const modeLabel = document.getElementById("scanModeLabel");
const modeShortBtn = document.getElementById("modeShort");
const modeLongBtn  = document.getElementById("modeLong");

function setMode(mode){
  scanMode = mode;
  modeLabel.textContent = "MODE : " + mode.toUpperCase();

  modeShortBtn.classList.remove("active");
  modeLongBtn.classList.remove("active");

  if(mode==="short") modeShortBtn.classList.add("active");
  if(mode==="long")  modeLongBtn.classList.add("active");
}

modeShortBtn.onclick = ()=>setMode("short");
modeLongBtn.onclick  = ()=>setMode("long");
setMode("short");


/* ===========================
   FETCH QUOTES
=========================== */

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


/* ===========================
   FETCH 3 DAILY CANDLES
=========================== */

async function fetchCandles(symbol){

const url = `https://${API_HOST}/stock/v3/get-historical-data?symbol=${symbol}&region=JP`;

const res = await fetch(url,{
headers:{
"x-rapidapi-key":API_KEY,
"x-rapidapi-host":API_HOST
}});

const json = await res.json();
return json.prices?.slice(0,3) || [];
}


/* ===========================
   CANDLE SCORE
=========================== */

function candleScore(c){

  const open=c.open;
  const high=c.high;
  const low=c.low;
  const close=c.close;

  if(!open||!high||!low||!close) return 0;

  const body=Math.abs(close-open);
  const range=high-low;
  const lowerWick=Math.min(open,close)-low;

  let s=0;
  if(close>open) s++;
  if(body/range>=0.3) s++;
  if(lowerWick/range>=0.25) s++;

  return s;
}

function candleAverageScore(candles){
  if(candles.length===0) return 0;
  let total=0;
  candles.forEach(c=> total+=candleScore(c));
  return total / candles.length;
}


/* ===========================
   STAR SCORE
=========================== */

function calcStars(d,avgCandle){

  let s=0;

  if(scanMode==="short"){
    if(d.regularMarketChangePercent>=2) s++;
    if(d.regularMarketChangePercent>=5) s++;
    if(d.regularMarketVolume>=1000000) s++;
    if(d.regularMarketVolume>=3000000) s++;
    if(avgCandle>=1.5) s++;
  }else{
    if(d.regularMarketPrice<=300) s++;
    if(d.regularMarketVolume>=500000) s++;
    if(d.regularMarketChangePercent>-2 &&
       d.regularMarketChangePercent<2) s++;
    if(d.regularMarketChangePercent>0) s++;
  }

  return "★".repeat(s);
}


/* ===========================
   SCANNER
=========================== */

const scanBtn=document.getElementById("scanBtn");
const scannerList=document.getElementById("scannerList");

scanBtn.onclick = async ()=>{

scannerList.innerHTML="スキャン中...";

const quotes = await fetchQuotes(LOW_PRICE_LIST);
scannerList.innerHTML="";

for(const d of quotes){

  if(scanMode==="short"){
    if(!(d.regularMarketPrice<=300 &&
         d.regularMarketChangePercent>=2 &&
         d.regularMarketVolume>=1000000)) continue;
  }

  if(scanMode==="long"){
    if(!(d.regularMarketPrice<=300 &&
         d.regularMarketVolume>=500000)) continue;
  }

  const candles = await fetchCandles(d.symbol);
  const avgCandle = candleAverageScore(candles);

  if(scanMode==="short" && avgCandle<1.5) continue;

  const stars = calcStars(d,avgCandle);

  const div=document.createElement("div");
  div.className="scanItem";

  div.innerHTML=`
    <div>${d.symbol}</div>
    <div>${d.shortName||""}</div>
    <div>🚀 ${stars}</div>
  `;

  div.onclick=()=>insertSymbolToBoard(d.symbol);
  scannerList.appendChild(div);
}

};


/* ===========================
   BOARD
=========================== */

const STORAGE_KEY="adj_trade_board";
const rows=document.getElementById("rows");

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
<td><input class="entry" value="${saved[i]?.entry||""}"></td>
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


/* ===========================
   INSERT
=========================== */

function insertSymbolToBoard(symbol){

const inputs=[...document.querySelectorAll(".symbol")];
if(inputs.some(i=>i.value===symbol)) return;

const empty=inputs.find(i=>i.value==="");
if(empty) empty.value=symbol;
else alert("空き行なし");

saveBoard();
}


/* ===========================
   SAVE
=========================== */

function saveBoard(){
const data=[...document.querySelectorAll("#rows tr")]
.map(tr=>({
symbol:tr.querySelector(".symbol").value,
entry:tr.querySelector(".entry").value,
note:tr.querySelector(".note").value
}));
localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}


/* ===========================
   DELETE
=========================== */

document.addEventListener("click",(e)=>{

if(!e.target.classList.contains("delBtn")) return;

const row=e.target.closest("tr");

row.querySelector(".symbol").value="";
row.querySelector(".entry").value="";
row.querySelector(".note").value="";

row.querySelector(".name").textContent="-";
row.querySelector(".price").textContent="-";
row.querySelector(".change").textContent="-";
row.querySelector(".status").textContent="🫷";
row.querySelector(".tp").textContent="-";
row.querySelector(".sl").textContent="-";
row.querySelector(".diff").textContent="-";

row.className="";
saveBoard();
});
