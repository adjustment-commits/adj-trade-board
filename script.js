/*************************************************
 * 初期非表示（ロック解除までUIを隠す）
 *************************************************/
const app = document.getElementById("app");
const headerEl = document.querySelector("header");
app.style.display = "none";
headerEl.style.display = "none";

/*************************************************
 * PASSWORD LOCK
 *************************************************/
const PW_KEY = "adj_trade_password";

const lockScreen = document.getElementById("lockScreen");
const pwInput = document.getElementById("pwInput");
const pwBtn = document.getElementById("pwBtn");
const pwMsg = document.getElementById("pwMsg");

// 初期メッセージ
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

  // 初回登録
  if(!localStorage.getItem(PW_KEY)){
    localStorage.setItem(PW_KEY,input);
    lockScreen.style.display="none";
    app.style.display="flex";
    headerEl.style.display="flex";
    return;
  }

  // 照合
  if(input === localStorage.getItem(PW_KEY)){
    lockScreen.style.display="none";
    app.style.display="flex";
    headerEl.style.display="flex";
  }else{
    pwMsg.textContent="パスワードが違います";
  }
};

/*************************************************
 * SETTINGS
 *************************************************/
const openSettingsBtn = document.getElementById("openSettings");
const closeSettingsBtn = document.getElementById("closeSettings");
const settingsPanel = document.getElementById("settingsPanel");

const currentPw = document.getElementById("currentPw");
const newPw = document.getElementById("newPw");
const changePwBtn = document.getElementById("changePwBtn");
const settingsMsg = document.getElementById("settingsMsg");

openSettingsBtn.onclick = ()=>{
  settingsPanel.style.display="flex";
};

closeSettingsBtn.onclick = ()=>{
  settingsPanel.style.display="none";
  currentPw.value="";
  newPw.value="";
  settingsMsg.textContent="";
};

changePwBtn.onclick = ()=>{
  const now = localStorage.getItem(PW_KEY);
  if(currentPw.value !== now){
    settingsMsg.textContent="現在のパスワードが違います";
    return;
  }
  if(newPw.value.length < 4){
    settingsMsg.textContent="4文字以上にしてください";
    return;
  }
  localStorage.setItem(PW_KEY,newPw.value);
  settingsMsg.textContent="変更しました";
};

/*************************************************
 * API SETTINGS
 *************************************************/
const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

const LOW_PRICE_LIST = [
"2134.T","2315.T","2330.T","2345.T","2370.T",
"2687.T","2929.T","3031.T","3070.T","3315.T",
"3521.T","3664.T","3823.T","3907.T","4180.T",
"4594.T","4764.T","5017.T","5955.T","6298.T",
"6335.T","6731.T","6993.T","7527.T","7615.T",
"7777.T","8013.T","8202.T","8411.T","8746.T",
"8894.T","9424.T","9878.T"
];

const STORAGE_KEY = "adj_trade_board";

/*************************************************
 * MODE SWITCH
 *************************************************/
let scanMode="short";

const modeLabel = document.getElementById("scanModeLabel");
const modeShortBtn = document.getElementById("modeShort");
const modeLongBtn  = document.getElementById("modeLong");

function setMode(mode){
  scanMode=mode;
  modeLabel.textContent="MODE : "+mode.toUpperCase();
  modeShortBtn.classList.remove("active");
  modeLongBtn.classList.remove("active");
  if(mode==="short") modeShortBtn.classList.add("active");
  if(mode==="long") modeLongBtn.classList.add("active");
}
modeShortBtn.onclick=()=>setMode("short");
modeLongBtn.onclick =()=>setMode("long");
setMode("short");

/*************************************************
 * BUILD ROWS
 *************************************************/
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

/*************************************************
 * FETCH
 *************************************************/
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

/*************************************************
 * CANDLE SCORE
 *************************************************/
function candleScore(d){
const o=d.regularMarketOpen;
const h=d.regularMarketDayHigh;
const l=d.regularMarketDayLow;
const c=d.regularMarketPrice;
if(!o||!h||!l||!c) return 0;

let s=0;
const body=Math.abs(c-o);
const range=h-l;
const wick=Math.min(o,c)-l;

if(c>o) s++;
if(body/range>=0.3) s++;
if(wick/range>=0.25) s++;
return s;
}

