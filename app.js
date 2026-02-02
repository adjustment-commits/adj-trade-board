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

const API_KEY = "ここにあなたのRapidAPIキー";
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
    <td><input class="change" value="${data.change || ""}" disabled></td>
    <td class="status">-</td>
    <td><button class="delBtn">✖</button></td>
  `;

  /* 削除 */
  tr.querySelector(".delBtn").onclick = () => {
    tr.remove();
    save();
  };

  /* コード入力 → 取得 */
  tr.querySelector(".code").addEventListener("change", async (e)=>{
    const symbol = e.target.value.trim().toUpperCase();
    if(!symbol) return;

    const data = await fetchStock(symbol);
    if(!data){
      alert("取得失敗");
      return;
    }

    tr.querySelector(".name").value = data.name;
    tr.querySelector(".price").value = data.price;
    tr.querySelector(".change").value = data.change;

    judgeRow(tr);
    save();
  });

  board.appendChild(tr);
}

/* ===========================
   FETCH ONE STOCK
=========================== */

async function fetchStock(symbol){

  try{
    const url = `https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbol}`;

    const res = await fetch(url,{
      headers:{
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST
      }
    });

    const json = await res.json();
    const d = json.quoteResponse?.result?.[0];
    if(!d) return null;

    return {
      name: d.longName || d.shortName || "-",
      price: d.regularMarketPrice?.toFixed(2) || "-",
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

  const rows = document.querySelectorAll("#board tr");

  for(const row of rows){

    const code = row.querySelector(".code").value.trim();
    if(!code) continue;

    const data = await fetchStock(code);
    if(!data) continue;

    row.querySelector(".name").value = data.name;
    row.querySelector(".price").value = data.price;
    row.querySelector(".change").value = data.change;

    judgeRow(row);
  }

  save();
}

/* ===========================
   JUDGE
=========================== */

function judgeRow(row){

  const change = parseFloat(row.querySelector(".change").value);
  row.className = "";

  if(isNaN(change)){
    row.querySelector(".status").textContent = "-";
    return;
  }

  if(change >= 2){
    row.classList.add("buy");
    row.querySelector(".status").textContent = "🚀";
  }
  else if(change <= -2){
    row.classList.add("sell");
    row.querySelector(".status").textContent = "🔥";
  }
  else{
    row.classList.add("wait");
    row.querySelector(".status").textContent = "🫷";
  }
}

/* ===========================
   SAVE
=========================== */

function save(){

  const data = [...document.querySelectorAll("#board tr")]
    .map(r=>({
      code: r.querySelector(".code").value,
      name: r.querySelector(".name").value,
      price: r.querySelector(".price").value,
      change: r.querySelector(".change").value
    }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ===========================
   LOAD
=========================== */

function load(){

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  saved.forEach(d => addRow(d));
}
