/* ===============================
 ADJ Stock Screener - REAL DATA
 EMA + BREAK + TP/SL + RapidAPI
=============================== */

const $ = (id) => document.getElementById(id);

/* ---------- Elements ---------- */
const els = {
  btnRefresh: $("btnRefresh"),
  btnAuto: $("btnAuto"),
  symbolsText: $("symbolsText"),
  resultBody: $("resultBody"),
  status: $("status"),
};

/* ---------- 設定 ---------- */
const RAPID_API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const RAPID_API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

const STOP_PCT = 0.01;
const TAKE_PCT = 0.015;

/* ---------- State ---------- */
let state = {
  auto: false,
  timer: null,
  symbols: ["8306.T","7203.T","4755.T"],
  history: {},
  positions: {}
};

/* ---------- Utils ---------- */
function setStatus(msg){
  els.status.textContent = msg;
}

/* ---------- EMA ---------- */
function ema(values, period){
  if(values.length < period) return null;
  const k = 2 / (period + 1);
  let e = values[0];
  for(let i=1;i<values.length;i++){
    e = values[i] * k + e * (1 - k);
  }
  return e;
}

/* ---------- Yahoo Finance ---------- */
async function fetchQuotes(symbols){
  try{
    const url = `https://${RAPID_API_HOST}/market/v2/get-quotes?region=JP&symbols=${symbols.join(",")}`;

    const res = await fetch(url,{
      headers:{
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST
      }
    });

    const json = await res.json();

    if(!json.quoteResponse || !json.quoteResponse.result){
      return [];
    }

    return json.quoteResponse.result.map(r=>({
      symbol: r.symbol,
      price: r.regularMarketPrice,
      changePct: r.regularMarketChangePercent,
      volume: r.regularMarketVolume
    }));
  }catch(e){
    setStatus("API取得エラー");
    return [];
  }
}

/* ---------- Logic ---------- */
function analyze(q){
  if(!state.history[q.symbol]){
    state.history[q.symbol] = [];
  }

  const prices = state.history[q.symbol];
  prices.push(q.price);
  if(prices.length>100) prices.shift();

  const ema9 = ema(prices,9);
  const ema21 = ema(prices,21);

  const recent = prices.slice(-20);
  const recentHigh = Math.max(...recent);
  const isBreak = q.price >= recentHigh * 1.002;
  let status="WATCH";

  if(
    q.price<=300 &&
    q.volume>1000000 &&
    ema9 && ema21 &&
    ema9>ema21 &&
    isBreak
  ){
    if(!state.positions[q.symbol]){
      const entry=q.price;
      state.positions[q.symbol]={
        entry,
        sl: entry*(1-STOP_PCT),
        tp: entry*(1+TAKE_PCT),
        status:"OPEN"
      };
    }
  }

  const pos=state.positions[q.symbol];
  if(pos && pos.status==="OPEN"){
    if(q.price>=pos.tp){pos.status="TP";status="TP";}
    else if(q.price<=pos.sl){pos.status="SL";status="SL";}
    else status="OPEN";
  }else if(
    q.price<=300 &&
    q.volume>1000000 &&
    ema9 && ema21 &&
    ema9>ema21 &&
    isBreak
  ){
    status="BUY";
  }

  return {status,ema9,ema21,isBreak,pos};
}

/* ---------- Render ---------- */
function render(rows){
  els.resultBody.innerHTML="";
  rows.forEach(r=>{
    const tpsl = r.pos ? `${r.pos.sl.toFixed(2)} / ${r.pos.tp.toFixed(2)}` : "-";
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${r.status}</td>
      <td>${r.symbol}</td>
      <td>${r.price.toFixed(2)}</td>
      <td>${r.changePct.toFixed(2)}</td>
      <td>${r.volume.toLocaleString()}</td>
      <td>${r.ema9? r.ema9.toFixed(2):"-"}</td>
      <td>${r.ema21? r.ema21.toFixed(2):"-"}</td>
      <td>${r.isBreak?"YES":"-"}</td>
      <td>${tpsl}</td>
    `;
    els.resultBody.appendChild(tr);
  });
}

/* ---------- Refresh ---------- */
async function refresh(){
  const symbols = els.symbolsText.value
    .split("\n")
    .map(s=>s.trim())
    .filter(Boolean);

  if(symbols.length===0) return;

  setStatus("取得中...");
  const quotes = await fetchQuotes(symbols);

  const list = quotes.map(q=>{
    const res=analyze(q);
    return {...q,...res};
  });

  render(list);
  setStatus("更新完了");
}

/* ---------- Auto ---------- */
function toggleAuto(){
  if(state.auto){
    clearInterval(state.timer);
    state.auto=false;
    els.btnAuto.textContent="自動更新: OFF";
  }else{
    state.timer=setInterval(refresh,5000);
    state.auto=true;
    els.btnAuto.textContent="自動更新: ON";
  }
}

/* ---------- Events ---------- */
els.btnRefresh.addEventListener("click",refresh);
els.btnAuto.addEventListener("click",toggleAuto);

/* ---------- Boot ---------- */
els.symbolsText.value = state.symbols.join("\n");
refresh();
