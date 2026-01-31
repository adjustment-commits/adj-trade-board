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

const LOW_PRICE_LIST = [
"1325.T","1356.T","1360.T","1366.T","1368.T","1435.T","1443.T","1447.T","1459.T","1466.T",
"1469.T","1472.T","1475.T","1571.T","1656.T","1678.T","1711.T","1726.T","1773.T","1783.T",
"179A.T","180A.T","1840.T","1853.T","1873.T","190A.T","196A.T","198A.T","2012.T","2013.T",
"2014.T","201A.T","2055.T","206A.T","2120.T","2134.T","213A.T","2146.T","2156.T","2164.T",
"2181.T","2183.T","2193.T","2195.T","2196.T","2250.T","2255.T","2256.T","2257.T","2258.T",
"2259.T","2315.T","2321.T","2330.T","2338.T","2341.T","2342.T","2345.T","2351.T","2353.T",
"2370.T","2375.T","237A.T","2385.T","2388.T","238A.T","2435.T","2438.T","2440.T","2454.T",
"2459.T","2464.T","2467.T","2471.T","2479.T","2484.T","2489.T","2499.T","2563.T","2586.T",
"2620.T","2652.T","2654.T","2656.T","2666.T","2667.T","2673.T","2686.T","2693.T","2694.T",
"2721.T","2722.T","275A.T","2762.T","2764.T","2776.T","2778.T","2788.T","281A.T","2851.T",
"2852.T","288A.T","2894.T","2901.T","2926.T","2930.T","2936.T","297A.T","3010.T","3011.T",
"3032.T","3042.T","3053.T","3054.T","3069.T","3070.T","3071.T","3111.T","3113.T","3121.T",
"3137.T","313A.T","314A.T","3159.T","3185.T","3187.T","3189.T","3192.T","3202.T","3236.T",
"3237.T","3266.T","3315.T","3323.T","3346.T","3358.T","3372.T","3409.T","340A.T","3423.T",
"348A.T","3494.T","3521.T","3536.T","3550.T","3598.T","3607.T","3624.T","3627.T","3639.T",
"3645.T","3646.T","3647.T","3656.T","3657.T","3664.T","3667.T","3671.T","3672.T","3674.T",
"3680.T","3681.T","3686.T","3719.T","3727.T","3739.T","3753.T","3758.T","3776.T","3777.T",
"3779.T","3807.T","3808.T","3810.T","3823.T","3825.T","3840.T","3845.T","3858.T","3903.T",
"3908.T","3909.T","3910.T","3911.T","3926.T","3928.T","3929.T","392A.T","3936.T","3940.T",
"3976.T","3985.T","3996.T","3998.T","4017.T","4052.T","408A.T","4093.T","4167.T","4169.T",
"4170.T","4176.T","4179.T","4192.T","4237.T","423A.T","4240.T","4260.T","4265.T","4308.T",
"4334.T","4344.T","4366.T","4370.T","4376.T","4392.T","4406.T","4422.T","4424.T","4427.T",
"4438.T","4448.T","4477.T","447A.T","4484.T","4487.T","448A.T","4512.T","451A.T","4531.T",
"4558.T","4563.T","4564.T","4571.T","4572.T","4574.T","4576.T","4582.T","4583.T","4584.T",
"4586.T","4591.T","4593.T","4594.T","4596.T","4597.T","4598.T","4599.T","4615.T","4650.T",
"4651.T","4678.T","4679.T","467A.T","4689.T","468A.T","4707.T","4714.T","4720.T","4735.T",
"4766.T","4767.T","4772.T","4777.T","4814.T","4829.T","4833.T","4845.T","4875.T","4881.T",
"4882.T","4883.T","4884.T","4888.T","4890.T","4891.T","4893.T","4918.T","4935.T","4936.T",
"4978.T","5010.T","5031.T","5074.T","5103.T","5129.T","5131.T","5133.T","5137.T","5216.T",
"5240.T","5244.T","5255.T","5269.T","5341.T","5342.T","5343.T","5563.T","5618.T","5658.T",
"5704.T","5721.T","5856.T","5928.T","5950.T","5952.T","5955.T","5986.T","6029.T","6031.T",
"6046.T","6049.T","6054.T","6059.T","6072.T","6081.T","6093.T","6096.T","6147.T","6173.T",
"6177.T","6181.T","6186.T","6195.T","6198.T","6276.T","6343.T","6347.T","6400.T","6428.T",
"6444.T","6464.T","6467.T","6472.T","6494.T","6495.T","6537.T","6538.T","6548.T","6552.T",
"6572.T","6573.T","6574.T","6579.T","6615.T","6619.T","6633.T","6634.T","6659.T","6662.T",
"6663.T","6664.T","6696.T","6721.T","6731.T","6740.T","6775.T","6776.T","6786.T","6803.T",
"6835.T","6837.T","6926.T","6955.T","6993.T","7022.T","7035.T","7041.T","7048.T","7063.T",
"7074.T","7078.T","7135.T","7138.T","7162.T","7183.T","7201.T","7211.T","7215.T","7238.T",
"7247.T","7256.T","7277.T","7354.T","7356.T","7359.T","7367.T","7445.T","7494.T","7524.T",
"7527.T","7538.T","7571.T","7578.T","7601.T","7602.T","7603.T","7610.T","7615.T","7624.T",
"7640.T","7692.T","7707.T","7709.T","7719.T","7771.T","7776.T","7779.T","7795.T","7803.T",
"7810.T","7815.T","7822.T","7831.T","7836.T","7837.T","7851.T","7859.T","7870.T","7883.T",
"7897.T","7908.T","7918.T","7919.T","7953.T","7992.T","8013.T","8077.T","8105.T","8107.T",
"8143.T","8165.T","8166.T","8202.T","8207.T","8209.T","8230.T","8247.T","8410.T","8518.T",
"8562.T","8705.T","8729.T","8783.T","8789.T","8798.T","8836.T","8887.T","8894.T","8897.T",
"8912.T","8918.T","8938.T","8944.T","8946.T","9160.T","9162.T","9204.T","9212.T","9229.T",
"9268.T","9327.T","9399.T","9417.T","9419.T","9423.T","9424.T","9432.T","9434.T","9439.T",
"9466.T","9514.T","9535.T","9557.T","9563.T","9610.T","9704.T","9760.T","9812.T","9816.T",
"9854.T","9876.T","9885.T","9904.T","9930.T","9969.T","9972.T","9973.T","9978.T","9980.T"
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
