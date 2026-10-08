let T=[],L=[];
const tabs=["順位表","リーダーズ","チーム比較"];let tab=0,sk="p",sd=-1,A="",B="";
const $=s=>document.getElementById(s);
let rank=[];
function nav(){$("nav").innerHTML=tabs.map((t,i)=>`<button class="${i==tab?"on":""}" onclick="tab=${i};render()">${t}</button>`).join("")}
function standings(){
 const rows=[...T].sort((a,b)=>sd*(a[sk]-b[sk])||b.p-a.p||b.gd-a.gd);
 const th=(k,l)=>`<th class="${sk==k?"s":""}" onclick="sk='${k}';sd=${sk==k?-sd:-1};render()">${l}${sk==k?(sd<0?"▼":"▲"):""}</th>`;
 const hr=x=>x.join("-");
 return `<div class="card scroll"><table><tr><th class="pos">#</th><th>クラブ</th>${th("g","試")}${th("w","勝")}${th("d","分")}${th("l","敗")}${th("gf","得")}${th("ga","失")}${th("gd","差")}${th("p","勝点")}<th>直近5試合</th><th>H</th><th>A</th></tr>
 ${rows.map(t=>{const r=rank.indexOf(t.c)+1;return `<tr><td class="pos ${r<=2?"z1":r<=5?"z2":r>=18?"z3":""}">${r}</td><td><b>${t.n}</b></td><td>${t.g}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf}</td><td>${t.ga}</td><td>${t.gd>0?"+":""}${t.gd}</td><td><b>${t.p}</b></td><td><span class="form">${[...t.f].map(x=>`<i class="${x=="W"?"W":x=="D"?"D":"L"}">${{W:"勝",D:"分",L:"敗"}[x]}</i>`).join("")}</span></td><td>${hr(t.h)}</td><td>${hr(t.a)}</td></tr>`}).join("")}</table>
 <div class="legend"><span><b style="background:var(--ac)"></b>ACLE出場枠</span><span><b style="background:var(--ac2)"></b>ACLE出場の可能性あり</span><span><b style="background:#d9534f"></b>降格圏</span><span>直近5試合は新しい順 / H・A=ホーム・アウェイ(勝-分-敗)</span><span>見出しクリックで並び替え</span></div></div>`}
function leaders(){
 return `<div class="lg">${L.map(([t,u,r])=>`<div class="card"><div style="color:var(--mu);font-size:.8rem;margin-bottom:6px">${t}</div>${r.map((x,i)=>`<div class="m2"><span>${i+1}</span><span><b>${x[0]}</b><br><small style="color:var(--mu)">${x[1]}</small></span><b class="v">${x[2]}${u}</b></div>`).join("")}</div>`).join("")}</div>`}
function compare(){
 const a=T.find(t=>t.c==A),b=T.find(t=>t.c==B);
 const st=[["勝点","p"],["得点","gf"],["失点","ga"],["得失点差","gd"],["勝利数","w"]];
 const opt=s=>T.map(t=>`<option value="${t.c}" ${t.c==s?"selected":""}>${t.n}</option>`).join("");
 const avg=(t,k)=>(t[k]/t.g).toFixed(2);
 return `<div class="row"><select onchange="A=this.value;render()">${opt(A)}</select><select onchange="B=this.value;render()">${opt(B)}</select></div>
 <div class="card"><div class="bar"><b style="text-align:right">${a.n}</b><span></span><b>${b.n}</b></div>
 ${st.map(([l,k])=>{const m=Math.max(Math.abs(a[k]),Math.abs(b[k]),1);return `<div class="bar"><div class="l"><b>${a[k]}</b><div class="track"><div class="f" style="width:${Math.abs(a[k])/m*100}%"></div></div></div><div class="t">${l}</div><div class="r"><div class="track"><div class="f" style="width:${Math.abs(b[k])/m*100}%"></div></div><b>${b[k]}</b></div></div>`}).join("")}
 <div class="bar"><b style="text-align:right">${avg(a,"gf")}</b><div class="t">1試合得点</div><b>${avg(b,"gf")}</b></div>
 <div class="bar"><b style="text-align:right">${avg(a,"ga")}</b><div class="t">1試合失点</div><b>${avg(b,"ga")}</b></div>
 <div class="bar"><b style="text-align:right">${a.h.join("-")}</b><div class="t">ホーム</div><b>${b.h.join("-")}</b></div>
 <div class="bar"><b style="text-align:right">${a.a.join("-")}</b><div class="t">アウェイ</div><b>${b.a.join("-")}</b></div></div>`}
function render(){nav();$("v").innerHTML=[standings,leaders,compare][tab]()}
async function load(){
  try{
    const r=await fetch("data.json?"+Date.now());
    if(!r.ok)throw new Error("HTTP "+r.status);
    const d=await r.json();
    T=d.teams.map(a=>({...a,p:a.w*3+a.d,g:a.w+a.d+a.l,gd:a.gf-a.ga}));
    rank=[...T].sort((a,b)=>b.p-a.p||b.gd-a.gd||b.gf-a.gf).map(t=>t.c);
    L=[["ゴール","点",d.goals],["アシスト","本",d.assists]].filter(x=>x[2]&&x[2].length);
    A=T[0].c;B=T[1].c;
    $("note").textContent="最終更新: "+d.updated+" ／ データ提供: API-Football";
    render();
  }catch(e){
    $("v").innerHTML='<div class="card">データを読み込めませんでした（'+e.message+'）。ファイルを直接開いている場合は、フォルダ内で「python -m http.server」を実行し、http://localhost:8000 を開いてください。</div>';
  }
}
load();
