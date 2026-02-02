const board = document.getElementById("board");
const addRowBtn = document.getElementById("addRowBtn");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");

const STORAGE_KEY = "adj_simple_board";

/* -------------------
 初期化
------------------- */

load();

/* -------------------
 行追加
------------------- */

addRowBtn.onclick = () => {
  addRow();
  save();
};

/* -------------------
 更新
------------------- */

refreshBtn.onclick = () => {
  calculate();
  save();
};

/* -------------------
 全削除
------------------- */

clearBtn.onclick = () => {
  if(confirm("全削除しますか？")){
    board.innerHTML="";
    save();
  }
};

/* -------------------
 行作成
------------------- */

function addRow(data={}){

  const tr=document.createElement("tr");

  tr.innerHTML=`
    <td><input class="code" value="${data.code||""}"></td>
    <td><input class="name" value="${data.name||""}"></td>
    <td><input class="price" value="${data.price||""}"></td>
    <td><input class="change" value="${data.change||""}"></td>
    <td class="status">-</td>
    <td><button class="delBtn">✖</button></td>
  `;

  tr.querySelector(".delBtn").onclick=()=>{
    tr.remove();
    save();
  };

  board.appendChild(tr);
}

/* -------------------
 判定
------------------- */

function calculate(){

  document.querySelectorAll("#board tr").forEach(row=>{

    const change = parseFloat(
      row.querySelector(".change").value
    );

    row.className="";

    if(isNaN(change)) return;

    if(change>=2){
      row.classList.add("buy");
      row.querySelector(".status").textContent="🚀";
    }
    else if(change<=-2){
      row.classList.add("sell");
      row.querySelector(".status").textContent="🔥";
    }
    else{
      row.classList.add("wait");
      row.querySelector(".status").textContent="🫷";
    }
  });

}

/* -------------------
 保存
------------------- */

function save(){

  const data=[...document.querySelectorAll("#board tr")]
  .map(row=>({

    code: row.querySelector(".code").value,
    name: row.querySelector(".name").value,
    price: row.querySelector(".price").value,
    change: row.querySelector(".change").value

  }));

  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

/* -------------------
 復元
------------------- */

function load(){

  const saved=JSON.parse(
    localStorage.getItem(STORAGE_KEY)||"[]"
  );

  saved.forEach(d=>addRow(d));
}
