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
"1301.T","1332.T","1377.T","1419.T","1514.T","1518.T",
"1711.T","1757.T","1840.T","1860.T","1921.T","1963.T",
"2134.T","2148.T","2162.T","2170.T","2191.T","2315.T",
"2330.T","2345.T","2370.T","2395.T","2438.T","2484.T",
"2491.T","2687.T","2929.T","3031.T","3070.T","3133.T",
"3189.T","3205.T","3315.T","3323.T","3356.T","3521.T",
"3624.T","3664.T","3686.T","3726.T","3823.T","3856.T",
"3907.T","3911.T","3923.T","3962.T","3992.T","4026.T",
"4180.T","4240.T","4344.T","4385.T","4594.T","4764.T",
"4889.T","4996.T","5017.T","5103.T","5216.T","5721.T",
"5955.T","6072.T","6085.T","6178.T","6184.T","6298.T",
"6335.T","6494.T","6532.T","6731.T","6835.T","6905.T",
"6993.T","7044.T","7068.T","7161.T","7187.T","7212.T",
"7527.T","7615.T","7707.T","7777.T","7836.T","8013.T",
"8107.T","8202.T","8306.T","8411.T","8473.T","8515.T",
"8585.T","8746.T","8789.T","8894.T","8918.T","8946.T",
"9424.T","9479.T","9501.T","9878.T","9984.T",

"1515.T","1670.T","1678.T","1698.T","1762.T","1783.T",
"1821.T","1824.T","1888.T","1893.T","1934.T","2001.T",
"2120.T","2154.T","2175.T","2196.T","2206.T","2323.T",
"2379.T","2404.T","2427.T","2440.T","2468.T","2497.T",
"2656.T","2694.T","2715.T","2721.T","2733.T","2768.T",
"2810.T","2871.T","2892.T","2914.T","2930.T","2975.T",
"3003.T","3046.T","3079.T","3092.T","3109.T","3154.T",
"3179.T","3197.T","3222.T","3231.T","3242.T","3252.T",
"3288.T","3291.T","3308.T","3333.T","3341.T","3371.T",
"3390.T","3393.T","3407.T","3436.T","3443.T","3452.T",
"3475.T","3524.T","3536.T","3544.T","3580.T","3608.T",
"3612.T","3630.T","3656.T","3673.T","3679.T","3697.T",
"3710.T","3738.T","3750.T","3768.T","3778.T","3791.T",
"3807.T","3815.T","3834.T","3845.T","3878.T","3891.T",
"3928.T","3941.T","3964.T","3981.T","3998.T","4005.T",
"4023.T","4042.T","4051.T","4095.T","4109.T","4114.T",
"4176.T","4185.T","4231.T","4246.T","4288.T","4293.T",
"4317.T","4321.T","4334.T","4346.T","4362.T","4382.T",
"4393.T","4406.T","4425.T","4436.T","4464.T","4477.T",
"4493.T","4519.T","4531.T","4552.T","4571.T","4583.T",
"4597.T","4615.T","4627.T","4651.T","4667.T","4689.T"
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
   FETCH VOLUME AVERAGE
=========================== */

async function fetchVolumeAverage(symbol){

  const url = `https://${API_HOST}/stock/v2/get-summary?symbol=${symbol}`;

  const res = await fetch(url,{
    headers:{
      "x-rapidapi-key":API_KEY,
      "x-rapidapi-host":API_HOST
    }
  });

  const json = await res.json();

  return json.summaryDetail?.averageDailyVolume10Day?.raw || null;
}


/* ===========================
   VOLUME SPIKE
=========================== */

function volumeSpike(today, avg){
  if(!today || !avg) return 0;
  return today / avg;
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
   if(d.spike>=2) s++;
if(d.spike>=3) s++;
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

scanBtn.onclick = async ()=>{

  const quotes = await fetchQuotes(LOW_PRICE_LIST);

  let candidates = [];

  for(const d of quotes){

    const avgVol = await fetchVolumeAverage(d.symbol);
    d.spike = volumeSpike(d.regularMarketVolume, avgVol);

    if(scanMode==="short"){
      if(!(d.regularMarketPrice<=300 &&
           d.regularMarketChangePercent>=0.8 &&
           d.spike>=1.3)) continue;
    }

    if(scanMode==="long"){
      if(!(d.regularMarketPrice<=300 &&
           d.regularMarketVolume>=500000)) continue;
    }

    const candles = await fetchCandles(d.symbol);
    const avgCandle = candleAverageScore(candles);

    if(scanMode==="short" && avgCandle<1.2) continue;

    const stars = calcStars(d, avgCandle);
    const score = stars.length;   // ★の数を数値化

    candidates.push({
      symbol: d.symbol,
      score: score
    });
  }

  // ★が多い順に並べ替え
  candidates.sort((a,b)=>b.score - a.score);

  // 上位20件だけ
  const top20 = candidates.slice(0,20);

  // ボードへ自動転送
  top20.forEach(c=>{
    insertSymbolToBoard(c.symbol);
  });

  refresh();
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
   REFRESH BUTTON
=========================== */

const refreshBtn = document.getElementById("refreshBtn");

async function refresh(){

  const inputs=[...document.querySelectorAll(".symbol")];
  const symbols=inputs.map(i=>i.value.trim()).filter(v=>v!=="");
  if(symbols.length===0) return;

  const data = await fetchQuotes(symbols);

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

    row.querySelector(".name").textContent =
      d.shortName || "-";

    const pct=d.regularMarketChangePercent;
    row.className="";

    if(pct>=2){
      row.classList.add("buy");
      row.querySelector(".status").textContent="🚀";
    }
    else if(pct<=-2){
      row.classList.add("sl");
      row.querySelector(".status").textContent="🔥";
    }
    else if(pct>=1){
      row.classList.add("tp");
      row.querySelector(".status").textContent="✨";
    }
    else{
      row.classList.add("wait");
      row.querySelector(".status").textContent="🫷";
    }

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

  saveBoard();
}

refreshBtn.onclick = refresh;

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
