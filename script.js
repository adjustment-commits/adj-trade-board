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
   FIXED MODE
=========================== */

let scanMode = "short";

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
"3907.T","3911.T","3923.T","3962.T","3992.T","4026.T"
];

/* ===========================
   FETCH
=========================== */

async function fetchQuotes(symbols){
  const url=`https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbols.join(",")}`;
  const res=await fetch(url,{
    headers:{
      "x-rapidapi-key":API_KEY,
      "x-rapidapi-host":API_HOST
    }
  });
  const json=await res.json();
  return json.quoteResponse?.result||[];
}

async function fetchVolumeAverage(symbol){
  const url=`https://${API_HOST}/stock/v2/get-summary?symbol=${symbol}`;
  const res=await fetch(url,{
    headers:{
      "x-rapidapi-key":API_KEY,
      "x-rapidapi-host":API_HOST
    }
  });
  const json=await res.json();
  return json.summaryDetail?.averageDailyVolume10Day?.raw || null;
}

async function fetchCandles(symbol){
  const url=`https://${API_HOST}/stock/v3/get-historical-data?symbol=${symbol}&region=JP`;
  const res=await fetch(url,{
    headers:{
      "x-rapidapi-key":API_KEY,
      "x-rapidapi-host":API_HOST
    }
  });
  const json=await res.json();
  return json.prices?.slice(0,3)||[];
}

/* ===========================
   LOGIC
=========================== */

function volumeSpike(today,avg){
  if(!today||!avg) return 0;
  return today/avg;
}

function candleScore(c){
  if(!c.open||!c.high||!c.low||!c.close) return 0;
  const body=Math.abs(c.close-c.open);
  const range=c.high-c.low;
  const lower=Math.min(c.open,c.close)-c.low;
  let s=0;
  if(c.close>c.open) s++;
  if(body/range>=0.3) s++;
  if(lower/range>=0.25) s++;
  return s;
}

function candleAverageScore(cs){
  if(cs.length===0) return 0;
  let t=0;
  cs.forEach(c=>t+=candleScore(c));
  return t/cs.length;
}

/* ===========================
   SCANNER
=========================== */

const scanBtn=document.getElementById("scanBtn");

scanBtn.onclick = async ()=>{

  clearBoard();

  const quotes=await fetchQuotes(LOW_PRICE_LIST);
  const candidates=[];

  for(const d of quotes){

    const avgVol=await fetchVolumeAverage(d.symbol);
    d.spike=volumeSpike(d.regularMarketVolume,avgVol);

    if(!(d.regularMarketPrice<=300 &&
         d.regularMarketChangePercent>=0.8 &&
         d.spike>=1.3)) continue;

    const candles=await fetchCandles(d.symbol);
    const avg=candleAverageScore(candles);

    if(avg<1.2) continue;

    candidates.push(d.symbol);
  }

  candidates.slice(0,20).forEach(s=>{
    insertSymbolToBoard(s);
  });

  refresh();
};

/* ===========================
   BOARD
=========================== */

const STORAGE_KEY="adj_trade_board";
const rows=document.getElementById("rows");

function buildRows(){
  rows.innerHTML="";
  for(let i=0;i<20;i++){
    const tr=document.createElement("tr");
    tr.innerHTML=`
<td><input class="symbol"></td>
<td class="name">-</td>
<td class="price">-</td>
<td class="change">-</td>
<td class="status">🫷</td>
<td><input class="entry"></td>
<td class="tp">-</td>
<td class="sl">-</td>
<td class="diff">-</td>
<td><input class="note"></td>
<td><button class="delBtn">✖</button></td>`;
    rows.appendChild(tr);
  }
}
buildRows();

/* ===========================
   REFRESH
=========================== */

const refreshBtn=document.getElementById("refreshBtn");

async function refresh(){

  const inputs=[...document.querySelectorAll(".symbol")];
  const symbols=inputs.map(i=>i.value.trim()).filter(v=>v!=="");
  if(symbols.length===0) return;

  const data=await fetchQuotes(symbols);

  inputs.forEach(input=>{
    const row=input.closest("tr");
    const d=data.find(x=>x.symbol===input.value.toUpperCase());
    if(!d) return;

    row.querySelector(".price").textContent=d.regularMarketPrice?.toFixed(2)||"-";
    row.querySelector(".change").textContent=d.regularMarketChangePercent?.toFixed(2)+"%"||"-";
    row.querySelector(".name").textContent=d.shortName||"-";

    const pct=d.regularMarketChangePercent;
    row.className="";
    if(pct>=2){row.classList.add("buy");row.querySelector(".status").textContent="🚀";}
    else if(pct<=-2){row.classList.add("sl");row.querySelector(".status").textContent="🔥";}
    else if(pct>=1){row.classList.add("tp");row.querySelector(".status").textContent="✨";}
    else{row.classList.add("wait");row.querySelector(".status").textContent="🫷";}
  });
}

refreshBtn.onclick=refresh;

/* ===========================
   INSERT / CLEAR
=========================== */

function insertSymbolToBoard(symbol){
  const inputs=[...document.querySelectorAll(".symbol")];
  if(inputs.some(i=>i.value===symbol)) return;
  const empty=inputs.find(i=>i.value==="");
  if(empty) empty.value=symbol;
}

function clearBoard(){
  document.querySelectorAll(".symbol").forEach(i=>i.value="");
}

document.getElementById("clearBtn").onclick=()=>{
  if(confirm("全削除しますか？")) clearBoard();
};

/* ===========================
   DELETE
=========================== */

document.addEventListener("click",e=>{
  if(!e.target.classList.contains("delBtn")) return;
  e.target.closest("tr").querySelector(".symbol").value="";
});
