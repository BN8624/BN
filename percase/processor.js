window.executeCalculation = async ({
  file, tab, isTax, taxCode, g1P, g1A, g2P, g2A,
  v1A, v1B, v2A, v2B, mAmts, u250, unit, minA, maxA,
  item, bAcc, oAcc, log, cRef, setIsProc
}) => {
  // helpers.js 에서 도구들을 가져옵니다.
  const { randGen, parseDate, breathe, getNum } = window;
  
  let pInfo = [];
  if(tab === "term") {
    if(g1P) { pInfo.push([1,3,getNum(v1A)], [4,6,getNum(v1B)]); } else if(g1A) pInfo.push([1,6,getNum(v1A)]);
    if(g2P) { pInfo.push([7,9,getNum(v2A)], [10,12,getNum(v2B)]); } else if(g2A) pInfo.push([7,12,getNum(v2A)]);
  } else {
    mAmts.forEach((a, i) => { const v = getNum(a); if(v>0) pInfo.push([i+1, i+1, v]); });
  }

  const tTar = pInfo.reduce((s, p) => s+p[2], 0);
  if(tTar<=0) { alert("⚠️ 배분할 금액을 입력해주세요."); setIsProc(false); return; }

  const sp250 = (tab==="month" && !isTax && u250);
  log(`🚀 [시작] ${isTax?'과세':'면세'} / 총액: ${tTar.toLocaleString()}원`);

  try {
    await breathe();
    const data = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = (e) => res(new Uint8Array(e.target.result));
      r.onerror = () => rej(new Error("파일 읽기 실패")); r.readAsArrayBuffer(file);
    });
    if(cRef.current) throw new Error("취소");

    const wb = XLSX.read(data, {type: 'array', cellDates: true});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, {defval: ""});
    if(!rows.length) throw new Error("엑셀 데이터 없음");

    const ks = Object.keys(rows[0]);
    const dC = ks.find(k=>k==='전표일자') || ks.find(k=>k.includes('일자')||k.includes('날짜')) || ks[0];
    const aC = ks.find(k=>k==='합계') || ks.find(k=>k.includes('합계')||k.includes('금액')) || ks[1];
    log(`🔍 인식 열 -> 날짜: [${dC}], 금액: [${aC}]`);

    const gMap = new Map();
    rows.forEach(r => {
      const pd = parseDate(r[dC]); if(!pd) return;
      const dStr = `${pd.getFullYear()}-${String(pd.getMonth()+1).padStart(2,'0')}-${String(pd.getDate()).padStart(2,'0')}`;
      const am = typeof r[aC]==='number' ? r[aC] : parseFloat(String(r[aC]).replace(/[,\s]/g,''))||0;
      if(!gMap.has(dStr)) gMap.set(dStr, {d: pd, o: 0, n: 0});
      gMap.get(dStr).o += am;
    });

    const gList = Array.from(gMap.values());
    if(!gList.length) throw new Error("유효한 데이터 없음");

    const rand = randGen(file.name+tTar);

    for (const [sM, eM, tA] of pInfo) {
      if(cRef.current) throw new Error("취소");
      if(tA <= 0) continue;
      let pItems = gList.filter(i => { const m = i.d.getMonth()+1; return m>=sM && m<=eM; });
      if(!pItems.length) { log(`⚠️ ${sM}~${eM}월 데이터 없음`); continue; }

      if (sp250) {
        let tO = pItems.reduce((s, i) => s + Math.max(0, i.o), 0);
        let exA = pItems.map(i => {
          const w = (tO>0 ? (Math.max(0, i.o)/tO) : (1/pItems.length))*0.3 + rand()*0.7;
          return { ref: i, w, b: 0 };
        });
        let sumW = exA.reduce((s,o)=>s+o.w, 0);
        exA.forEach(o => o.w = sumW>0 ? o.w/sumW : 1/pItems.length);

        let sItems = exA.map((o,i)=>({...o, idx: i})).sort((a,b)=>b.w-a.w);
        let rT = tA, cks = [];
        
        while(rT>=1000 && cks.length < sItems.length-1) {
          let avg = rT/(sItems.length-cks.length);
          let mxC = Math.max(5000, avg*2);
          let tk = Math.floor(rand() * (Math.floor((Math.min(rT,mxC)-1000)/250) + 1));
          if(rand()<0.25) tk=0;
          let c = 1000 + tk*250; cks.push(c); rT-=c;
        }
        if(rT>0) cks.push(rT);
        
        for(let i=0; i<cks.length; i++) sItems[i].b = cks[i];
        for(let i=cks.length; i<sItems.length; i++) sItems[i].b = 0;
        sItems.forEach(i => exA[i.idx].b = i.b);
        
        pItems.forEach(i => i.n=0);
        exA.forEach(o => o.ref.n = o.b);

      } else {
        let rT = tA;
        let act = [...pItems];

        let tMin = getNum(minA) || unit;
        let tMax = getNum(maxA) || tA;
        
        tMin = Math.ceil(tMin / unit) * unit;
        tMax = Math.floor(tMax / unit) * unit;
        if (tMin > tMax) tMax = tMin;

        let maxN = Math.floor(tA / tMin);
        let minN = Math.ceil(tA / tMax);
        if (minN < 1) minN = 1;
        if (maxN < minN) maxN = minN;
        
        let avail = act.length;
        if (minN > avail) minN = avail;
        if (maxN > avail) maxN = avail;

        let N = minN + Math.floor(rand() * (maxN - minN + 1));
        if (N === 0) N = 1;

        act.forEach(i => i.s = (i.o * 0.5) + (rand() * 1000000));
        act.sort((a,b) => b.s - a.s);
        let sel = act.slice(0, N);
        
        sel.forEach(i => { i.b = tMin; rT -= tMin; });

        let ticks = Math.floor(rT / unit);
        let indices = sel.map((_, i) => i);
        
        for(let i=0; i<ticks; i++) {
          let valids = indices.filter(idx => sel[idx].b + unit <= tMax);
          if(valids.length === 0) valids = indices; 
          let pick = valids[Math.floor(rand() * valids.length)];
          sel[pick].b += unit;
          rT -= unit;
        }

        if (rT !== 0) {
          sel[0].b += rT;
        }

        pItems.forEach(i => i.n = 0);
        sel.forEach(i => i.n = i.b); 
      }
      
      log(`✅ ${sM}~${eM}월: ${tA.toLocaleString()}원 불규칙 분배 완료!`);
      await breathe();
    }

    if(cRef.current) throw new Error("취소");
    
    const out = [[ 
      '년도','월','일','매입매출구분(1-매출/2-매입)','과세유형','불공제사유',
      '신용카드거래처코드','신용카드사명','신용카드(가맹점)번호','거래처명',
      '사업자(주민)등록번호',' 공급가액 ',' 부가세 ','품명','전자세금(1.전자)',
      '기본계정','상대계정','현금영수증 승인번호' 
    ]];
    
    let fc=0, fs=0;
    
    gList.forEach(i => {
      if(i.n<=0) return;
      let sA=0, vA=0;
      if(isTax) { sA = Math.round(i.n/1.1); vA = i.n-sA; } else { sA = i.n; vA = 0; }
      out.push([ i.d.getFullYear(), i.d.getMonth()+1, i.d.getDate(), 1, parseInt(taxCode), "","","","","","", sA, vA, item, "", parseInt(bAcc)||"", parseInt(oAcc)||"", "" ]);
      fc++; fs+=i.n;
    });

    if(!fc) { alert("결과 데이터 0건"); setIsProc(false); return; }
    log(`💾 ${fc}건 엑셀 생성 중...`); await breathe();

    const ows = XLSX.utils.aoa_to_sheet(out);
    const owb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(owb, ows, "매출자료 & 매입자료");
    
    const safeName = file.name.split('.').slice(0,-1).join('.');
    XLSX.writeFile(owb, `${safeName}_결과_${isTax?'과세':'면세'}.xls`, {bookType:'biff8'});
    
    log("🎉 작업 성공!"); alert(`✅ 완료!\n합계: ${fs.toLocaleString()}원\n건수: ${fc}건`);
    
  } catch(e) {
    if(e.message==="취소") log("🛑 중단됨."); else { log(`❌ 오류: ${e.message}`); alert(`⚠️ ${e.message}`); }
  } finally { setIsProc(false); }
};