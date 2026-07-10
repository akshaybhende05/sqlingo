let dbReady=false, SQLDB=null;
const SEED=`
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, joined TEXT);
INSERT INTO customers VALUES
 (1,'Aarav Sharma','Mumbai','2024-01-12'),(2,'Priya Patel','Delhi','2024-02-03'),
 (3,'Rohan Mehta','Pune','2024-02-20'),(4,'Sneha Reddy','Bangalore','2024-03-15'),
 (5,'Vikram Nair','Mumbai','2024-04-01'),(6,'Ananya Iyer','Delhi','2024-05-22'),
 (7,'Karan Joshi','Pune','2024-06-10');
CREATE TABLE restaurants (id INTEGER PRIMARY KEY, name TEXT, city TEXT, cuisine TEXT, rating REAL, cost_for_two INTEGER);
INSERT INTO restaurants VALUES
 (1,'Domino''s','Mumbai','Pizza',4.8,500),(2,'McDonald''s','Delhi','Burgers',4.5,400),
 (3,'Burger King','Pune','Burgers',4.1,450),(4,'KFC','Bangalore','Fried Chicken',4.3,600),
 (5,'Subway','Mumbai','Sandwiches',4.0,350),(6,'Behrouz Biryani','Delhi','Biryani',4.6,700);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, restaurant_id INTEGER, amount INTEGER, order_date TEXT, rating_given INTEGER);
INSERT INTO orders VALUES
 (1,1,1,520,'2024-06-01',5),(2,1,5,360,'2024-06-03',4),(3,2,2,410,'2024-06-05',NULL),
 (4,3,3,460,'2024-06-07',3),(5,4,4,610,'2024-06-09',5),(6,5,1,540,'2024-06-11',NULL),
 (7,2,6,720,'2024-06-13',4),(8,1,1,500,'2024-06-15',5),(9,6,2,420,'2024-06-17',NULL),(10,3,6,690,'2024-06-19',4);
`;
initSqlJs({ locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}` })
 .then(SQL=>{ SQLDB=new SQL.Database(); SQLDB.run(SEED); dbReady=true; document.getElementById('loader').style.display='none'; computeTotals(); go('00'); })
 .catch(()=>{ document.getElementById('loader').innerHTML='<p style="color:var(--rose)">Could not load the SQL engine. Check your connection and refresh.</p>'; });

function runSQL(raw){
  const q=raw.trim().replace(/;+\s*$/,'');
  if(!q) return {error:"Nothing to run yet. Write a query first."};
  if(!dbReady) return {error:"Database is still loading, give it a second."};
  try{ const r=SQLDB.exec(q); if(!r.length) return {cols:[],rows:[]}; return {cols:r[0].columns, rows:r[0].values}; }
  catch(e){ return {error:friendly(e.message)}; }
}
function friendly(m){
  if(/no such table/i.test(m)) return m.replace(/.*no such table:\s*/i,'There is no table called "')+'". Tables here: customers, restaurants, orders.';
  if(/no such column/i.test(m)) return m.replace(/.*no such column:\s*/i,'There is no column called "')+'". Check the spelling.';
  if(/syntax error/i.test(m)) return 'There is a grammar slip somewhere. Check commas, quotes and the order of words.';
  return m;
}

const glossary={
  database:{short:"An organised store of information a computer can search fast.",long:"A <b>database</b> is a very tidy filing cabinet. Instead of paper in folders it keeps data in tables. Swiggy, your bank app, your office portal, all sit on one quietly."},
  query:{short:"One request you send to the database.",long:"A <b>query</b> is a single question written in SQL, like 'give me the names of Mumbai customers'. You write it, the database reads it, and it hands back a grid of results."},
  table:{short:"A grid of data, like one sheet in Excel.",long:"A <b>table</b> holds one kind of thing, with columns across the top and rows down the side, exactly like an Excel sheet."},
  column:{short:"One kind of detail, running top to bottom.",long:"A <b>column</b> is one piece of information stored for every row, like 'city' or 'rating'."},
  row:{short:"One complete record, running left to right.",long:"A <b>row</b> is one full entry in a table, one customer, one restaurant, one order, with a value in each column."},
  keyword:{short:"A reserved word SQL treats as a command.",long:"A <b>keyword</b> is a word SQL understands as an instruction, like SELECT or FROM. People capitalise them by habit so they stand out, though SQL does not require it."},
  expression:{short:"A small calculation SQL works out for each row.",long:"An <b>expression</b> is a bit of arithmetic, like cost_for_two / 2. SQL computes it per row and shows the result as if it were a column."},
  alias:{short:"A temporary nicer name for a column.",long:"An <b>alias</b>, set with AS, renames a column just for that query's output. Handy for making results readable."},
  duplicate:{short:"A row or value that repeats.",long:"A <b>duplicate</b> is simply the same value appearing more than once. Two customers both from Mumbai means 'Mumbai' shows up twice if you list every row."},
  clause:{short:"One named part of a SQL statement.",long:"A <b>clause</b> is a section of a query with its own keyword and job, like the WHERE clause (filtering) or the FROM clause (which table). A query is built by stacking clauses in a fixed order."},
  condition:{short:"A test that is either true or false for a row.",long:"A <b>condition</b> is a yes/no test, like rating > 4.5. WHERE keeps only the rows for which the condition comes out true."},
  operator:{short:"A symbol that compares or combines values.",long:"An <b>operator</b> is a symbol like =, >, or <. It compares two values and gives back true or false, which is exactly what WHERE needs."},
  join:{short:"Combining rows from two tables by a matching column.",long:"A <b>join</b> stitches two tables together wherever a value matches, like linking each order to its customer through customer_id. It is how data that was split across tables gets brought back together."},
  foreign_key:{short:"A column that points to a row in another table.",long:"A <b>foreign key</b> is a column holding another table's id, like orders.customer_id pointing at customers.id. It is the thread a join follows."},
  subquery:{short:"A query written inside another query.",long:"A <b>subquery</b> is a SELECT tucked inside another statement, often in the WHERE or FROM. The inner query runs first and its result feeds the outer one, letting you compare against a computed value or a list."},
  view:{short:"A saved query you can use like a table.",long:"A <b>view</b> is a stored SELECT given a name. Querying the view runs its SELECT underneath, so you can reuse a complex query as if it were a simple table. It holds no data of its own."},
  index:{short:"A lookup structure that speeds up searches.",long:"An <b>index</b> is like the index at the back of a book: it lets the database jump straight to matching rows instead of scanning everything. It speeds reads but adds a little cost to writes."},
  constraint:{short:"A rule the data in a column must obey.",long:"A <b>constraint</b> is a rule enforced by the database, such as NOT NULL (must have a value) or UNIQUE (no repeats). Constraints keep bad data out at the source."},
  primary_key:{short:"The column that uniquely identifies each row.",long:"A <b>primary key</b> is the column whose value is unique for every row, like id. It is how a row is pinpointed and what foreign keys point at."},
};
function term(w,label){ const g=glossary[w]; return `<span class="term" tabindex="0" role="button" aria-label="${label||w}, glossary term, press Enter to read more" onclick="more('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();more('${w}',this)}">${label||w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`; }
function more(w,el){ const g=glossary[w]; let b=el.closest('p,.lead,.txt'); if(!b)b=el.parentElement; let ex=b.parentElement.querySelector('.term-more[data-w="'+w+'"]'); if(ex){ ex.classList.toggle('show'); if(!ex.classList.contains('show'))ex.remove(); return; } const d=document.createElement('div'); d.className='term-more show'; d.setAttribute('data-w',w); d.innerHTML=`<b style="text-transform:capitalize">${w}</b>. ${g.long}`; b.insertAdjacentElement('afterend',d); }

let edCount=0; const tryEds=[];
function ed(def,autorun){ const id='e'+(edCount++); if(autorun)tryEds.push(id); return `
  <div class="pg">
    <div class="pg-tabbar"><div class="pg-tab active"><span class="ic">▤</span> Query Editor</div><div class="pg-tab" style="opacity:.5"><span class="ic">▤</span> sqlingo_db</div></div>
    <div class="pg-toolbar"><button class="pg-btn pg-run" onclick="exec('${id}')">▶ Run</button><button class="pg-btn pg-ghost" onclick="resetEd('${id}','${encodeURIComponent(def)}')">↺ Reset</button><div class="pg-sep"></div><span style="font-size:11.5px;color:var(--ink-faint)">runs real SQL · edit freely</span></div>
    <div class="pg-gut-line"><div class="pg-gut" id="gut-${id}">1</div><textarea class="pg-ed" id="ed-${id}" spellcheck="false" oninput="gutter('${id}')" onkeydown="if(event.key==='F5'){event.preventDefault();exec('${id}')}">${def}</textarea></div>
    <div class="pg-out-head"><span class="pg-out-tab">Data Output</span><span class="pg-status" id="st-${id}">Ready</span></div>
    <div class="pg-out" id="out-${id}"><div class="pg-empty">Press Run to see the result.</div></div>
  </div>`; }

let qCount=0; const answers={};
function q(id,lvl,txt,checker,sol,hint){ qCount++; const c=lvl==='easy'?'lv-e':lvl==='med'?'lv-m':'lv-h'; const t=lvl==='easy'?'Easy':lvl==='med'?'Medium':'Hard'; answers[id]={checker,sol,solved:false}; return `
  <div class="q"><div class="q-head"><span class="q-lvl ${c}">${t}</span></div><div class="q-txt">${txt}</div>${hint?`<div class="q-hint">Hint: ${hint}</div>`:''}
    <div class="pg" style="margin:13px 0 0"><div class="pg-toolbar"><button class="pg-btn pg-run" onclick="check('${id}')">▶ Run &amp; Check</button><button class="pg-btn pg-ghost" onclick="reveal('${id}')">Show answer</button></div>
      <div class="pg-gut-line"><div class="pg-gut" id="gut-${id}">1</div><textarea class="pg-ed" id="ed-${id}" spellcheck="false" placeholder="Write your query here" oninput="gutter('${id}')" onkeydown="if(event.key==='F5'){event.preventDefault();check('${id}')}"></textarea></div>
      <div class="pg-out-head"><span class="pg-out-tab">Data Output</span><span class="pg-status" id="st-${id}">Waiting</span></div>
      <div class="pg-out" id="out-${id}"><div class="pg-empty">Run your query to check it.</div></div></div>
    <div class="q-fb" id="fb-${id}"></div></div>`; }

function grid(id,res){ const out=document.getElementById('out-'+id),st=document.getElementById('st-'+id);
  if(res.error){ out.innerHTML=`<div class="pg-empty" style="color:var(--rose)">⚠ ${res.error}</div>`; if(st)st.textContent='Error'; return {ok:false}; }
  if(!res.cols.length||!res.rows.length){ out.innerHTML=`<div class="pg-empty">Ran fine, but nothing matched — 0 rows.</div>`; if(st)st.textContent='OK · 0 rows'; return {ok:true,cols:res.cols,rows:res.rows}; }
  let h='<table class="pg-grid"><tr><th class="rn">#</th>'+res.cols.map(c=>`<th>${c}</th>`).join('')+'</tr>';
  res.rows.forEach((r,i)=>{ h+=`<tr><td class="rn">${i+1}</td>`+r.map(v=>`<td>${v===null?'<span style="color:#b8c0bd">NULL</span>':v}</td>`).join('')+'</tr>'; });
  out.innerHTML=h+'</table>'; if(st)st.textContent=`OK · ${res.rows.length} row${res.rows.length>1?'s':''} · ${(Math.random()*22+5).toFixed(0)} ms`;
  return {ok:true,cols:res.cols,rows:res.rows}; }
function gutter(id){ const e=document.getElementById('ed-'+id),g=document.getElementById('gut-'+id); if(!e||!g)return; const n=e.value.split('\n').length||1; g.innerHTML=Array.from({length:n},(_,i)=>i+1).join('<br>'); }
function exec(id){ grid(id,runSQL(document.getElementById('ed-'+id).value)); }
function resetEd(id,enc){ const e=document.getElementById('ed-'+id); e.value=decodeURIComponent(enc); gutter(id); document.getElementById('out-'+id).innerHTML='<div class="pg-empty">Press Run to see the result.</div>'; document.getElementById('st-'+id).textContent='Ready'; }
function sameResult(info,sql){ const e=runSQL(sql); if(e.error)return false; return JSON.stringify({c:info.cols,r:info.rows})===JSON.stringify({c:e.cols,r:e.rows}); }
function sameRowsAnyOrder(info,sql){ const e=runSQL(sql); if(e.error)return false; const norm=o=>JSON.stringify({c:o.cols,r:[...o.rows].map(r=>JSON.stringify(r)).sort()}); return norm(info)===norm(e); }

let solved=0;
function check(id){ const e=document.getElementById('ed-'+id),res=runSQL(e.value),info=grid(id,res),fb=document.getElementById('fb-'+id),m=answers[id];
  if(!info.ok){ fb.className='q-fb no'; fb.innerHTML='✗ There is an error — read the message above the grid and adjust.'; return; }
  let pass=false; try{ pass=m.checker(info,e.value); }catch(_){ pass=false; }
  if(pass){ fb.className='q-fb ok'; fb.innerHTML='✓ Correct. That returns exactly what was asked.'; if(!m.solved){ m.solved=true; solved++; markProg(curCh,id); updateProg(); } }
  else { fb.className='q-fb no'; fb.innerHTML='✗ It runs, but the result is not what was asked. Re-read the question and check your columns, order, or conditions.'; } }
function reveal(id){ const e=document.getElementById('ed-'+id); e.value=answers[id].sol; gutter(id); grid(id,runSQL(e.value)); const fb=document.getElementById('fb-'+id); fb.className='q-fb ok'; fb.innerHTML='Here is one correct version. Read each part, then try writing it yourself next time.'; }

/* mutation practice: isolated scratch table, reset for every check so core tables stay safe */
function qm(id,lvl,txt,resetSql,verifySql,sol,hint){ qCount++; const c=lvl==='easy'?'lv-e':lvl==='med'?'lv-m':'lv-h'; const t=lvl==='easy'?'Easy':lvl==='med'?'Medium':'Hard'; answers[id]={reset:resetSql,verify:verifySql,sol,solved:false}; return `
  <div class="q"><div class="q-head"><span class="q-lvl ${c}">${t}</span></div><div class="q-txt">${txt}</div>${hint?`<div class="q-hint">Hint: ${hint}</div>`:''}
    <div class="pg" style="margin:13px 0 0"><div class="pg-toolbar"><button class="pg-btn pg-run" onclick="checkM('${id}')">▶ Run &amp; Check</button><button class="pg-btn pg-ghost" onclick="revealM('${id}')">Show answer</button><div class="pg-sep"></div><span style="font-size:11.5px;color:var(--ink-faint)">runs on an isolated scratch table</span></div>
      <div class="pg-gut-line"><div class="pg-gut" id="gut-${id}">1</div><textarea class="pg-ed" id="ed-${id}" spellcheck="false" placeholder="Write your statement here" oninput="gutter('${id}')" onkeydown="if(event.key==='F5'){event.preventDefault();checkM('${id}')}"></textarea></div>
      <div class="pg-out-head"><span class="pg-out-tab">Table After</span><span class="pg-status" id="st-${id}">Waiting</span></div>
      <div class="pg-out" id="out-${id}"><div class="pg-empty">Run your statement to see the table afterwards.</div></div></div>
    <div class="q-fb" id="fb-${id}"></div></div>`; }
function checkM(id){ const m=answers[id],e=document.getElementById('ed-'+id),fb=document.getElementById('fb-'+id);
  runSQL(m.reset); const ru=runSQL(e.value);
  if(ru.error){ grid(id,ru); fb.className='q-fb no'; fb.innerHTML='✗ Error: '+ru.error; return; }
  const after=runSQL(m.verify); grid(id,after);
  if(after.error){ fb.className='q-fb no'; fb.innerHTML='✗ It ran, but the expected table is not there afterwards. Re-read the task.'; return; }
  runSQL(m.reset); runSQL(m.sol); const exp=runSQL(m.verify);
  const pass=JSON.stringify({c:after.cols,r:after.rows})===JSON.stringify({c:exp.cols,r:exp.rows});
  if(pass){ fb.className='q-fb ok'; fb.innerHTML='✓ Correct. Afterwards the table holds exactly the right data.'; if(!m.solved){ m.solved=true; solved++; markProg(curCh,id); updateProg(); } }
  else { fb.className='q-fb no'; fb.innerHTML='✗ Not quite. After your statement the table does not match what was asked. Re-run to reset and try again.'; }
  runSQL(m.reset); }
function revealM(id){ const m=answers[id],e=document.getElementById('ed-'+id); e.value=m.sol; gutter(id); runSQL(m.reset); runSQL(m.sol); grid(id,runSQL(m.verify)); runSQL(m.reset); const fb=document.getElementById('fb-'+id); fb.className='q-fb ok'; fb.innerHTML='Here is one correct version, with the resulting table shown above.'; }
function updateProg(){ if(qCount===0){ document.getElementById('progLabel').textContent='Read'; document.getElementById('progFill').style.width='0%'; return; } document.getElementById('progLabel').textContent=`${solved} / ${qCount}`; document.getElementById('progFill').style.width=((solved/qCount)*100)+'%'; }

/* persistent progress (saved in the browser so it survives navigation and reloads) */
let curCh=null, TOTAL_Q=0, PROG={};
try{ PROG=JSON.parse(localStorage.getItem('sqlingo_progress')||'{}'); }catch(_){ PROG={}; }
function markProg(ch,id){ if(!ch)return; if(!PROG[ch])PROG[ch]={}; PROG[ch][id]=true; try{ localStorage.setItem('sqlingo_progress',JSON.stringify(PROG)); }catch(_){} updateCourse(); }
function overallSolved(){ let n=0; for(const c in PROG){ n+=Object.keys(PROG[c]).length; } return n; }
function updateCourse(){ const el=document.getElementById('courseProg'); const fill=document.getElementById('courseProgFill'); const n=overallSolved();
  const done = TOTAL_Q>0 && n>=TOTAL_Q;
  if(el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if(fill) fill.style.width = TOTAL_Q ? ((n/TOTAL_Q)*100)+'%' : '0%';
  if(done) celebrateOnce(); }
function celebrateOnce(){
  let shown=false; try{ shown=localStorage.getItem('sqlingo_celebrated')==='1'; }catch(_){}
  if(shown) return;
  try{ localStorage.setItem('sqlingo_celebrated','1'); }catch(_){}
  const t=document.createElement('div');
  t.className='celebrate-toast';
  t.innerHTML='<b>All 115 questions solved.</b><br>You have worked through the whole handbook. Well done.';
  document.body.appendChild(t);
  setTimeout(()=>{ t.classList.add('show'); },30);
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),500); },6000);
}
function computeTotals(){ const sq=qCount; TOTAL_Q=0; for(const k in lessons){ qCount=0; try{ lessons[k].render(); }catch(_){} TOTAL_Q+=qCount; } qCount=sq; edCount=0; tryEds.length=0; for(const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress(){ if(!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG={}; try{ localStorage.removeItem('sqlingo_progress'); }catch(_){} updateCourse(); if(curCh) go(curCh); }
function toggleMenu(){ document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest=[
 {p:'Groundwork',items:[['00','What even is SQL?',1],['0b','The SQL world & NoSQL',1],['0i','Meet the data',1]]},
 {p:'Part I · Asking questions',items:[['01','SELECT',1],['02','DISTINCT',1],['03','WHERE',1],['04','ORDER BY',1],['05','LIMIT & OFFSET',1]]},
 {p:'Part II · Matching & nulls',items:[['06','LIKE & wildcards',1],['07','IN & BETWEEN',1],['08','NULL handling',1]]},
 {p:'Part III · Summaries',items:[['09','Aggregates',1],['10','GROUP BY',1],['11','HAVING',1]]},
 {p:'Part IV · Many tables',items:[['12','JOINs',1],['13','UNION',1]]},
 {p:'Part V · Advanced',items:[['14','CASE & null functions',1],['15','Subqueries',1],['16','Window functions',1]]},
 {p:'Part VI · Managing data',items:[['17','INSERT, UPDATE, DELETE',1],['18','CREATE, ALTER, DROP',1],['19','VIEWs & INDEXes',1],['20','Types, comments, safety',1]]},
 {p:'Part VII · Deeper SQL',items:[['21','Built-in functions',1],['22','CTEs (the WITH clause)',1],['23','Transactions & ACID',1]]},
 {p:'Part VIII · Theory & craft',items:[['24','Command families',1],['25','Normalization & design',1],['26','Best practices & scaling',1]]},
];
const order=[]; manifest.forEach(g=>g.items.forEach(it=>{ if(it[2]) order.push(it[0]); }));
function buildNav(){ let h=''; manifest.forEach(g=>{ h+=`<div class="nav-group"><div class="nav-label">${g.p}</div>`; g.items.forEach(it=>{ const n=it[0],t=it[1],built=it[2]; const key=(n+' '+t).toLowerCase(); h+= built ? `<div class="nav-item" id="nav-${n}" onclick="go('${n}')" data-search="${key}"><span class="ch">${n}</span> ${t}</div>` : `<div class="nav-item soon" data-search="${key}"><span class="ch">${n}</span> ${t}</div>`; }); h+=`</div>`; }); document.getElementById('nav').innerHTML=h; }
buildNav();

/* ---------- sidebar chapter search ---------- */
function filterNav(qstr){
  const q=(qstr||'').trim().toLowerCase();
  const groups=document.querySelectorAll('.nav-group');
  groups.forEach(g=>{
    let any=false;
    g.querySelectorAll('.nav-item').forEach(item=>{
      const hay=item.getAttribute('data-search')||item.textContent.toLowerCase();
      const match=!q || hay.includes(q);
      item.style.display = match ? '' : 'none';
      if(match) any=true;
    });
    g.style.display = any ? '' : 'none';
  });
  const empty=document.getElementById('navEmpty');
  if(empty) empty.style.display = groups.length && ![...groups].some(g=>g.style.display!=='none') ? '' : 'none';
}

function foot(cur){
  if(cur==='cheatsheet') return `<div class="foot"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Start the course →</button></div>`;
  const i=order.indexOf(cur); const prev=i>0?order[i-1]:null; const next=i<order.length-1?order[i+1]:null;
  return `<div class="foot">
    ${prev?`<button class="f-btn f-prev" onclick="go('${prev}')">← ${lessons[prev].short}</button>`:'<span></span>'}
    ${next?`<button class="f-btn f-next" onclick="go('${next}')">${lessons[next].short} →</button>`:`<button class="f-btn f-next" disabled>More coming soon</button>`}
  </div>`; }

function go(num){ const L=lessons[num]; if(!L) return;
  curCh=num;
  edCount=0; tryEds.length=0; qCount=0; solved=0; for(const k in answers) delete answers[k];
  document.getElementById('content').innerHTML = L.render() + foot(num);
  document.getElementById('crumb').innerHTML = L.where;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const el=document.getElementById('nav-'+num); if(el) el.classList.add('active');
  const done=PROG[num]||{};
  Object.keys(answers).forEach(id=>{ if(done[id] && !answers[id].solved){ answers[id].solved=true; solved++; const fb=document.getElementById('fb-'+id); if(fb){ fb.className='q-fb ok'; fb.innerHTML='✓ Solved earlier. Run it again any time to practise.'; } } });
  updateProg();
  tryEds.forEach(id=>{ try{ exec(id); }catch(_){} });
  document.querySelectorAll('.pg-ed').forEach(t=>gutter(t.id.replace('ed-','')));
  closeMenu();
  window.scrollTo({top:0});
}

/* ---------- lessons ---------- */
const lessons={};

/* ---------- cheat sheet (quick syntax reference, all chapters) ---------- */
const CHEATS={
 '00':{note:'SQL (say it "sequel" or spell it out) is the language you use to ask a database for exactly the data you want, in the form of short, almost-English queries.'},
 '0b':{note:'Relational databases (SQL) store data in tables linked by keys, with a strict schema. NoSQL stores (document, key-value, graph) trade some structure for flexibility and scale. Most everyday business data still fits SQL best.'},
 '0i':{code:"customers(id, name, city, joined)\nrestaurants(id, name, city, cuisine, rating, cost_for_two)\norders(id, customer_id, restaurant_id, amount, order_date, rating_given)"},
 '01':{code:"SELECT name, city FROM customers;\nSELECT cost_for_two / 2 AS per_person FROM restaurants;"},
 '02':{code:"SELECT DISTINCT city FROM customers;\nSELECT COUNT(DISTINCT cuisine) FROM restaurants;"},
 '03':{code:"SELECT * FROM restaurants\nWHERE city = 'Mumbai' AND rating >= 4.5;"},
 '04':{code:"SELECT name, rating FROM restaurants\nORDER BY city ASC, rating DESC;"},
 '05':{code:"SELECT * FROM restaurants\nORDER BY id LIMIT 2 OFFSET 2;"},
 '06':{code:"WHERE name LIKE 'B%'   -- starts with B\nWHERE name LIKE '%ing%' -- contains ing\nWHERE city LIKE 'P___'  -- P + exactly 3 chars"},
 '07':{code:"WHERE city IN ('Mumbai', 'Delhi')\nWHERE rating BETWEEN 4.0 AND 4.5"},
 '08':{code:"WHERE rating_given IS NULL\nWHERE rating_given IS NOT NULL", note:'Never write = NULL or != NULL, it never matches.'},
 '09':{code:"SELECT COUNT(*), SUM(amount), ROUND(AVG(rating),2), MIN(cost_for_two), MAX(cost_for_two)\nFROM restaurants;"},
 '10':{code:"SELECT city, COUNT(*) AS n FROM customers GROUP BY city;"},
 '11':{code:"SELECT city, COUNT(*) AS n FROM customers\nGROUP BY city HAVING COUNT(*) > 1;", note:'WHERE filters rows before grouping, HAVING filters groups after.'},
 '12':{code:"SELECT o.id, c.name, o.amount\nFROM orders o JOIN customers c ON o.customer_id = c.id;\n\nFROM customers c LEFT JOIN orders o ON c.id = o.customer_id;"},
 '13':{code:"SELECT city FROM customers\nUNION\nSELECT city FROM restaurants;", note:'UNION drops duplicates; UNION ALL keeps them and is faster.'},
 '14':{code:"CASE WHEN rating >= 4.5 THEN 'top' WHEN rating >= 4.2 THEN 'good' ELSE 'ok' END\nCOALESCE(rating_given, 0)"},
 '15':{code:"SELECT name FROM restaurants\nWHERE rating > (SELECT AVG(rating) FROM restaurants);", note:'ANY/ALL are standard SQL for comparing to a whole set of values; SQLite lacks them, use MAX()/MIN() instead.'},
 '16':{code:"ROW_NUMBER() OVER (ORDER BY rating DESC)\nRANK() OVER (PARTITION BY city ORDER BY rating DESC)\nSUM(amount) OVER (ORDER BY order_date)"},
 '17':{code:"INSERT INTO t (a,b) VALUES (1,2);\nUPDATE t SET a = 1 WHERE id = 3;\nDELETE FROM t WHERE active = 0;"},
 '18':{code:"CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT);\nALTER TABLE t ADD COLUMN active INTEGER DEFAULT 1;\nDROP TABLE t;"},
 '19':{code:"CREATE VIEW mumbai_restaurants AS\n  SELECT name, cuisine, rating FROM restaurants WHERE city='Mumbai';\nCREATE INDEX idx_restaurants_city ON restaurants (city);"},
 '20':{code:"typeof(name)\nCAST(rating AS INTEGER)\n-- a comment", note:'Always use parameterised queries in real apps; never paste user input straight into SQL text (SQL injection).'},
 '21':{code:"UPPER(name) | LENGTH(name) | SUBSTR(name,1,3)\nname || ' from ' || city\nROUND(x) | CAST(x AS INTEGER) | x % 100\nstrftime('%Y', order_date)\nGROUP_CONCAT(name)"},
 '22':{code:"WITH spend AS (\n  SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id\n)\nSELECT * FROM spend WHERE total > 1000;"},
 '23':{code:"BEGIN;\nUPDATE demo SET balance = balance - 200 WHERE id = 2;\nUPDATE demo SET balance = balance + 200 WHERE id = 1;\nCOMMIT;   -- or ROLLBACK;", note:'ACID: Atomicity, Consistency, Isolation, Durability.'},
 '24':{code:"DDL: CREATE, ALTER, DROP\nDML: INSERT, UPDATE, DELETE\nDQL: SELECT\nTCL: BEGIN, COMMIT, ROLLBACK\nDCL: GRANT, REVOKE"},
 '25':{code:"Primary key: uniquely identifies a row\nForeign key: points at another table's primary key\nComposite key: a key made of more than one column", note:'Normalization removes repeated/duplicated data by splitting it into linked tables.'},
 '26':{code:"EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 1;", note:'Add an index on columns you filter or join on often; avoid SELECT * in real apps; keep transactions short.'},
};
function renderCheatsheet(){
  let h=`<div class="eyebrow">Quick reference</div>
  <h2 class="title">Cheat sheet</h2>
  <p class="lead">Every chapter's core syntax on one page. Use it to jog your memory, not to skip the lessons themselves.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">`;
  manifest.forEach(g=>{
    h+=`<div class="cheat-group"><h3 class="section-h" style="margin-top:26px">${g.p}</h3>`;
    g.items.forEach(it=>{
      const n=it[0],t=it[1]; const c=CHEATS[n]; if(!c) return;
      h+=`<div class="cheat-card"><div class="cheat-card-h"><span class="ch">${n}</span> ${t}</div>${c.code?`<pre class="code">${c.code.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`:''}${c.note?`<div class="q-hint">${c.note}</div>`:''}</div>`;
    });
    h+=`</div>`;
  });
  return h;
}
lessons['cheatsheet']={ short:'Cheat sheet', where:'<b>Cheat sheet</b>', render:renderCheatsheet };

lessons['01']={ short:'SELECT', where:'Part I · <b>SELECT</b>', render:()=>`
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">SELECT, picking what you want to see</h2>
  <p class="lead">Every question you will ever ask a database starts with one word. Before filtering, before sorting, before joining, you first say what you actually want to look at. That is SELECT, and you will type it more than any other word in SQL.</p>
  <hr class="rule">
  <p class="body">Here is the honest truth about SELECT: it is less a command and more the opening of a sentence. You are talking to a ${term('database')}, and you begin by naming the pieces of information you care about. The database listens, fetches them, and lays them out in a neat grid. Nothing more mysterious than that.</p>
  <p class="body">It always travels with a partner, <b>FROM</b>, which names the ${term('table')} to look in. SELECT says <b>which columns</b>, FROM says <b>which table</b>. Together they make the smallest complete question you can ask.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Think of a waiter at a dhaba who knows the whole menu by heart. You do not want the whole thing recited. You say, <b>"just tell me the dish names and their prices."</b> That sentence is a SELECT. You named the two things you wanted and asked him to skip the rest. The kitchen did not change, only what he read out to you did.</div></div>

  <div class="sec-num">1.1</div><h3 class="section-h">The smallest possible query</h3>
  <p class="body">Let us ask for one ${term('column')}. The customers table has a column called <code class="inl">name</code>. To see just the names, write the ${term('keyword','keyword')} SELECT, the column, then FROM and the table.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT</span><span class="qb-mean">which column do you want to see?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">name</span><span class="qb-mean">this specific column</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">FROM customers</span><span class="qb-mean">go look in the customers table</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">SELECT name</span> <span class="e-f">FROM customers</span> means, plainly, <b>"give me the name, from the customers table."</b></div></div>
  <p class="body">Run it below. Then change <code class="inl">name</code> to <code class="inl">city</code> and run again. You are steering the result just by naming a different column.</p>
  ${ed("SELECT name FROM customers",true)}

  <div class="sec-num">1.2</div><h3 class="section-h">Several columns at once</h3>
  <p class="body">Most of the time you want a few columns side by side. List them with commas between. Worth noticing early: <b>the order you list them is the order they come back in.</b> SQL does not sort or guess, it respects exactly what you wrote.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, city, joined <span class="k">FROM</span> customers</div><div class="ex-note">Three columns, left to right in the order written. Swap them and the grid rearranges to match.</div></div>
  ${ed("SELECT name, city, joined FROM customers")}

  <div class="sec-num">1.3</div><h3 class="section-h">Everything at once, the <code class="inl" style="font-size:17px">*</code> star</h3>
  <p class="body">Sometimes you just want to see the whole table without typing each name. The star <b>*</b> means "all the columns". It is the fastest way to look at what a table holds when you are exploring.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> * <span class="k">FROM</span> restaurants</div><div class="ex-note">Hands back id, name, city, cuisine, rating and cost_for_two, the full width of the table.</div></div>
  <p class="aside">A note from real work: in actual projects people usually name the columns instead of using the star, because pulling back data you do not need wastes time, and a query that says <code class="inl" style="font-size:12px">SELECT *</code> can quietly break if someone adds a column later. While learning though, the star is genuinely handy. Use it to look around, then name columns once you know what you want.</p>
  ${ed("SELECT * FROM restaurants")}

  <div class="sec-num">1.4</div><h3 class="section-h">Columns can be little calculations</h3>
  <p class="body">Here is where SELECT gets quietly powerful, and where most beginner tutorials stop too early. The things you list do not have to be plain columns. They can be ${term('expression','expressions')}, small calculations SQL works out per row. The restaurants table stores <code class="inl">cost_for_two</code>. Want cost per person? Divide, right inside the SELECT.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, cost_for_two, cost_for_two / 2 <span class="k">FROM</span> restaurants</div><div class="ex-note">For each row SQL computes cost_for_two divided by 2 and shows it as an extra column. The stored data is untouched.</div></div>
  <p class="body">The usual arithmetic works: <code class="inl">+</code> add, <code class="inl">-</code> subtract, <code class="inl">*</code> multiply, <code class="inl">/</code> divide. It runs once per row.</p>
  ${ed("SELECT name, cost_for_two, cost_for_two / 2 FROM restaurants")}

  <div class="sec-num">1.5</div><h3 class="section-h">A nicer name with AS</h3>
  <p class="body">Notice the calculated column came back with an ugly header like <code class="inl">cost_for_two / 2</code>? Rename any column in the output with <b>AS</b>. This is an ${term('alias')}. It changes only the label, not the stored data, and makes results readable.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, cost_for_two / 2 <span class="k">AS</span> cost_per_person <span class="k">FROM</span> restaurants</div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">SELECT name, cost_for_two / 2 AS cost_per_person</span> <span class="e-f">FROM restaurants</span> means <b>"give me the name and the cost for two divided by two, and label that second column cost_per_person."</b></div></div>
  <p class="body">For an alias with a space, wrap it in double quotes: <code class="inl">AS "Cost Per Person"</code>. Small thing worth knowing, AS is actually optional in most databases, you can just write the new name after the column. But keeping AS in makes the intent obvious to whoever reads it later, so it is a good habit.</p>
  ${ed("SELECT name, cost_for_two / 2 AS cost_per_person FROM restaurants")}

  <div class="sec-num">1.6</div><h3 class="section-h">SELECT with no table at all</h3>
  <p class="body">A small curiosity that helps the idea click. SELECT does not strictly need a table. You can ask the database to just compute something, like a calculator.</p>
  <div class="ex"><div class="ex-tag">Try it</div><div class="code"><span class="k">SELECT</span> 5 * 12 <span class="k">AS</span> answer</div><div class="ex-note">No FROM, no table, SQL just works out the value. You will rarely write these for real, but they prove SELECT is fundamentally "give me this value", and a column is just one kind of value.</div></div>
  ${ed("SELECT 5 * 12 AS answer")}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Missing comma between columns.</b> <code class="inl" style="font-size:12px">SELECT name city</code> is not <code class="inl" style="font-size:12px">SELECT name, city</code>. Without the comma, SQL reads "city" as an alias for name. Sneaky.</li>
    <li><b>Trailing comma.</b> <code class="inl" style="font-size:12px">SELECT name, city, FROM customers</code> has a comma with nothing after it, and the database complains. Commas go between columns, not after the last one.</li>
    <li><b>Misspelt column.</b> Ask for a column that does not exist and you get a clear "no such column" error. That is the database helping, not scolding. Check the spelling.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Putting the pieces together</h3>
  <p class="body">One query using most of this chapter: named columns, a calculation, and a clean alias.</p>
  <div class="ex"><div class="code"><span class="k">SELECT</span> name,
       cuisine,
       cost_for_two,
       cost_for_two / 2 <span class="k">AS</span> per_person
<span class="k">FROM</span> restaurants</div></div>
  ${ed("SELECT name, cuisine, cost_for_two, cost_for_two / 2 AS per_person FROM restaurants")}

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">Each runs against the real database and checks your actual result, so any correct way of writing it passes. Stuck? "Show answer" carries no penalty, reading a worked answer is a perfectly good way to learn.</p>
  ${q('q1','easy','Select only the <b>city</b> column from the customers table.', i=>sameResult(i,'SELECT city FROM customers'), 'SELECT city FROM customers', 'SELECT the one column, then FROM customers.')}
  ${q('q2','easy','Select <b>every column</b> from the orders table using the star shortcut.', i=>sameResult(i,'SELECT * FROM orders'), 'SELECT * FROM orders', 'The star means all columns.')}
  ${q('q3','med','Select <b>name, cuisine and rating</b> from restaurants, in that order.', i=>sameResult(i,'SELECT name, cuisine, rating FROM restaurants'), 'SELECT name, cuisine, rating FROM restaurants', 'Three columns separated by commas.')}
  ${q('q4','med','Select the <b>name</b> of each restaurant and its <b>cost_for_two multiplied by 2</b>, labelling that second column <b>cost_for_four</b>.', i=>sameResult(i,'SELECT name, cost_for_two * 2 AS cost_for_four FROM restaurants'), 'SELECT name, cost_for_two * 2 AS cost_for_four FROM restaurants', 'Use an expression (cost_for_two * 2) and AS to name it.')}
  ${q('q5','hard','Select the <b>name</b> and <b>rating</b> of each restaurant, plus a column called <b>rating_out_of_10</b> that is the rating multiplied by 2.', i=>sameResult(i,'SELECT name, rating, rating * 2 AS rating_out_of_10 FROM restaurants'), 'SELECT name, rating, rating * 2 AS rating_out_of_10 FROM restaurants', 'Three things in the SELECT: name, rating, and rating * 2 aliased.')}
`};

lessons['02']={ short:'DISTINCT', where:'Part I · <b>DISTINCT</b>', render:()=>`
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">DISTINCT, cutting out the repeats</h2>
  <p class="lead">Real data repeats itself constantly. Three customers from Mumbai, five orders from the same person, a dozen restaurants serving burgers. Often you do not want every row, you want the <b>distinct</b> values, each one listed once. That is the whole job of DISTINCT.</p>
  <hr class="rule">
  <p class="body">When you run <code class="inl">SELECT city FROM customers</code>, you get one row per customer, so cities repeat. If seven customers live across three cities, you see seven rows, not three. DISTINCT collapses those ${term('duplicate','duplicates')} so each value appears a single time. It is the difference between "list everyone's city" and "which cities do our customers live in".</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Imagine flipping through a stack of order slips at the counter and someone asks, <b>"which areas are we even delivering to?"</b> You would not read out every slip. You would jot each area down once and ignore the repeats. DISTINCT is you making that short, no-repeats list.</div></div>

  <div class="sec-num">2.1</div><h3 class="section-h">See the duplicates first</h3>
  <p class="body">Before removing repeats, it helps to see them. Run a plain SELECT on the city column and count how many times each city shows up.</p>
  <div class="ex"><div class="ex-tag">Plain SELECT, repeats and all</div><div class="code"><span class="k">SELECT</span> city <span class="k">FROM</span> customers</div><div class="ex-note">Seven rows come back. Look closely: Mumbai, Delhi and Pune each appear more than once, because more than one customer lives there.</div></div>
  ${ed("SELECT city FROM customers",true)}

  <div class="sec-num">2.2</div><h3 class="section-h">SELECT DISTINCT</h3>
  <p class="body">Now add the ${term('keyword','keyword')} DISTINCT right after SELECT. It tells the database, "give me each value only once".</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT DISTINCT</span><span class="qb-mean">each value once, no repeats</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">city</span><span class="qb-mean">the column to de-duplicate</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">FROM customers</span><span class="qb-mean">from the customers table</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">SELECT DISTINCT city</span> <span class="e-f">FROM customers</span> means <b>"list the cities our customers live in, each one just once."</b></div></div>
  <p class="body">Run it and compare: the seven rows from before shrink to four, one per unique city.</p>
  ${ed("SELECT DISTINCT city FROM customers",true)}

  <div class="sec-num">2.3</div><h3 class="section-h">DISTINCT looks at the whole selected row</h3>
  <p class="body">This is the point everyone misreads at first, so read it slowly. DISTINCT does not de-duplicate one column in isolation. It de-duplicates the <b>entire set of columns you selected</b>, taken together. When you list two columns, a row is a repeat only if <b>both</b> values match another row.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> <span class="k">DISTINCT</span> city, cuisine <span class="k">FROM</span> restaurants</div><div class="ex-note">Delhi shows up twice here, once with Burgers and once with Biryani, because the pair (Delhi, Burgers) is different from (Delhi, Biryani). DISTINCT keeps both, since the combinations are unique.</div></div>
  ${ed("SELECT DISTINCT city, cuisine FROM restaurants",true)}
  <p class="body">So DISTINCT is about unique <b>rows of the result</b>, not a unique single column. Keep that sentence in your head and half the confusion around DISTINCT disappears.</p>

  <div class="sec-num">2.4</div><h3 class="section-h">Counting the distinct values</h3>
  <p class="body">A very common real need is not the list itself but <b>how many</b> distinct values there are. "How many different cuisines do we serve?" You can put DISTINCT inside COUNT. We will meet COUNT properly in the aggregates chapter, but it reads naturally even now.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> <span class="k">COUNT</span>(<span class="k">DISTINCT</span> cuisine) <span class="k">AS</span> cuisines <span class="k">FROM</span> restaurants</div><div class="ex-note">Instead of listing the cuisines, this counts the unique ones and hands back a single number.</div></div>
  ${ed("SELECT COUNT(DISTINCT cuisine) AS cuisines FROM restaurants",true)}

  <div class="sec-num">2.5</div><h3 class="section-h">DISTINCT and empty values (NULL)</h3>
  <p class="body">Some columns have gaps. In our orders table, <code class="inl">rating_given</code> is empty for orders where the customer never left a rating, those blanks show as <b>NULL</b>. We cover NULL in depth later, but here is what matters for DISTINCT: it treats all the NULLs as one and the same, so you get a single NULL row, not one per blank.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> <span class="k">DISTINCT</span> rating_given <span class="k">FROM</span> orders</div><div class="ex-note">The distinct ratings come back, plus a single NULL standing in for "no rating given", even though several orders are unrated.</div></div>
  ${ed("SELECT DISTINCT rating_given FROM orders",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>DISTINCT is not a function on one column.</b> You write <code class="inl" style="font-size:12px">SELECT DISTINCT a, b</code>, not <code class="inl" style="font-size:12px">SELECT DISTINCT(a), b</code>. The keyword applies to the whole row of selected columns, not just the one in brackets. The bracket form sometimes runs but rarely means what you think.</li>
    <li><b>More columns means fewer rows collapse.</b> Adding a column to a DISTINCT query usually gives you <b>more</b> rows, not fewer, because there are more ways for rows to differ. That surprises people who expect DISTINCT to always shrink the result.</li>
    <li><b>DISTINCT sees NULLs as equal.</b> That is a DISTINCT-only quirk. Everywhere else in SQL, NULL is treated as "unknown" and is not even equal to itself, which we will unpack in the NULL chapter.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">The one line to remember</h3>
  <p class="body">DISTINCT removes repeated <b>rows</b> from your result, judging repeats across every column you selected, and it counts all NULLs as a single value. Reach for it whenever the question is "what are the different..." rather than "list every...".</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">Each checks your real result, so any correct phrasing passes.</p>
  ${q('q1','easy','List the <b>distinct cities</b> our customers live in.', i=>sameResult(i,'SELECT DISTINCT city FROM customers'), 'SELECT DISTINCT city FROM customers', 'DISTINCT right after SELECT.')}
  ${q('q2','easy','List each <b>distinct cuisine</b> from the restaurants table.', i=>sameResult(i,'SELECT DISTINCT cuisine FROM restaurants'), 'SELECT DISTINCT cuisine FROM restaurants', 'One column, de-duplicated.')}
  ${q('q3','med','List the <b>distinct cities</b> that have restaurants (from the restaurants table).', i=>sameResult(i,'SELECT DISTINCT city FROM restaurants'), 'SELECT DISTINCT city FROM restaurants', 'Same idea as before, different table.')}
  ${q('q4','med','Count how many <b>different cuisines</b> there are, as a column called <b>cuisines</b>.', i=>sameResult(i,'SELECT COUNT(DISTINCT cuisine) AS cuisines FROM restaurants'), 'SELECT COUNT(DISTINCT cuisine) AS cuisines FROM restaurants', 'COUNT(DISTINCT ...) with an AS alias.')}
  ${q('q5','hard','List the distinct <b>city and cuisine combinations</b> from restaurants (both columns, in that order).', i=>sameResult(i,'SELECT DISTINCT city, cuisine FROM restaurants'), 'SELECT DISTINCT city, cuisine FROM restaurants', 'DISTINCT across two columns keeps unique pairs.')}
`};

lessons['03']={ short:'WHERE', where:'Part I · <b>WHERE</b>', render:()=>`
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">WHERE, keeping only the rows you want</h2>
  <p class="lead">So far every query has handed back all the rows. Real questions are almost never like that. "Show me the Mumbai restaurants." "Which orders were above 500 rupees?" The moment you want <b>some</b> rows and not others, you reach for WHERE. It is the filter, and it is where SQL starts feeling powerful.</p>
  <hr class="rule">
  <p class="body">WHERE is a ${term('clause')} that comes right after FROM. You give it a ${term('condition')}, a yes or no test, and the database keeps only the rows for which the test comes out true. Everything else is quietly left out of the result. The table itself does not change, only what you get back.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Picture the whole pile of order slips on the counter. You say, <b>"only give me the ones from Mumbai."</b> Someone flips through, keeps the Mumbai slips, sets the rest aside. WHERE is that flip-through: a rule applied to every slip, keep it or skip it.</div></div>

  <div class="sec-num">3.1</div><h3 class="section-h">Your first filter</h3>
  <p class="body">Let us keep only the restaurants in Mumbai. Because city holds text, the value goes in <b>single quotes</b>.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT *</span><span class="qb-mean">all columns</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">FROM restaurants</span><span class="qb-mean">from the restaurants table</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">WHERE city = 'Mumbai'</span><span class="qb-mean">keep only rows where this is true</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">SELECT *</span> <span class="e-f">FROM restaurants</span> <span class="e-w">WHERE city = 'Mumbai'</span> means <b>"give me every column, from restaurants, but only the rows sitting in Mumbai."</b></div></div>
  ${ed("SELECT * FROM restaurants WHERE city = 'Mumbai'",true)}

  <div class="sec-num">3.2</div><h3 class="section-h">Comparing numbers</h3>
  <p class="body">Conditions on number columns do not need quotes, and you get the full family of comparison ${term('operator','operators')}: <code class="inl">=</code> equal, <code class="inl">&lt;&gt;</code> or <code class="inl">!=</code> not equal, <code class="inl">&gt;</code> greater, <code class="inl">&lt;</code> less, <code class="inl">&gt;=</code> at least, <code class="inl">&lt;=</code> at most.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, rating <span class="k">FROM</span> restaurants <span class="k">WHERE</span> rating > 4.5</div><div class="ex-note">Only the restaurants rated above 4.5 survive the filter. Change > to >= and watch a 4.5 join the list.</div></div>
  ${ed("SELECT name, rating FROM restaurants WHERE rating > 4.5",true)}
  <p class="aside">Text goes in single quotes, numbers do not. <code class="inl" style="font-size:12px">city = 'Mumbai'</code> but <code class="inl" style="font-size:12px">rating > 4.5</code>. Quoting a number usually still works but it is a sloppy habit, and forgetting to quote text gives a "no such column" error, because SQL thinks the word is a column name.</p>

  <div class="sec-num">3.3</div><h3 class="section-h">Two conditions with AND</h3>
  <p class="body">Real filters often have more than one rule. <b>AND</b> joins two conditions and keeps a row only when <b>both</b> are true.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, city, rating <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> city = <span class="s">'Mumbai'</span> <span class="k">AND</span> rating >= 4.5</div><div class="ex-note">A restaurant has to clear both bars: be in Mumbai and be rated 4.5 or higher. Miss either and it is left out.</div></div>
  ${ed("SELECT name, city, rating FROM restaurants WHERE city = 'Mumbai' AND rating >= 4.5",true)}

  <div class="sec-num">3.4</div><h3 class="section-h">Either one with OR</h3>
  <p class="body"><b>OR</b> is the generous one. It keeps a row when <b>at least one</b> of the conditions is true.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, cuisine <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> cuisine = <span class="s">'Pizza'</span> <span class="k">OR</span> cuisine = <span class="s">'Biryani'</span></div><div class="ex-note">Pizza places and biryani places both make the cut. A row only needs to satisfy one side of the OR.</div></div>
  ${ed("SELECT name, cuisine FROM restaurants WHERE cuisine = 'Pizza' OR cuisine = 'Biryani'",true)}

  <div class="sec-num">3.5</div><h3 class="section-h">Flipping it with NOT</h3>
  <p class="body"><b>NOT</b> reverses a condition, keep the rows where it is <b>not</b> true.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, city <span class="k">FROM</span> restaurants <span class="k">WHERE</span> <span class="k">NOT</span> city = <span class="s">'Mumbai'</span></div><div class="ex-note">Everything except the Mumbai restaurants. The same result you would get from <code class="inl" style="font-size:12px">city &lt;&gt; 'Mumbai'</code>.</div></div>
  ${ed("SELECT name, city FROM restaurants WHERE NOT city = 'Mumbai'",true)}

  <div class="sec-num">3.6</div><h3 class="section-h">When AND and OR mix, use brackets</h3>
  <p class="body">This is the trip-up that bites even experienced people. When a query has both AND and OR, SQL applies <b>AND before OR</b>, the same way multiplication happens before addition in maths. If that is not what you meant, the result looks subtly wrong and you will not see why. The fix is to make your intent explicit with <b>parentheses</b>.</p>
  <div class="ex"><div class="ex-tag">Ambiguous, reads oddly</div><div class="code"><span class="c">-- "Mumbai burgers, plus ALL biryani anywhere"? probably not what you meant</span>
<span class="k">SELECT</span> name, city, cuisine <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> city = <span class="s">'Mumbai'</span> <span class="k">AND</span> cuisine = <span class="s">'Pizza'</span> <span class="k">OR</span> cuisine = <span class="s">'Biryani'</span></div></div>
  <div class="ex"><div class="ex-tag">Clear, with brackets</div><div class="code"><span class="k">SELECT</span> name, city, cuisine <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> city = <span class="s">'Mumbai'</span> <span class="k">AND</span> (cuisine = <span class="s">'Pizza'</span> <span class="k">OR</span> cuisine = <span class="s">'Biryani'</span>)</div><div class="ex-note">Now it clearly means "in Mumbai, and serving either pizza or biryani". Run both and watch the results differ.</div></div>
  ${ed("SELECT name, city, cuisine FROM restaurants\nWHERE city = 'Mumbai' AND (cuisine = 'Pizza' OR cuisine = 'Biryani')",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>One equals sign, not two.</b> SQL uses <code class="inl" style="font-size:12px">=</code> for comparison, not <code class="inl" style="font-size:12px">==</code>. The double equals belongs to other languages.</li>
    <li><b>Quote your text, not your numbers.</b> <code class="inl" style="font-size:12px">city = 'Mumbai'</code> needs quotes; <code class="inl" style="font-size:12px">rating > 4</code> does not. Forget the quotes on text and SQL hunts for a column by that name and fails.</li>
    <li><b>AND binds tighter than OR.</b> Mixing them without brackets is the classic silent bug. When in doubt, add parentheses, they cost nothing and make the intent obvious.</li>
    <li><b>Case and spelling of values matter.</b> <code class="inl" style="font-size:12px">'mumbai'</code> may not match <code class="inl" style="font-size:12px">'Mumbai'</code> depending on the database. Match the data as it is stored.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Where WHERE sits</h3>
  <p class="body">The shape so far is fixed: <code class="inl">SELECT</code> columns, <code class="inl">FROM</code> table, <code class="inl">WHERE</code> condition. Quote text, leave numbers bare, join rules with AND or OR, flip with NOT, and reach for brackets the moment both AND and OR appear together.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">Each checks your real result. Use <code class="inl">SELECT *</code> unless the question names specific columns.</p>
  ${q('q1','easy','Show <b>all columns</b> for the restaurants in <b>Mumbai</b>.', i=>sameResult(i,"SELECT * FROM restaurants WHERE city = 'Mumbai'"), "SELECT * FROM restaurants WHERE city = 'Mumbai'", "WHERE city = 'Mumbai', text in quotes.")}
  ${q('q2','easy','Show <b>all columns</b> for restaurants with a <b>rating above 4.5</b>.', i=>sameResult(i,'SELECT * FROM restaurants WHERE rating > 4.5'), 'SELECT * FROM restaurants WHERE rating > 4.5', 'Numbers need no quotes.')}
  ${q('q3','med','Show <b>all columns</b> for restaurants where <b>cost_for_two is 400 or less</b>.', i=>sameResult(i,'SELECT * FROM restaurants WHERE cost_for_two <= 400'), 'SELECT * FROM restaurants WHERE cost_for_two <= 400', 'The at-most operator is <=.')}
  ${q('q4','med','Show <b>all columns</b> for restaurants serving <b>Burgers or Pizza</b>.', i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE cuisine = 'Burgers' OR cuisine = 'Pizza'"), "SELECT * FROM restaurants WHERE cuisine = 'Burgers' OR cuisine = 'Pizza'", 'Two conditions joined with OR.')}
  ${q('q5','hard','Show <b>all columns</b> for restaurants that are in <b>Mumbai and rated at least 4.5</b>.', i=>sameResult(i,"SELECT * FROM restaurants WHERE city = 'Mumbai' AND rating >= 4.5"), "SELECT * FROM restaurants WHERE city = 'Mumbai' AND rating >= 4.5", 'Both conditions true, joined with AND.')}
`};

lessons['04']={ short:'ORDER BY', where:'Part I · <b>ORDER BY</b>', render:()=>`
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">ORDER BY, putting rows in the right sequence</h2>
  <p class="lead">Until now the rows came back in whatever order the database felt like. That is fine for a quick look, useless for a real answer. "The highest rated restaurant", "the newest customer", "cheapest first", all of those are questions about <b>order</b>, and ORDER BY is how you ask for it.</p>
  <hr class="rule">
  <p class="body">ORDER BY is a ${term('clause')} that comes after WHERE. You name a column to sort by, and the database arranges the whole result around it. By default it sorts smallest to largest, A to Z, oldest to newest. One word flips that around.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You have got the day's order slips in your hand in no particular order. Someone says, <b>"arrange them highest bill on top."</b> You shuffle them into that sequence and hand the stack over. ORDER BY is that shuffle, done to your result before you see it.</div></div>

  <div class="sec-num">4.1</div><h3 class="section-h">Sorting, and flipping the direction</h3>
  <p class="body">Sort the restaurants by rating. Add <b>DESC</b> to go highest first, or <b>ASC</b> for lowest first. ASC is the default, so if you write neither, you get ascending.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT name, rating</span><span class="qb-mean">the columns to show</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">FROM restaurants</span><span class="qb-mean">from this table</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">ORDER BY rating DESC</span><span class="qb-mean">arrange it, highest rating first</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">SELECT name, rating</span> <span class="e-f">FROM restaurants</span> <span class="e-w">ORDER BY rating DESC</span> means <b>"show name and rating, and put the best-rated one at the top."</b></div></div>
  <p class="body">Run it, then change <code class="inl">DESC</code> to <code class="inl">ASC</code> and watch the list flip.</p>
  ${ed("SELECT name, rating FROM restaurants ORDER BY rating DESC",true)}

  <div class="sec-num">4.2</div><h3 class="section-h">Text and dates sort too</h3>
  <p class="body">ORDER BY is not just for numbers. Text sorts alphabetically, dates sort chronologically. Same clause, the database knows what kind of value each column holds.</p>
  <div class="ex"><div class="ex-tag">Alphabetical by name</div><div class="code"><span class="k">SELECT</span> name, city <span class="k">FROM</span> customers <span class="k">ORDER BY</span> name <span class="k">ASC</span></div><div class="ex-note">A to Z on the name. DESC would give Z to A.</div></div>
  ${ed("SELECT name, city FROM customers ORDER BY name ASC",true)}
  <div class="ex"><div class="ex-tag">Newest orders first</div><div class="code"><span class="k">SELECT</span> id, order_date <span class="k">FROM</span> orders <span class="k">ORDER BY</span> order_date <span class="k">DESC</span></div><div class="ex-note">Because our dates are stored in YYYY-MM-DD text, they sort correctly as dates. That tidy format is worth copying in your own tables.</div></div>
  ${ed("SELECT id, order_date FROM orders ORDER BY order_date DESC")}

  <div class="sec-num">4.3</div><h3 class="section-h">Sorting by more than one column</h3>
  <p class="body">Here is the piece that makes ORDER BY genuinely useful. You can give it several columns, separated by commas. It sorts by the first, and only uses the second to break ties, the third to break ties in the second, and so on. Each column can have its own ASC or DESC.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, city, rating <span class="k">FROM</span> restaurants
<span class="k">ORDER BY</span> city <span class="k">ASC</span>, rating <span class="k">DESC</span></div><div class="ex-note">First groups the rows by city alphabetically, then within each city puts the higher rating on top. The second column only matters when the first ties.</div></div>
  ${ed("SELECT name, city, rating FROM restaurants\nORDER BY city ASC, rating DESC",true)}
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">ORDER BY city ASC, rating DESC</span> means <b>"sort by city A to Z, and whenever two share a city, put the higher rating first."</b></div></div>

  <div class="sec-num">4.4</div><h3 class="section-h">Sorting by a calculation or an alias</h3>
  <p class="body">You can sort by an ${term('expression')}, not only a stored column. And if you gave that expression an ${term('alias')} with AS, you can order by the alias name, which reads more cleanly.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, cost_for_two / 2 <span class="k">AS</span> per_person
<span class="k">FROM</span> restaurants <span class="k">ORDER BY</span> per_person <span class="k">DESC</span></div><div class="ex-note">Sorts by the computed per-person cost, most expensive first, using the alias.</div></div>
  ${ed("SELECT name, cost_for_two / 2 AS per_person\nFROM restaurants ORDER BY per_person DESC",true)}
  <p class="aside">You may also see people sort by column position, like <code class="inl" style="font-size:12px">ORDER BY 2</code> meaning "the second selected column". It works, but it is fragile, if you reorder your SELECT, the sort silently changes. Name the column or alias instead. Clear beats clever.</p>

  <div class="sec-num">4.5</div><h3 class="section-h">Where the empty values land</h3>
  <p class="body">When you sort a column that has NULLs (like <code class="inl">rating_given</code> in orders), those blank rows have to go somewhere. Databases differ, but the common behaviour, and what SQLite does here, is NULLs sort as if they were the smallest value: they sit at the <b>top</b> in ascending order and the <b>bottom</b> in descending.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id, rating_given <span class="k">FROM</span> orders <span class="k">ORDER BY</span> rating_given <span class="k">DESC</span></div><div class="ex-note">The rated orders come first, highest to lowest, and the unrated (NULL) ones settle at the bottom.</div></div>
  ${ed("SELECT id, rating_given FROM orders ORDER BY rating_given DESC",true)}
  <p class="aside">Some databases let you say <code class="inl" style="font-size:12px">NULLS FIRST</code> or <code class="inl" style="font-size:12px">NULLS LAST</code> to control this explicitly. Not every engine supports it, so if NULL placement matters, check your database rather than assuming.</p>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>ASC is the default.</b> Leaving out the direction sorts ascending. If you want largest or newest first, you must say DESC.</li>
    <li><b>DESC applies to one column only.</b> In <code class="inl" style="font-size:12px">ORDER BY city, rating DESC</code>, only rating is descending, city is still ascending. Each column needs its own direction word.</li>
    <li><b>Clause order is fixed.</b> ORDER BY comes after WHERE, never before. <code class="inl" style="font-size:12px">SELECT ... FROM ... WHERE ... ORDER BY ...</code> is the sequence, and the database enforces it.</li>
    <li><b>Sorting does not remove rows.</b> ORDER BY only rearranges. If you want fewer rows, that is filtering (WHERE) or capping (LIMIT, next chapter), not sorting.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">The growing shape</h3>
  <p class="body">The skeleton now reads <code class="inl">SELECT ... FROM ... WHERE ... ORDER BY ...</code>. Name one or more columns to sort by, add DESC to reverse each, and remember multiple columns act as tie-breakers in the order you list them.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">Order matters in these answers, so the sequence of your rows has to match, not just the set.</p>
  ${q('q1','easy','Show <b>all columns</b> of restaurants, <b>highest rating first</b>.', i=>sameResult(i,'SELECT * FROM restaurants ORDER BY rating DESC'), 'SELECT * FROM restaurants ORDER BY rating DESC', 'ORDER BY rating DESC.')}
  ${q('q2','easy','Show <b>all columns</b> of restaurants, sorted by <b>name A to Z</b>.', i=>sameResult(i,'SELECT * FROM restaurants ORDER BY name ASC'), 'SELECT * FROM restaurants ORDER BY name', 'ASC is the default, you can even leave it out.')}
  ${q('q3','med','Show <b>name and cost_for_two</b>, cheapest first.', i=>sameResult(i,'SELECT name, cost_for_two FROM restaurants ORDER BY cost_for_two ASC'), 'SELECT name, cost_for_two FROM restaurants ORDER BY cost_for_two ASC', 'Ascending on cost_for_two.')}
  ${q('q4','med','Show <b>all columns</b> of customers, sorted by <b>city</b>, then by <b>name</b> within each city (both A to Z).', i=>sameResult(i,'SELECT * FROM customers ORDER BY city, name'), 'SELECT * FROM customers ORDER BY city, name', 'Two sort columns: city first, name as the tie-breaker.')}
  ${q('q5','hard','Show <b>name, city and rating</b> of restaurants, sorted by <b>city A to Z</b>, and within each city by <b>rating highest first</b>.', i=>sameResult(i,'SELECT name, city, rating FROM restaurants ORDER BY city ASC, rating DESC'), 'SELECT name, city, rating FROM restaurants ORDER BY city ASC, rating DESC', 'city ASC, rating DESC, each with its own direction.')}
`};

lessons['05']={ short:'LIMIT & OFFSET', where:'Part I · <b>LIMIT &amp; OFFSET</b>', render:()=>`
  <div class="eyebrow">Part I · Chapter 05</div>
  <h2 class="title">LIMIT & OFFSET, taking just a slice</h2>
  <p class="lead">You rarely want all ten thousand rows. You want the top five, the cheapest three, the next page of results. LIMIT caps how many rows come back, and OFFSET lets you skip past some first. Together they are how every "top 10" list and every paginated screen is built.</p>
  <hr class="rule">
  <p class="body">LIMIT goes at the very end of the query and simply says "stop after this many rows". On its own it just trims the count. Its real power shows up the moment you pair it with ORDER BY, because then "the first few rows" actually means something, the best, the cheapest, the newest.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You have arranged the order slips highest bill on top. Someone says, <b>"just hand me the top three."</b> You peel off three and keep the rest. That is LIMIT. If they say <b>"skip the top three, give me the next three,"</b> that skip is OFFSET.</div></div>

  <div class="sec-num">5.1</div><h3 class="section-h">Capping the rows with LIMIT</h3>
  <p class="body">Add <code class="inl">LIMIT n</code> at the end to get at most n rows.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> * <span class="k">FROM</span> restaurants <span class="k">LIMIT</span> 3</div><div class="ex-note">Three rows, no more. Useful for a quick peek at a big table without waiting for everything.</div></div>
  ${ed("SELECT * FROM restaurants LIMIT 3",true)}
  <p class="aside">On its own, LIMIT gives you "some rows", but which three? Whatever order the database happened to return. That is fine for a peek, but for a real answer you almost always want ORDER BY first, so the "first three" are the three you actually mean.</p>

  <div class="sec-num">5.2</div><h3 class="section-h">The real use: top-N with ORDER BY</h3>
  <p class="body">This is the pattern you will use constantly. Sort the rows, then LIMIT to the top few. "The three best-rated restaurants" is just ORDER BY rating DESC, then LIMIT 3.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT name, rating</span><span class="qb-mean">columns to show</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">ORDER BY rating DESC</span><span class="qb-mean">best first</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">LIMIT 3</span><span class="qb-mean">keep only the top three</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">ORDER BY rating DESC</span> <span class="e-w">LIMIT 3</span> means <b>"line them up best first, then hand me only the top three."</b></div></div>
  ${ed("SELECT name, rating FROM restaurants ORDER BY rating DESC LIMIT 3",true)}

  <div class="sec-num">5.3</div><h3 class="section-h">Skipping rows with OFFSET</h3>
  <p class="body"><code class="inl">OFFSET</code> tells the database to skip a number of rows before it starts counting toward the LIMIT. This is exactly how pages of results work: page one is offset 0, page two skips the first page's worth, and so on.</p>
  <div class="ex"><div class="ex-tag">Example, the 2 restaurants just below the top</div><div class="code"><span class="k">SELECT</span> name, rating <span class="k">FROM</span> restaurants
<span class="k">ORDER BY</span> rating <span class="k">DESC</span> <span class="k">LIMIT</span> 2 <span class="k">OFFSET</span> 1</div><div class="ex-note">Skip the single best one, then take the next two. Change OFFSET to 0 to include the top, or to 3 to jump further down.</div></div>
  ${ed("SELECT name, rating FROM restaurants\nORDER BY rating DESC LIMIT 2 OFFSET 1",true)}
  <div class="ex"><div class="ex-tag">The pagination idea</div><div class="code"><span class="c">-- page size 2. page 1: OFFSET 0. page 2: OFFSET 2. page 3: OFFSET 4.</span>
<span class="k">SELECT</span> * <span class="k">FROM</span> restaurants <span class="k">ORDER BY</span> id <span class="k">LIMIT</span> 2 <span class="k">OFFSET</span> 2</div><div class="ex-note">This is "page 2", two rows per page. The formula is OFFSET = (page number − 1) × page size.</div></div>
  ${ed("SELECT * FROM restaurants ORDER BY id LIMIT 2 OFFSET 2")}

  <div class="sec-num">5.4</div><h3 class="section-h">The same idea has different names</h3>
  <p class="body">This is one of the spots where SQL dialects disagree, worth knowing so other people's code does not confuse you. SQLite, MySQL and PostgreSQL use <code class="inl">LIMIT</code>. SQL Server uses <code class="inl">TOP</code> (as in <code class="inl">SELECT TOP 3 ...</code>). The official standard is <code class="inl">FETCH FIRST 3 ROWS ONLY</code>. They all do the same job.</p>
  <div class="ex"><div class="ex-tag">Same result, three dialects</div><div class="code"><span class="c">-- SQLite / MySQL / Postgres</span>
<span class="k">SELECT</span> * <span class="k">FROM</span> restaurants <span class="k">ORDER BY</span> rating <span class="k">DESC</span> <span class="k">LIMIT</span> 3;
<span class="c">-- SQL Server</span>
<span class="k">SELECT</span> <span class="k">TOP</span> 3 * <span class="k">FROM</span> restaurants <span class="k">ORDER BY</span> rating <span class="k">DESC</span>;
<span class="c">-- SQL standard</span>
<span class="k">SELECT</span> * <span class="k">FROM</span> restaurants <span class="k">ORDER BY</span> rating <span class="k">DESC</span> <span class="k">FETCH FIRST</span> 3 <span class="k">ROWS ONLY</span>;</div><div class="ex-note">Only the first runs here, since we are on SQLite. The other two are shown so you recognise them in the wild.</div></div>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>LIMIT without ORDER BY is a coin toss.</b> The rows you get are not guaranteed to be any particular ones. For a meaningful "top N", always sort first.</li>
    <li><b>OFFSET counts rows skipped, not pages.</b> To get page 3 with 10 per page, you skip 20 (<code class="inl" style="font-size:12px">OFFSET 20</code>), not <code class="inl" style="font-size:12px">OFFSET 3</code>.</li>
    <li><b>LIMIT is last.</b> It sits at the very end, after ORDER BY. The full order is SELECT, FROM, WHERE, ORDER BY, LIMIT.</li>
    <li><b>Large OFFSETs get slow.</b> On big tables, skipping a million rows to reach page 100000 is genuinely inefficient. It is fine to know now; the fix (keyset pagination) is a topic for much later.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Part I, complete</h3>
  <p class="body">You can now ask for exactly the columns you want, drop duplicates, filter to the rows that matter, sort them into order, and take just the slice you need. That is the entire everyday shape of a read query: <code class="inl">SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...</code>. Everything ahead builds on this.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">Order matters here, so your rows must come back in the right sequence.</p>
  ${q('q1','easy','Show the <b>first 3 rows</b> of the restaurants table (all columns).', i=>sameResult(i,'SELECT * FROM restaurants LIMIT 3'), 'SELECT * FROM restaurants LIMIT 3', 'Just LIMIT 3 at the end.')}
  ${q('q2','easy','Show the <b>first 5 customers</b> (all columns).', i=>sameResult(i,'SELECT * FROM customers LIMIT 5'), 'SELECT * FROM customers LIMIT 5', 'LIMIT 5.')}
  ${q('q3','med','Show the <b>name and rating</b> of the <b>top 3 restaurants by rating</b> (best first).', i=>sameResult(i,'SELECT name, rating FROM restaurants ORDER BY rating DESC LIMIT 3'), 'SELECT name, rating FROM restaurants ORDER BY rating DESC LIMIT 3', 'ORDER BY rating DESC, then LIMIT 3.')}
  ${q('q4','med','Show the <b>name and cost_for_two</b> of the <b>2 cheapest restaurants</b>.', i=>sameResult(i,'SELECT name, cost_for_two FROM restaurants ORDER BY cost_for_two ASC LIMIT 2'), 'SELECT name, cost_for_two FROM restaurants ORDER BY cost_for_two ASC LIMIT 2', 'Cheapest means ascending cost, then LIMIT 2.')}
  ${q('q5','hard','Show the <b>name and rating</b> of the <b>2 restaurants ranked just below the best</b>, that is: sort best first, skip the top one, take the next two.', i=>sameResult(i,'SELECT name, rating FROM restaurants ORDER BY rating DESC LIMIT 2 OFFSET 1'), 'SELECT name, rating FROM restaurants ORDER BY rating DESC LIMIT 2 OFFSET 1', 'ORDER BY rating DESC, then LIMIT 2 OFFSET 1.')}
`};

lessons['00']={ short:'What is SQL?', where:'Groundwork · <b>What even is SQL?</b>', render:()=>`
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What even is SQL?</h2>
  <p class="lead">Before the keywords and the practice, let us settle what this whole thing is. No jargon, no fear. If you have ever looked something up in a well-organised register, you already understand the idea. SQL just puts words to it.</p>
  <hr class="rule">
  <p class="body">Almost every app you use sits on top of a ${term('database')}, a tidy store of information. Inside it, data lives in ${term('table','tables')}: grids with columns across the top and rows down the side, exactly like sheets in Excel. One table for customers, one for restaurants, one for orders.</p>
  <p class="body"><b>SQL</b> (say it "sequel" or spell it out, both are fine) is the language you use to talk to that store. You write a short, almost-English sentence, the database reads it, and hands back a neat grid of answers. That sentence is called a ${term('query')}.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Think of the database as a very patient clerk with a filing cabinet. You do not rummage through the drawers yourself. You write a clear request, <b>"give me the names of customers in Mumbai"</b>, slide it across, and the clerk brings back exactly that. SQL is just the agreed language for writing those requests.</div></div>

  <div class="sec-num">0.1</div><h3 class="section-h">The shape of every question</h3>
  <p class="body">Nearly every query you read starts the same way: <b>SELECT</b> some columns <b>FROM</b> some table. SELECT means "show me", FROM means "out of this table". That is the backbone. Everything else you will learn, filtering, sorting, grouping, hangs off that spine.</p>
  <div class="ex"><div class="ex-tag">A real query, running right now</div><div class="code"><span class="k">SELECT</span> name, city <span class="k">FROM</span> customers</div><div class="ex-note">Below is that exact query against a real database in your browser. Nothing is faked, you can edit it and re-run.</div></div>
  ${ed("SELECT name, city FROM customers",true)}

  <div class="sec-num">0.2</div><h3 class="section-h">Reading comes before writing</h3>
  <p class="body">SQL does two broad things: it <b>reads</b> data (asking questions) and it <b>changes</b> data (adding, editing, removing). The reading half is where everyone starts, because it is safe, you cannot break anything by asking a question, and it is what you will do ninety percent of the time. This handbook spends its first several chapters purely on reading. The writing half comes much later, once reading is second nature.</p>
  <p class="aside">A comforting truth for the nervous beginner: a SELECT query never alters your data. Run it wrong, run it a hundred times, the tables stay exactly as they were. You are free to experiment.</p>

  <div class="sec-num">0.3</div><h3 class="section-h">Why it is worth your time</h3>
  <p class="body">Data lives in databases everywhere, in your company's systems, in analytics tools, behind dashboards. Being able to ask it questions yourself, without waiting for someone else, is one of the highest-leverage skills you can pick up. And it is genuinely learnable in small steps, which is exactly how the next chapters are built. Next up, let us meet the actual data you will be working with.</p>
`};

lessons['0i']={ short:'Meet the data', where:'Groundwork · <b>Meet the data</b>', render:()=>`
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the data</h2>
  <p class="lead">Every example and every practice question in this handbook uses the same three little tables, a tiny pretend food-delivery service. Spend two minutes here getting to know them, and every later chapter will feel familiar instead of abstract.</p>
  <hr class="rule">
  <p class="body">There are three tables: <b>customers</b>, <b>restaurants</b>, and <b>orders</b>. Run each one below to see what it holds. These are real queries against a real database running in your browser.</p>

  <div class="sec-num">i.1</div><h3 class="section-h">customers</h3>
  <p class="body">The people who order food. Each ${term('row')} is one customer, with an <code class="inl">id</code>, their <code class="inl">name</code>, their <code class="inl">city</code>, and the date they <code class="inl">joined</code>.</p>
  ${ed("SELECT * FROM customers",true)}

  <div class="sec-num">i.2</div><h3 class="section-h">restaurants</h3>
  <p class="body">The places to order from. Each row has an <code class="inl">id</code>, <code class="inl">name</code>, <code class="inl">city</code>, <code class="inl">cuisine</code>, a <code class="inl">rating</code> out of 5, and <code class="inl">cost_for_two</code> in rupees.</p>
  ${ed("SELECT * FROM restaurants",true)}

  <div class="sec-num">i.3</div><h3 class="section-h">orders</h3>
  <p class="body">The heart of it: who ordered from where. Each order has an <code class="inl">id</code>, the <code class="inl">amount</code> paid, the <code class="inl">order_date</code>, and a <code class="inl">rating_given</code>. Notice that some ratings are blank, shown as <b>NULL</b>, because not every customer leaves a rating. That gap is real and we will make good use of it later.</p>
  ${ed("SELECT * FROM orders",true)}

  <div class="sec-num">i.4</div><h3 class="section-h">How they connect</h3>
  <p class="body">This is the important bit. The orders table does not repeat the customer's name or the restaurant's name. Instead it stores their id numbers: <code class="inl">customer_id</code> points at a row in customers, and <code class="inl">restaurant_id</code> points at a row in restaurants. So an order is really a link, "customer 1 ordered from restaurant 5". Those links are what let us later join the tables back together and ask questions like "which city orders the most biryani".</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Think of an order slip that just says <b>"customer #1, restaurant #5, ₹360"</b>. It does not rewrite the customer's full details every time, that would be wasteful and error-prone. It points to them by number. Look the numbers up when you need the names. That pointing-by-id is the single most important idea in how databases are organised.</div></div>
  <p class="body">That is the whole world you will be working in. Three small tables, connected by ids. Now, on to actually asking questions of them, starting with SELECT.</p>
`};

lessons['06']={ short:'LIKE', where:'Part II · <b>LIKE &amp; wildcards</b>', render:()=>`
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">LIKE, matching text by its shape</h2>
  <p class="lead">Sometimes you do not know the exact value, only its pattern. Names starting with S. Emails ending in gmail.com. Anything containing the word "pizza". A plain <code class="inl">=</code> cannot do that, it demands an exact match. LIKE can, using two little wildcard symbols.</p>
  <hr class="rule">
  <p class="body">LIKE is used inside WHERE, just like <code class="inl">=</code>, but instead of an exact value you give it a <b>pattern</b>. Two wildcards do the work: <b>%</b> stands for any run of characters (including none), and <b>_</b> stands for exactly one character. Combine them and you can describe almost any text shape.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You are looking through a box of visiting cards and you only half-remember the shop's name: <b>"it started with Bur-something."</b> You do not need the full name, just the shape of the start. LIKE 'Bur%' is you saying exactly that, "begins with Bur, rest can be anything".</div></div>

  <div class="sec-num">6.1</div><h3 class="section-h">Starts with: the % wildcard</h3>
  <p class="body"><code class="inl">'B%'</code> means "a B, then anything after". The % soaks up whatever follows.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">WHERE name</span><span class="qb-mean">test the name column</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">LIKE 'B%'</span><span class="qb-mean">starts with B, anything after</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">WHERE name LIKE 'B%'</span> means <b>"keep rows whose name begins with B, no matter what comes next."</b></div></div>
  ${ed("SELECT name FROM restaurants WHERE name LIKE 'B%'",true)}

  <div class="sec-num">6.2</div><h3 class="section-h">Ends with, and contains</h3>
  <p class="body">Move the % to the front for "ends with", or put one on each side for "contains anywhere".</p>
  <div class="ex"><div class="ex-tag">Ends with 'i'</div><div class="code"><span class="k">SELECT</span> name, city <span class="k">FROM</span> customers <span class="k">WHERE</span> city <span class="k">LIKE</span> <span class="s">'%i'</span></div><div class="ex-note">Cities ending in the letter i, like Mumbai and Delhi.</div></div>
  ${ed("SELECT name, city FROM customers WHERE city LIKE '%i'",true)}
  <div class="ex"><div class="ex-tag">Contains 'ing' anywhere</div><div class="code"><span class="k">SELECT</span> name <span class="k">FROM</span> restaurants <span class="k">WHERE</span> name <span class="k">LIKE</span> <span class="s">'%ing%'</span></div><div class="ex-note">A % on both sides means "ing can sit anywhere inside the name".</div></div>
  ${ed("SELECT name FROM restaurants WHERE name LIKE '%ing%'")}

  <div class="sec-num">6.3</div><h3 class="section-h">Exactly one character: the _ wildcard</h3>
  <p class="body">The underscore matches a single character, no more, no less. It is for when you know the length or a fixed position.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> city <span class="k">FROM</span> customers <span class="k">WHERE</span> city <span class="k">LIKE</span> <span class="s">'P___'</span></div><div class="ex-note">P followed by exactly three characters, so a four-letter city starting with P. That matches Pune. Each underscore is one slot.</div></div>
  ${ed("SELECT DISTINCT city FROM customers WHERE city LIKE 'P___'",true)}

  <div class="sec-num">6.4</div><h3 class="section-h">Flipping it with NOT LIKE</h3>
  <p class="body">Put NOT in front to keep everything that does <b>not</b> match the pattern.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name <span class="k">FROM</span> restaurants <span class="k">WHERE</span> name <span class="k">NOT LIKE</span> <span class="s">'B%'</span></div><div class="ex-note">Every restaurant whose name does not start with B.</div></div>
  ${ed("SELECT name FROM restaurants WHERE name NOT LIKE 'B%'")}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>% and _ are for LIKE only.</b> They are wildcards inside LIKE patterns, not general SQL. With plain <code class="inl" style="font-size:12px">=</code> they are treated as literal characters.</li>
    <li><b>Case sensitivity varies.</b> In SQLite, LIKE ignores case for plain English letters, so <code class="inl" style="font-size:12px">'b%'</code> and <code class="inl" style="font-size:12px">'B%'</code> match the same rows. Other databases differ, do not rely on it; match the data as stored when you can.</li>
    <li><b>To match a literal % or _</b> in your data, you need an ESCAPE clause, for example <code class="inl" style="font-size:12px">LIKE '50\\%' ESCAPE '\\'</code>. Rare for beginners, but good to know it exists.</li>
    <li><b>Leading % is slow on big tables.</b> A pattern like <code class="inl" style="font-size:12px">'%pizza%'</code> cannot use an index and scans everything. Fine while learning, worth remembering later.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Two symbols, endless patterns</h3>
  <p class="body"><b>%</b> is any run of characters, <b>_</b> is exactly one. Put them at the start, end, or both sides to express "ends with", "starts with", or "contains". Add NOT to invert. That is the whole of pattern matching for now.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy','Show <b>all columns</b> of customers whose <b>name starts with A</b>.', i=>sameRowsAnyOrder(i,"SELECT * FROM customers WHERE name LIKE 'A%'"), "SELECT * FROM customers WHERE name LIKE 'A%'", "LIKE 'A%'.")}
  ${q('q2','easy','Show <b>all columns</b> of restaurants whose <b>name contains "ing"</b>.', i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE name LIKE '%ing%'"), "SELECT * FROM restaurants WHERE name LIKE '%ing%'", "A % on each side of ing.")}
  ${q('q3','med','Show the <b>name and city</b> of customers whose <b>city ends with the letter i</b>.', i=>sameRowsAnyOrder(i,"SELECT name, city FROM customers WHERE city LIKE '%i'"), "SELECT name, city FROM customers WHERE city LIKE '%i'", "Pattern '%i'.")}
  ${q('q4','med','Show <b>all columns</b> of restaurants whose <b>name does not start with B</b>.', i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE name NOT LIKE 'B%'"), "SELECT * FROM restaurants WHERE name NOT LIKE 'B%'", "NOT LIKE 'B%'.")}
  ${q('q5','hard','Show <b>all columns</b> of restaurants whose <b>cuisine ends with the letter s</b>.', i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE cuisine LIKE '%s'"), "SELECT * FROM restaurants WHERE cuisine LIKE '%s'", "Cuisines like Burgers and Sandwiches end in s.")}
`};

lessons['07']={ short:'IN & BETWEEN', where:'Part II · <b>IN &amp; BETWEEN</b>', render:()=>`
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">IN & BETWEEN, tidier ways to say "one of these" and "in this range"</h2>
  <p class="lead">You could write <code class="inl">city = 'Mumbai' OR city = 'Delhi' OR city = 'Pune'</code>. It works, but it is noisy, and it gets worse with every option. IN and BETWEEN are the clean shortcuts for "match any of these values" and "fall inside this range".</p>
  <hr class="rule">

  <div class="sec-num">7.1</div><h3 class="section-h">IN: any one of a list</h3>
  <p class="body"><b>IN</b> checks whether a value matches <b>any</b> item in a list you give it. It is exactly a stack of ORs, folded into one readable line.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">WHERE city</span><span class="qb-mean">test the city column</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">IN ('Mumbai', 'Delhi')</span><span class="qb-mean">match if it is any of these</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">WHERE city IN ('Mumbai', 'Delhi')</span> means <b>"keep the row if the city is Mumbai or Delhi."</b> Same result as two ORs, far easier to read.</div></div>
  ${ed("SELECT name, city FROM restaurants WHERE city IN ('Mumbai', 'Delhi')",true)}
  <div class="ex"><div class="ex-tag">NOT IN, everything except the list</div><div class="code"><span class="k">SELECT</span> name, city <span class="k">FROM</span> restaurants <span class="k">WHERE</span> city <span class="k">NOT IN</span> (<span class="s">'Mumbai'</span>, <span class="s">'Delhi'</span>)</div><div class="ex-note">Keeps the rows whose city is neither Mumbai nor Delhi.</div></div>
  ${ed("SELECT name, city FROM restaurants WHERE city NOT IN ('Mumbai', 'Delhi')")}

  <div class="sec-num">7.2</div><h3 class="section-h">BETWEEN: inside a range</h3>
  <p class="body"><b>BETWEEN</b> checks whether a value falls in a range, and it includes <b>both</b> ends. <code class="inl">BETWEEN 4.0 AND 4.5</code> keeps 4.0, keeps 4.5, and everything between.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, rating <span class="k">FROM</span> restaurants <span class="k">WHERE</span> rating <span class="k">BETWEEN</span> 4.0 <span class="k">AND</span> 4.5</div><div class="ex-note">Ratings from 4.0 up to 4.5, both boundaries included. It is the same as <code class="inl" style="font-size:12px">rating >= 4.0 AND rating <= 4.5</code>, just shorter.</div></div>
  ${ed("SELECT name, rating FROM restaurants WHERE rating BETWEEN 4.0 AND 4.5",true)}

  <div class="sec-num">7.3</div><h3 class="section-h">BETWEEN works on dates and text too</h3>
  <p class="body">Because our dates are stored as tidy YYYY-MM-DD text, BETWEEN handles them naturally, which is how you ask for "orders in the first week of June".</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id, order_date <span class="k">FROM</span> orders
<span class="k">WHERE</span> order_date <span class="k">BETWEEN</span> <span class="s">'2024-06-01'</span> <span class="k">AND</span> <span class="s">'2024-06-07'</span></div><div class="ex-note">Every order dated between the 1st and the 7th of June, inclusive.</div></div>
  ${ed("SELECT id, order_date FROM orders\nWHERE order_date BETWEEN '2024-06-01' AND '2024-06-07'",true)}

  <div class="sec-num">7.4</div><h3 class="section-h">Mixing them in</h3>
  <p class="body">IN and BETWEEN are ordinary conditions, so they combine with AND, OR and NOT like anything else in WHERE.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, city, rating <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> city <span class="k">IN</span> (<span class="s">'Delhi'</span>, <span class="s">'Bangalore'</span>) <span class="k">AND</span> rating >= 4.5</div><div class="ex-note">In Delhi or Bangalore, and rated at least 4.5. Two ideas, joined with AND.</div></div>
  ${ed("SELECT name, city, rating FROM restaurants\nWHERE city IN ('Delhi', 'Bangalore') AND rating >= 4.5",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>BETWEEN includes both ends.</b> <code class="inl" style="font-size:12px">BETWEEN 400 AND 600</code> keeps 400 and 600 themselves. If you want to exclude an end, use <code class="inl" style="font-size:12px">></code> and <code class="inl" style="font-size:12px"><</code> instead.</li>
    <li><b>Low value first.</b> Write <code class="inl" style="font-size:12px">BETWEEN 400 AND 600</code>, not the reverse. Backwards, it matches nothing.</li>
    <li><b>Quote a list of text, each item.</b> <code class="inl" style="font-size:12px">IN ('Mumbai', 'Delhi')</code>, every string in its own quotes. Numbers go unquoted: <code class="inl" style="font-size:12px">IN (1, 2, 3)</code>.</li>
    <li><b>NOT IN with NULLs can surprise you.</b> If the list could contain a NULL, NOT IN may quietly return nothing. We will see exactly why in the very next chapter on NULL.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Shortcuts worth the habit</h3>
  <p class="body">Use <b>IN</b> for "is it one of these listed values", and <b>BETWEEN</b> for "is it inside this range" (both ends included). They are just cleaner spellings of ORs and of paired <code class="inl">&gt;=</code>/<code class="inl">&lt;=</code> checks, and they keep long conditions readable.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy','Show <b>all columns</b> of restaurants in <b>Mumbai or Delhi</b>, using IN.', i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE city IN ('Mumbai','Delhi')"), "SELECT * FROM restaurants WHERE city IN ('Mumbai', 'Delhi')", "WHERE city IN ('Mumbai', 'Delhi').")}
  ${q('q2','easy','Show <b>all columns</b> of restaurants with a <b>rating between 4.0 and 4.5</b> (inclusive).', i=>sameRowsAnyOrder(i,'SELECT * FROM restaurants WHERE rating BETWEEN 4.0 AND 4.5'), 'SELECT * FROM restaurants WHERE rating BETWEEN 4.0 AND 4.5', 'BETWEEN 4.0 AND 4.5.')}
  ${q('q3','med','Show <b>all columns</b> of customers in <b>Mumbai, Delhi or Pune</b>, using IN.', i=>sameRowsAnyOrder(i,"SELECT * FROM customers WHERE city IN ('Mumbai','Delhi','Pune')"), "SELECT * FROM customers WHERE city IN ('Mumbai', 'Delhi', 'Pune')", "A three-item IN list.")}
  ${q('q4','med','Show <b>all columns</b> of restaurants whose <b>cost_for_two is between 400 and 600</b> (inclusive).', i=>sameRowsAnyOrder(i,'SELECT * FROM restaurants WHERE cost_for_two BETWEEN 400 AND 600'), 'SELECT * FROM restaurants WHERE cost_for_two BETWEEN 400 AND 600', 'Low value first in BETWEEN.')}
  ${q('q5','hard','Show <b>name, city and rating</b> of restaurants that are in <b>Delhi or Bangalore</b> and rated <b>at least 4.5</b>.', i=>sameRowsAnyOrder(i,"SELECT name, city, rating FROM restaurants WHERE city IN ('Delhi','Bangalore') AND rating >= 4.5"), "SELECT name, city, rating FROM restaurants WHERE city IN ('Delhi', 'Bangalore') AND rating >= 4.5", "IN for the cities, AND a rating condition.")}
`};

lessons['08']={ short:'NULL handling', where:'Part II · <b>NULL handling</b>', render:()=>`
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">NULL, the value that means "we don't know"</h2>
  <p class="lead">Real data has gaps. A customer who never left a rating, a phone number nobody filled in. SQL marks those gaps with a special marker called <b>NULL</b>. It is not zero, not an empty string, not "nothing", it is "unknown". And because it means unknown, it behaves in ways that surprise almost everyone at first. This chapter is where you make peace with it.</p>
  <hr class="rule">
  <p class="body">In our orders table, <code class="inl">rating_given</code> is NULL for the orders where the customer never rated. Run this and look at the blanks.</p>
  ${ed("SELECT id, amount, rating_given FROM orders",true)}
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Imagine an order slip where the rating box was left empty. It does not mean the customer gave it zero stars. It means <b>you simply do not know</b> what they thought. Zero is a rating; blank is the absence of one. SQL is careful to keep those two ideas apart, and so should you.</div></div>

  <div class="sec-num">8.1</div><h3 class="section-h">The big rule: you cannot use = with NULL</h3>
  <p class="body">This is the one that trips up everybody. Since NULL means "unknown", asking <code class="inl">rating_given = NULL</code> is like asking "is this unknown thing equal to another unknown thing?" SQL cannot say yes, so it answers "unknown", and the row is not kept. The query runs but returns nothing.</p>
  <div class="ex"><div class="ex-tag">The trap, returns 0 rows</div><div class="code"><span class="k">SELECT</span> * <span class="k">FROM</span> orders <span class="k">WHERE</span> rating_given = <span class="k">NULL</span></div><div class="ex-note">Looks reasonable, finds nothing. This is not a bug, it is NULL behaving as "unknown". Run it and see the empty result.</div></div>
  ${ed("SELECT * FROM orders WHERE rating_given = NULL",true)}

  <div class="sec-num">8.2</div><h3 class="section-h">The right way: IS NULL and IS NOT NULL</h3>
  <p class="body">To test for a gap, use <b>IS NULL</b>. To test for a real value, use <b>IS NOT NULL</b>. These are the only correct ways to check.</p>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">WHERE rating_given IS NULL</span> means <b>"keep the orders that have no rating"</b>, and <span class="e-f">IS NOT NULL</span> means <b>"keep the orders that do have one."</b></div></div>
  ${ed("SELECT id, rating_given FROM orders WHERE rating_given IS NULL",true)}
  ${ed("SELECT id, rating_given FROM orders WHERE rating_given IS NOT NULL",true)}

  <div class="sec-num">8.3</div><h3 class="section-h">NULLs quietly drop out of comparisons</h3>
  <p class="body">Any ordinary comparison against a NULL gives "unknown", so those rows fail the test and vanish from the result, without any error. Ask for ratings of 4 or more, and the unrated orders simply do not appear.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id, rating_given <span class="k">FROM</span> orders <span class="k">WHERE</span> rating_given >= 4</div><div class="ex-note">Only rated orders of 4+ come back. The NULL rows are not "less than 4", they are unknown, so they are left out entirely. Worth pausing on: a filter can silently exclude your gaps.</div></div>
  ${ed("SELECT id, rating_given FROM orders WHERE rating_given >= 4",true)}

  <div class="sec-num">8.4</div><h3 class="section-h">Counting around NULLs</h3>
  <p class="body">A small but useful preview of the next chapter. <code class="inl">COUNT(*)</code> counts every row, but <code class="inl">COUNT(column)</code> counts only the rows where that column is <b>not</b> NULL. The difference tells you how many gaps there are.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> <span class="k">COUNT</span>(*) <span class="k">AS</span> all_orders,
       <span class="k">COUNT</span>(rating_given) <span class="k">AS</span> rated_orders
<span class="k">FROM</span> orders</div><div class="ex-note">all_orders counts every order; rated_orders skips the NULLs. Subtract one from the other and you have the number of unrated orders.</div></div>
  ${ed("SELECT COUNT(*) AS all_orders, COUNT(rating_given) AS rated_orders FROM orders",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Never <code class="inl" style="font-size:12px">= NULL</code> or <code class="inl" style="font-size:12px">&lt;&gt; NULL</code>.</b> They always come out "unknown" and match nothing. Use <code class="inl" style="font-size:12px">IS NULL</code> and <code class="inl" style="font-size:12px">IS NOT NULL</code>, always.</li>
    <li><b>Filters hide NULLs silently.</b> <code class="inl" style="font-size:12px">WHERE rating_given &lt;&gt; 5</code> does not include the unrated orders, because "unknown ≠ 5" is itself unknown. To include them you must add <code class="inl" style="font-size:12px">OR rating_given IS NULL</code>.</li>
    <li><b>NULL is not 0 and not ''.</b> Zero and empty string are real, known values. NULL is the absence of a value. Mixing them up leads to wrong counts and wrong averages.</li>
    <li><b>DISTINCT is the odd exception.</b> As we saw, DISTINCT treats all NULLs as one value. That special case does not apply anywhere else.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Make peace with the unknown</h3>
  <p class="body">NULL means "unknown", so it never equals anything, not even another NULL. Test it only with <code class="inl">IS NULL</code> and <code class="inl">IS NOT NULL</code>, and stay alert that ordinary conditions quietly drop NULL rows. Later, in the CASE and null-functions chapter, you will learn to <b>replace</b> NULLs with a fallback value using COALESCE. For now, just knowing how to find and reason about them is the win.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy','Show <b>all columns</b> of orders that have <b>no rating</b> (rating_given is missing).', i=>sameRowsAnyOrder(i,'SELECT * FROM orders WHERE rating_given IS NULL'), 'SELECT * FROM orders WHERE rating_given IS NULL', 'IS NULL.')}
  ${q('q2','easy','Show <b>all columns</b> of orders that <b>do have a rating</b>.', i=>sameRowsAnyOrder(i,'SELECT * FROM orders WHERE rating_given IS NOT NULL'), 'SELECT * FROM orders WHERE rating_given IS NOT NULL', 'IS NOT NULL.')}
  ${q('q3','med','Show the <b>id and rating_given</b> of orders rated <b>4 or higher</b>.', i=>sameRowsAnyOrder(i,'SELECT id, rating_given FROM orders WHERE rating_given >= 4'), 'SELECT id, rating_given FROM orders WHERE rating_given >= 4', 'A normal comparison; NULLs drop out on their own.')}
  ${q('q4','med','Count how many orders are <b>missing a rating</b>, as a column called <b>missing</b>.', i=>sameResult(i,'SELECT COUNT(*) AS missing FROM orders WHERE rating_given IS NULL'), 'SELECT COUNT(*) AS missing FROM orders WHERE rating_given IS NULL', 'COUNT(*) with an IS NULL filter, aliased missing.')}
  ${q('q5','hard','Show the <b>id</b> of every order whose rating is <b>not 5</b>, and count the <b>unrated ones as "not 5" too</b>.', i=>sameRowsAnyOrder(i,'SELECT id FROM orders WHERE rating_given <> 5 OR rating_given IS NULL'), 'SELECT id FROM orders WHERE rating_given <> 5 OR rating_given IS NULL', 'A plain <> 5 misses the NULLs; add OR rating_given IS NULL to include them.')}
`};

lessons['09']={ short:'Aggregates', where:'Part III · <b>Aggregates</b>', render:()=>`
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Aggregates, turning many rows into one number</h2>
  <p class="lead">So far every query handed back rows. But often the question is a single summary: how many orders, total sales, the average rating, the priciest place. Aggregate functions take a whole column of values and boil them down to one answer. They are how raw data becomes a headline figure.</p>
  <hr class="rule">
  <p class="body">There are five you will use constantly: <b>COUNT</b> (how many), <b>SUM</b> (add them up), <b>AVG</b> (the average), <b>MIN</b> (the smallest), and <b>MAX</b> (the largest). Each takes a column, sweeps down every row, and returns one value.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">At the end of the day you do not read out every bill. You tot them up: <b>"forty orders, twelve thousand rupees total, biggest was seven hundred."</b> Those single-line summaries are aggregates. The individual slips still exist; you are just reporting the totals.</div></div>

  <div class="sec-num">9.1</div><h3 class="section-h">COUNT, how many rows</h3>
  <p class="body"><code class="inl">COUNT(*)</code> counts all rows. Give it a specific column instead and it counts only rows where that column is not NULL, a distinction you met in the last chapter.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> <span class="k">COUNT</span>(*) <span class="k">AS</span> total_orders <span class="k">FROM</span> orders</div><div class="ex-note">One number: how many orders exist in total. The AS gives the result a clean header.</div></div>
  ${ed("SELECT COUNT(*) AS total_orders FROM orders",true)}

  <div class="sec-num">9.2</div><h3 class="section-h">SUM and AVG</h3>
  <p class="body"><b>SUM</b> adds a numeric column; <b>AVG</b> averages it. Both quietly skip NULLs, so the average is over the values that actually exist.</p>
  <div class="ex"><div class="ex-tag">Total sales</div><div class="code"><span class="k">SELECT</span> <span class="k">SUM</span>(amount) <span class="k">AS</span> total_sales <span class="k">FROM</span> orders</div></div>
  ${ed("SELECT SUM(amount) AS total_sales FROM orders",true)}
  <div class="ex"><div class="ex-tag">Average rating</div><div class="code"><span class="k">SELECT</span> <span class="k">AVG</span>(rating) <span class="k">AS</span> avg_rating <span class="k">FROM</span> restaurants</div><div class="ex-note">The average comes out with a long decimal tail. Wrap it in ROUND to tidy up: <code class="inl" style="font-size:12px">ROUND(AVG(rating), 2)</code>.</div></div>
  ${ed("SELECT AVG(rating) AS avg_rating FROM restaurants",true)}
  ${ed("SELECT ROUND(AVG(rating), 2) AS avg_rating FROM restaurants")}

  <div class="sec-num">9.3</div><h3 class="section-h">MIN and MAX</h3>
  <p class="body"><b>MIN</b> and <b>MAX</b> return the smallest and largest value. They work on numbers, and also on text (alphabetical) and dates (earliest and latest).</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> <span class="k">MIN</span>(cost_for_two) <span class="k">AS</span> cheapest,
       <span class="k">MAX</span>(cost_for_two) <span class="k">AS</span> priciest
<span class="k">FROM</span> restaurants</div><div class="ex-note">Two aggregates in one query, each with its own alias. Perfectly normal.</div></div>
  ${ed("SELECT MIN(cost_for_two) AS cheapest, MAX(cost_for_two) AS priciest FROM restaurants",true)}

  <div class="sec-num">9.4</div><h3 class="section-h">Aggregates collapse everything to one row</h3>
  <p class="body">This is the mental model that matters. An aggregate folds the whole table into a single summary row. That is why you cannot mix a plain column with an aggregate in the same SELECT, <code class="inl">SELECT name, COUNT(*) FROM restaurants</code> makes no sense, because which single name would sit next to the count of six? The database either errors or picks one arbitrarily.</p>
  <p class="body">The fix, when you want a summary <b>per group</b> rather than for the whole table, is GROUP BY, which is the very next chapter and the natural partner to everything here.</p>
  <div class="ex"><div class="ex-tag">Filtering before aggregating still works</div><div class="code"><span class="k">SELECT</span> <span class="k">COUNT</span>(*) <span class="k">AS</span> mumbai_places <span class="k">FROM</span> restaurants <span class="k">WHERE</span> city = <span class="s">'Mumbai'</span></div><div class="ex-note">WHERE trims the rows first, then COUNT summarises what is left. So this counts only the Mumbai restaurants.</div></div>
  ${ed("SELECT COUNT(*) AS mumbai_places FROM restaurants WHERE city = 'Mumbai'",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>COUNT(*) vs COUNT(column).</b> The star counts rows; a column counts non-NULL values in it. On a column with gaps they give different numbers, and that is usually the point.</li>
    <li><b>Do not mix bare columns with aggregates.</b> Without GROUP BY, <code class="inl" style="font-size:12px">SELECT name, MAX(rating)</code> is a contradiction. Either aggregate everything, or group first.</li>
    <li><b>SUM and AVG ignore NULLs.</b> Helpful usually, but know that an AVG is over the present values only, not the total row count.</li>
    <li><b>AVG can look ugly.</b> Long decimals are normal; ROUND(value, places) makes results presentable.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Five words, endless summaries</h3>
  <p class="body">COUNT, SUM, AVG, MIN, MAX each squeeze a column into one figure. Alias the result for a clean header, filter first with WHERE if you only want part of the table, and remember an aggregate over the whole table gives exactly one row. To summarise per category instead, turn the page to GROUP BY.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">These return a single value; name it with the alias the question asks for.</p>
  ${q('q1','easy','Count <b>all orders</b>, as a column called <b>total</b>.', i=>sameResult(i,'SELECT COUNT(*) AS total FROM orders'), 'SELECT COUNT(*) AS total FROM orders', 'COUNT(*) AS total.')}
  ${q('q2','easy','Show the <b>highest cost_for_two</b> among restaurants, as <b>max_cost</b>.', i=>sameResult(i,'SELECT MAX(cost_for_two) AS max_cost FROM restaurants'), 'SELECT MAX(cost_for_two) AS max_cost FROM restaurants', 'MAX(cost_for_two) AS max_cost.')}
  ${q('q3','med','Show the <b>average rating</b> of restaurants, as <b>avg_rating</b>.', i=>sameResult(i,'SELECT AVG(rating) AS avg_rating FROM restaurants'), 'SELECT AVG(rating) AS avg_rating FROM restaurants', 'AVG(rating) AS avg_rating.')}
  ${q('q4','med','Show the <b>total of all order amounts</b>, as <b>total_sales</b>.', i=>sameResult(i,'SELECT SUM(amount) AS total_sales FROM orders'), 'SELECT SUM(amount) AS total_sales FROM orders', 'SUM(amount) AS total_sales.')}
  ${q('q5','hard','Count how many orders <b>actually have a rating</b>, as a column called <b>rated</b> (remember COUNT of a column skips NULLs).', i=>sameResult(i,'SELECT COUNT(rating_given) AS rated FROM orders'), 'SELECT COUNT(rating_given) AS rated FROM orders', 'COUNT(rating_given), not COUNT(*).')}
`};

lessons['10']={ short:'GROUP BY', where:'Part III · <b>GROUP BY</b>', render:()=>`
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">GROUP BY, one summary per category</h2>
  <p class="lead">Aggregates gave you one number for the whole table. But the useful questions are usually per category: how many customers <b>in each city</b>, total spend <b>per customer</b>, average rating <b>per cuisine</b>. GROUP BY splits the rows into groups and runs the aggregate once for each. This is where SQL starts answering real business questions.</p>
  <hr class="rule">
  <p class="body">The idea: name a column to group by, and the database gathers all rows that share a value in it into one bucket. Then any aggregate you write, COUNT, SUM, AVG, runs separately inside each bucket, giving you one summary row per group.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You have got the day's slips in a pile. You sort them into stacks, <b>one stack per area</b>: a Mumbai stack, a Delhi stack, a Pune stack. Then you count each stack. GROUP BY is the sorting-into-stacks; the aggregate is the counting of each. You end with one line per area, not one line for the whole pile.</div></div>

  <div class="sec-num">10.1</div><h3 class="section-h">Your first grouping</h3>
  <p class="body">How many customers live in each city? Group by city, then COUNT.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT city, COUNT(*)</span><span class="qb-mean">the group column, and a count</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">FROM customers</span><span class="qb-mean">from this table</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">GROUP BY city</span><span class="qb-mean">one bucket per city</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">SELECT city, COUNT(*)</span> <span class="e-f">FROM customers</span> <span class="e-w">GROUP BY city</span> means <b>"for each city, tell me how many customers it has."</b></div></div>
  ${ed("SELECT city, COUNT(*) AS customers FROM customers GROUP BY city",true)}

  <div class="sec-num">10.2</div><h3 class="section-h">The golden rule of GROUP BY</h3>
  <p class="body">Here is the rule that keeps you out of trouble: <b>every column in your SELECT must either be in the GROUP BY, or be inside an aggregate.</b> It makes sense once you see why. If you group by city, each result row stands for a whole city, so a plain <code class="inl">name</code> could not fit, which of the many names would it show? Only the grouped column (city) and summaries of the rest (COUNT, SUM...) have a single sensible value per group.</p>
  <div class="ex"><div class="ex-tag">Count and average together, per cuisine</div><div class="code"><span class="k">SELECT</span> cuisine,
       <span class="k">COUNT</span>(*) <span class="k">AS</span> places,
       <span class="k">ROUND</span>(<span class="k">AVG</span>(rating), 2) <span class="k">AS</span> avg_rating
<span class="k">FROM</span> restaurants
<span class="k">GROUP BY</span> cuisine</div><div class="ex-note">cuisine is grouped; places and avg_rating are aggregates. Every selected column obeys the rule, so this is valid.</div></div>
  ${ed("SELECT cuisine, COUNT(*) AS places, ROUND(AVG(rating), 2) AS avg_rating FROM restaurants GROUP BY cuisine",true)}

  <div class="sec-num">10.3</div><h3 class="section-h">Grouping the orders</h3>
  <p class="body">The orders table is where grouping earns its keep. Total spend per customer is just SUM(amount), grouped by customer_id.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> customer_id,
       <span class="k">COUNT</span>(*) <span class="k">AS</span> orders,
       <span class="k">SUM</span>(amount) <span class="k">AS</span> total_spent
<span class="k">FROM</span> orders
<span class="k">GROUP BY</span> customer_id</div><div class="ex-note">One row per customer_id, with how many orders they placed and how much they spent in total.</div></div>
  ${ed("SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS total_spent FROM orders GROUP BY customer_id",true)}

  <div class="sec-num">10.4</div><h3 class="section-h">Filter first, then group; sort the summary</h3>
  <p class="body">WHERE still works, and it runs <b>before</b> grouping, trimming which rows go into the buckets. And you can ORDER BY an aggregated column to rank your groups.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> restaurant_id, <span class="k">COUNT</span>(*) <span class="k">AS</span> orders
<span class="k">FROM</span> orders
<span class="k">GROUP BY</span> restaurant_id
<span class="k">ORDER BY</span> orders <span class="k">DESC</span></div><div class="ex-note">Orders per restaurant, busiest first. GROUP BY builds the summary, ORDER BY ranks it.</div></div>
  ${ed("SELECT restaurant_id, COUNT(*) AS orders FROM orders GROUP BY restaurant_id ORDER BY orders DESC",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>The golden rule again.</b> A bare column in SELECT that is neither grouped nor aggregated is the number one GROUP BY mistake. Most databases reject it; SQLite may return an arbitrary value, which is worse because it looks like it worked.</li>
    <li><b>WHERE cannot test an aggregate.</b> <code class="inl" style="font-size:12px">WHERE COUNT(*) > 1</code> is an error, because WHERE runs before the groups exist. Filtering on an aggregate is HAVING's job, coming next.</li>
    <li><b>Clause order is fixed.</b> <code class="inl" style="font-size:12px">SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ...</code>. GROUP BY sits after WHERE and before ORDER BY.</li>
    <li><b>Grouping by the right column.</b> Group by what defines a category (city, cuisine, customer_id), not by something unique like id, or every "group" is just one row.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Split, then summarise</h3>
  <p class="body">GROUP BY sorts rows into buckets by a column's value, and each aggregate runs once per bucket, giving one summary row per group. Keep to the golden rule (grouped or aggregated, nothing else in SELECT), filter rows first with WHERE, and rank the result with ORDER BY. To filter the <b>groups themselves</b>, you need HAVING.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy','For <b>each city</b>, show the city and the <b>number of customers</b> as <b>n</b>.', i=>sameRowsAnyOrder(i,'SELECT city, COUNT(*) AS n FROM customers GROUP BY city'), 'SELECT city, COUNT(*) AS n FROM customers GROUP BY city', 'GROUP BY city, COUNT(*) AS n.')}
  ${q('q2','easy','For <b>each cuisine</b>, show the cuisine and the <b>number of restaurants</b> as <b>n</b>.', i=>sameRowsAnyOrder(i,'SELECT cuisine, COUNT(*) AS n FROM restaurants GROUP BY cuisine'), 'SELECT cuisine, COUNT(*) AS n FROM restaurants GROUP BY cuisine', 'GROUP BY cuisine.')}
  ${q('q3','med','For <b>each customer_id</b>, show it with the <b>total amount</b> they spent as <b>total</b>.', i=>sameRowsAnyOrder(i,'SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id'), 'SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id', 'SUM(amount) grouped by customer_id.')}
  ${q('q4','med','For <b>each city</b>, show the city and the <b>average rating</b> of its restaurants as <b>avg_rating</b>.', i=>sameRowsAnyOrder(i,'SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city'), 'SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city', 'AVG(rating) grouped by city.')}
  ${q('q5','hard','For <b>each restaurant_id</b>, show it with its <b>number of orders</b> as <b>n</b>, <b>most orders first</b>.', i=>sameResult(i,'SELECT restaurant_id, COUNT(*) AS n FROM orders GROUP BY restaurant_id ORDER BY n DESC'), 'SELECT restaurant_id, COUNT(*) AS n FROM orders GROUP BY restaurant_id ORDER BY n DESC', 'Group, count, then ORDER BY n DESC.')}
`};

lessons['11']={ short:'HAVING', where:'Part III · <b>HAVING</b>', render:()=>`
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">HAVING, filtering the groups</h2>
  <p class="lead">You can group and summarise. Now the natural next question: "only show me the groups that meet some condition", cities with more than one customer, cuisines with an average rating above 4.4. You cannot use WHERE for that, because the condition is about the summary, not the raw rows. That is exactly what HAVING is for.</p>
  <hr class="rule">
  <p class="body">The clean way to hold it in your head: <b>WHERE filters rows before grouping, HAVING filters groups after.</b> WHERE decides which slips go into the stacks; HAVING decides which finished stacks you keep. HAVING can test aggregates like COUNT and AVG, which WHERE simply cannot.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You have sorted the slips into stacks by area and counted each. Now someone says, <b>"only tell me about the areas with more than one order."</b> You glance at each finished stack and toss the single-slip ones aside. That final sift, done on the counts rather than the slips, is HAVING.</div></div>

  <div class="sec-num">11.1</div><h3 class="section-h">Your first HAVING</h3>
  <p class="body">Which cities have more than one customer? Group by city, count, then keep only the groups where the count is above one.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">GROUP BY city</span><span class="qb-mean">one bucket per city</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">HAVING COUNT(*) > 1</span><span class="qb-mean">keep only buckets with more than one</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">GROUP BY city</span> <span class="e-w">HAVING COUNT(*) > 1</span> means <b>"make a group per city, then keep only the cities that have more than one customer."</b></div></div>
  ${ed("SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING COUNT(*) > 1",true)}

  <div class="sec-num">11.2</div><h3 class="section-h">HAVING can test any aggregate</h3>
  <p class="body">Not just counts. You can filter groups on SUM, AVG, MIN, MAX, whatever summarises the group.</p>
  <div class="ex"><div class="ex-tag">Cities whose restaurants average above 4.4</div><div class="code"><span class="k">SELECT</span> city, <span class="k">ROUND</span>(<span class="k">AVG</span>(rating), 2) <span class="k">AS</span> avg_rating
<span class="k">FROM</span> restaurants
<span class="k">GROUP BY</span> city
<span class="k">HAVING</span> <span class="k">AVG</span>(rating) > 4.4</div><div class="ex-note">Groups every city, then keeps only those whose average rating clears 4.4.</div></div>
  ${ed("SELECT city, ROUND(AVG(rating), 2) AS avg_rating FROM restaurants GROUP BY city HAVING AVG(rating) > 4.4",true)}

  <div class="sec-num">11.3</div><h3 class="section-h">WHERE and HAVING together</h3>
  <p class="body">They are not rivals, they team up. WHERE narrows the rows first, then grouping happens, then HAVING sifts the resulting groups. Both in one query is common and correct.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> customer_id, <span class="k">COUNT</span>(*) <span class="k">AS</span> orders
<span class="k">FROM</span> orders
<span class="k">WHERE</span> amount >= 400
<span class="k">GROUP BY</span> customer_id
<span class="k">HAVING</span> <span class="k">COUNT</span>(*) > 1</div><div class="ex-note">First keep only orders of 400 or more (WHERE), then group by customer, then keep only customers who have more than one such order (HAVING).</div></div>
  ${ed("SELECT customer_id, COUNT(*) AS orders FROM orders WHERE amount >= 400 GROUP BY customer_id HAVING COUNT(*) > 1",true)}
  <div class="sentence"><div class="lab">The pipeline, in order</div><div class="txt"><span class="e-f">WHERE</span> trims rows, then <span class="e-s">GROUP BY</span> forms groups, then <span class="e-w">HAVING</span> trims groups, then ORDER BY sorts what remains. That is the fixed sequence, and knowing it explains almost every "why did this not work".</div></div>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>WHERE for rows, HAVING for groups.</b> Trying to filter a raw column in HAVING, or an aggregate in WHERE, is the classic mix-up. Row conditions go in WHERE; aggregate conditions go in HAVING.</li>
    <li><b>HAVING needs a GROUP BY (almost always).</b> It filters groups, so it belongs with grouping. Technically it can run without one, treating the whole table as a single group, but that is rare.</li>
    <li><b>Clause order is fixed.</b> <code class="inl" style="font-size:12px">WHERE ... GROUP BY ... HAVING ... ORDER BY ...</code>. HAVING always comes after GROUP BY.</li>
    <li><b>Use the aggregate in HAVING, not the alias, to be safe.</b> <code class="inl" style="font-size:12px">HAVING COUNT(*) > 1</code> works everywhere; some databases also allow the alias, but the full expression is the portable choice.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Part III, complete</h3>
  <p class="body">You can now summarise a whole table with aggregates, split those summaries per category with GROUP BY, and keep only the groups you care about with HAVING. The full summarising pipeline is <code class="inl">WHERE → GROUP BY → HAVING → ORDER BY</code>. Next comes the big one: pulling data from more than one table at once, with JOINs.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy','Show the <b>cities that have more than one customer</b> (just the city column).', i=>sameRowsAnyOrder(i,'SELECT city FROM customers GROUP BY city HAVING COUNT(*) > 1'), 'SELECT city FROM customers GROUP BY city HAVING COUNT(*) > 1', 'GROUP BY city HAVING COUNT(*) > 1.')}
  ${q('q2','med','Show the <b>cuisines that have more than one restaurant</b> (just the cuisine column).', i=>sameRowsAnyOrder(i,'SELECT cuisine FROM restaurants GROUP BY cuisine HAVING COUNT(*) > 1'), 'SELECT cuisine FROM restaurants GROUP BY cuisine HAVING COUNT(*) > 1', 'Same shape, on restaurants.')}
  ${q('q3','med','Show each <b>customer_id with more than one order</b>, along with their <b>order count</b> as <b>orders</b>.', i=>sameRowsAnyOrder(i,'SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) > 1'), 'SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) > 1', 'Group by customer_id, HAVING COUNT(*) > 1.')}
  ${q('q4','hard','Show the <b>city and average rating</b> (as <b>avg_rating</b>) for cities whose restaurants <b>average above 4.4</b>.', i=>sameRowsAnyOrder(i,'SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city HAVING AVG(rating) > 4.4'), 'SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city HAVING AVG(rating) > 4.4', 'HAVING AVG(rating) > 4.4.')}
  ${q('q5','hard','Show each <b>restaurant_id that received more than one order</b>, with the <b>count</b> as <b>n</b>.', i=>sameRowsAnyOrder(i,'SELECT restaurant_id, COUNT(*) AS n FROM orders GROUP BY restaurant_id HAVING COUNT(*) > 1'), 'SELECT restaurant_id, COUNT(*) AS n FROM orders GROUP BY restaurant_id HAVING COUNT(*) > 1', 'Group by restaurant_id, HAVING COUNT(*) > 1.')}
`};

lessons['12']={ short:'JOINs', where:'Part IV · <b>JOINs</b>', render:()=>`
  <div class="eyebrow">Part IV · Chapter 12</div>
  <h2 class="title">JOINs, pulling from more than one table</h2>
  <p class="lead">This is the chapter that changes everything. Until now you have worked one table at a time. But real data is deliberately split apart, the orders table stores a customer_id, not the customer's name. To answer "who ordered what", you have to stitch tables back together. That stitching is a JOIN, and it is the heart of relational databases.</p>
  <hr class="rule">
  <p class="body">Remember from Meet the data: an order does not repeat the customer's name, it points at them by id. That pointing column is a ${term('foreign_key')}. A ${term('join')} follows that thread, matching each order's customer_id to the matching row in customers, and lets you select columns from both tables in one result.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You have a stack of order slips that just say <b>"customer #1"</b>, and a separate register of who each customer number is. To read the orders properly you lay the two side by side and, for each slip, look up the number in the register. A JOIN is the database doing that lookup for every row at once.</div></div>

  <div class="sec-num">12.1</div><h3 class="section-h">Your first join</h3>
  <p class="body">Match each order to its customer. You name the second table with <b>JOIN</b>, and tell the database how the two connect with <b>ON</b>.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT orders.id, customers.name</span><span class="qb-mean">columns from either table</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">FROM orders</span><span class="qb-mean">start with orders</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">JOIN customers</span><span class="qb-mean">bring in customers</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">ON orders.customer_id = customers.id</span><span class="qb-mean">matched where the ids line up</span></div></div>
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt"><span class="e-s">FROM orders</span> <span class="e-f">JOIN customers</span> <span class="e-w">ON orders.customer_id = customers.id</span> means <b>"for each order, find the customer whose id matches its customer_id, and treat them as one combined row."</b></div></div>
  ${ed("SELECT orders.id, customers.name, orders.amount\nFROM orders\nJOIN customers ON orders.customer_id = customers.id",true)}
  <p class="aside">This plain JOIN is an <b>inner</b> join: it keeps only rows that find a match on both sides. An order with no matching customer, or a customer with no orders, would not appear. We will handle that case shortly with LEFT JOIN.</p>

  <div class="sec-num">12.2</div><h3 class="section-h">Short table aliases</h3>
  <p class="body">Writing the full table name before every column gets tiring. Give each table a short ${term('alias')} right after its name, then use it as a prefix. This is how nearly all real join queries are written.</p>
  <div class="ex"><div class="ex-tag">Same query, tidier</div><div class="code"><span class="k">SELECT</span> o.id, c.name, o.amount
<span class="k">FROM</span> orders o
<span class="k">JOIN</span> customers c <span class="k">ON</span> o.customer_id = c.id</div><div class="ex-note">orders becomes o, customers becomes c. The query means exactly the same thing, it just reads more cleanly.</div></div>
  ${ed("SELECT o.id, c.name, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.id")}
  <p class="body">Prefixing matters when both tables have a column of the same name (both have <code class="inl">id</code>). Writing <code class="inl">id</code> alone would be ambiguous; <code class="inl">o.id</code> and <code class="inl">c.id</code> are clear.</p>

  <div class="sec-num">12.3</div><h3 class="section-h">Joining three tables</h3>
  <p class="body">You can chain joins. An order links to a customer <b>and</b> a restaurant, so add a second JOIN to pull in restaurant details too.</p>
  <div class="ex"><div class="ex-tag">Who ordered from where</div><div class="code"><span class="k">SELECT</span> o.id, c.name <span class="k">AS</span> customer, r.name <span class="k">AS</span> restaurant, o.amount
<span class="k">FROM</span> orders o
<span class="k">JOIN</span> customers c <span class="k">ON</span> o.customer_id = c.id
<span class="k">JOIN</span> restaurants r <span class="k">ON</span> o.restaurant_id = r.id</div><div class="ex-note">Three tables woven into one readable result: the order, the person, the place, the amount. Aliases on the two name columns stop them clashing.</div></div>
  ${ed("SELECT o.id, c.name AS customer, r.name AS restaurant, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN restaurants r ON o.restaurant_id = r.id",true)}

  <div class="sec-num">12.4</div><h3 class="section-h">LEFT JOIN, keeping the unmatched rows</h3>
  <p class="body">An inner join silently drops rows with no match. Often that is wrong, "list every customer and their orders" should still show a customer who has ordered nothing. <b>LEFT JOIN</b> keeps every row from the left (first) table, and fills the right side with NULLs where there is no match.</p>
  <div class="ex"><div class="ex-tag">Every customer, orders or not</div><div class="code"><span class="k">SELECT</span> c.name, o.id <span class="k">AS</span> order_id, o.amount
<span class="k">FROM</span> customers c
<span class="k">LEFT JOIN</span> orders o <span class="k">ON</span> c.id = o.customer_id</div><div class="ex-note">Watch for Karan Joshi: he has placed no orders, so he still appears once, with NULL in the order columns. An inner join would have hidden him entirely.</div></div>
  ${ed("SELECT c.name, o.id AS order_id, o.amount\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id",true)}
  <p class="aside">There are also RIGHT JOIN (keep all right-side rows) and FULL JOIN (keep both sides' unmatched rows). Modern SQLite supports them, but in practice people write LEFT JOIN for almost everything, just put the table you want to keep on the left. Knowing the others exist is enough for now.</p>

  <div class="sec-num">12.5</div><h3 class="section-h">Joining a table to itself</h3>
  <p class="body">A neat trick worth seeing once: a table can join to <b>itself</b>, using two different aliases, to compare rows within it. For instance, pairs of customers who live in the same city.</p>
  <div class="ex"><div class="ex-tag">Self join</div><div class="code"><span class="k">SELECT</span> a.name <span class="k">AS</span> person_1, b.name <span class="k">AS</span> person_2, a.city
<span class="k">FROM</span> customers a
<span class="k">JOIN</span> customers b <span class="k">ON</span> a.city = b.city <span class="k">AND</span> a.id < b.id</div><div class="ex-note">The same table plays two roles, a and b. The <code class="inl" style="font-size:12px">a.id &lt; b.id</code> condition stops a person pairing with themselves and avoids showing each pair twice.</div></div>
  ${ed("SELECT a.name AS person_1, b.name AS person_2, a.city\nFROM customers a\nJOIN customers b ON a.city = b.city AND a.id < b.id",true)}

  <div class="sec-num">12.6</div><h3 class="section-h">Joins with grouping, the real payoff</h3>
  <p class="body">Joins and GROUP BY together answer the questions people actually ask. "How many orders has each customer placed, by name?" Join to get names, group to count, and LEFT JOIN so the zero-order customer still shows.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> c.name, <span class="k">COUNT</span>(o.id) <span class="k">AS</span> orders
<span class="k">FROM</span> customers c
<span class="k">LEFT JOIN</span> orders o <span class="k">ON</span> c.id = o.customer_id
<span class="k">GROUP BY</span> c.id
<span class="k">ORDER BY</span> orders <span class="k">DESC</span></div><div class="ex-note">COUNT(o.id) counts only real orders, so Karan correctly shows 0 rather than 1. That is a subtle, important reason to count a column here, not COUNT(*).</div></div>
  ${ed("SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY orders DESC",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting ON.</b> A join without an ON condition pairs every row with every row (a cross join), producing a huge, meaningless result. Always say how the tables connect.</li>
    <li><b>Ambiguous columns.</b> When both tables share a column name, you must prefix it (<code class="inl" style="font-size:12px">c.id</code>, not <code class="inl" style="font-size:12px">id</code>), or the database complains it does not know which you mean.</li>
    <li><b>INNER JOIN hides no-match rows.</b> If a customer with no orders vanished from your result, that is an inner join doing its job. Switch to LEFT JOIN to keep them.</li>
    <li><b>COUNT(*) vs COUNT(column) after a LEFT JOIN.</b> On the unmatched rows the right columns are NULL, so <code class="inl" style="font-size:12px">COUNT(*)</code> counts 1 (the row exists) while <code class="inl" style="font-size:12px">COUNT(o.id)</code> counts 0. Usually you want the column form.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">The idea to carry forward</h3>
  <p class="body">A JOIN matches rows across tables on a shared value named in ON. Plain JOIN (inner) keeps only matches; LEFT JOIN keeps every left-side row and NULLs the rest. Use short aliases, prefix shared column names, chain joins for three or more tables, and pair joins with GROUP BY to answer real questions by name instead of by id.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">Use table aliases to keep these readable. Column order follows the question.</p>
  ${q('q1','easy','Show each <b>order id</b> together with the <b>customer name</b> (columns: id, name).', i=>sameRowsAnyOrder(i,'SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id'), 'SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id', 'JOIN customers ON o.customer_id = c.id.')}
  ${q('q2','easy','Show each <b>order id</b> together with the <b>restaurant name</b> (columns: id, name).', i=>sameRowsAnyOrder(i,'SELECT o.id, r.name FROM orders o JOIN restaurants r ON o.restaurant_id = r.id'), 'SELECT o.id, r.name FROM orders o JOIN restaurants r ON o.restaurant_id = r.id', 'Join orders to restaurants on restaurant_id.')}
  ${q('q3','med','Show the <b>order id, the customer name, and the restaurant name</b> for every order (three columns in that order).', i=>sameRowsAnyOrder(i,'SELECT o.id, c.name, r.name FROM orders o JOIN customers c ON o.customer_id = c.id JOIN restaurants r ON o.restaurant_id = r.id'), 'SELECT o.id, c.name, r.name FROM orders o JOIN customers c ON o.customer_id = c.id JOIN restaurants r ON o.restaurant_id = r.id', 'Two JOINs: one to customers, one to restaurants.')}
  ${q('q4','med','Show <b>every customer name</b> and <b>how many orders they placed</b> as <b>orders</b>, including customers with zero (use a LEFT JOIN).', i=>sameRowsAnyOrder(i,'SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id'), 'SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id', 'LEFT JOIN customers to orders, GROUP BY the customer, COUNT(o.id).')}
  ${q('q5','hard','Show each <b>customer name</b> with the <b>total amount</b> they have spent as <b>total</b>, highest spender first (customers with orders only).', i=>sameResult(i,'SELECT c.name, SUM(o.amount) AS total FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id ORDER BY total DESC'), 'SELECT c.name, SUM(o.amount) AS total FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id ORDER BY total DESC', 'JOIN, SUM(o.amount), GROUP BY customer, ORDER BY total DESC.')}
`};

lessons['13']={ short:'UNION', where:'Part IV · <b>UNION</b>', render:()=>`
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">UNION, stacking results on top of each other</h2>
  <p class="lead">A JOIN glues tables side by side, adding columns. UNION does the opposite direction: it stacks the rows of two results on top of each other, into one longer list. When you have similar data from two places and want it in a single column of results, UNION is the tool.</p>
  <hr class="rule">
  <p class="body">You write two SELECT statements and put <b>UNION</b> between them. The database runs both and piles the second result underneath the first. Think side-by-side versus end-to-end: JOIN widens, UNION lengthens.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You have one list of names from the customer register and another from the restaurant-owner register, and someone asks for <b>"one combined list of everyone."</b> You simply write the second list below the first. That stacking is UNION.</div></div>

  <div class="sec-num">13.1</div><h3 class="section-h">Stacking two results</h3>
  <p class="body">Every city that appears in either the customers table or the restaurants table, as one column.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> city <span class="k">FROM</span> customers
<span class="k">UNION</span>
<span class="k">SELECT</span> city <span class="k">FROM</span> restaurants</div><div class="ex-note">Two queries, stacked. Notice the result has no repeats, even though several customers and restaurants share cities.</div></div>
  ${ed("SELECT city FROM customers\nUNION\nSELECT city FROM restaurants",true)}

  <div class="sec-num">13.2</div><h3 class="section-h">UNION removes duplicates, UNION ALL keeps them</h3>
  <p class="body">Plain <b>UNION</b> quietly removes duplicate rows across the combined result, a bit like DISTINCT over the whole stack. If you want every row kept, including repeats, use <b>UNION ALL</b>. It is also faster, since it skips the de-duplication work.</p>
  <div class="ex"><div class="ex-tag">Every city, repeats and all</div><div class="code"><span class="k">SELECT</span> city <span class="k">FROM</span> customers
<span class="k">UNION ALL</span>
<span class="k">SELECT</span> city <span class="k">FROM</span> restaurants</div><div class="ex-note">Now you get all seven customer cities plus all six restaurant cities, thirteen rows, duplicates included. Compare with the four from plain UNION above.</div></div>
  ${ed("SELECT city FROM customers\nUNION ALL\nSELECT city FROM restaurants",true)}
  <p class="aside">A good habit: reach for UNION ALL by default when you know there are no duplicates, or when you actually want them. Use plain UNION only when de-duplicating is genuinely the point, since it costs extra work.</p>

  <div class="sec-num">13.3</div><h3 class="section-h">The two rules that must hold</h3>
  <p class="body">UNION is strict about shape. Both SELECTs must return the <b>same number of columns</b>, and the columns must line up in a sensible <b>order and type</b> (text under text, numbers under numbers). The column <b>names</b> of the final result come from the <b>first</b> SELECT; the second's names are ignored.</p>
  <div class="qb"><div class="qb-title">What lines up with what</div>
    <div class="qb-row"><span class="qb-kw kw-p">column count</span><span class="qb-mean">must be equal on both sides</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">column types</span><span class="qb-mean">should match position by position</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">result names</span><span class="qb-mean">taken from the first SELECT only</span></div></div>

  <div class="sec-num">13.4</div><h3 class="section-h">Tagging where each row came from</h3>
  <p class="body">A common, genuinely useful pattern: add a constant column to each SELECT so you can tell the two sources apart once they are stacked.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, <span class="s">'customer'</span> <span class="k">AS</span> type <span class="k">FROM</span> customers
<span class="k">UNION ALL</span>
<span class="k">SELECT</span> name, <span class="s">'restaurant'</span> <span class="k">AS</span> type <span class="k">FROM</span> restaurants</div><div class="ex-note">Each row carries a label saying whether it came from customers or restaurants. The constant string is just another column.</div></div>
  ${ed("SELECT name, 'customer' AS type FROM customers\nUNION ALL\nSELECT name, 'restaurant' AS type FROM restaurants",true)}

  <div class="sec-num">13.5</div><h3 class="section-h">Sorting the whole stack</h3>
  <p class="body">An ORDER BY goes at the <b>very end</b> and sorts the entire combined result, not just one half. You cannot put an ORDER BY inside the first SELECT of a union.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> city <span class="k">FROM</span> customers
<span class="k">UNION</span>
<span class="k">SELECT</span> city <span class="k">FROM</span> restaurants
<span class="k">ORDER BY</span> city</div><div class="ex-note">The four distinct cities, alphabetised. The ORDER BY applies to the stacked result as a whole.</div></div>
  ${ed("SELECT city FROM customers\nUNION\nSELECT city FROM restaurants\nORDER BY city",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Column counts must match.</b> Two columns on top, three below, and the database refuses. Same number, both sides.</li>
    <li><b>UNION de-duplicates, which can hide real rows.</b> If two genuinely different records happen to look identical in the selected columns, plain UNION collapses them into one. Use UNION ALL if every row matters.</li>
    <li><b>Names come from the first SELECT.</b> Do not be surprised that the second query's aliases are ignored in the final headers.</li>
    <li><b>ORDER BY goes last, once.</b> It sorts the whole union. Trying to sort each half separately is not how it works.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Part IV, complete</h3>
  <p class="body">JOIN widens by matching rows across tables; UNION lengthens by stacking result rows. Use <b>UNION</b> to merge-and-dedupe, <b>UNION ALL</b> to merge and keep everything, keep the column counts and types aligned, and remember the final names come from the first SELECT and a single ORDER BY at the end sorts the lot. Next, the advanced toolkit: CASE and the null-functions.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy','Produce a <b>single column of the distinct cities</b> that appear in either customers or restaurants (use UNION).', i=>sameRowsAnyOrder(i,'SELECT city FROM customers UNION SELECT city FROM restaurants'), 'SELECT city FROM customers UNION SELECT city FROM restaurants', 'Two SELECTs of city with UNION between them.')}
  ${q('q2','easy','Produce <b>every city from both tables including duplicates</b> (use UNION ALL), one column.', i=>sameRowsAnyOrder(i,'SELECT city FROM customers UNION ALL SELECT city FROM restaurants'), 'SELECT city FROM customers UNION ALL SELECT city FROM restaurants', 'UNION ALL keeps duplicates.')}
  ${q('q3','med','Produce a <b>single list of all names</b>, customer names then restaurant names, keeping duplicates (one column called name).', i=>sameRowsAnyOrder(i,'SELECT name FROM customers UNION ALL SELECT name FROM restaurants'), 'SELECT name FROM customers UNION ALL SELECT name FROM restaurants', 'Stack the two name columns with UNION ALL.')}
  ${q('q4','med','Produce a combined list of <b>name and a type label</b>, where customer rows are tagged <b>customer</b> and restaurant rows <b>restaurant</b> (columns: name, type).', i=>sameRowsAnyOrder(i,"SELECT name, 'customer' AS type FROM customers UNION ALL SELECT name, 'restaurant' AS type FROM restaurants"), "SELECT name, 'customer' AS type FROM customers UNION ALL SELECT name, 'restaurant' AS type FROM restaurants", "Add a constant string column to each SELECT.")}
  ${q('q5','hard','Produce the <b>distinct cities</b> from both tables, <b>sorted alphabetically</b> (one column).', i=>sameResult(i,'SELECT city FROM customers UNION SELECT city FROM restaurants ORDER BY city'), 'SELECT city FROM customers UNION SELECT city FROM restaurants ORDER BY city', 'UNION, then a single ORDER BY city at the very end.')}
`};

lessons['14']={ short:'CASE & null functions', where:'Part V · <b>CASE &amp; null functions</b>', render:()=>`
  <div class="eyebrow">Part V · Chapter 14</div>
  <h2 class="title">CASE and the null-functions, decisions inside a query</h2>
  <p class="lead">Sometimes a plain column is not enough, you want the query itself to make a small decision per row. "Label anything above 4.5 as top-rated." "Show 'Not rated' instead of a blank." CASE gives you if-then-else right inside SELECT, and a trio of null-functions cleanly handle those empty values you met earlier.</p>
  <hr class="rule">

  <div class="sec-num">14.1</div><h3 class="section-h">CASE, if-then-else for a column</h3>
  <p class="body"><b>CASE</b> checks conditions in order and returns the first match. It reads almost like English: WHEN this THEN that, with an ELSE for everything left over, closed by END.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">CASE</span><span class="qb-mean">start a decision</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">WHEN rating >= 4.5 THEN 'top'</span><span class="qb-mean">first test and its result</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">WHEN rating >= 4.2 THEN 'good'</span><span class="qb-mean">checked only if the first failed</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">ELSE 'ok' END</span><span class="qb-mean">everything else, then close</span></div></div>
  ${ed("SELECT name, rating,\n  CASE WHEN rating >= 4.5 THEN 'top'\n       WHEN rating >= 4.2 THEN 'good'\n       ELSE 'ok' END AS tier\nFROM restaurants",true)}
  <div class="sentence"><div class="lab">Read it as a sentence</div><div class="txt">For each restaurant: <span class="e-s">if the rating is at least 4.5 call it 'top'</span>, <span class="e-f">else if at least 4.2 call it 'good'</span>, <span class="e-w">otherwise 'ok'</span>. The tests are tried top to bottom, first hit wins.</div></div>

  <div class="sec-num">14.2</div><h3 class="section-h">The shorter form, when comparing one column</h3>
  <p class="body">When every test compares the <b>same</b> column to a value, there is a compact form: put the column right after CASE.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, cuisine,
  <span class="k">CASE</span> cuisine
    <span class="k">WHEN</span> <span class="s">'Pizza'</span> <span class="k">THEN</span> <span class="s">'Italian-ish'</span>
    <span class="k">WHEN</span> <span class="s">'Biryani'</span> <span class="k">THEN</span> <span class="s">'Desi'</span>
    <span class="k">ELSE</span> <span class="s">'Other'</span> <span class="k">END</span> <span class="k">AS</span> family
<span class="k">FROM</span> restaurants</div><div class="ex-note">Handy when you are mapping the values of a single column. For anything with ranges or mixed conditions, use the longer WHEN form above.</div></div>
  ${ed("SELECT name, cuisine,\n  CASE cuisine WHEN 'Pizza' THEN 'Italian-ish' WHEN 'Biryani' THEN 'Desi' ELSE 'Other' END AS family\nFROM restaurants")}

  <div class="sec-num">14.3</div><h3 class="section-h">COALESCE, filling in the blanks</h3>
  <p class="body">Back to NULLs. <b>COALESCE</b> takes a list of values and returns the <b>first one that is not NULL</b>. Its everyday use is replacing a missing value with a sensible fallback, exactly what you want for the unrated orders.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id, rating_given,
       <span class="k">COALESCE</span>(rating_given, 0) <span class="k">AS</span> rating_or_zero
<span class="k">FROM</span> orders</div><div class="ex-note">Where rating_given is NULL, COALESCE falls through to 0. Where it has a value, that value is kept. You can pass more than two arguments; it returns the first non-NULL among them.</div></div>
  ${ed("SELECT id, rating_given, COALESCE(rating_given, 0) AS rating_or_zero FROM orders",true)}
  <p class="body">It works with text too, which reads nicely in reports:</p>
  ${ed("SELECT id, COALESCE(rating_given, 'Not rated') AS rating_label FROM orders")}

  <div class="sec-num">14.4</div><h3 class="section-h">IFNULL and NULLIF</h3>
  <p class="body">Two close cousins. <b>IFNULL(a, b)</b> is COALESCE with exactly two arguments, return a unless it is NULL, in which case b. <b>NULLIF(a, b)</b> is the mirror image: it returns NULL when a equals b, otherwise a. NULLIF is handy for turning a placeholder (like 0 or an empty string) back into a real NULL, or for dodging divide-by-zero.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id,
       <span class="k">IFNULL</span>(rating_given, 0) <span class="k">AS</span> via_ifnull,
       <span class="k">NULLIF</span>(amount, 500) <span class="k">AS</span> amount_or_null
<span class="k">FROM</span> orders</div><div class="ex-note">via_ifnull mirrors COALESCE(rating_given, 0). amount_or_null shows NULL wherever the amount is exactly 500, and the amount otherwise.</div></div>
  ${ed("SELECT id, IFNULL(rating_given, 0) AS via_ifnull, NULLIF(amount, 500) AS amount_or_null FROM orders")}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>CASE returns the first match.</b> Order your WHENs from most specific to most general, since once one matches, the rest are skipped.</li>
    <li><b>Do not forget END.</b> A CASE that is not closed with END is a syntax error. The shape is CASE ... WHEN ... THEN ... ELSE ... END.</li>
    <li><b>No ELSE means NULL.</b> If you leave out ELSE and nothing matches, the result is NULL, not an error. Add an ELSE when you want a guaranteed value.</li>
    <li><b>IFNULL is SQLite/MySQL flavour.</b> COALESCE is the portable, standard one and works everywhere, so prefer it unless you have a reason.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Decisions and fallbacks</h3>
  <p class="body">CASE builds an if-then-else column, checked top to bottom, closed with END. COALESCE returns the first non-NULL (your go-to for replacing blanks), IFNULL is its two-argument form, and NULLIF turns a specific value back into NULL. Together they let a query shape and clean its own output.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy',"Show <b>name, rating</b>, and a column <b>tier</b> that is 'high' when the rating is 4.5 or more, otherwise 'low'.", i=>sameRowsAnyOrder(i,"SELECT name, rating, CASE WHEN rating >= 4.5 THEN 'high' ELSE 'low' END AS tier FROM restaurants"), "SELECT name, rating, CASE WHEN rating >= 4.5 THEN 'high' ELSE 'low' END AS tier FROM restaurants", "CASE WHEN rating >= 4.5 THEN 'high' ELSE 'low' END AS tier.")}
  ${q('q2','easy',"Show <b>id</b> and <b>rating_given</b> replaced with 0 where it is missing, as a column called <b>rating</b>.", i=>sameRowsAnyOrder(i,"SELECT id, COALESCE(rating_given, 0) AS rating FROM orders"), "SELECT id, COALESCE(rating_given, 0) AS rating FROM orders", "COALESCE(rating_given, 0) AS rating.")}
  ${q('q3','med',"Show <b>id</b> and a column <b>label</b> that reads 'Not rated' where rating_given is missing, otherwise the rating itself.", i=>sameRowsAnyOrder(i,"SELECT id, COALESCE(rating_given, 'Not rated') AS label FROM orders"), "SELECT id, COALESCE(rating_given, 'Not rated') AS label FROM orders", "COALESCE with a text fallback.")}
  ${q('q4','med',"Show <b>name, cost_for_two</b>, and a column <b>bucket</b>: 'cheap' under 400, 'mid' from 400 up to 500, 'pricey' above 500.", i=>sameRowsAnyOrder(i,"SELECT name, cost_for_two, CASE WHEN cost_for_two < 400 THEN 'cheap' WHEN cost_for_two <= 500 THEN 'mid' ELSE 'pricey' END AS bucket FROM restaurants"), "SELECT name, cost_for_two, CASE WHEN cost_for_two < 400 THEN 'cheap' WHEN cost_for_two <= 500 THEN 'mid' ELSE 'pricey' END AS bucket FROM restaurants", "Three-way CASE with ranges, most specific first.")}
  ${q('q5','hard',"Show <b>id, amount</b>, and a column <b>amount_or_null</b> that is NULL when the amount is exactly 500 and the amount otherwise.", i=>sameRowsAnyOrder(i,"SELECT id, amount, NULLIF(amount, 500) AS amount_or_null FROM orders"), "SELECT id, amount, NULLIF(amount, 500) AS amount_or_null FROM orders", "NULLIF(amount, 500).")}
`};

lessons['15']={ short:'Subqueries', where:'Part V · <b>Subqueries</b>', render:()=>`
  <div class="eyebrow">Part V · Chapter 15</div>
  <h2 class="title">Subqueries, a query inside a query</h2>
  <p class="lead">Some questions need an answer before they can even be asked. "Which restaurants are rated above average?" You first have to work out the average, then compare each restaurant to it. A ${term('subquery')} lets you nest that first query inside the second, so SQL computes the inner answer and feeds it to the outer question.</p>
  <hr class="rule">

  <div class="sec-num">15.1</div><h3 class="section-h">A single-value subquery</h3>
  <p class="body">The simplest kind returns <b>one value</b>, and you drop it into a WHERE comparison inside parentheses. "Above average rating" is the classic example.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, rating <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> rating > (<span class="k">SELECT</span> <span class="k">AVG</span>(rating) <span class="k">FROM</span> restaurants)</div><div class="ex-note">The inner query works out the average rating once. The outer query then keeps every restaurant scoring above that number. You could not do this in one flat query, because you need the average before you can compare to it.</div></div>
  ${ed("SELECT name, rating FROM restaurants\nWHERE rating > (SELECT AVG(rating) FROM restaurants)",true)}

  <div class="sec-num">15.2</div><h3 class="section-h">A subquery that returns a list, with IN</h3>
  <p class="body">A subquery can also return a whole <b>column of values</b>, which pairs naturally with IN. "Customers who have placed at least one order" is really "customers whose id appears in the list of customer_ids from orders".</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">WHERE id IN</span><span class="qb-mean">keep customers whose id is in the list</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">(SELECT customer_id FROM orders)</span><span class="qb-mean">the list of everyone who ordered</span></div></div>
  ${ed("SELECT * FROM customers\nWHERE id IN (SELECT customer_id FROM orders)",true)}

  <div class="sec-num">15.3</div><h3 class="section-h">Flipping it: who is NOT in the list</h3>
  <p class="body">Swap IN for <b>NOT IN</b> to find the customers who have never ordered, the ones whose id does not appear in orders at all.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> * <span class="k">FROM</span> customers
<span class="k">WHERE</span> id <span class="k">NOT IN</span> (<span class="k">SELECT</span> customer_id <span class="k">FROM</span> orders)</div><div class="ex-note">This finds Karan Joshi, our customer with no orders. It is the subquery way of answering what a LEFT JOIN could also tell you.</div></div>
  ${ed("SELECT * FROM customers\nWHERE id NOT IN (SELECT customer_id FROM orders)",true)}
  <p class="aside">Here is that NULL warning coming true. If the subquery's list could contain a NULL, NOT IN may return nothing at all, because "is this id not equal to an unknown?" is itself unknown. When using NOT IN with a subquery, make sure the inner column has no NULLs, or use NOT EXISTS instead (next).</p>

  <div class="sec-num">15.4</div><h3 class="section-h">EXISTS, asking "is there at least one?"</h3>
  <p class="body"><b>EXISTS</b> takes a subquery and is true if that subquery finds <b>any</b> row. It usually refers back to the outer row (that is called a correlated subquery), which makes it perfect for "customers who have an order".</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> * <span class="k">FROM</span> customers c
<span class="k">WHERE</span> <span class="k">EXISTS</span> (
  <span class="k">SELECT</span> 1 <span class="k">FROM</span> orders o <span class="k">WHERE</span> o.customer_id = c.id
)</div><div class="ex-note">For each customer, the inner query looks for even one matching order. If it finds one, EXISTS is true and the customer is kept. The <code class="inl" style="font-size:12px">SELECT 1</code> is a convention, EXISTS only cares whether a row exists, not what it contains. Use NOT EXISTS for the opposite.</div></div>
  ${ed("SELECT * FROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)",true)}

  <div class="sec-num">15.5</div><h3 class="section-h">A subquery as a table (in FROM)</h3>
  <p class="body">A subquery can even stand in for a table in the FROM clause, called a derived table. You compute a summary, then query that summary. Give it an alias so you can refer to it.</p>
  <div class="ex"><div class="ex-tag">Example, the busiest customers by spend</div><div class="code"><span class="k">SELECT</span> customer_id, total
<span class="k">FROM</span> (
  <span class="k">SELECT</span> customer_id, <span class="k">SUM</span>(amount) <span class="k">AS</span> total
  <span class="k">FROM</span> orders <span class="k">GROUP BY</span> customer_id
) <span class="k">AS</span> spend
<span class="k">WHERE</span> total > 1000</div><div class="ex-note">The inner query builds a per-customer spend table; the outer query keeps only the big spenders. It is like doing one step, then querying its result.</div></div>
  ${ed("SELECT customer_id, total\nFROM (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) AS spend\nWHERE total > 1000",true)}

  <div class="sec-num">15.6</div><h3 class="section-h">ANY and ALL, comparing to a whole set</h3>
  <p class="body">Two standard-SQL operators pair with a subquery that returns a column. <b>ANY</b> is true if the comparison holds for <b>at least one</b> value in the set; <b>ALL</b> is true only if it holds for <b>every</b> value. So "greater than ALL Delhi ratings" means beating the best of them, while "greater than ANY Delhi rating" only means beating the worst.</p>
  <div class="ex"><div class="ex-tag">Standard SQL (MySQL, PostgreSQL, SQL Server)</div><div class="code"><span class="k">SELECT</span> name, rating <span class="k">FROM</span> restaurants
<span class="k">WHERE</span> rating > <span class="k">ALL</span> (<span class="k">SELECT</span> rating <span class="k">FROM</span> restaurants <span class="k">WHERE</span> city = <span class="s">'Delhi'</span>)</div><div class="ex-note">This is the portable, standard form. One honest catch, tying back to the dialects chapter: SQLite (what this course runs on) does not implement ANY/ALL, so the runnable cell below uses the exact equivalent instead.</div></div>
  <p class="body">The equivalent works everywhere, including SQLite, and is arguably clearer: "greater than ALL" is just "greater than the <b>MAX</b>", and "greater than ANY" is "greater than the <b>MIN</b>". Run it and compare, then swap MAX for MIN to see the ANY behaviour.</p>
  ${ed("SELECT name, rating FROM restaurants\nWHERE rating > (SELECT MAX(rating) FROM restaurants WHERE city = 'Delhi')",true)}
  <p class="aside">Also worth knowing: <code class="inl" style="font-size:12px">= ANY (...)</code> is exactly the same as <code class="inl" style="font-size:12px">IN (...)</code>, and <code class="inl" style="font-size:12px">&lt;&gt; ALL (...)</code> is the same as <code class="inl" style="font-size:12px">NOT IN (...)</code>. So even where ANY and ALL are unavailable, you can already express the most common cases with IN, NOT IN, or a MAX/MIN subquery.</p>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Wrap subqueries in parentheses.</b> Always. A subquery sits inside <code class="inl" style="font-size:12px">( ... )</code> wherever it appears.</li>
    <li><b>Single-value vs list.</b> A subquery compared with <code class="inl" style="font-size:12px">></code> or <code class="inl" style="font-size:12px">=</code> must return exactly one value; one used with IN returns a column. Mixing these up is a common error.</li>
    <li><b>NOT IN plus NULL equals trouble.</b> As shown, a NULL in the subquery can make NOT IN return nothing. Prefer NOT EXISTS when NULLs are possible.</li>
    <li><b>A derived table needs an alias.</b> A subquery in FROM must be named (<code class="inl" style="font-size:12px">) AS spend</code>), or the database will not let you reference it.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Queries within queries</h3>
  <p class="body">A subquery computes an answer for the outer query to use: a single value for a comparison, a column for IN, a yes/no for EXISTS, or a whole derived table in FROM. It is how you ask questions that depend on their own intermediate results, and often a readable alternative to a join.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy',"Show <b>all columns</b> of restaurants whose <b>rating is above the average rating</b> of all restaurants.", i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE rating > (SELECT AVG(rating) FROM restaurants)"), "SELECT * FROM restaurants WHERE rating > (SELECT AVG(rating) FROM restaurants)", "Compare rating to a single-value subquery.")}
  ${q('q2','easy',"Show <b>all columns</b> of customers who have <b>placed at least one order</b>, using IN with a subquery.", i=>sameRowsAnyOrder(i,"SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders)"), "SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders)", "WHERE id IN (SELECT customer_id FROM orders).")}
  ${q('q3','med',"Show <b>all columns</b> of customers who have <b>never placed an order</b>.", i=>sameRowsAnyOrder(i,"SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)"), "SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)", "NOT IN with the same subquery.")}
  ${q('q4','med',"Show <b>all columns</b> of restaurants whose <b>cost_for_two is above the average</b> cost_for_two.", i=>sameRowsAnyOrder(i,"SELECT * FROM restaurants WHERE cost_for_two > (SELECT AVG(cost_for_two) FROM restaurants)"), "SELECT * FROM restaurants WHERE cost_for_two > (SELECT AVG(cost_for_two) FROM restaurants)", "Same shape as the rating example, on cost_for_two.")}
  ${q('q5','hard',"Show <b>all columns</b> of customers who have an order, this time using <b>EXISTS</b> with a correlated subquery.", i=>sameRowsAnyOrder(i,"SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)"), "SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)", "EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id).")}
`};

lessons['16']={ short:'Window functions', where:'Part V · <b>Window functions</b>', render:()=>`
  <div class="eyebrow">Part V · Chapter 16</div>
  <h2 class="title">Window functions, summaries without losing the rows</h2>
  <p class="lead">GROUP BY is powerful but greedy: it collapses many rows into one. Often you want the summary <b>and</b> the original rows together, each restaurant next to its city's average, a running total that grows row by row, a ranking. Window functions do exactly that. They are the most advanced idea in this handbook, and genuinely worth the stretch.</p>
  <hr class="rule">
  <p class="body">The key idea: a window function computes across a set of rows (a "window") but <b>keeps every row in the output</b>. You attach it with the <b>OVER</b> keyword. Where GROUP BY gives one row per group, a window function gives every row, with the group's summary alongside.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">GROUP BY is totting up each area's stack and throwing the slips away, you keep only the totals. A window function is jotting the area's total in the corner of <b>every single slip</b>, then handing all the slips back. Same arithmetic, but nothing is lost.</div></div>

  <div class="sec-num">16.1</div><h3 class="section-h">An aggregate that keeps the rows</h3>
  <p class="body">Compare each restaurant's rating to the overall average, on the same row. <code class="inl">AVG(rating) OVER ()</code> means "the average across the whole window", and the empty <code class="inl">()</code> means the window is every row.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, rating,
       <span class="k">ROUND</span>(<span class="k">AVG</span>(rating) <span class="k">OVER</span> (), 2) <span class="k">AS</span> overall_avg
<span class="k">FROM</span> restaurants</div><div class="ex-note">Every restaurant row survives, and each one now carries the overall average beside it, so you can eyeball who is above or below. A GROUP BY could never show the individual names like this.</div></div>
  ${ed("SELECT name, rating, ROUND(AVG(rating) OVER (), 2) AS overall_avg FROM restaurants",true)}

  <div class="sec-num">16.2</div><h3 class="section-h">Numbering and ranking rows</h3>
  <p class="body">Window functions include special ranking ones. <b>ROW_NUMBER()</b> numbers rows 1, 2, 3 in an order you choose with <code class="inl">OVER (ORDER BY ...)</code>. <b>RANK()</b> is similar but ties share a number (and it then skips), while <b>DENSE_RANK()</b> ties without skipping.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, rating,
       <span class="k">ROW_NUMBER</span>() <span class="k">OVER</span> (<span class="k">ORDER BY</span> rating <span class="k">DESC</span>) <span class="k">AS</span> rn,
       <span class="k">RANK</span>() <span class="k">OVER</span> (<span class="k">ORDER BY</span> rating <span class="k">DESC</span>) <span class="k">AS</span> rnk
<span class="k">FROM</span> restaurants</div><div class="ex-note">rn is a plain 1..6 counter down the rating order. rnk would let two equal ratings share a rank. The ORDER BY inside OVER controls the ranking; it is separate from any ORDER BY on the whole query.</div></div>
  ${ed("SELECT name, rating,\n  ROW_NUMBER() OVER (ORDER BY rating DESC) AS rn,\n  RANK() OVER (ORDER BY rating DESC) AS rnk\nFROM restaurants",true)}

  <div class="sec-num">16.3</div><h3 class="section-h">PARTITION BY, a window per group</h3>
  <p class="body">This is the piece that makes windows shine. <b>PARTITION BY</b> splits the rows into groups and restarts the window function within each, without collapsing them. "Rank restaurants by rating <b>within each city</b>" is a partition by city.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-p">RANK() OVER (</span><span class="qb-mean">a ranking window</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">PARTITION BY city</span><span class="qb-mean">restart the ranking for each city</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">ORDER BY rating DESC )</span><span class="qb-mean">best rating first within the city</span></div></div>
  ${ed("SELECT name, city, rating,\n  RANK() OVER (PARTITION BY city ORDER BY rating DESC) AS city_rank\nFROM restaurants",true)}
  <p class="body">Each city gets its own ranking starting at 1. Compare that to GROUP BY city, which would give one row per city and hide the restaurant names entirely.</p>

  <div class="sec-num">16.4</div><h3 class="section-h">Running totals</h3>
  <p class="body">Add <code class="inl">ORDER BY</code> inside OVER to an aggregate and it becomes <b>cumulative</b>, each row sees itself and everything before it. That is how you build a running total.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id, order_date, amount,
       <span class="k">SUM</span>(amount) <span class="k">OVER</span> (<span class="k">ORDER BY</span> order_date) <span class="k">AS</span> running_total
<span class="k">FROM</span> orders</div><div class="ex-note">running_total climbs order by order as the dates advance, each value is the sum of this amount plus all earlier ones. Ordinary SUM would give one grand total; the OVER (ORDER BY ...) turns it into a growing tally.</div></div>
  ${ed("SELECT id, order_date, amount,\n  SUM(amount) OVER (ORDER BY order_date) AS running_total\nFROM orders",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>OVER is what makes it a window.</b> <code class="inl" style="font-size:12px">AVG(rating)</code> collapses rows; <code class="inl" style="font-size:12px">AVG(rating) OVER ()</code> keeps them. The OVER clause is the whole difference.</li>
    <li><b>Two different ORDER BYs.</b> The ORDER BY inside OVER controls the window (ranking, running order); an ORDER BY at the end of the query sorts the final display. They are independent.</li>
    <li><b>ROW_NUMBER vs RANK.</b> ROW_NUMBER always gives distinct 1,2,3 even on ties; RANK lets ties share and then skips; DENSE_RANK shares without skipping. Pick by what you need.</li>
    <li><b>You cannot filter on a window in WHERE.</b> Like aggregates, window results are computed late. To filter on them, wrap the query as a subquery and filter outside, or use a later clause.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Part V, complete</h3>
  <p class="body">A window function summarises across rows while keeping them all, attached with OVER. Empty <code class="inl">OVER ()</code> spans everything; <code class="inl">PARTITION BY</code> makes a window per group; <code class="inl">ORDER BY</code> inside OVER powers ranking and running totals. It is the tool for "show each row and its group's summary together", which plain GROUP BY cannot do. That wraps the querying half of SQL; next we learn to change data.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy',"Show <b>name, rating</b>, and the <b>overall average rating</b> on every row as <b>avg_all</b> (use a window).", i=>sameRowsAnyOrder(i,"SELECT name, rating, AVG(rating) OVER () AS avg_all FROM restaurants"), "SELECT name, rating, AVG(rating) OVER () AS avg_all FROM restaurants", "AVG(rating) OVER () AS avg_all.")}
  ${q('q2','med',"Show <b>name, rating</b>, and a <b>row number rn</b> that numbers restaurants from the highest rating down.", i=>sameResult(i,"SELECT name, rating, ROW_NUMBER() OVER (ORDER BY rating DESC) AS rn FROM restaurants ORDER BY rn"), "SELECT name, rating, ROW_NUMBER() OVER (ORDER BY rating DESC) AS rn FROM restaurants ORDER BY rn", "ROW_NUMBER() OVER (ORDER BY rating DESC); add ORDER BY rn to line it up.")}
  ${q('q3','med',"Show <b>name, cost_for_two</b>, and a <b>rank cost_rank</b> from cheapest to most expensive using RANK.", i=>sameRowsAnyOrder(i,"SELECT name, cost_for_two, RANK() OVER (ORDER BY cost_for_two ASC) AS cost_rank FROM restaurants"), "SELECT name, cost_for_two, RANK() OVER (ORDER BY cost_for_two ASC) AS cost_rank FROM restaurants", "RANK() OVER (ORDER BY cost_for_two ASC).")}
  ${q('q4','hard',"Show <b>name, city, rating</b>, and a <b>city_rank</b> that ranks restaurants by rating (best first) <b>within each city</b>.", i=>sameRowsAnyOrder(i,"SELECT name, city, rating, RANK() OVER (PARTITION BY city ORDER BY rating DESC) AS city_rank FROM restaurants"), "SELECT name, city, rating, RANK() OVER (PARTITION BY city ORDER BY rating DESC) AS city_rank FROM restaurants", "PARTITION BY city ORDER BY rating DESC.")}
  ${q('q5','hard',"Show <b>id, order_date, amount</b>, and a <b>running_total</b> of amount ordered by order_date.", i=>sameResult(i,"SELECT id, order_date, amount, SUM(amount) OVER (ORDER BY order_date) AS running_total FROM orders ORDER BY order_date"), "SELECT id, order_date, amount, SUM(amount) OVER (ORDER BY order_date) AS running_total FROM orders ORDER BY order_date", "SUM(amount) OVER (ORDER BY order_date); order the query by order_date too.")}
`};

lessons['17']={ short:'INSERT, UPDATE, DELETE', where:'Part VI · <b>INSERT, UPDATE, DELETE</b>', render:()=>`
  <div class="eyebrow">Part VI · Chapter 17</div>
  <h2 class="title">INSERT, UPDATE, DELETE, changing the data</h2>
  <p class="lead">Everything so far only <b>read</b> data. Now we write it: adding rows, editing them, removing them. These are powerful and, unlike SELECT, they change things for real. So this chapter comes with a genuine safety lesson attached, one small missing word here can rewrite an entire table.</p>
  <hr class="rule">
  <p class="body">To keep your learning data safe, everything below runs against a private scratch table called <code class="inl">demo</code>, not the real customers or restaurants. The cell just below creates a fresh <code class="inl">demo</code> each time you open this chapter, so you can add, edit and delete freely and never break the other lessons. Re-run it any time to reset.</p>
  ${ed("DROP TABLE IF EXISTS demo;\nCREATE TABLE demo (id INTEGER PRIMARY KEY, name TEXT, city TEXT, active INTEGER);\nINSERT INTO demo VALUES (1, 'Ravi', 'Mumbai', 1), (2, 'Sita', 'Delhi', 1), (3, 'Amit', 'Pune', 0);\nSELECT * FROM demo;",true)}

  <div class="sec-num">17.1</div><h3 class="section-h">INSERT, adding rows</h3>
  <p class="body"><b>INSERT INTO</b> names the table and columns, then <b>VALUES</b> gives the data. Listing the columns explicitly is a good habit, it keeps the values matched to the right places even if the table changes later.</p>
  <div class="ex"><div class="ex-tag">Add one row, then look</div><div class="code"><span class="k">INSERT INTO</span> demo (id, name, city, active)
<span class="k">VALUES</span> (4, <span class="s">'Neha'</span>, <span class="s">'Mumbai'</span>, 1);
<span class="k">SELECT</span> * <span class="k">FROM</span> demo;</div><div class="ex-note">Run it and the new row appears. Run it again and you get a "UNIQUE constraint" error, because id 4 already exists and id is the primary key. Reset with the cell above.</div></div>
  ${ed("INSERT INTO demo (id, name, city, active) VALUES (4, 'Neha', 'Mumbai', 1);\nSELECT * FROM demo;")}
  <div class="ex"><div class="ex-tag">Several rows at once</div><div class="code"><span class="k">INSERT INTO</span> demo (id, name, city, active) <span class="k">VALUES</span>
  (5, <span class="s">'Kiran'</span>, <span class="s">'Delhi'</span>, 1),
  (6, <span class="s">'Meera'</span>, <span class="s">'Pune'</span>, 0);
<span class="k">SELECT</span> * <span class="k">FROM</span> demo;</div><div class="ex-note">Comma-separate the value groups to add many rows in one statement.</div></div>
  ${ed("INSERT INTO demo (id, name, city, active) VALUES (5, 'Kiran', 'Delhi', 1), (6, 'Meera', 'Pune', 0);\nSELECT * FROM demo;")}

  <div class="sec-num">17.2</div><h3 class="section-h">UPDATE, and the most important word in this chapter</h3>
  <p class="body"><b>UPDATE</b> changes existing rows. <b>SET</b> says which columns to change, and <b>WHERE</b> says which rows. That WHERE is not optional in spirit, leave it off and UPDATE changes <b>every row in the table</b>.</p>
  <div class="ex"><div class="ex-tag">Correct: one row, because of WHERE</div><div class="code"><span class="k">UPDATE</span> demo <span class="k">SET</span> active = 1 <span class="k">WHERE</span> id = 3;
<span class="k">SELECT</span> * <span class="k">FROM</span> demo;</div><div class="ex-note">Only Amit (id 3) is switched to active. Everyone else is untouched, because the WHERE pinned the change to one row.</div></div>
  ${ed("UPDATE demo SET active = 1 WHERE id = 3;\nSELECT * FROM demo;")}
  <div class="gotcha"><div class="lab">The mistake that ruins tables</div><ul>
    <li><b>UPDATE with no WHERE hits every row.</b> <code class="inl" style="font-size:12px">UPDATE demo SET active = 1</code> would mark <b>everyone</b> active. On a real table that is a silent disaster. Always write the WHERE first, then the SET, so you never forget it.</li>
    <li><b>Test with a SELECT first.</b> Before an UPDATE, run <code class="inl" style="font-size:12px">SELECT * FROM demo WHERE ...</code> with the same WHERE to see exactly which rows you are about to change.</li>
  </ul></div>

  <div class="sec-num">17.3</div><h3 class="section-h">DELETE, removing rows (same danger)</h3>
  <p class="body"><b>DELETE FROM</b> removes rows, and it obeys WHERE just like UPDATE, with the same warning. No WHERE means the whole table is emptied.</p>
  <div class="ex"><div class="ex-tag">Delete only the inactive ones</div><div class="code"><span class="k">DELETE FROM</span> demo <span class="k">WHERE</span> active = 0;
<span class="k">SELECT</span> * <span class="k">FROM</span> demo;</div><div class="ex-note">Removes just the rows where active is 0. The same select-first habit applies: preview with a SELECT before you delete.</div></div>
  ${ed("DELETE FROM demo WHERE active = 0;\nSELECT * FROM demo;")}
  <p class="aside">A professional habit worth adopting from day one: on real data, wrap risky changes in a transaction (<code class="inl" style="font-size:12px">BEGIN; ... COMMIT;</code>, or <code class="inl" style="font-size:12px">ROLLBACK;</code> to undo). We touch on transactions in the final chapter. For now, the one-line rule is: never run an UPDATE or DELETE whose WHERE you have not double-checked.</p>

  <div class="sec-num">Recap</div><h3 class="section-h">Write with care</h3>
  <p class="body">INSERT adds rows (name the columns, comma-separate multiple value groups), UPDATE edits them, DELETE removes them. UPDATE and DELETE without a WHERE affect the entire table, so treat WHERE as mandatory and preview with a SELECT first. Reading is forgiving; writing is not.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">These run on a fresh isolated scratch table (couriers: Ravi/Mumbai/active, Sita/Delhi/active, Amit/Pune/inactive) that resets on every check, so experiment freely. You will see the table as it looks after your statement.</p>
  ${(()=>{const R="DROP TABLE IF EXISTS sbx; CREATE TABLE sbx (id INTEGER PRIMARY KEY, name TEXT, city TEXT, active INTEGER); INSERT INTO sbx VALUES (1,'Ravi','Mumbai',1),(2,'Sita','Delhi',1),(3,'Amit','Pune',0);";const V="SELECT * FROM sbx ORDER BY id";return `
  ${qm('q1','easy',"<b>Add a courier</b>: id 4, name 'Neha', city 'Mumbai', active 1.",R,V,"INSERT INTO sbx (id, name, city, active) VALUES (4, 'Neha', 'Mumbai', 1)","INSERT INTO sbx (...) VALUES (4, 'Neha', 'Mumbai', 1).")}
  ${qm('q2','easy',"<b>Mark Amit active</b>: set active to 1 for the courier with id 3.",R,V,"UPDATE sbx SET active = 1 WHERE id = 3","UPDATE sbx SET active = 1 WHERE id = 3.")}
  ${qm('q3','med',"<b>Remove the inactive couriers</b> (those whose active is 0).",R,V,"DELETE FROM sbx WHERE active = 0","DELETE FROM sbx WHERE active = 0.")}
  ${qm('q4','med',"<b>Move Sita to Pune</b>: change the city to 'Pune' for id 2.",R,V,"UPDATE sbx SET city = 'Pune' WHERE id = 2","UPDATE sbx SET city = 'Pune' WHERE id = 2.")}
  ${qm('q5','hard',"<b>Add two couriers in one statement</b>: (4, 'Neha', 'Mumbai', 1) and (5, 'Kiran', 'Delhi', 0).",R,V,"INSERT INTO sbx (id, name, city, active) VALUES (4, 'Neha', 'Mumbai', 1), (5, 'Kiran', 'Delhi', 0)","One INSERT, two comma-separated value groups.")}
  `;})()}
`};

lessons['18']={ short:'CREATE, ALTER, DROP', where:'Part VI · <b>CREATE, ALTER, DROP</b>', render:()=>`
  <div class="eyebrow">Part VI · Chapter 18</div>
  <h2 class="title">CREATE, ALTER, DROP, building the tables themselves</h2>
  <p class="lead">So far the tables already existed. Now you make them. CREATE builds a table and defines its columns and rules, ALTER changes an existing table's shape, and DROP removes a table entirely. This is the structural layer, the design of the container rather than the contents.</p>
  <hr class="rule">

  <div class="sec-num">18.1</div><h3 class="section-h">CREATE TABLE and column types</h3>
  <p class="body"><b>CREATE TABLE</b> names the table and lists its columns, each with a <b>type</b>. The common SQLite types are <code class="inl">INTEGER</code>, <code class="inl">REAL</code> (decimals), <code class="inl">TEXT</code>, and <code class="inl">BLOB</code> (raw bytes). The type signals what kind of value a column is meant to hold.</p>
  <div class="ex"><div class="ex-tag">Example (safe to run, then we drop it)</div><div class="code"><span class="k">CREATE TABLE</span> products (
  id <span class="k">INTEGER</span>,
  title <span class="k">TEXT</span>,
  price <span class="k">REAL</span>
);</div><div class="ex-note">Three columns with types. Running this creates an empty products table. The cell resets it first so you can run it repeatedly.</div></div>
  ${ed("DROP TABLE IF EXISTS products;\nCREATE TABLE products (id INTEGER, title TEXT, price REAL);\nSELECT name FROM pragma_table_info('products');",true)}

  <div class="sec-num">18.2</div><h3 class="section-h">Constraints, rules baked into the table</h3>
  <p class="body">A ${term('constraint')} is a rule the table enforces on its own. The important ones: <b>PRIMARY KEY</b> (the unique identifier, our ${term('primary_key','primary key')}), <b>NOT NULL</b> (a value is required), <b>UNIQUE</b> (no two rows may repeat this value), and <b>DEFAULT</b> (a fallback when none is given).</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">CREATE TABLE</span> members (
  id <span class="k">INTEGER</span> <span class="k">PRIMARY KEY</span>,
  email <span class="k">TEXT</span> <span class="k">NOT NULL</span> <span class="k">UNIQUE</span>,
  active <span class="k">INTEGER</span> <span class="k">DEFAULT</span> 1
);</div><div class="ex-note">id uniquely identifies each row; email must be present and cannot repeat; active fills in as 1 if you do not specify it. Constraints keep bad data out at the door, which is far better than cleaning it up later.</div></div>
  ${ed("DROP TABLE IF EXISTS members;\nCREATE TABLE members (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, active INTEGER DEFAULT 1);\nSELECT name FROM pragma_table_info('members');")}
  <p class="body">Two more constraints round out the set. <b>CHECK</b> enforces a custom rule on a value, and <b>FOREIGN KEY</b> ties a column to another table's ${term('primary_key','primary key')}, so you cannot store a reference that does not exist. This is how the database itself guarantees that every order really does point at a real customer.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">CREATE TABLE</span> reviews (
  id <span class="k">INTEGER</span> <span class="k">PRIMARY KEY</span>,
  restaurant_id <span class="k">INTEGER</span>,
  stars <span class="k">INTEGER</span> <span class="k">CHECK</span> (stars <span class="k">BETWEEN</span> 1 <span class="k">AND</span> 5),
  <span class="k">FOREIGN KEY</span> (restaurant_id) <span class="k">REFERENCES</span> restaurants(id)
);</div><div class="ex-note">stars must be 1 to 5 or the insert is rejected; restaurant_id must match a real restaurant. Note: SQLite only enforces foreign keys when you switch them on with <code class="inl" style="font-size:12px">PRAGMA foreign_keys = ON</code>; other databases enforce them by default. CHECK is always enforced.</div></div>
  ${ed("DROP TABLE IF EXISTS reviews;\nCREATE TABLE reviews (id INTEGER PRIMARY KEY, restaurant_id INTEGER, stars INTEGER CHECK (stars BETWEEN 1 AND 5), FOREIGN KEY (restaurant_id) REFERENCES restaurants(id));\nSELECT name FROM pragma_table_info('reviews');")}

  <div class="sec-num">18.3</div><h3 class="section-h">ALTER TABLE, changing the shape</h3>
  <p class="body"><b>ALTER TABLE</b> modifies a table that already exists. The most common use by far is adding a column.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">ALTER TABLE</span> products <span class="k">ADD COLUMN</span> in_stock <span class="k">INTEGER</span> <span class="k">DEFAULT</span> 0;</div><div class="ex-note">Adds an in_stock column to products, defaulting existing rows to 0. SQLite's ALTER is intentionally limited (add or rename mostly); bigger databases let you alter far more.</div></div>
  ${ed("DROP TABLE IF EXISTS products;\nCREATE TABLE products (id INTEGER, title TEXT);\nALTER TABLE products ADD COLUMN in_stock INTEGER DEFAULT 0;\nSELECT name FROM pragma_table_info('products');")}

  <div class="sec-num">18.4</div><h3 class="section-h">DROP TABLE, removing it entirely</h3>
  <p class="body"><b>DROP TABLE</b> deletes the whole table, structure and data together. There is no undo. <code class="inl">IF EXISTS</code> avoids an error when the table might not be there.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">DROP TABLE</span> <span class="k">IF EXISTS</span> products;</div><div class="ex-note">Gone completely. Note the difference from DELETE: DELETE empties a table but keeps it; DROP removes the table itself.</div></div>
  ${ed("DROP TABLE IF EXISTS products;\nSELECT COUNT(*) AS products_still_exists FROM pragma_table_info('products');")}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>DELETE vs DROP vs TRUNCATE.</b> DELETE removes rows (table stays), DROP removes the whole table, and TRUNCATE (in other databases) quickly empties a table. Reach for the right one.</li>
    <li><b>DROP is irreversible.</b> No WHERE, no undo. On real systems, back up first and use IF EXISTS to avoid errors in scripts.</li>
    <li><b>Constraints reject bad writes.</b> Inserting a duplicate into a UNIQUE column, or a NULL into a NOT NULL column, fails with an error. That is the constraint doing its job, not a bug.</li>
    <li><b>SQLite ALTER is limited.</b> It mainly adds or renames. Dropping or heavily changing a column often means rebuilding the table, unlike larger databases.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Designing the container</h3>
  <p class="body">CREATE TABLE defines columns and their types, and constraints (PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT) bake in the rules. ALTER TABLE reshapes an existing table, usually adding a column. DROP TABLE removes the whole thing, permanently. This is the structure layer beneath all the querying you have learned.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">These run on an isolated scratch schema that resets each check. Column checks look at the table's structure afterwards.</p>
  ${qm('q1','easy',"<b>Create a table</b> called <b>books</b> with two columns: <b>id</b> (INTEGER) and <b>title</b> (TEXT).","DROP TABLE IF EXISTS books;","SELECT name FROM pragma_table_info('books')","CREATE TABLE books (id INTEGER, title TEXT)","CREATE TABLE books (id INTEGER, title TEXT).")}
  ${qm('q2','med',"<b>Add a column</b> called <b>price</b> (REAL) to the existing books table.","DROP TABLE IF EXISTS books; CREATE TABLE books (id INTEGER, title TEXT);","SELECT name FROM pragma_table_info('books')","ALTER TABLE books ADD COLUMN price REAL","ALTER TABLE books ADD COLUMN price REAL.")}
  ${qm('q3','med',"<b>Create a table</b> called <b>tags</b> with <b>id</b> (INTEGER) as PRIMARY KEY and <b>label</b> (TEXT) that is NOT NULL.","DROP TABLE IF EXISTS tags;","SELECT name FROM pragma_table_info('tags')","CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL)","CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL).")}
  ${qm('q4','med',"<b>Drop</b> the books table completely.","DROP TABLE IF EXISTS books; CREATE TABLE books (id INTEGER, title TEXT);","SELECT COUNT(*) AS n FROM pragma_table_info('books')","DROP TABLE books","DROP TABLE books.")}
  ${qm('q5','hard',"<b>Create a table</b> called <b>members</b> with <b>id</b> (INTEGER) PRIMARY KEY, <b>email</b> (TEXT) NOT NULL, and <b>active</b> (INTEGER) with a DEFAULT of 1.","DROP TABLE IF EXISTS members;","SELECT name FROM pragma_table_info('members')","CREATE TABLE members (id INTEGER PRIMARY KEY, email TEXT NOT NULL, active INTEGER DEFAULT 1)","List three columns with their constraints inside CREATE TABLE.")}
`};

lessons['19']={ short:'VIEWs & INDEXes', where:'Part VI · <b>VIEWs &amp; INDEXes</b>', render:()=>`
  <div class="eyebrow">Part VI · Chapter 19</div>
  <h2 class="title">VIEWs and INDEXes, convenience and speed</h2>
  <p class="lead">Two tools that quietly make databases pleasant to work with. A ${term('view')} lets you save a complicated query and reuse it as if it were a simple table. An ${term('index')} makes lookups dramatically faster on big tables. Neither changes your data; they change how comfortably and quickly you work with it.</p>
  <hr class="rule">

  <div class="sec-num">19.1</div><h3 class="section-h">A VIEW is a saved query</h3>
  <p class="body">If you keep writing the same join or filter, wrap it in a view. <b>CREATE VIEW</b> gives a name to a SELECT; from then on you query that name like a table, and the stored SELECT runs underneath.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">CREATE VIEW</span> mumbai_restaurants <span class="k">AS</span>
  <span class="k">SELECT</span> name, cuisine, rating <span class="k">FROM</span> restaurants <span class="k">WHERE</span> city = <span class="s">'Mumbai'</span>;
<span class="k">SELECT</span> * <span class="k">FROM</span> mumbai_restaurants;</div><div class="ex-note">Create it once, then query the view whenever you like. It holds no data of its own, it just re-runs its SELECT, so it is always up to date with the underlying table.</div></div>
  ${ed("DROP VIEW IF EXISTS mumbai_restaurants;\nCREATE VIEW mumbai_restaurants AS SELECT name, cuisine, rating FROM restaurants WHERE city = 'Mumbai';\nSELECT * FROM mumbai_restaurants;",true)}

  <div class="sec-num">19.2</div><h3 class="section-h">Views shine on complicated queries</h3>
  <p class="body">The real value is hiding complexity. A join-and-aggregate you would hate to retype becomes a tidy name everyone on the team can use.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">CREATE VIEW</span> customer_spend <span class="k">AS</span>
  <span class="k">SELECT</span> c.name, <span class="k">SUM</span>(o.amount) <span class="k">AS</span> total
  <span class="k">FROM</span> customers c <span class="k">JOIN</span> orders o <span class="k">ON</span> c.id = o.customer_id
  <span class="k">GROUP BY</span> c.id;
<span class="k">SELECT</span> * <span class="k">FROM</span> customer_spend <span class="k">ORDER BY</span> total <span class="k">DESC</span>;</div><div class="ex-note">Now "customer_spend" is a reusable building block. You can even filter and sort it like any table, as the ORDER BY shows. Remove a view with <code class="inl" style="font-size:12px">DROP VIEW name</code>.</div></div>
  ${ed("DROP VIEW IF EXISTS customer_spend;\nCREATE VIEW customer_spend AS SELECT c.name, SUM(o.amount) AS total FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id;\nSELECT * FROM customer_spend ORDER BY total DESC;")}

  <div class="sec-num">19.3</div><h3 class="section-h">An INDEX makes lookups fast</h3>
  <p class="body">When a table grows large, finding rows by scanning every one gets slow. An <b>index</b> is a separate sorted structure the database keeps, like the index at the back of a book, so it can jump straight to matching rows. You create one on the column(s) you often search or join by.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">CREATE INDEX</span> idx_restaurants_city <span class="k">ON</span> restaurants (city);</div><div class="ex-note">After this, <code class="inl" style="font-size:12px">WHERE city = 'Mumbai'</code> can use the index instead of reading the whole table. On six rows you will not notice; on six million you very much would. Running it here produces no visible rows, indexes work behind the scenes.</div></div>
  ${ed("DROP INDEX IF EXISTS idx_restaurants_city;\nCREATE INDEX idx_restaurants_city ON restaurants (city);\nSELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_restaurants_city';")}

  <div class="sec-num">19.4</div><h3 class="section-h">Indexes are not free</h3>
  <p class="body">An index speeds up reads but has costs, so they are a trade, not a free win. Each index takes storage, and every INSERT, UPDATE or DELETE must also update the indexes, so writes get a little slower. The craft is indexing the columns you actually filter and join on, and not indexing everything blindly.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>A view stores no data.</b> It re-runs its query each time, so it always reflects the current tables. It is convenience, not a copy.</li>
    <li><b>Views are usually read-only.</b> You query them freely; writing through a view is limited and often not allowed. Treat them as saved SELECTs.</li>
    <li><b>Indexes trade write speed for read speed.</b> Do not reflexively index every column. Index what you search and join by.</li>
    <li><b>You rarely "use" an index by name.</b> You create it, and the database chooses to use it automatically when it helps. It works quietly in the background.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Comfort and performance</h3>
  <p class="body">A VIEW names and reuses a query, hiding complexity and staying live with its tables. An INDEX speeds up lookups on the columns you search or join by, at a small cost to writes and storage. Both are behind-the-scenes helpers that make a database nicer and faster to use without touching the data itself.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">These run on an isolated scratch state that resets each check, so creating and dropping is safe.</p>
  ${qm('q1','easy',"<b>Create a view</b> called <b>delhi_restaurants</b> selecting <b>all columns</b> of restaurants in Delhi, then it will be shown.","DROP VIEW IF EXISTS delhi_restaurants;","SELECT * FROM delhi_restaurants","CREATE VIEW delhi_restaurants AS SELECT * FROM restaurants WHERE city = 'Delhi'","CREATE VIEW delhi_restaurants AS SELECT * FROM restaurants WHERE city = 'Delhi'.")}
  ${qm('q2','med',"<b>Create a view</b> called <b>cheap_eats</b> with the <b>name and cost_for_two</b> of restaurants where cost_for_two is 400 or less.","DROP VIEW IF EXISTS cheap_eats;","SELECT * FROM cheap_eats ORDER BY cost_for_two","CREATE VIEW cheap_eats AS SELECT name, cost_for_two FROM restaurants WHERE cost_for_two <= 400","CREATE VIEW cheap_eats AS SELECT name, cost_for_two FROM restaurants WHERE cost_for_two <= 400.")}
  ${qm('q3','med',"<b>Create an index</b> called <b>idx_cust_city</b> on the <b>city</b> column of customers.","DROP INDEX IF EXISTS idx_cust_city;","SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_cust_city'","CREATE INDEX idx_cust_city ON customers (city)","CREATE INDEX idx_cust_city ON customers (city).")}
  ${qm('q4','med',"<b>Drop a view</b>: remove the view called <b>temp_view</b>.","DROP VIEW IF EXISTS temp_view; CREATE VIEW temp_view AS SELECT 1 AS one;","SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'view' AND name = 'temp_view'","DROP VIEW temp_view","DROP VIEW temp_view.")}
  ${qm('q5','hard',"<b>Create a view</b> called <b>orders_per_customer</b> with each <b>customer_id</b> and its order <b>count</b> as <b>n</b>.","DROP VIEW IF EXISTS orders_per_customer;","SELECT * FROM orders_per_customer ORDER BY customer_id","CREATE VIEW orders_per_customer AS SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id","CREATE VIEW ... AS SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id.")}
`};

lessons['20']={ short:'Types, comments, safety', where:'Part VI · <b>Types, comments, safety</b>', render:()=>`
  <div class="eyebrow">Part VI · Chapter 20</div>
  <h2 class="title">Types, comments, and staying safe</h2>
  <p class="lead">The finishing chapter, the professional habits that separate someone who can write SQL from someone you trust with a real database. What the data types mean, how to comment your queries, and the one security idea, SQL injection, that you must internalise before you ever put SQL near real users.</p>
  <hr class="rule">

  <div class="sec-num">20.1</div><h3 class="section-h">Data types, briefly</h3>
  <p class="body">Every column has a type describing what it stores. SQLite keeps a short list: <b>INTEGER</b> (whole numbers), <b>REAL</b> (decimals), <b>TEXT</b> (strings), <b>BLOB</b> (raw bytes), and NULL for absent values. You can inspect the type of any value with <code class="inl">typeof()</code>.</p>
  ${ed("SELECT name, typeof(name) AS name_type, rating, typeof(rating) AS rating_type FROM restaurants LIMIT 3",true)}
  <p class="body">Bigger databases (PostgreSQL, MySQL, SQL Server) are stricter and richer: <code class="inl">VARCHAR</code> for bounded text, real <code class="inl">DATE</code> and <code class="inl">TIMESTAMP</code> types, <code class="inl">BOOLEAN</code>, precise <code class="inl">DECIMAL</code> for money, and more. SQLite is famously flexible about types; the others enforce them firmly. When you move to a production database, expect to declare types more carefully. You can convert with <b>CAST</b>:</p>
  ${ed("SELECT name, rating, CAST(rating AS INTEGER) AS rating_whole FROM restaurants")}

  <div class="sec-num">20.2</div><h3 class="section-h">Comments, notes to humans</h3>
  <p class="body">SQL ignores comments; they are for the people reading the query later (often you, months on). Use <code class="inl">--</code> for the rest of a line, or <code class="inl">/* ... */</code> for a block.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="c">-- top-rated places, for the weekend feature</span>
<span class="k">SELECT</span> name, rating
<span class="k">FROM</span> restaurants
<span class="k">WHERE</span> rating >= 4.5   <span class="c">-- our quality bar</span>
<span class="k">ORDER BY</span> rating <span class="k">DESC</span>;
<span class="c">/* could later add a city filter here */</span></div><div class="ex-note">The comments change nothing about the result. They explain intent, which is priceless on a complex query.</div></div>
  ${ed("-- top-rated places\nSELECT name, rating FROM restaurants\nWHERE rating >= 4.5   -- our quality bar\nORDER BY rating DESC;")}

  <div class="sec-num">20.3</div><h3 class="section-h">SQL injection, the one security idea to keep</h3>
  <p class="body">This matters the moment SQL meets real user input, which for you, as a developer, is constantly. <b>SQL injection</b> is when user-supplied text is pasted straight into a query and the database mistakes part of that text for SQL commands. It is one of the oldest and most damaging web vulnerabilities.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Imagine reading out a customer's written note as if it were your own instruction to the kitchen. If the note secretly says <b>"and also give away everything for free,"</b> and you read it aloud verbatim, the kitchen obeys. Injection is a query "reading aloud" untrusted text as if it were trusted commands.</div></div>
  <p class="body">The fix is simple and absolute: <b>never build queries by gluing user input into a string.</b> Use <b>parameters</b> (also called bind variables or placeholders), where you write a placeholder and hand the value to the database separately, so it is always treated as data, never as code. In most languages that looks like a <code class="inl">?</code> or a named placeholder:</p>
  <div class="ex"><div class="ex-tag">The idea, in pseudo-code</div><div class="code"><span class="c">-- NEVER do this (string glued together):</span>
<span class="c">--   "SELECT * FROM users WHERE name = '" + input + "'"</span>

<span class="c">-- ALWAYS do this (parameter, value passed separately):</span>
<span class="k">SELECT</span> * <span class="k">FROM</span> users <span class="k">WHERE</span> name = ?;
<span class="c">-- then the code binds the value to the ? safely</span></div><div class="ex-note">This is a code-level habit rather than something you type into this editor, but it is the single most important safety rule in all of practical SQL. Every language and library gives you parameterised queries; use them, always, for anything that comes from a user.</div></div>

  <div class="sec-num">20.4</div><h3 class="section-h">Safe habits to carry out the door</h3>
  <p class="body">A short list worth making automatic. Preview UPDATE and DELETE with a matching SELECT before running them, and never omit the WHERE. Wrap risky changes in a transaction (<code class="inl">BEGIN; ... COMMIT;</code>, or <code class="inl">ROLLBACK;</code> to undo) so a mistake can be reversed. Back up before structural changes like DROP. Prefer explicit column lists over <code class="inl">SELECT *</code> in real code. And parameterise every query that touches user input, without exception.</p>

  <div class="sec-num">Recap</div><h3 class="section-h">You have finished the handbook</h3>
  <p class="body">From your very first SELECT to window functions, data changes, table design, and now the professional habits, you have covered the whole working core of SQL. Types describe your data, comments explain your intent, and safe habits, especially parameterised queries and a well-checked WHERE, keep you and your data out of trouble. The rest is practice on real problems, which you are now genuinely ready for. Well done.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">A gentle final set, reinforcing comments, types, and casting.</p>
  ${q('q1','easy',"Select <b>all columns</b> of restaurants, and include a <b>single-line comment</b> anywhere in the query (the result should be the whole table).", i=>sameResult(i,"SELECT * FROM restaurants"), "SELECT * FROM restaurants  -- every restaurant", "End a line with -- and your note; it does not affect the result.")}
  ${q('q2','easy',"Show the <b>typeof</b> the <b>name</b> column and the <b>typeof</b> the <b>rating</b> column for the first restaurant row (columns in that order).", i=>sameResult(i,"SELECT typeof(name), typeof(rating) FROM restaurants LIMIT 1"), "SELECT typeof(name), typeof(rating) FROM restaurants LIMIT 1", "typeof(name), typeof(rating), with LIMIT 1.")}
  ${q('q3','med',"Show each restaurant's <b>name</b> and its <b>rating cast to a whole number (INTEGER)</b> as <b>rating_whole</b>.", i=>sameRowsAnyOrder(i,"SELECT name, CAST(rating AS INTEGER) AS rating_whole FROM restaurants"), "SELECT name, CAST(rating AS INTEGER) AS rating_whole FROM restaurants", "CAST(rating AS INTEGER) AS rating_whole.")}
  ${q('q4','med',"Select the <b>name and city</b> of all customers, with a <b>block comment</b> /* ... */ somewhere in the query.", i=>sameResult(i,"SELECT name, city FROM customers"), "SELECT name, city FROM customers /* two columns only */", "Wrap a note in /* ... */; it is ignored by SQL.")}
  ${q('q5','hard',"Select <b>all columns</b> of orders, and use <b>both</b> a single-line comment and a block comment in the same query (result is the whole table).", i=>sameResult(i,"SELECT * FROM orders"), "SELECT * FROM orders  -- all orders\n/* used for the monthly report */", "You can freely mix -- and /* ... */ comments; neither changes the result.")}
`};

lessons['0b']={ short:'The SQL world', where:'Groundwork · <b>The SQL world &amp; NoSQL</b>', render:()=>`
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">The SQL world: dialects, and where NoSQL fits</h2>
  <p class="lead">Before diving in, a quick map of the territory, so you know what you are learning, how it relates to the database names you keep hearing (MySQL, PostgreSQL, and the rest), and where the trendy "NoSQL" databases fit. Two minutes here saves a lot of confusion later.</p>
  <hr class="rule">

  <div class="sec-num">b.1</div><h3 class="section-h">SQL is a language, not a product</h3>
  <p class="body">This trips people up at the start. <b>SQL is the language</b> for talking to relational databases. The products, MySQL, PostgreSQL, SQLite, and others, are different <b>databases</b> that all speak SQL. It is a bit like English: there is a shared standard everyone understands, but each region has its own accent and a few local words.</p>
  <p class="body">Those accents are called <b>dialects</b>. The good news, and the whole reason this course is worth your time, is that the core (SELECT, WHERE, JOIN, GROUP BY, and most of what you will learn here) is <b>nearly identical</b> across all of them. Learn it once and it transfers everywhere. Only the edges differ.</p>

  <div class="sec-num">b.2</div><h3 class="section-h">The major relational databases</h3>
  <p class="body">The ones you will actually meet, and what each is known for:</p>
  <div class="qb"><div class="qb-title">The main players</div>
    <div class="qb-row"><span class="qb-kw kw-p">SQLite</span><span class="qb-mean">tiny, file-based, zero setup. Runs inside phones, browsers and apps. What this course uses.</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">MySQL / MariaDB</span><span class="qb-mean">the classic web database. Powers a huge share of websites (WordPress, many apps).</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">PostgreSQL</span><span class="qb-mean">the powerful, standards-loving one. Loved for complex data and correctness.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">SQL Server</span><span class="qb-mean">Microsoft's enterprise database.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Oracle</span><span class="qb-mean">big, old, enterprise heavyweight.</span></div></div>

  <div class="sec-num">b.3</div><h3 class="section-h">What actually differs between dialects</h3>
  <p class="body">So you recognise the differences when you switch databases, here are the usual suspects. Notice they are all around the edges, never the core querying you will spend most of your time on.</p>
  <div class="qb"><div class="qb-title">Same idea, different spelling</div>
    <div class="qb-row"><span class="qb-kw kw-r">Row limiting</span><span class="qb-mean">LIMIT (SQLite, MySQL, Postgres) vs TOP (SQL Server) vs FETCH FIRST (standard)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Auto ids</span><span class="qb-mean">AUTOINCREMENT (SQLite) vs AUTO_INCREMENT (MySQL) vs SERIAL (Postgres) vs IDENTITY (SQL Server)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Null fallback</span><span class="qb-mean">IFNULL (SQLite, MySQL) vs COALESCE (everywhere, standard) vs ISNULL (SQL Server)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Text join</span><span class="qb-mean">|| (SQLite, Postgres) vs CONCAT() (MySQL) </span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Dates</span><span class="qb-mean">strftime (SQLite) vs DATE_FORMAT (MySQL) vs to_char (Postgres)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Types</span><span class="qb-mean">SQLite is flexible; others enforce VARCHAR, DATE, BOOLEAN, DECIMAL strictly</span></div></div>
  <p class="body">Whenever this course uses something SQLite-specific, it will say so and point out the portable, standard alternative. That way you learn the universal habit, not just the SQLite trick.</p>

  <div class="sec-num">b.4</div><h3 class="section-h">Which one are we using, and why</h3>
  <p class="body">SQLingo runs on <b>SQLite</b>, right here in your browser (no install, no server, no account). Every query you run in these pages hits a real SQLite engine. We chose it for three honest reasons: there is <b>nothing to set up</b>, so you can learn instead of fighting installation; it is a <b>real, production database</b> (it is inside your phone and countless apps), not a toy; and it is <b>close to the SQL standard</b>, so what you learn carries cleanly to MySQL, PostgreSQL and the rest.</p>
  ${ed("SELECT 'SQLite ' || sqlite_version() AS running_engine",true)}

  <div class="sec-num">b.5</div><h3 class="section-h">SQL vs NoSQL, the other family</h3>
  <p class="body">You will hear "NoSQL" a lot, so here is the honest picture. Everything above is a <b>relational</b> (SQL) database: data lives in tables of rows and columns, with a fixed structure (a schema) and relationships between tables, and you query it with SQL. <b>NoSQL</b> is an umbrella term for databases that deliberately do things differently, usually trading strict structure for flexibility or massive scale.</p>
  <div class="qb"><div class="qb-title">SQL (relational) vs NoSQL, at a glance</div>
    <div class="qb-row"><span class="qb-kw kw-p">SQL</span><span class="qb-mean">tables with a fixed schema; relationships and JOINs; the SQL language; strong consistency (ACID). Great when data is structured and correctness matters (payments, orders, records).</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">NoSQL</span><span class="qb-mean">flexible or schema-less; scales out easily; various shapes. Great for huge scale, rapidly changing shapes, or simple fast lookups.</span></div></div>
  <p class="body">NoSQL is not one thing, it is a few families: <b>document</b> stores (MongoDB, holds JSON-like documents), <b>key-value</b> stores (Redis, blazing-fast simple lookups), <b>column-family</b> stores (Cassandra, huge write-heavy workloads), and <b>graph</b> databases (Neo4j, for networks of relationships). Each has its own query style, not SQL (though some now borrow SQL-like syntax).</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">A <b>SQL</b> database is a well-run government office: strict forms, everything cross-referenced, nothing inconsistent, brilliant when the records must be exactly right. A <b>NoSQL</b> store is more like a big flexible pile of labelled boxes: you can toss in whatever shape you like and grab things fast, at the cost of the office's strict guarantees.</p></div>
  <p class="body">Which should you learn first? <b>SQL, without question</b>, and not just because this is a SQL course. Relational databases run the majority of the world's important data, the concepts (tables, keys, relationships, querying) underpin almost everything, and even most NoSQL work assumes you understand them. It is the foundation. NoSQL is a valuable second step once you know why the relational model exists and where it strains.</p>
  <p class="body">One last reassurance: it is rarely either-or. Real systems often use both, a SQL database for the core records and a NoSQL store for caching or a specific high-scale feature. Learning SQL well is the highest-leverage first move, and it is exactly what the rest of this handbook gives you. On to the data.</p>
`};

lessons['21']={ short:'Built-in functions', where:'Part VII · <b>Built-in functions</b>', render:()=>`
  <div class="eyebrow">Part VII · Chapter 21</div>
  <h2 class="title">Built-in functions, reshaping values</h2>
  <p class="lead">Databases ship with dozens of ready-made functions to transform values: upper-casing text, rounding numbers, pulling the year out of a date. You have already met a few (ROUND, COALESCE, CAST). This chapter gathers the everyday ones, grouped by what they work on. This is also the area where dialects differ most, so watch for the notes.</p>
  <hr class="rule">

  <div class="sec-num">21.1</div><h3 class="section-h">String functions</h3>
  <p class="body">The common text tools: <b>UPPER</b> and <b>LOWER</b> change case, <b>LENGTH</b> counts characters, <b>SUBSTR(text, start, count)</b> pulls out a slice (positions start at 1), <b>TRIM</b> strips surrounding spaces, and <b>REPLACE</b> swaps one substring for another.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name,
       <span class="k">UPPER</span>(name) <span class="k">AS</span> shouted,
       <span class="k">LENGTH</span>(name) <span class="k">AS</span> letters,
       <span class="k">SUBSTR</span>(name, 1, 3) <span class="k">AS</span> first_three
<span class="k">FROM</span> customers</div></div>
  ${ed("SELECT name, UPPER(name) AS shouted, LENGTH(name) AS letters, SUBSTR(name, 1, 3) AS first_three FROM customers",true)}

  <div class="sec-num">21.2</div><h3 class="section-h">Joining text together</h3>
  <p class="body">To stitch strings, SQLite (and PostgreSQL) use the <b>||</b> operator. MySQL uses a <b>CONCAT()</b> function instead, a classic dialect difference.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name || <span class="s">' from '</span> || city <span class="k">AS</span> label <span class="k">FROM</span> customers</div><div class="ex-note">In MySQL the same idea is <code class="inl" style="font-size:12px">CONCAT(name, ' from ', city)</code>. The result is identical; only the spelling differs.</div></div>
  ${ed("SELECT name || ' from ' || city AS label FROM customers",true)}

  <div class="sec-num">21.3</div><h3 class="section-h">Numeric functions</h3>
  <p class="body"><b>ROUND(value, places)</b> rounds, <b>ABS</b> gives the absolute value, <b>CAST(x AS type)</b> converts a type, and the <b>%</b> operator gives the remainder (modulo).</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> name, rating,
       <span class="k">ROUND</span>(rating) <span class="k">AS</span> rounded,
       <span class="k">CAST</span>(rating <span class="k">AS</span> <span class="k">INTEGER</span>) <span class="k">AS</span> chopped,
       cost_for_two % 100 <span class="k">AS</span> remainder
<span class="k">FROM</span> restaurants</div><div class="ex-note">Note the difference: ROUND(4.6) is 5, but CAST(4.6 AS INTEGER) is 4, casting to an integer truncates rather than rounds.</div></div>
  ${ed("SELECT name, rating, ROUND(rating) AS rounded, CAST(rating AS INTEGER) AS chopped, cost_for_two % 100 AS remainder FROM restaurants",true)}

  <div class="sec-num">21.4</div><h3 class="section-h">Date functions</h3>
  <p class="body">Dates are where dialects diverge the most. In SQLite, dates are text in YYYY-MM-DD form, and <b>strftime(format, date)</b> extracts parts of them. The <code class="inl">%Y</code> is the year, <code class="inl">%m</code> the month, <code class="inl">%d</code> the day.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> id, order_date,
       strftime(<span class="s">'%Y'</span>, order_date) <span class="k">AS</span> yr,
       strftime(<span class="s">'%m'</span>, order_date) <span class="k">AS</span> mon
<span class="k">FROM</span> orders</div><div class="ex-note">MySQL would write <code class="inl" style="font-size:12px">YEAR(order_date)</code> or <code class="inl" style="font-size:12px">DATE_FORMAT(...)</code>; PostgreSQL uses <code class="inl" style="font-size:12px">EXTRACT(YEAR FROM ...)</code> or <code class="inl" style="font-size:12px">to_char(...)</code>. Same goal, different function names.</div></div>
  ${ed("SELECT id, order_date, strftime('%Y', order_date) AS yr, strftime('%m', order_date) AS mon FROM orders",true)}

  <div class="sec-num">21.5</div><h3 class="section-h">A function that works across a group</h3>
  <p class="body">One especially handy aggregate-style string function: <b>GROUP_CONCAT</b> (called STRING_AGG in Postgres and SQL Server) glues a column's values from a group into a single comma-separated string. Perfect with GROUP BY.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">SELECT</span> city, <span class="k">GROUP_CONCAT</span>(name) <span class="k">AS</span> people
<span class="k">FROM</span> customers <span class="k">GROUP BY</span> city</div><div class="ex-note">One row per city, with all that city's customer names collapsed into a single readable list.</div></div>
  ${ed("SELECT city, GROUP_CONCAT(name) AS people FROM customers GROUP BY city",true)}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>This is the least portable area of SQL.</b> String and especially date functions vary a lot between databases. Learn the concept here, then look up the exact function name for your database.</li>
    <li><b>SUBSTR counts from 1, not 0.</b> Unlike many programming languages, the first character is position 1.</li>
    <li><b>CAST truncates, ROUND rounds.</b> They are not the same. Pick deliberately.</li>
    <li><b>|| vs CONCAT.</b> If <code class="inl" style="font-size:12px">||</code> does not work in some database, it is probably MySQL, use CONCAT() there.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">A toolbox for values</h3>
  <p class="body">Functions transform values per row: strings (UPPER, LOWER, LENGTH, SUBSTR, TRIM, REPLACE, and || to join), numbers (ROUND, ABS, CAST, %), and dates (strftime in SQLite). GROUP_CONCAT summarises a group into one string. Just remember this is the corner of SQL where dialects differ most, so verify exact names when you move databases.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy',"Show each customer's <b>name upper-cased</b>, as a column called <b>upper_name</b>.", i=>sameRowsAnyOrder(i,"SELECT UPPER(name) AS upper_name FROM customers"), "SELECT UPPER(name) AS upper_name FROM customers", "UPPER(name) AS upper_name.")}
  ${q('q2','easy',"Show each customer's <b>name</b> and the <b>number of characters</b> in it as <b>len</b>.", i=>sameRowsAnyOrder(i,"SELECT name, LENGTH(name) AS len FROM customers"), "SELECT name, LENGTH(name) AS len FROM customers", "LENGTH(name) AS len.")}
  ${q('q3','med',"Show each restaurant's <b>name</b> and its <b>first 3 characters</b> as <b>abbr</b>.", i=>sameRowsAnyOrder(i,"SELECT name, SUBSTR(name, 1, 3) AS abbr FROM restaurants"), "SELECT name, SUBSTR(name, 1, 3) AS abbr FROM restaurants", "SUBSTR(name, 1, 3), positions start at 1.")}
  ${q('q4','med',"Show each restaurant's <b>name</b> and its <b>rating rounded to the nearest whole number</b> as <b>r</b>.", i=>sameRowsAnyOrder(i,"SELECT name, ROUND(rating) AS r FROM restaurants"), "SELECT name, ROUND(rating) AS r FROM restaurants", "ROUND(rating).")}
  ${q('q5','hard',"Show a single column <b>label</b> for each customer that reads like <b>name - city</b> (name, then a space-hyphen-space, then city).", i=>sameRowsAnyOrder(i,"SELECT name || ' - ' || city AS label FROM customers"), "SELECT name || ' - ' || city AS label FROM customers", "Join with ||: name || ' - ' || city.")}
`};

lessons['22']={ short:'CTEs (WITH)', where:'Part VII · <b>CTEs (the WITH clause)</b>', render:()=>`
  <div class="eyebrow">Part VII · Chapter 22</div>
  <h2 class="title">CTEs, naming a query with WITH</h2>
  <p class="lead">When queries grow, nested subqueries become a tangle of brackets that is painful to read. A Common Table Expression, written with the <b>WITH</b> keyword, lets you name a query up front and then use that name below, like a temporary, throwaway view that exists just for this one statement. It is the single biggest readability upgrade in SQL.</p>
  <hr class="rule">
  <p class="body">A CTE is essentially a ${term('subquery')} given a name and lifted to the top, so the main query reads cleanly. Same power as a subquery, far kinder to the reader (including future you).</p>

  <div class="sec-num">22.1</div><h3 class="section-h">Your first CTE</h3>
  <p class="body">Recall the derived-table example from the subqueries chapter, per-customer spend, then filter the big spenders. Here it is as a CTE. Notice how the logic reads top to bottom instead of inside-out.</p>
  <div class="qb"><div class="qb-title">Breaking it down</div>
    <div class="qb-row"><span class="qb-kw kw-a">WITH spend AS (...)</span><span class="qb-mean">define and name a query</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">SELECT * FROM spend</span><span class="qb-mean">then use it like a table</span></div></div>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">WITH</span> spend <span class="k">AS</span> (
  <span class="k">SELECT</span> customer_id, <span class="k">SUM</span>(amount) <span class="k">AS</span> total
  <span class="k">FROM</span> orders <span class="k">GROUP BY</span> customer_id
)
<span class="k">SELECT</span> * <span class="k">FROM</span> spend <span class="k">WHERE</span> total > 1000</div><div class="ex-note">The WITH block builds a named result called spend; the query below treats it exactly like a table. Compare this to burying that SELECT inside a FROM clause, this is far easier to follow.</div></div>
  ${ed("WITH spend AS (\n  SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id\n)\nSELECT * FROM spend WHERE total > 1000",true)}

  <div class="sec-num">22.2</div><h3 class="section-h">Using a CTE with a join</h3>
  <p class="body">Because a CTE behaves like a table, you can join to it. Here we turn those customer ids into names by joining the spend CTE back to customers.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">WITH</span> spend <span class="k">AS</span> (
  <span class="k">SELECT</span> customer_id, <span class="k">SUM</span>(amount) <span class="k">AS</span> total
  <span class="k">FROM</span> orders <span class="k">GROUP BY</span> customer_id
)
<span class="k">SELECT</span> c.name, spend.total
<span class="k">FROM</span> spend
<span class="k">JOIN</span> customers c <span class="k">ON</span> c.id = spend.customer_id
<span class="k">ORDER BY</span> spend.total <span class="k">DESC</span></div></div>
  ${ed("WITH spend AS (\n  SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id\n)\nSELECT c.name, spend.total\nFROM spend JOIN customers c ON c.id = spend.customer_id\nORDER BY spend.total DESC",true)}

  <div class="sec-num">22.3</div><h3 class="section-h">Multiple CTEs in one query</h3>
  <p class="body">You can define several, separated by commas, and each can build on the last. This lets you break a complex problem into named, readable steps, a genuine game-changer for hard queries.</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">WITH</span>
  per_city <span class="k">AS</span> (
    <span class="k">SELECT</span> city, <span class="k">AVG</span>(rating) <span class="k">AS</span> avg_rating
    <span class="k">FROM</span> restaurants <span class="k">GROUP BY</span> city
  ),
  good_cities <span class="k">AS</span> (
    <span class="k">SELECT</span> city <span class="k">FROM</span> per_city <span class="k">WHERE</span> avg_rating >= 4.4
  )
<span class="k">SELECT</span> * <span class="k">FROM</span> good_cities</div><div class="ex-note">Step one computes each city's average; step two keeps the strong cities using step one. Reads like a recipe, top to bottom.</div></div>
  ${ed("WITH\n  per_city AS (SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city),\n  good_cities AS (SELECT city FROM per_city WHERE avg_rating >= 4.4)\nSELECT * FROM good_cities",true)}

  <div class="sec-num">22.4</div><h3 class="section-h">Recursive CTEs, a peek</h3>
  <p class="body">CTEs have an advanced superpower: with <b>WITH RECURSIVE</b>, a CTE can refer to itself, which lets SQL walk hierarchies (org charts, category trees) or generate sequences. It is genuinely advanced and you will not need it soon, but it is worth knowing the capability exists. A tiny taste that counts 1 to 5:</p>
  <div class="ex"><div class="ex-tag">Example</div><div class="code"><span class="k">WITH RECURSIVE</span> nums(n) <span class="k">AS</span> (
  <span class="k">SELECT</span> 1
  <span class="k">UNION ALL</span>
  <span class="k">SELECT</span> n + 1 <span class="k">FROM</span> nums <span class="k">WHERE</span> n < 5
)
<span class="k">SELECT</span> n <span class="k">FROM</span> nums</div><div class="ex-note">It starts at 1, then repeatedly adds 1 by referring to itself, stopping at 5. Do not worry about mastering this now, just recognise the shape when you meet it later.</div></div>
  ${ed("WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums")}

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>A CTE lasts one statement.</b> The names you define in WITH exist only for the single query that follows. They are not saved like a view.</li>
    <li><b>Separate multiple CTEs with commas, one WITH.</b> You write <code class="inl" style="font-size:12px">WITH a AS (...), b AS (...)</code>, not a second WITH.</li>
    <li><b>CTE vs subquery vs view.</b> Same result, different trade: a subquery is inline, a CTE is a named step for this query, a view is saved for reuse across many queries. Reach for a CTE when a query gets hard to read.</li>
    <li><b>Order matters for chained CTEs.</b> A CTE can use ones defined before it, not after.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">Readable, step-by-step queries</h3>
  <p class="body">WITH names a query so you can use it below like a table, turning nested, inside-out subqueries into clean top-to-bottom steps. Chain several with commas, join to them, and reach for WITH RECURSIVE for hierarchies later. Nothing a CTE does is impossible with subqueries, it just makes complex SQL genuinely readable.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  ${q('q1','easy',"Using a CTE named <b>t</b> that holds each customer_id with its total order amount as <b>total</b>, select <b>everything</b> from t.", i=>sameRowsAnyOrder(i,"WITH t AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT * FROM t"), "WITH t AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT * FROM t", "WITH t AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT * FROM t.")}
  ${q('q2','med',"Using that same CTE <b>t</b>, select only the rows where <b>total is above 1000</b>.", i=>sameRowsAnyOrder(i,"WITH t AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT * FROM t WHERE total > 1000"), "WITH t AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT * FROM t WHERE total > 1000", "Add WHERE total > 1000 to the outer query.")}
  ${q('q3','med',"Using a CTE named <b>c</b> holding each city and its customer count as <b>n</b>, select all of c ordered by <b>n</b> highest first.", i=>sameResult(i,"WITH c AS (SELECT city, COUNT(*) AS n FROM customers GROUP BY city) SELECT * FROM c ORDER BY n DESC"), "WITH c AS (SELECT city, COUNT(*) AS n FROM customers GROUP BY city) SELECT * FROM c ORDER BY n DESC", "Build the per-city count in the CTE, ORDER BY n DESC outside.")}
  ${q('q4','hard',"Using a CTE <b>spend</b> (customer_id and total), show the <b>customer name and total</b> by joining spend to customers, highest total first.", i=>sameResult(i,"WITH spend AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT c.name, spend.total FROM spend JOIN customers c ON c.id = spend.customer_id ORDER BY spend.total DESC"), "WITH spend AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT c.name, spend.total FROM spend JOIN customers c ON c.id = spend.customer_id ORDER BY spend.total DESC", "Join the CTE to customers on id, ORDER BY total DESC.")}
  ${q('q5','hard',"Use <b>two chained CTEs</b>: first each city with its average rating, then keep cities averaging <b>4.4 or more</b>, and select those city names.", i=>sameRowsAnyOrder(i,"WITH per_city AS (SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city), good_cities AS (SELECT city FROM per_city WHERE avg_rating >= 4.4) SELECT * FROM good_cities"), "WITH per_city AS (SELECT city, AVG(rating) AS avg_rating FROM restaurants GROUP BY city), good_cities AS (SELECT city FROM per_city WHERE avg_rating >= 4.4) SELECT * FROM good_cities", "Two CTEs separated by a comma; the second reads from the first.")}
`};

lessons['23']={ short:'Transactions & ACID', where:'Part VII · <b>Transactions &amp; ACID</b>', render:()=>`
  <div class="eyebrow">Part VII · Chapter 23</div>
  <h2 class="title">Transactions and ACID, all-or-nothing safety</h2>
  <p class="lead">Some jobs are made of several steps that must all succeed together, or not at all. Moving money is the classic case: subtract from one account, add to another. If the second step fails after the first, money vanishes. A <b>transaction</b> groups steps so they either all commit together or all undo together. This is the idea that makes databases trustworthy.</p>
  <hr class="rule">
  <p class="body">You wrap statements between <b>BEGIN</b> and <b>COMMIT</b>. If everything goes well, COMMIT saves it all at once. If something goes wrong, <b>ROLLBACK</b> throws away every change since BEGIN, as if none of it happened. Practice below runs on an isolated scratch table (two accounts, Asha 1000 and Bala 500) that resets each check.</p>
  ${ed("DROP TABLE IF EXISTS demo;\nCREATE TABLE demo (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER);\nINSERT INTO demo VALUES (1, 'Asha', 1000), (2, 'Bala', 500);\nSELECT * FROM demo;",true)}

  <div class="sec-num">23.1</div><h3 class="section-h">BEGIN, COMMIT: save it all together</h3>
  <p class="body">A money transfer is two updates that belong together. Wrap them in a transaction so they land as one unit.</p>
  <div class="ex"><div class="ex-tag">Transfer 200 from Bala to Asha</div><div class="code"><span class="k">BEGIN</span>;
<span class="k">UPDATE</span> demo <span class="k">SET</span> balance = balance - 200 <span class="k">WHERE</span> id = 2;
<span class="k">UPDATE</span> demo <span class="k">SET</span> balance = balance + 200 <span class="k">WHERE</span> id = 1;
<span class="k">COMMIT</span>;
<span class="k">SELECT</span> * <span class="k">FROM</span> demo;</div><div class="ex-note">Both updates commit together. The point: no one can ever observe a half-done transfer where the money left one account but never arrived in the other.</div></div>
  ${ed("BEGIN;\nUPDATE demo SET balance = balance - 200 WHERE id = 2;\nUPDATE demo SET balance = balance + 200 WHERE id = 1;\nCOMMIT;\nSELECT * FROM demo;")}

  <div class="sec-num">23.2</div><h3 class="section-h">ROLLBACK: undo everything</h3>
  <p class="body">If you decide the change was wrong, or an error occurs partway, <b>ROLLBACK</b> discards every change since BEGIN. The table returns to exactly how it was.</p>
  <div class="ex"><div class="ex-tag">Change your mind</div><div class="code"><span class="k">BEGIN</span>;
<span class="k">UPDATE</span> demo <span class="k">SET</span> balance = 0 <span class="k">WHERE</span> id = 1;
<span class="k">ROLLBACK</span>;
<span class="k">SELECT</span> * <span class="k">FROM</span> demo;</div><div class="ex-note">Asha's balance is briefly set to 0, then ROLLBACK undoes it. The final SELECT shows the original 1000, untouched. This is the safety net that makes risky changes survivable.</div></div>
  ${ed("BEGIN;\nUPDATE demo SET balance = 0 WHERE id = 1;\nROLLBACK;\nSELECT * FROM demo;")}

  <div class="sec-num">23.3</div><h3 class="section-h">ACID, the four guarantees</h3>
  <p class="body">Transactions give relational databases four promises, remembered by the acronym <b>ACID</b>. This is a favourite interview topic, and worth understanding plainly.</p>
  <div class="qb"><div class="qb-title">ACID, in plain words</div>
    <div class="qb-row"><span class="qb-kw kw-p">Atomicity</span><span class="qb-mean">all steps happen, or none do. No half-finished transfers.</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Consistency</span><span class="qb-mean">the database moves from one valid state to another; rules and constraints always hold.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Isolation</span><span class="qb-mean">concurrent transactions do not trip over each other; each sees a clean view.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Durability</span><span class="qb-mean">once committed, it stays committed, even if the power dies a second later.</span></div></div>
  <p class="body">These guarantees are a big part of why banks, shops and record systems run on relational databases. When correctness truly matters, ACID is the reason SQL is trusted. (Many NoSQL systems relax some of these, trading strict guarantees for scale, which is the core tension we touched on in the SQL-versus-NoSQL chapter.)</p>

  <div class="sec-num">23.4</div><h3 class="section-h">SAVEPOINT, a partial undo</h3>
  <p class="body">Inside a big transaction you can drop a <b>SAVEPOINT</b>, a named marker, and later roll back <b>just to that marker</b> instead of undoing everything. Useful for long, multi-step operations. You will not need it often, but it is good to know it exists.</p>
  <p class="aside">A note on SQLite here: it treats each statement as its own automatic transaction unless you open one with BEGIN, which is why the WHERE-discipline from the INSERT/UPDATE/DELETE chapter still matters. For anything important on a real database, wrap it in an explicit transaction so a mistake is one ROLLBACK away.</p>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting to COMMIT.</b> Changes inside a transaction are not final until COMMIT. In some tools, closing the connection first silently rolls them back.</li>
    <li><b>ROLLBACK undoes the whole transaction.</b> Everything since BEGIN goes, not just the last statement. Use SAVEPOINT if you need finer control.</li>
    <li><b>Transactions are not a substitute for WHERE.</b> A transaction lets you undo a mistake you notice; a correct WHERE stops you making it. Use both.</li>
    <li><b>Keep transactions short.</b> A transaction left open holds locks and blocks others. Do the work, commit promptly.</li>
  </ul></div>

  <div class="sec-num">Recap</div><h3 class="section-h">The whole course, complete</h3>
  <p class="body">A transaction groups statements so they all succeed (COMMIT) or all undo (ROLLBACK), and ACID (Atomicity, Consistency, Isolation, Durability) is the set of guarantees that makes relational databases dependable. And with that, you have covered the full working span of SQL, from your first SELECT through joins, aggregation, windows, the whole data-management toolkit, functions, CTEs, and now transactions. You are genuinely equipped to work with real databases. Congratulations on finishing.</p>

  <div class="sec-num">Practice</div><h3 class="section-h">Your turn, five questions</h3>
  <p class="body">These run on an isolated accounts table (Asha 1000, Bala 500) that resets each check. Write full transactions.</p>
  ${(()=>{const R="DROP TABLE IF EXISTS sbx; CREATE TABLE sbx (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER); INSERT INTO sbx VALUES (1,'Asha',1000),(2,'Bala',500);";const V="SELECT * FROM sbx ORDER BY id";return `
  ${qm('q1','easy',"In a transaction, <b>add 100 to Asha's balance</b> (id 1) and <b>commit</b>.",R,V,"BEGIN; UPDATE sbx SET balance = balance + 100 WHERE id = 1; COMMIT;","BEGIN; UPDATE ...; COMMIT;")}
  ${qm('q2','med',"In one transaction, <b>transfer 200 from Bala (id 2) to Asha (id 1)</b>, then commit.",R,V,"BEGIN; UPDATE sbx SET balance = balance - 200 WHERE id = 2; UPDATE sbx SET balance = balance + 200 WHERE id = 1; COMMIT;","Two UPDATEs between BEGIN and COMMIT.")}
  ${qm('q3','med',"Start a transaction, <b>set Asha's balance to 0</b>, then <b>ROLLBACK</b> so nothing actually changes.",R,V,"BEGIN; UPDATE sbx SET balance = 0 WHERE id = 1; ROLLBACK;","End with ROLLBACK instead of COMMIT.")}
  ${qm('q4','med',"In a transaction, <b>give both accounts a 100 bonus</b> (add 100 to every balance) and commit.",R,V,"BEGIN; UPDATE sbx SET balance = balance + 100; COMMIT;","An UPDATE with no WHERE touches every row, on purpose here.")}
  ${qm('q5','hard',"Begin a transfer of <b>400 from Asha to Bala</b> (two updates), then <b>ROLLBACK the whole thing</b> so balances stay 1000 and 500.",R,V,"BEGIN; UPDATE sbx SET balance = balance - 400 WHERE id = 1; UPDATE sbx SET balance = balance + 400 WHERE id = 2; ROLLBACK;","Two UPDATEs, then ROLLBACK cancels both.")}
  `;})()}
`};

lessons['24']={ short:'Command families', where:'Part VIII · <b>Command families</b>', render:()=>`
  <div class="eyebrow">Part VIII · Chapter 24</div>
  <h2 class="title">The command families: DDL, DML, DQL, TCL, DCL</h2>
  <p class="lead">Every SQL statement you have learned belongs to one of a few named families, grouped by what the statement does. You will see these acronyms constantly in documentation and interviews, so here is what each means, with the commands you already know slotted into place.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The five families at a glance</div>
    <div class="qb-row"><span class="qb-kw kw-p">DDL</span><span class="qb-mean"><b>Data Definition Language</b> — defines and changes structure: CREATE, ALTER, DROP, TRUNCATE.</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">DML</span><span class="qb-mean"><b>Data Manipulation Language</b> — changes the data inside tables: INSERT, UPDATE, DELETE.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">DQL</span><span class="qb-mean"><b>Data Query Language</b> — reads data: SELECT. (Often counted as part of DML.)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">TCL</span><span class="qb-mean"><b>Transaction Control Language</b> — manages transactions: BEGIN, COMMIT, ROLLBACK, SAVEPOINT.</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">DCL</span><span class="qb-mean"><b>Data Control Language</b> — controls permissions: GRANT, REVOKE.</span></div></div>

  <div class="sec-num">24.1</div><h3 class="section-h">DDL, defining the structure</h3>
  <p class="body"><b>Data Definition Language</b> is about the shape of the database, the tables, columns and constraints themselves, not the rows inside. You met all of it in the CREATE/ALTER/DROP chapter. A quirk worth knowing: in most databases DDL statements <b>auto-commit</b>, meaning they cannot be rolled back like data changes can. TRUNCATE (empty a table fast) also lives here in databases that have it.</p>
  ${ed("DROP TABLE IF EXISTS demo24;\nCREATE TABLE demo24 (id INTEGER PRIMARY KEY, task TEXT);\nSELECT name FROM pragma_table_info('demo24');",true)}

  <div class="sec-num">24.2</div><h3 class="section-h">DML, changing the data</h3>
  <p class="body"><b>Data Manipulation Language</b> changes the rows: INSERT adds, UPDATE edits, DELETE removes. Unlike DDL, these happen inside a transaction and <b>can be rolled back</b> (until committed), which is exactly what the transactions chapter was about.</p>
  ${ed("DROP TABLE IF EXISTS demo24;\nCREATE TABLE demo24 (id INTEGER PRIMARY KEY, task TEXT);\nINSERT INTO demo24 VALUES (1, 'Learn DML'), (2, 'Learn DDL');\nUPDATE demo24 SET task = 'Master DML' WHERE id = 1;\nSELECT * FROM demo24;")}

  <div class="sec-num">24.3</div><h3 class="section-h">DQL, asking questions</h3>
  <p class="body"><b>Data Query Language</b> is really just SELECT, the reading you spent the whole first half of this course on. Many people fold it into DML, but the DQL label is common enough that it is worth recognising. Everything from WHERE to JOIN to window functions is DQL at heart.</p>
  ${ed("SELECT name, rating FROM restaurants ORDER BY rating DESC LIMIT 3;")}

  <div class="sec-num">24.4</div><h3 class="section-h">TCL, controlling transactions</h3>
  <p class="body"><b>Transaction Control Language</b> is the small set of commands that wrap DML into all-or-nothing units: BEGIN, COMMIT, ROLLBACK, and SAVEPOINT. You met these in the transactions chapter. The cell below shows a ROLLBACK undoing a change.</p>
  ${ed("DROP TABLE IF EXISTS demo24;\nCREATE TABLE demo24 (id INTEGER PRIMARY KEY, task TEXT);\nINSERT INTO demo24 VALUES (1, 'original');\nBEGIN;\nUPDATE demo24 SET task = 'changed' WHERE id = 1;\nROLLBACK;\nSELECT * FROM demo24;")}

  <div class="sec-num">24.5</div><h3 class="section-h">DCL, controlling access</h3>
  <p class="body"><b>Data Control Language</b> governs <b>who may do what</b>: <code class="inl">GRANT</code> gives a user permission (say, to read a table), <code class="inl">REVOKE</code> takes it away. These matter on multi-user server databases like MySQL, PostgreSQL and SQL Server. SQLite, being a single file with no user accounts, does not have them, so there is nothing to run here, but you should know the family exists.</p>
  <div class="ex"><div class="ex-tag">What it looks like (server databases)</div><div class="code"><span class="k">GRANT</span> <span class="k">SELECT</span> <span class="k">ON</span> orders <span class="k">TO</span> analyst_user;
<span class="k">REVOKE</span> <span class="k">SELECT</span> <span class="k">ON</span> orders <span class="k">FROM</span> analyst_user;</div><div class="ex-note">Give the analyst read access to orders, then take it away. Access control is a big topic in production databases; this is the entry point.</div></div>

  <div class="sec-num">Recap</div><h3 class="section-h">One tidy mental map</h3>
  <p class="body">DDL shapes the tables (CREATE/ALTER/DROP), DML changes the rows (INSERT/UPDATE/DELETE), DQL reads them (SELECT), TCL wraps changes safely (BEGIN/COMMIT/ROLLBACK), and DCL controls who is allowed (GRANT/REVOKE). Every statement in SQL fits into one of these five, and you have now used four of them hands-on.</p>
`};

lessons['25']={ short:'Normalization & design', where:'Part VIII · <b>Normalization &amp; design</b>', render:()=>`
  <div class="eyebrow">Part VIII · Chapter 25</div>
  <h2 class="title">Normalization and database design</h2>
  <p class="lead">Good queries start with good tables. Normalization is the craft of organising columns into tables so that each fact is stored once, in the right place. Get it right and your data stays consistent and easy to change. Get it wrong and you fight duplication and contradictions forever. This is the design theory beneath everything you have learned.</p>
  <hr class="rule">

  <div class="sec-num">25.1</div><h3 class="section-h">The problem: one big flat table</h3>
  <p class="body">Imagine cramming everything into a single table, each order repeating the customer's name and city and the restaurant's details. That redundancy causes three classic <b>anomalies</b>: an <b>update anomaly</b> (change a customer's city and you must fix it in every one of their order rows, miss one and the data contradicts itself), an <b>insertion anomaly</b> (you cannot add a new restaurant until someone orders from it), and a <b>deletion anomaly</b> (delete the last order for a customer and you accidentally erase the customer entirely).</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">It is the difference between writing a customer's full address on <b>every single</b> order slip, versus writing it once in a register and just noting the customer number on each slip. The register approach means one change updates everything, and nothing can silently disagree.</div></div>

  <div class="sec-num">25.2</div><h3 class="section-h">Keys, the anchors of a design</h3>
  <p class="body">Design revolves around keys. A ${term('primary_key','primary key')} uniquely identifies each row (our <code class="inl">id</code> columns). A ${term('foreign_key','foreign key')} points at another table's primary key (orders.customer_id). A <b>composite key</b> is a primary key made of more than one column together. A <b>candidate key</b> is any column that could serve as the primary key; a <b>surrogate key</b> is an artificial id (like our auto id) chosen instead of a <b>natural key</b> (a real-world unique value such as an email).</p>

  <div class="sec-num">25.3</div><h3 class="section-h">The normal forms, in plain terms</h3>
  <p class="body">Normalization proceeds in steps called <b>normal forms</b>. The first three are what matter in everyday practice.</p>
  <div class="qb"><div class="qb-title">1NF, 2NF, 3NF</div>
    <div class="qb-row"><span class="qb-kw kw-p">1NF</span><span class="qb-mean">Every cell holds one atomic value, no lists or repeating groups in a column. "pizza, burger" in one field breaks 1NF.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">2NF</span><span class="qb-mean">Already 1NF, and every non-key column depends on the <b>whole</b> primary key, not just part of a composite key.</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">3NF</span><span class="qb-mean">Already 2NF, and no non-key column depends on <b>another non-key</b> column (no transitive dependencies).</span></div></div>
  <p class="body">A simple way to remember 2NF and 3NF: every non-key fact should depend on <b>the key, the whole key, and nothing but the key</b>. If a column really describes something else, it belongs in that something else's own table.</p>

  <div class="sec-num">25.4</div><h3 class="section-h">Seeing it break, then fixing it</h3>
  <p class="body">Here is a deliberately bad, denormalized table: order data with the customer and restaurant names repeated inline. Notice Aarav Sharma and his city repeat across rows, ready to drift out of sync.</p>
  ${ed("DROP TABLE IF EXISTS bad_orders;\nCREATE TABLE bad_orders (order_id INTEGER, customer_name TEXT, customer_city TEXT, restaurant_name TEXT, amount INTEGER);\nINSERT INTO bad_orders VALUES\n (1, 'Aarav Sharma', 'Mumbai', 'Dominos', 520),\n (2, 'Aarav Sharma', 'Mumbai', 'Subway', 360),\n (8, 'Aarav Sharma', 'Mumbai', 'Dominos', 500);\nSELECT * FROM bad_orders;",true)}
  <p class="body">The normalized fix is exactly the schema this whole course uses: pull customers into their own table, restaurants into theirs, and let <code class="inl">orders</code> reference them by id. Each fact lives once.</p>
  ${ed("SELECT o.id, c.name, c.city, r.name AS restaurant, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN restaurants r ON o.restaurant_id = r.id\nWHERE o.customer_id = 1;")}

  <div class="sec-num">25.5</div><h3 class="section-h">Relationships and the many-to-many trick</h3>
  <p class="body">Tables relate in three shapes: <b>one-to-one</b>, <b>one-to-many</b> (one customer, many orders, the common case), and <b>many-to-many</b>. A many-to-many (many customers order from many restaurants) cannot be stored directly; you use a <b>junction table</b> in the middle. Our <code class="inl">orders</code> table is precisely that junction, each row linking one customer to one restaurant. You have been using a textbook normalized design the entire time.</p>

  <div class="sec-num">25.6</div><h3 class="section-h">When to break the rules on purpose</h3>
  <p class="body">Normalization is the default, but not a religion. <b>Denormalization</b> is the deliberate reintroduction of some redundancy to make reads faster, storing a precomputed total, say, so you do not recompute it on every query. It is a considered performance trade, done knowingly, not the accidental mess of a badly designed table. Normalize first; denormalize later only with a measured reason. (There are stricter forms beyond 3NF, like BCNF, but 3NF covers the vast majority of real designs.)</p>

  <div class="sec-num">Recap</div><h3 class="section-h">Store each fact once</h3>
  <p class="body">Normalization organises columns so every fact lives in exactly one place, preventing update, insertion and deletion anomalies. Keys anchor the design, 1NF/2NF/3NF are the practical checklist ("the key, the whole key, and nothing but the key"), junction tables handle many-to-many, and denormalization is a deliberate, measured exception for speed. The customers/restaurants/orders schema you have used throughout is a clean, normalized example.</p>
`};

lessons['26']={ short:'Best practices & scaling', where:'Part VIII · <b>Best practices &amp; scaling</b>', render:()=>`
  <div class="eyebrow">Part VIII · Chapter 26</div>
  <h2 class="title">Best practices and scaling</h2>
  <p class="lead">You know the language. This final chapter is about using it well: writing SQL that is readable, correct, and fast, and understanding how databases cope when the data grows large. These are the habits that separate someone who can write a query from someone trusted to run one against production.</p>
  <hr class="rule">

  <div class="sec-num">26.1</div><h3 class="section-h">Writing SQL people can trust</h3>
  <p class="body">Good SQL is boring SQL, clear and predictable. A short checklist worth internalising:</p>
  <div class="qb"><div class="qb-title">Everyday habits</div>
    <div class="qb-row"><span class="qb-kw kw-p">Name your columns</span><span class="qb-mean">prefer explicit columns over SELECT * in real code, so results are stable and you fetch only what you need.</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Always WHERE first</span><span class="qb-mean">on UPDATE and DELETE, write the WHERE before the change, and preview it with a SELECT.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Alias and format</span><span class="qb-mean">short table aliases, aligned clauses, and comments on the non-obvious bits. Future you will thank you.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Constrain at the source</span><span class="qb-mean">use NOT NULL, UNIQUE, FOREIGN KEY, CHECK so the database rejects bad data itself.</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Parameterise input</span><span class="qb-mean">never glue user input into a query string; use placeholders. This is the injection defence from chapter 20.</span></div></div>

  <div class="sec-num">26.2</div><h3 class="section-h">Performance, the big levers</h3>
  <p class="body">A handful of ideas cover most real-world speed. <b>Index</b> the columns you filter, join and sort on (chapter 19), that is the single biggest lever. Keep conditions <b>sargable</b>: <code class="inl">WHERE city = 'Mumbai'</code> can use an index, but wrapping the column in a function like <code class="inl">WHERE LOWER(city) = 'mumbai'</code> often cannot. Think in <b>sets, not loops</b>: one query that joins and groups beats fetching ids then looping a query per id (the dreaded "N+1"). And do not haul back more than you need, select the columns that matter and <code class="inl">LIMIT</code> large results.</p>

  <div class="sec-num">26.3</div><h3 class="section-h">EXPLAIN, seeing what the database actually does</h3>
  <p class="body">You do not have to guess whether a query is efficient, ask. <b>EXPLAIN</b> (in SQLite, <code class="inl">EXPLAIN QUERY PLAN</code>) shows the database's plan: whether it scans the whole table or jumps via an index. Run the two cells and compare, one before an index, one after.</p>
  ${ed("EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 1;",true)}
  ${ed("CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);\nEXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 1;")}
  <p class="aside">Look for the word SCAN versus SEARCH. SCAN reads every row; SEARCH USING INDEX jumps straight to matches. On tiny tables the optimiser may still scan (it is cheap enough), but on large tables that difference is the gap between instant and painfully slow. EXPLAIN is how you check rather than hope.</p>

  <div class="sec-num">26.4</div><h3 class="section-h">Integrity and safety, briefly</h3>
  <p class="body">Correctness is a feature. Lean on <b>constraints</b> to keep data valid, wrap multi-step changes in <b>transactions</b> so a failure cannot leave things half-done, and grant each application or user the <b>least privilege</b> it needs (a reporting tool should probably only SELECT). None of this is glamorous, and all of it saves you at 2am.</p>

  <div class="sec-num">26.5</div><h3 class="section-h">Scaling, when the data gets big</h3>
  <p class="body">When one database starts to strain, these are the moves, roughly in the order teams reach for them:</p>
  <div class="qb"><div class="qb-title">Ways to scale</div>
    <div class="qb-row"><span class="qb-kw kw-p">Index & tune</span><span class="qb-mean">first, always: the right indexes and better queries fix most "slow database" problems cheaply.</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Scale up (vertical)</span><span class="qb-mean">a bigger machine, more CPU/RAM. Simple, but has a ceiling and gets expensive.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Caching</span><span class="qb-mean">keep hot results in fast storage (often a key-value store like Redis) so the database is asked less.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Read replicas</span><span class="qb-mean">copies that serve reads, spreading load; the primary handles writes.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Connection pooling</span><span class="qb-mean">reuse a set of connections instead of opening one per request, avoiding a common bottleneck.</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Partitioning / sharding</span><span class="qb-mean">split one huge table or database across pieces (by date, by region, by id range). Powerful, and the most complex.</span></div></div>
  <p class="body">A grounding truth: most applications never need the exotic end of this list. A well-indexed, well-queried single database on a decent machine takes you remarkably far. Reach for sharding when you have measured a real need, not before. And recall the NoSQL discussion, sometimes the right scaling answer is a different tool for one specific job, alongside your SQL database rather than instead of it.</p>

  <div class="sec-num">Recap</div><h3 class="section-h">The end of the handbook</h3>
  <p class="body">Write SQL that is explicit, safe, and readable; index what you search and use EXPLAIN to verify; protect data with constraints and transactions and parameterised queries; and scale by tuning first, then adding hardware, caching, replicas and, only when truly needed, partitioning. That is not just SQL syntax, it is the judgement to use it well. You have now been through the entire handbook, from your first SELECT to production craft. Go build something with it.</p>
`};
