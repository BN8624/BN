const { useState, useEffect, useRef } = React;
// 연결된 엔진과 헬퍼 함수를 불러옵니다
const { fmt, executeCalculation } = window; 

function App() {
  const [file, setFile] = useState(null);
  const [isTax, setIsTax] = useState(true);
  const [taxCode, setTaxCode] = useState("14");
  const [tab, setTab] = useState("month");
  
  const [v1A, setV1A] = useState(""); const [v1B, setV1B] = useState("");
  const [v2A, setV2A] = useState(""); const [v2B, setV2B] = useState("");
  const [g1P, setG1P] = useState(false); const [g1A, setG1A] = useState(false);
  const [g2P, setG2P] = useState(false); const [g2A, setG2A] = useState(false);
  const [mAmts, setMAmts] = useState(Array(12).fill(""));
  
  const [u250, setU250] = useState(false);
  const [unit, setUnit] = useState(1000);
  const [minA, setMinA] = useState("");
  const [maxA, setMaxA] = useState("");
  
  const [item, setItem] = useState("건축자재");
  const [bAcc, setBAcc] = useState("401"); 
  const [oAcc, setOAcc] = useState("101");
  
  const [isProc, setIsProc] = useState(false);
  const [logs, setLogs] = useState([]);
  const cRef = useRef(false); const lRef = useRef(null);

  const log = (msg) => setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  useEffect(() => { lRef.current?.scrollIntoView({behavior: 'smooth'}); }, [logs]);

  const handleTaxChange = (taxable) => { setIsTax(taxable); setTaxCode(taxable ? "14" : "18"); };
  const handleMonthAmtChange = (idx, val) => { const newAmts = [...mAmts]; newAmts[idx] = fmt(val); setMAmts(newAmts); };
  const cancelProcess = () => { cRef.current = true; log("🛑 비상정지! 작업을 안전하게 멈춥니다..."); };

  const downloadLogs = () => {
    if (logs.length === 0) return alert("다운로드할 로그가 없습니다.");
    const blob = new Blob(["=== 건별산출 작업 로그 ===\n" + logs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = `건별산출_로그_${new Date().toISOString().slice(0,10)}.txt`; link.click(); URL.revokeObjectURL(url);
  };

  const runProc = async () => {
    setIsProc(true); cRef.current = false; setLogs([]);
    // 외부 파일에 분리된 계산 엔진을 호출합니다
    await executeCalculation({
      file, tab, isTax, taxCode, g1P, g1A, g2P, g2A,
      v1A, v1B, v2A, v2B, mAmts, u250, unit, minA, maxA,
      item, bAcc, oAcc, log, cRef, setIsProc
    });
  };

  return (
    <div className="min-h-screen text-slate-300 p-6 flex justify-center relative z-10">
      <div className="max-w-xl w-full space-y-5">
        <header className="flex items-center gap-4 border-b border-slate-800 pb-3">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg"><h1 className="text-xl font-black text-white">건별산출 <span className="text-emerald-400">v4.7 Web</span></h1></div>
        </header>

        <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          {/* 파일 선택 */}
          <div className="flex items-center gap-3">
            <label className={`bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shrink-0 ${isProc?'opacity-50 cursor-not-allowed':'cursor-pointer'}`}>
              엑셀 선택 <input type="file" accept=".xlsx, .xls" className="hidden" disabled={isProc} onChange={e=>setFile(e.target.files[0])} />
            </label>
            <span className="text-sm font-medium text-emerald-400 truncate">{file ? file.name : "파일 없음"}</span>
          </div>

          {/* 과세 면세 */}
          <div className="flex gap-6 border-y border-slate-800/60 py-3 justify-center">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="radio" disabled={isProc} checked={isTax} onChange={()=>handleTaxChange(true)} className="h-4 w-4 accent-red-500" /><span className={isTax?"text-red-400":"text-slate-500"}>과세 매출</span></label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="radio" disabled={isProc} checked={!isTax} onChange={()=>handleTaxChange(false)} className="h-4 w-4 accent-blue-500" /><span className={!isTax?"text-blue-400":"text-slate-500"}>면세 매출</span></label>
          </div>

          <div className="space-y-3">
            <div className="flex border-b border-slate-800">
              <button disabled={isProc} onClick={()=>setTab("term")} className={`flex-1 py-2 text-sm font-bold ${tab==="term"?"border-b-2 border-emerald-500 text-white":"text-slate-500"}`}>기수별</button>
              <button disabled={isProc} onClick={()=>setTab("month")} className={`flex-1 py-2 text-sm font-bold ${tab==="month"?"border-b-2 border-emerald-500 text-white":"text-slate-500"}`}>월별</button>
            </div>
            
            {tab==="term" && (
              <div className="space-y-3">
                <div className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex justify-between items-center"><span className="font-bold text-slate-200">■ 1기</span>
                    <div className="flex gap-2">
                      <button disabled={isProc} onClick={()=>{setG1P(!g1P); setG1A(false);}} className={`px-2 py-1 text-xs font-bold rounded-lg ${g1P?'bg-emerald-500 text-slate-950':'bg-slate-800 text-slate-400'}`}>예정/확정</button>
                      <button disabled={isProc} onClick={()=>{setG1A(!g1A); setG1P(false);}} className={`px-2 py-1 text-xs font-bold rounded-lg ${g1A?'bg-emerald-500 text-slate-950':'bg-slate-800 text-slate-400'}`}>일괄</button>
                    </div>
                  </div>
                  {g1P && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-400 text-right">예정:</span><input disabled={isProc} placeholder="0" value={v1A} onChange={e=>setV1A(fmt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-white text-xs flex-1 outline-none focus:border-emerald-500"/></div>
                      <div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-400 text-right">확정:</span><input disabled={isProc} placeholder="0" value={v1B} onChange={e=>setV1B(fmt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-white text-xs flex-1 outline-none focus:border-emerald-500"/></div>
                    </div>
                  )}
                  {g1A && <div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-400 text-right">일괄:</span><input disabled={isProc} placeholder="0" value={v1A} onChange={e=>setV1A(fmt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-white text-xs flex-1 outline-none focus:border-emerald-500"/></div>}
                </div>

                <div className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex justify-between items-center"><span className="font-bold text-slate-200">■ 2기</span>
                    <div className="flex gap-2">
                      <button disabled={isProc} onClick={()=>{setG2P(!g2P); setG2A(false);}} className={`px-2 py-1 text-xs font-bold rounded-lg ${g2P?'bg-emerald-500 text-slate-950':'bg-slate-800 text-slate-400'}`}>예정/확정</button>
                      <button disabled={isProc} onClick={()=>{setG2A(!g2A); setG2P(false);}} className={`px-2 py-1 text-xs font-bold rounded-lg ${g2A?'bg-emerald-500 text-slate-950':'bg-slate-800 text-slate-400'}`}>일괄</button>
                    </div>
                  </div>
                  {g2P && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-400 text-right">예정:</span><input disabled={isProc} placeholder="0" value={v2A} onChange={e=>setV2A(fmt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-white text-xs flex-1 outline-none focus:border-emerald-500"/></div>
                      <div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-400 text-right">확정:</span><input disabled={isProc} placeholder="0" value={v2B} onChange={e=>setV2B(fmt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-white text-xs flex-1 outline-none focus:border-emerald-500"/></div>
                    </div>
                  )}
                  {g2A && <div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-400 text-right">일괄:</span><input disabled={isProc} placeholder="0" value={v2A} onChange={e=>setV2A(fmt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-white text-xs flex-1 outline-none focus:border-emerald-500"/></div>}
                </div>
              </div>
            )}

            {tab==="month" && (
              <div className="space-y-2">
                {!isTax && <div className="bg-blue-900/20 p-2 rounded-lg"><label className="text-xs font-bold text-blue-300 flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={u250} onChange={e=>setU250(e.target.checked)} disabled={isProc} className="accent-blue-500"/>✨ [면세] 1000원 시작 + 250원 랜덤 + 자투리</label></div>}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/20 p-3 rounded-xl border border-slate-800/60 max-h-[220px] overflow-y-auto scrollbar">
                  {mAmts.map((a, i) => <div key={i} className="flex items-center gap-2 text-xs"><span className="w-8 text-right font-bold">{i+1}월</span><input disabled={isProc} placeholder="0" value={a} onChange={e=>handleMonthAmtChange(i, e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white outline-none focus:border-emerald-500"/></div>)}
                </div>
              </div>
            )}
          </div>

          {/* 설정 패널 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs">
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1"><span className="text-slate-400">단위:</span><select disabled={isProc||(tab==='month'&&!isTax&&u250)} value={unit} onChange={e=>setUnit(parseInt(e.target.value))} className="bg-slate-900 border border-slate-700 rounded p-1 text-white outline-none"><option value={10}>10</option><option value={100}>100</option><option value={1000}>1,000</option><option value={10000}>10,000</option></select></div>
              <div className="flex flex-col gap-1"><span className="text-slate-400">최소금액:</span><input disabled={isProc||(tab==='month'&&!isTax&&u250)} placeholder="예: 1000" value={minA} onChange={e=>setMinA(fmt(e.target.value))} className="bg-slate-900 border border-slate-700 rounded p-1 text-center text-white outline-none"/></div>
              <div className="flex flex-col gap-1"><span className="text-slate-400">최대금액:</span><input disabled={isProc||(tab==='month'&&!isTax&&u250)} placeholder="예: 350000" value={maxA} onChange={e=>setMaxA(fmt(e.target.value))} className="bg-slate-900 border border-slate-700 rounded p-1 text-center text-white outline-none"/></div>
              <div className="flex flex-col gap-1"><span className="text-slate-400">품명:</span><input disabled={isProc} value={item} onChange={e=>setItem(e.target.value)} className="bg-slate-900 border border-slate-700 rounded p-1 text-center text-white outline-none"/></div>
            </div>
            <div className="flex items-center gap-2"><span className="text-slate-400 shrink-0">계정:</span><input disabled={isProc} value={bAcc} onChange={e=>setBAcc(e.target.value.replace(/[^0-9]/g,''))} className="w-12 text-center bg-slate-900 border border-slate-700 rounded p-1 text-white"/><span className="text-slate-600">/</span><input disabled={isProc} value={oAcc} onChange={e=>setOAcc(e.target.value.replace(/[^0-9]/g,''))} className="w-12 text-center bg-slate-900 border border-slate-700 rounded p-1 text-white"/><span className="text-slate-400 ml-2">유형:</span><input disabled={isProc} value={taxCode} onChange={e=>setTaxCode(e.target.value.replace(/[^0-9]/g,''))} className="w-10 text-center bg-slate-900 border border-slate-700 rounded p-1 text-white"/></div>
          </div>

          <div className="flex gap-2">
            {!isProc ? <button onClick={runProc} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-black shadow-lg">실 행 🚀</button> : <button onClick={cancelProcess} className="w-full bg-rose-500 hover:bg-rose-400 text-white py-3 rounded-xl font-black shadow-lg animate-pulse">중단 🛑</button>}
          </div>

          {logs.length > 0 && (
            <div className="bg-[#0b1220] border border-slate-700 rounded-xl p-3 h-40 flex flex-col shadow-inner">
              <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1"><span className="text-[10px] font-bold text-slate-500">System Logs</span><button onClick={downloadLogs} className="text-cyan-400 text-[10px] font-bold">💾 다운로드</button></div>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar text-[10px] pr-1">
                {logs.map((l, i) => <p key={i} className={l.includes('❌')||l.includes('🛑')||l.includes('⚠️')?'text-rose-400':l.includes('✅')||l.includes('🎉')||l.includes('✨')||l.includes('🔥')?'text-emerald-400':'text-slate-400'}>{l}</p>)}<div ref={lRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);