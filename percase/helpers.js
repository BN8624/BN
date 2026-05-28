// 1. 랜덤 숫자 생성기
window.randGen = (seed) => {
  let h = 0; 
  for(let i=0; i<seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return () => { h = Math.imul(h, 1664525) + 1013904223 | 0; return (h >>> 0) / 4294967296; };
};

// 2. 날짜 변환기
window.parseDate = (val) => {
  if(!val) return null; 
  if(val instanceof Date) return val;
  if(typeof val === 'number') return new Date((val - 25569) * 86400000);
  let s = String(val).trim().replace(/[\.\/]/g, '-');
  let d = new Date(s); if(!isNaN(d.getTime())) return d;
  if(/^\d{8}$/.test(s)) return new Date(`${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`);
  return null;
};

// 3. 시스템 휴식기
window.breathe = () => new Promise(r => setTimeout(r, 5));

// 4. 숫자 콤마 찍기
window.fmt = (v) => { 
  if (!v) return ""; 
  const c = String(v).replace(/[^0-9]/g, ''); 
  if (c === "") return "";
  return Number(c).toLocaleString(); 
};

// 5. 콤마 빼고 숫자로 만들기
window.getNum = (v) => parseInt(String(v).replace(/,/g, '')) || 0;