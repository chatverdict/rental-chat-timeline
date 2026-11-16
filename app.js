var LINE_RE=/^\[?(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?[\s\u202f]*([AaPp]\.?[Mm]\.?)?\]?\s*[-\u2013]?\s*([^:\n]{1,40}):\s?(.*)$/;
var RULES={
 repair:/\b(repair|fix(ed|ing)?|broken|leak(ing|s)?|mould|mold|damp|heating|boiler|no hot water|plumber|electrician|maintenance|not working|stopped working|infestation|pests?|cockroach(es)?|mice|rats?)\b/i,
 reply:/\b(i will|i'll|we will|we'll|will (send|come|fix|arrange)|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|tomorrow|next week|scheduled|booked|sorry for the delay|got your message)\b/i,
 rent:/\b(rent|deposit|paid|payment|transfer(red)?|bank|owe[ds]?|refund|invoice|utilit(y|ies)|bills?)\b/i,
 notice:/\b(notice|deadline|due (on|by)|by (monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|end of)|move out|vacate|inspection|entry|visit|lease|contract|terminate|termination)\b/i};
var rowsData=[];
function mask(t){return t.replace(/https?:\/\/\S+/gi,'[link]').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'[email]').replace(/\+?\d[\d\s\-()]{8,}\d/g,'[number]');}
function parse(text){var lines=text.split(/\r?\n/),msgs=[],cur=null;
 lines.forEach(function(l){l=l.replace(/[\u200e\u200f\u202a-\u202e]/g,'');var m=l.match(LINE_RE);
  if(m){var hh=+m[2];if(m[4]){var pm=/^p/i.test(m[4]);if(pm&&hh<12)hh+=12;if(!pm&&hh===12)hh=0;}cur={date:m[1],time:String(hh).padStart(2,'0')+':'+m[3],who:m[5].trim(),text:m[6]||''};msgs.push(cur);}
  else if(cur&&l.trim()){cur.text+=' '+l.trim();}});
 return msgs;}
function run(text){var msgs=parse(text);rowsData=[];
 msgs.forEach(function(m){Object.keys(RULES).forEach(function(k){if(RULES[k].test(m.text)){rowsData.push({date:m.date+' '+m.time,who:m.who,type:k,text:mask(m.text)});}});});
 document.getElementById('out').hidden=false;
 if(msgs.length){try{new Image().src='https://pitzui-tisot.goatcounter.com/count?p=/event/rental-parsed&e=true&t=file-processed&rnd='+Math.random();}catch(x){}}
 var c={};rowsData.forEach(function(r){c[r.type]=(c[r.type]||0)+1;});
 document.getElementById('sum').textContent=msgs.length?(msgs.length+' messages read, '+rowsData.length+' matches ('+Object.keys(c).map(function(k){return c[k]+' '+k;}).join(', ')+').'):'No messages recognised. Check this is a WhatsApp .txt export.';
 render();}
function cell(tr,text,cls){var td=document.createElement('td');if(cls){var s=document.createElement('span');s.className='tag';s.textContent=text;td.appendChild(s);}else{td.textContent=text;}tr.appendChild(td);}
function render(){var f=document.getElementById('flt').value,tb=document.getElementById('rows');tb.textContent='';
 rowsData.filter(function(r){return f==='all'||r.type===f;}).forEach(function(r){var tr=document.createElement('tr');
  cell(tr,r.date);cell(tr,r.who);cell(tr,r.type,true);cell(tr,r.text);tb.appendChild(tr);});}
document.getElementById('flt').onchange=render;
document.getElementById('f').onchange=function(e){var fl=e.target.files[0];if(!fl)return;var rd=new FileReader();rd.onload=function(){run(String(rd.result));};rd.readAsText(fl);};
document.getElementById('print').onclick=function(){window.print();};
document.getElementById('csv').onclick=function(){var q=function(s){s=String(s);if(/^[\s\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 var out='date,who,type,message\n'+rowsData.map(function(r){return [r.date,r.who,r.type,r.text].map(q).join(',');}).join('\n');
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([out],{type:'text/csv'}));a.download='rental-chat-timeline.csv';a.click();};
