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

const scanStatus = document.getElementById("scanStatus");

/* ===========================
   API SETTINGS
=========================== */

const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

/* ===========================
   LOW PRICE LIST
=========================== */

const LOW_PRICE_LIST = [ ... 省略せずあなたの配列そのまま ... ];

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

const QUOTE_CACHE_KEY = "adj_trade_last_quotes";

async function fetchQuotes(symbols){
  try{
    const url = `https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbols.join(",")}`;
    const res = await fetch(url,{
      headers:{
        "x-rapidapi-key":API_KEY,
        "x-rapidapi-host":API_HOST
      }
    });
    const json = await res.json();
    const result = json.quoteResponse?.result || [];
    localStorage.setItem(QUOTE_CACHE_KEY,JSON.stringify(result));
    return result;
  }catch(e){
    return JSON.parse(localStorage.getItem(QUOTE_CACHE_KEY)||"[]");
  }
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
    }
  });
  const json = await res.json();
  return json.prices?.slice(0,3) || [];
}

/* ===========================
   VOLUME TREND
=========================== */

function volumeTrend(prices){
  if(prices.length<3) return 0;
  const v0=prices[0].volume;
  const v1=prices[1].volume;
  const v2=prices[2].volume;
  if(!v0||!v1||!v2) return 0;
  let s=0;
  if(v0>v1) s++;
  if(v1>v2) s++;
  return s; //0-2
}

/* ===========================
   CANDLE SCORE
=========================== */

function candleScore(c){
  if(!c.open||!c.high||!c.low||!c.close) return 0;
  const body=Math.abs(c.close-c.open);
  const range=c.high-c.low;
  const lowerWick=Math.min(c.open,c.close)-c.low;
  let s=0;
  if(c.close>c.open) s++;
  if(body/range>=0.3) s++;
  if(lowerWick/range>=0.4) s++;
  return s;
}

function candleAverageScore(candles){
  let total=0;
  candles.forEach(c=> total+=candleScore(c));
  return candles.length?total/candles.length:0;
}

/* ===========================
   STAR SCORE
=========================== */

function calcStars(d,avgCandle,volTrend){

  let s=0;

  if(scanMode==="short"){
    if(d.regularMarketChangePercent>=2) s++;
    if(d.regularMarketChangePercent>=5) s++;
    if(d.regularMarketVolume>=1000000) s++;
    if(d.regularMarketVolume>=3000000) s++;
    if(avgCandle>=1.5) s++;
    if(d.spike>=2) s++;
    if(d.spike>=3) s++;

    if(volTrend>=1) s++;
    if(volTrend>=2) s++;
  }

  if(scanMode==="long"){
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
const SCAN_RESULT_MODE="TOP50";

scanBtn.onclick = async ()=>{

  scanStatus.textContent="スキャン中...";
  scanBtn.disabled=true;
  clearBoard();

  const quotes = await fetchQuotes(LOW_PRICE_LIST);
  const candidates=[];

  for(const d of quotes){

    const avgVol = await fetchVolumeAverage(d.symbol);
    d.spike = volumeSpike(d.regularMarketVolume,avgVol);

    if(scanMode==="short"){
      if(!(d.regularMarketPrice<=500 &&
           d.regularMarketChangePercent>=0.1 &&
           d.spike>=0.8)) continue;
    }

    const candles = await fetchCandles(d.symbol);
    const avgCandle = candleAverageScore(candles);
    const volT = volumeTrend(candles);

    if(volT===0) continue;

    const stars = calcStars(d,avgCandle,volT);

    candidates.push({
      symbol:d.symbol,
      score:stars.length
    });
  }

  candidates.sort((a,b)=>b.score-a.score);
  const result = candidates.slice(0,50);

  result.forEach(r=>insertSymbolToBoard(r.symbol));
  localStorage.setItem("adj_last_scan_symbols",
    JSON.stringify(result.map(r=>r.symbol))
  );

  refresh();
  scanStatus.textContent="完了";
  scanBtn.disabled=false;
};

/* ===========================
   QUICK CHECK (スマホ用)
=========================== */

const quickInput=document.getElementById("quickSymbol");
const quickBtn=document.getElementById("quickBtn");

if(quickBtn){
quickBtn.onclick=async()=>{
  const sym=quickInput.value.trim().toUpperCase();
  if(!sym) return;

  const data=await fetchQuotes([sym]);
  if(!data.length){ alert("取得不可"); return; }

  const d=data[0];
  const avgVol=await fetchVolumeAverage(sym);
  const candles=await fetchCandles(sym);
  const spike=volumeSpike(d.regularMarketVolume,avgVol);
  const volT=volumeTrend(candles);
  const avgCandle=candleAverageScore(candles);
  const stars=calcStars({...d,spike},avgCandle,volT);

  alert(
`${d.longName||d.shortName}
価格:${d.regularMarketPrice}
前日比:${d.regularMarketChangePercent.toFixed(2)}%
出来高倍率:${spike.toFixed(2)}
出来高トレンド:${volT}
${stars}`
  );
};
}

/* ===========================
   BOARD
=========================== */

const STORAGE_KEY="adj_trade_board";
const LAST_SCAN_KEY = "adj_last_scan_symbols";
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

/* 前回スキャン復元 */

const lastScan = JSON.parse(localStorage.getItem(LAST_SCAN_KEY) || "[]");
lastScan.forEach(sym => insertSymbolToBoard(sym));

/* ===========================
   REFRESH
=========================== */

const refreshBtn=document.getElementById("refreshBtn");

async function refresh(){

  const inputs=[...document.querySelectorAll(".symbol")];
  const symbols=inputs.map(i=>i.value.trim()).filter(v=>v!=="");

  if(symbols.length===0) return;

  const data = await fetchQuotes(symbols);
  if(!Array.isArray(data)) return;

  inputs.forEach(input=>{
    const row=input.closest("tr");
    const d=data.find(x=>x.symbol===input.value.trim().toUpperCase());
    if(!d) return;

    row.querySelector(".price").textContent =
      d.regularMarketPrice ? d.regularMarketPrice.toFixed(2) : "-";

    row.querySelector(".change").textContent =
      d.regularMarketChangePercent!==undefined
        ? d.regularMarketChangePercent.toFixed(2)+"%"
        : "-";

    row.querySelector(".name").textContent =
      d.longName || d.shortName || "-";

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

refreshBtn.onclick=refresh;

/* ===========================
   INSERT
=========================== */

function insertSymbolToBoard(symbol){

  const inputs=[...document.querySelectorAll(".symbol")];

  if(inputs.some(i=>i.value.toUpperCase()===symbol.toUpperCase())) return;

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
   CLEAR BOARD
=========================== */

function clearBoard(){

  document.querySelectorAll("#rows tr").forEach(row=>{

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
  });

  saveBoard();
}

const clearBtn=document.getElementById("clearBtn");

if(clearBtn){
  clearBtn.onclick=()=>{
    if(confirm("ボードを全削除しますか？")){
      clearBoard();
    }
  };
}

/* ===========================
   DELETE ROW
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
