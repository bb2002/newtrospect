(()=>{
  const ogt=(document.querySelector('meta[property="og:type"]')?.content||'').toLowerCase();
  const pub=document.querySelector('meta[property="article:published_time"]')?.content||document.querySelector('meta[name="article:published_time"]')?.content||'';
  const paras=document.querySelectorAll('p');
  let longParas=0,maxP=0,totalP=0;
  paras.forEach(p=>{const t=(p.innerText||'').trim();totalP+=t.length;if(t.length>=50)longParas++;if(t.length>maxP)maxP=t.length});
  const body=(document.body?.innerText||'').trim().length;
  const title=(document.title||'').slice(0,80);
  return JSON.stringify({ogt,hasPub:!!pub,nParas:paras.length,longParas,maxP,totalP,bodyLen:body,title});
})()
