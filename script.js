alert("JS LOADED");
console.log("scanBtn:", document.getElementById("scanBtn"));
console.log("refreshBtn:", document.getElementById("refreshBtn"));
/*********************************
 ADJ TRADE BOARD - FULL JS
*********************************/

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

if(!localStorage.getItem(PW_KEY)){
  pwMsg.textContent="新しいパスワードを設定してください";
}else{
  pwMsg.textContent="パスワードを入力してください";
}

pwBtn.onclick = ()=>{
  const input = pwInput.value.trim();
  if(!input) return;

  if(!localStorage.getItem(PW_KEY)){
    localStorage.setItem(PW_KEY,input);
  }

  if(input === localStorage.getItem(PW_KEY)){
    lockScreen.style.display="none";
    app.style.display="block";
    headerEl.style.display="block";
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
"2134.T","2315.T","2330.T","2345.T","2370.T",
"2687.T","2929.T","3031.T","3070.T","3315.T",
"3521.T","3664.T","3823.T","3907.T","4180.T",
"4594.T","4764.T","5017.T","5955.T","6298.T",
"6335.T","6731.T","6993.T","7527.T","7615.T",
"7777.T","8013.T","8202.T","8411.T","8746.T",
"8894.T","9424.T","9878.T"
];

/* ===========================
   API FETCH
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
  return json.quoteResponse?.result || [];
}

/* ===========================
   SCANNER
=========================== */

const scanBtn = document.getElementById("scanBtn");

scanBtn.onclick = async ()=>{

  clearBoard();

  const data = await fetchQuotes(LOW_PRICE_LIST);

  const result = data.filter(d=>{
    return d.regularMarketPrice <= 300 &&
           d.regularMarketVolume >= 300000;
  }).slice(0,20);

  result.forEach(d=>{
    insertSymbolToBoard(d.symbol);
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
    if(pct>=2){row.querySelector(".status").textContent="🚀";}
    else if(pct<=-2){row.querySelector(".status").textContent="🔥";}
    else if(pct>=1){row.querySelector(".status").textContent="✨";}
    else{row.querySelector(".status").textContent="🫷";}

    const entry=parseFloat(row.querySelector(".entry").value);
    if(entry){
      row.querySelector(".tp").textContent=(entry*1.02).toFixed(2);
      row.querySelector(".sl").textContent=(entry*0.99).toFixed(2);
      row.querySelector(".diff").textContent=
        (((d.regularMarketPrice-entry)/entry)*100).toFixed(1)+"%";
    }
  });

  saveBoard();
}

refreshBtn.onclick=refresh;

/* ===========================
   INSERT / SAVE / CLEAR
=========================== */

function insertSymbolToBoard(symbol){
  const inputs=[...document.querySelectorAll(".symbol")];
  if(inputs.some(i=>i.value===symbol)) return;
  const empty=inputs.find(i=>i.value==="");
  if(empty) empty.value=symbol;
}

function saveBoard(){
  const data=[...document.querySelectorAll("#rows tr")].map(tr=>({
    symbol:tr.querySelector(".symbol").value,
    entry:tr.querySelector(".entry").value,
    note:tr.querySelector(".note").value
  }));
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

function clearBoard(){
  document.querySelectorAll("#rows tr").forEach(row=>{
    row.querySelectorAll("input").forEach(i=>i.value="");
    row.querySelectorAll("td").forEach(td=>td.textContent="-");
    row.querySelector(".status").textContent="🫷";
    row.className="";
  });
  saveBoard();
}

document.getElementById("clearBtn").onclick=()=>{
  if(confirm("ボードを全削除しますか？")){
    clearBoard();
  }
};

/* ===========================
   DELETE
=========================== */

document.addEventListener("click",e=>{
  if(!e.target.classList.contains("delBtn")) return;
  const row=e.target.closest("tr");
  row.querySelectorAll("input").forEach(i=>i.value="");
  row.querySelectorAll("td").forEach(td=>td.textContent="-");
  row.querySelector(".status").textContent="🫷";
  row.className="";
  saveBoard();
});
