import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
import { fetchCatUrls, CAT_COUNT, LS_KEY } from './utils.js';
import { CardStack } from './swipe.js';

function App(){
  const [images,setImages] = useState([]);
  const [idx,setIdx] = useState(0);
  const [liked,setLiked] = useState(()=>JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  const [loading,setLoading] = useState(true);
  const [showToast,setShowToast] = useState(null);

  useEffect(()=>{
    const urls = fetchCatUrls(CAT_COUNT);
    let loaded=0, arr=[];
    urls.forEach((u,i)=>{
      const img = new Image(); img.src=u;
      img.onload = ()=>{ loaded++; arr[i]=u; if(loaded===urls.length){ setImages(arr); setLoading(false); } }
      img.onerror = ()=>{ loaded++; arr[i]=u; if(loaded===urls.length){ setImages(arr); setLoading(false); } }
    })
  },[]);

  useEffect(()=>{ localStorage.setItem(LS_KEY, JSON.stringify(liked)) },[liked]);

  useEffect(()=>{
    const onKey = (e)=>{
      if(loading) return;
      if(e.key==='ArrowRight') choose('like');
      if(e.key==='ArrowLeft') choose('dislike');
      if(e.key.toLowerCase()==='r') resetAll();
    }
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[loading,idx,images,liked]);

  function choose(direction){
    const u = images[idx]; if(!u) return;
    if(direction==='like'){ setLiked(prev=>[...prev,u]); setShowToast('Added to purr-faves!'); }
    else setShowToast('Maybe next meow 💭');
    setIdx(i=>i+1);
    setTimeout(()=>setShowToast(null),900);
  }

  function resetAll(){ setIdx(0); setLiked([]); setShowToast('Reset — swipe again!'); setTimeout(()=>setShowToast(null),900); }

  if(loading) return (
    <div className="bg-white/80 rounded-3xl shadow-xl p-8 text-center">
      <div className="text-2xl font-bold mb-2">MeowPop</div>
      <p className="text-slate-600">Fetching your dose of fluff…</p>
      <div className="mt-6 flex justify-center gap-2">
        <div className="h-3 w-20 rounded-full bg-pink-200 animate-pulse"></div>
        <div className="h-3 w-20 rounded-full bg-yellow-200 animate-pulse"></div>
      </div>
    </div>
  );

  if(idx>=images.length) return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">You're all caught up 🎉</h2>
        <small className="text-slate-400">{liked.length}/{images.length} saved</small>
      </div>
      {liked.length>0 ? (
        <div className="grid grid-cols-2 gap-3">
          {liked.map((u,i)=><img key={i} src={u} alt={`liked ${i}`} className="w-full h-36 object-cover rounded-lg"/>)}
        </div>
      ) : (<p className="text-slate-500">No purr-faves yet. Try again?</p>)}
      <div className="mt-5 flex gap-3 justify-center">
        <button className="px-4 py-2 rounded-full border" onClick={resetAll}>Try again</button>
        <button className="px-4 py-2 rounded-full bg-accent text-white" onClick={()=>{localStorage.removeItem(LS_KEY); window.location.reload()}}>Clear & Refresh</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-pink-300 to-yellow-200 w-10 h-10 flex items-center justify-center text-xl">🐱</div>
          <div>
            <div className="font-bold text-lg">MeowPop</div>
            <div className="text-xs text-slate-400">Swipe to discover your purr-fect match</div>
          </div>
        </div>
        <div className="text-sm text-slate-400">{idx}/{images.length}</div>
      </div>

      <div className="relative h-[62vh] flex items-center justify-center">
        <CardStack images={images} startIndex={idx} onChoice={choose}/>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>choose('dislike')} className="w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-2xl">😿</button>
          <button onClick={()=>choose('like')} className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 text-white shadow-lg flex items-center justify-center text-2xl">😻</button>
        </div>
        <div className="text-sm text-slate-400">Tip: use ← / → keys or tap emojis</div>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed bottom-8 left-0 right-0 flex justify-center">
        <div className={`bg-white/90 px-4 py-2 rounded-full shadow transition-opacity ${showToast ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-sm">{showToast||''}</div>
        </div>
      </div>

    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