/*************************************************
 * STAR SCORE
 *************************************************/
function calcStars(d){
let s=0;
if(scanMode==="short"){
 if(d.regularMarketChangePercent>=2) s++;
 if(d.regularMarketChangePercent>=5) s++;
 if(d.regularMarketVolume>=1000000) s++;
 if(d.regularMarketVolume>=3000000) s++;
 if(candleScore(d)>=2) s++;
}else{
 if(d.regularMarketPrice<=300) s++;
 if(d.regularMarketVolume>=500000) s++;
 if(d.regularMarketChangePercent>-2 &&
    d.regularMarketChangePercent<2) s++;
 if(d.regularMarketChangePercent>0) s++;
}
return "★".repeat(s);
}

/*************************************************
 * REFRESH BOARD
 *************************************************/
async function refresh(){
const inputs=[...document.querySelectorAll(".symbol")];
const symbols=inputs.map(i=>i.value.trim()).filter(v=>v);
if(!symbols.length) return;

const data=await fetchQuotes(symbols);

inputs.forEach(input=>{
const row=input.closest("tr");
const d=data.find(x=>x.symbol===input.value.toUpperCase());
if(!d) return;

row.querySelector(".price").textContent=d.regularMarketPrice.toFixed(2);
row.querySelector(".change").textContent=d.regularMarketChangePercent.toFixed(2)+"%";
row.querySelector(".name").textContent=d.shortName||"-";

const pct=d.regularMarketChangePercent;
row.className="";
if(pct>=2){row.classList.add("buy");row.querySelector(".status").textContent="🚀";}
else if(pct<=-2){row.classList.add("sl");row.querySelector(".status").textContent="🔥";}
else if(pct>=1){row.classList.add("tp");row.querySelector(".status").textContent="✨";}
else{row.classList.add("wait");row.querySelector(".status").textContent="🫷";}

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

/*************************************************
 * SAVE
 *************************************************/
function saveBoard(){
const data=[...document.querySelectorAll("#rows tr")].map(tr=>({
symbol:tr.querySelector(".symbol").value,
entry:tr.querySelector(".entry").value,
note:tr.querySelector(".note").value
}));
localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

/*************************************************
 * SCANNER
 *************************************************/
const scanBtn=document.getElementById("scanBtn");
const scannerList=document.getElementById("scannerList");

scanBtn.onclick=async()=>{
scannerList.innerHTML="スキャン中...";
const data=await fetchQuotes(LOW_PRICE_LIST);

let rockets=data.filter(d=>{
if(scanMode==="short"){
return d.regularMarketPrice<=300 &&
d.regularMarketChangePercent>=2 &&
d.regularMarketVolume>=1000000 &&
candleScore(d)>=2;
}else{
return d.regularMarketPrice<=300 &&
d.regularMarketVolume>=500000;
}
});

rockets.sort((a,b)=>calcStars(b).length-calcStars(a).length);
scannerList.innerHTML="";

rockets.forEach(d=>{
const div=document.createElement("div");
div.className="scanItem";
div.innerHTML=`
<div>${d.symbol}</div>
<div>${d.shortName||""}</div>
<div>🚀 ${calcStars(d)}</div>
`;
div.onclick=()=>insertSymbolToBoard(d.symbol);
scannerList.appendChild(div);
});
};

/*************************************************
 * INSERT
 *************************************************/
function insertSymbolToBoard(symbol){
const inputs=[...document.querySelectorAll(".symbol")];
if(inputs.some(i=>i.value===symbol)) return;
const empty=inputs.find(i=>!i.value);
if(empty){empty.value=symbol;refresh();}
}

/*************************************************
 * DELETE
 *************************************************/
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

/*************************************************
 * THEME
 *************************************************/
const THEME_KEY="adj_theme";
const themeBtns=document.querySelectorAll(".themeBtn");
document.body.className=localStorage.getItem(THEME_KEY)||"dark";

themeBtns.forEach(btn=>{
btn.onclick=()=>{
document.body.className=btn.dataset.theme;
localStorage.setItem(THEME_KEY,btn.dataset.theme);
};
});

/* ============================
   画像アップロード
============================ */

const patternInput = document.getElementById("patternImage");
const previewImage = document.getElementById("previewImage");

patternInput.onchange = () => {
  const file = patternInput.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e=>{
    previewImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
};
