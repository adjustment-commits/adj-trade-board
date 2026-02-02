/* ===========================
   ELEMENTS
=========================== */

const board = document.getElementById("board");
const addRowBtn = document.getElementById("addRowBtn");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");

const STORAGE_KEY = "adj_stock_board";

/* ===========================
   API SETTINGS
=========================== */

const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

/* ===========================
   INIT
=========================== */

load();

/* ===========================
   BUTTONS
=========================== */

addRowBtn.onclick = () => {
  addRow();
  save();
};

refreshBtn.onclick = () => {
  updateAllRows();
};

clearBtn.onclick = () => {
  if(confirm("全削除しますか？")){
    board.innerHTML = "";
    save();
  }
};

/* ===========================
   ROW CREATE
=========================== */

function addRow(data = {}) {

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="code" value="${data.code || ""}" placeholder="7203.T"></td>
    <td><input class="name" value="${data.name || ""}" disabled></td>
    <td><input class="price" value="${data.price || ""}" disabled></td>
    <td><input class="volume" value="${data.volume || ""}" disabled></td>
    <td><input class="change" value="${data.change || ""}" disabled></td>
    <td class="status">-</td>
    <td><button class="delBtn">✖</button></td>
  `;

  /* 削除 */
  tr.querySelector(".delBtn").onclick = () => {
    tr.remove();
    save();
  };

  /* コード入力 → 自動取得 */

  let timer=null;
  const codeInput = tr.querySelector(".code");

  codeInput.addEventListener("input",()=>{
    clearTimeout(timer);
    timer=setTimeout(async ()=>{
      const symbol = codeInput.value.trim().toUpperCase();
      if(symbol.length<4) return;

      const data = await fetchStock(symbol);
      if(!data){
        tr.querySelector(".status").textContent="×";
        return;
      }

      fillRow(tr,data);
      save();
    },600);
  });

  board.appendChild(tr);
}

/* ===========================
   FETCH ONE STOCK
=========================== */

async function fetchStock(symbol){

  try{
    const url =
      `https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbol}`;

    const res = await fetch(url,{
      headers:{
        "x-rapidapi-key":API_KEY,
        "x-rapidapi-host":API_HOST
      }
    });

    const json = await res.json();
    const d = json.quoteResponse?.result?.[0];
    if(!d) return null;

    return {
      name: d.longName || d.shortName || "-",
      price: d.regularMarketPrice?.toFixed(2) || "-",
      volume: d.regularMarketVolume || "-",
      change: d.regularMarketChangePercent?.toFixed(2) || "-"
    };

  }catch(e){
    console.error(e);
    return null;
  }
}

/* ===========================
   UPDATE ALL
=========================== */

async function updateAllRows(){

  const rows=document.querySelectorAll("#board tr");

  for(const row of rows){

    const code=row.querySelector(".code").value.trim();
    if(!code) continue;

    const data=await fetchStock(code);
    if(!data) continue;

    fillRow(row,data);
  }

  save();
}

/* ===========================
   FILL ROW
=========================== */

async function fillRow(row,data){

  row.querySelector(".name").value = data.name;
  row.querySelector(".price").value = data.price;
  row.querySelector(".volume").value = formatVolume(data.volume);
  row.querySelector(".change").value = data.change;

  const symbol = row.querySelector(".code").value.trim();

  const avgVol = await fetchAvgVolume(symbol);

  let spike = 0;
  if(avgVol && data.volume){
    spike = data.volume / avgVol;
  }

  judgeRow(row, spike);
}

/* ===========================
   JUDGE
=========================== */

function judgeRow(row, spike = 0){

  const change = parseFloat(row.querySelector(".change").value);
  row.className="";

  if(isNaN(change)){
    row.querySelector(".status").textContent="-";
    return;
  }

  // 🚀 ロケット条件
  if(change >= 2 && spike >= 2){
    row.classList.add("rocket");
    row.querySelector(".status").textContent="🚀";
  }
  // 出来高だけ急増
  else if(spike >= 2){
    row.classList.add("spike");
    row.querySelector(".status").textContent="📈";
  }
  // 下落
  else if(change <= -2){
    row.classList.add("sell");
    row.querySelector(".status").textContent="🔥";
  }
  // それ以外
  else{
    row.classList.add("wait");
    row.querySelector(".status").textContent="🫷";
  }
}

/* ===========================
   VOLUME FORMAT
=========================== */

function formatVolume(v){

  if(!v || isNaN(v)) return "-";

  if(v>=1000000) return (v/1000000).toFixed(1)+"M";
  if(v>=1000) return (v/1000).toFixed(1)+"K";
  return v;
}

/* ===========================
   SAVE
=========================== */

function save(){

  const data=[...document.querySelectorAll("#board tr")]
  .map(r=>({
    code:r.querySelector(".code").value,
    name:r.querySelector(".name").value,
    price:r.querySelector(".price").value,
    volume:r.querySelector(".volume").value,
    change:r.querySelector(".change").value
  }));

  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

/* ===========================
   LOAD
=========================== */

function load(){

  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  saved.forEach(d=>addRow(d));
}

/* ===========================
   FETCH AVG VOLUME (10DAY)
=========================== */

async function fetchAvgVolume(symbol){

  try{
    const url =
      `https://${API_HOST}/stock/v2/get-summary?symbol=${symbol}`;

    const res = await fetch(url,{
      headers:{
        "x-rapidapi-key":API_KEY,
        "x-rapidapi-host":API_HOST
      }
    });

    const json = await res.json();
    return json.summaryDetail?.averageDailyVolume10Day?.raw || null;

  }catch(e){
    console.error(e);
    return null;
  }
}

/* ===========================
   ROCKET SCANNER
=========================== */

const rocketBtn = document.getElementById("rocketBtn");
const rocketArea = document.getElementById("rocketArea");

rocketBtn.onclick = async ()=>{

  rocketArea.innerHTML = "スキャン中...<br>";

  const CHUNK = 30;
  let rockets = [];

  for(let i=0;i<LOW_PRICE_LIST.length;i+=CHUNK){

    const part = LOW_PRICE_LIST.slice(i,i+CHUNK);

    try{

      const url =
        `https://${API_HOST}/market/get-quotes?region=JP&symbols=${part.join(",")}`;

      const res = await fetch(url,{
        headers:{
          "x-rapidapi-key":API_KEY,
          "x-rapidapi-host":API_HOST
        }
      });

      const json = await res.json();
      const list = json.quoteResponse?.result || [];

      for(const d of list){

        if(d.regularMarketChangePercent < 2) continue;

        const avgVol = await fetchAvgVolume(d.symbol);
        if(!avgVol) continue;

        const spike = d.regularMarketVolume / avgVol;

        if(spike >= 2){

          rockets.push({
            symbol: d.symbol,
            name: d.longName || d.shortName || "-",
            price: d.regularMarketPrice,
            change: d.regularMarketChangePercent,
            spike: spike
          });

        }

      }

    }catch(e){
      console.error(e);
    }

  }

  if(rockets.length===0){
    rocketArea.innerHTML="ロケット候補なし";
    return;
  }

  rockets.sort((a,b)=>b.spike-a.spike);

  rocketArea.innerHTML = "";

  rockets.forEach(r=>{
    rocketArea.innerHTML +=
      `🚀 ${r.symbol} ${r.name}  
価格:${r.price}  
前日比:${r.change.toFixed(2)}%  
出来高倍率:${r.spike.toFixed(2)}倍  
---------------------<br>`;
  });

};
