document.addEventListener("DOMContentLoaded", () => {

/* ===========================
   ELEMENTS
=========================== */

const board = document.getElementById("board");
const addRowBtn = document.getElementById("addRowBtn");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");
const rocketBtn = document.getElementById("rocketBtn");
const rocketArea = document.getElementById("rocketArea");

const STORAGE_KEY = "adj_stock_board";

/* ===========================
   API SETTINGS
=========================== */

const API_KEY = "7f90ccb5f2mshdfa89c12f41b259p1ce25djsn72ddaa09eea5";
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
    localStorage.removeItem(STORAGE_KEY);
  }
};

rocketBtn.onclick = () => {
  runRocketScan();
};

/* ===========================
   ROW CREATE
=========================== */

function addRow(data={}){

const tr = document.createElement("tr");

tr.innerHTML = `
<td><input class="code" value="${data.code||""}" placeholder="7203.T"></td>
<td><input class="name" value="${data.name||""}"></td>
<td><input class="price" value="${data.price||""}" disabled></td>
<td><input class="change" value="${data.change||""}" disabled></td>
<td class="power">${data.power||"-"}</td>
<td class="flow">${data.flow||"0"}</td>
<td class="delta">${data.delta||"0"}</td>
<td class="star">${data.star||""}</td>
<td><button class="delBtn">✖</button></td>
`;

tr.querySelector(".delBtn").onclick = ()=>{
  tr.remove();
  save();
};

tr.querySelector(".code").addEventListener("change", async(e)=>{

const symbol = e.target.value.trim().toUpperCase();
if(!symbol) return;

const data = await fetchStock(symbol);
if(!data){ alert("取得失敗"); return; }

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);

/* 表示 */
tr.querySelector(".name").value   = data.name;
tr.querySelector(".price").value  = data.price.toFixed(2);
tr.querySelector(".change").value = data.change.toFixed(2);
tr.querySelector(".power").textContent = power.label;

/* FLOW */
const flowCell = tr.querySelector(".flow");
flowCell.textContent = flow;
applyFlowColor(flowCell, flow);

/* ΔFLOW */
const deltaCell = tr.querySelector(".delta");
deltaCell.textContent = flow;
applyDeltaColor(deltaCell, flow);

/* ⭐ */
tr.querySelector(".star").textContent =
  (power.label==="🚀+" && flow>=60) ? "⭐" : "";

judgeRow(tr);
save();

});

board.appendChild(tr);
return tr;
}

/* ===========================
   FETCH
=========================== */
if(!API_KEY){
  alert("APIキーが未設定です");
  return null;
}
   
async function fetchStock(symbol){

try{

const res = await fetch(
`https://yahoo-finance-real-time1.p.rapidapi.com/market/get-quotes?region=JP&symbols=${symbol}`,
{
method:"GET",
headers:{
"x-rapidapi-key": API_KEY,
"x-rapidapi-host": API_HOST
}
}
);

const j = await res.json();
const d = j.quoteResponse.result[0];

if(!d) return null;

return{
  name: d.shortName || d.longName || symbol,
  price: d.regularMarketPrice,
  change: d.regularMarketChangePercent,
  raw:{
    regularMarketPrice: d.regularMarketPrice,
    regularMarketChangePercent: d.regularMarketChangePercent,
    regularMarketVolume: d.regularMarketVolume,
    regularMarketDayHigh: d.regularMarketDayHigh,
    regularMarketDayLow: d.regularMarketDayLow,
    regularMarketOpen: d.regularMarketOpen
  }
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

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);

row.querySelector(".name").value = data.name;
row.querySelector(".price").value = data.price.toFixed(2);
row.querySelector(".change").value = data.change.toFixed(2);
row.querySelector(".power").textContent = power.label;

const flowCell=row.querySelector(".flow");
flowCell.textContent=flow;
applyFlowColor(flowCell,flow);

const deltaCell=row.querySelector(".delta");
deltaCell.textContent=flow;
applyDeltaColor(deltaCell,flow);

row.querySelector(".star").textContent =
  (power.label==="🚀+" && flow>=60) ? "⭐" : "";

judgeRow(row);
}

save();
}

/* ===========================
   JUDGE ROW COLOR
=========================== */

function judgeRow(row){

const change=parseFloat(row.querySelector(".change").value);
row.className="";

if(isNaN(change)) return;

if(change>=2){
row.classList.add("buy");
}
else if(change<=-2){
row.classList.add("sell");
}
else{
row.classList.add("wait");
}
}

/* ===========================
   SAVE / LOAD
=========================== */

function save(){

const data=[...document.querySelectorAll("#board tr")]
.map(r=>({
code:r.querySelector(".code").value,
name:r.querySelector(".name").value,
price:r.querySelector(".price").value,
change:r.querySelector(".change").value,
power:r.querySelector(".power").textContent,
flow:r.querySelector(".flow").textContent,
delta:r.querySelector(".delta").textContent,
star:r.querySelector(".star").textContent
}));

localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

function load(){

const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
saved.forEach(d=>addRow(d));
}

/* ===========================
   ROCKET POWER
=========================== */

function judgeRocketPower(d){

let score=0;

const price=d.regularMarketPrice;
const open=d.regularMarketOpen;
const high=d.regularMarketDayHigh;
const low=d.regularMarketDayLow;

const upper=high-price;
const body=Math.abs(price-open);

if(upper < body*0.5) score++;
if(d.regularMarketVolume>=1000000) score++;
if(d.regularMarketChangePercent>=5) score++;
if((price-low)/(high-low)>0.7) score++;

let label="🚀-";
if(score>=3) label="🚀+";
else if(score==2) label="🚀±";

return {label,score};
}

/* ===========================
   FLOW SCORE
=========================== */

function calcFlowScore(d){

let score=0;

const price=d.regularMarketPrice;
const high=d.regularMarketDayHigh;
const low=d.regularMarketDayLow;
const vol=d.regularMarketVolume;
const chg=d.regularMarketChangePercent;

if(vol>=1e6) score+=20;
if(vol>=2e6) score+=20;
if(vol>=4e6) score+=20;

const pos=(price-low)/(high-low);
if(pos>=0.6) score+=20;
if(pos>=0.8) score+=20;

if(chg>=3) score+=10;
if(chg>=6) score+=10;

return score;
}

/* ===========================
   COLOR
=========================== */

function applyFlowColor(cell,score){
let c="#334155";
if(score>=80) c="#ff3b30";
else if(score>=60) c="#ff9500";
else if(score>=40) c="#34c759";
else if(score>=20) c="#0a84ff";
cell.style.background=c;
cell.style.color="#fff";
cell.style.fontWeight="700";
}

function applyDeltaColor(cell,score){
applyFlowColor(cell,score);
}

/* ===========================
   ROCKET SCAN
=========================== */

async function runRocketScan(){

rocketArea.textContent="スキャン中...\n";

let result=[];

for(const code of LOW_PRICE_LIST){

const data = await fetchStock(code);
if(!data) continue;

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);

console.log(code, power.label, flow);

if(power.label !== "🚀-" && flow >= 20){
  result.push(
   `${code} | ${data.name} | ${data.price.toFixed(1)}円 | ${power.label} | FLOW:${flow}`
  );
}
   
// API負荷軽減
await new Promise(r=>setTimeout(r,300));

}

if(result.length===0){
  rocketArea.textContent="該当なし";
}else{
  rocketArea.textContent=result.join("\n");
}

}
});
