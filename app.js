const { useState, useEffect, useRef } = React;
const TOTAL_CATS = 14;
const LS_KEY = 'meowpop_liked';

function fetchCatUrl() {
  const width = window.innerWidth > 600 ? 800 : 400; // smaller width for mobile
  const height = window.innerWidth > 600 ? 1000 : 500; // smaller height for mobile
  return `https://cataas.com/cat?width=${width}&height=${height}&random=${Date.now()}-${Math.random()}`;
}

function App() {
  const [images, setImages] = useState([]); // preloaded images stack
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState(() => {
    localStorage.removeItem(LS_KEY); // clear previous likes
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(null);
  const [animType, setAnimType] = useState(null);
  
  useEffect(() => {
    const firstUrl = fetchCatUrl();
    const img = new Image();
    img.src = firstUrl;
    img.onload = img.onerror = () => {
      setImages([firstUrl]);
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(liked));
  }, [liked]);

  useEffect(() => {
    const onKey = (e) => {
      if (loading) return;
      if (e.key === 'ArrowRight') choose('like');
      if (e.key === 'ArrowLeft') choose('dislike');
      if (e.key.toLowerCase() === 'r') resetAll();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, idx, images, liked]);

  function choose(direction) {
    const u = images[idx];
    if (!u) return;

    if (direction === 'like') {
      setLiked(prev => [...prev, u]);
      setShowToast('Added to purr-faves!');
      setAnimType('like');
    } else {
      setShowToast('Maybe next meow 💭');
      setAnimType('dislike');
    }

    const nextIdx = idx + 1;
    if (nextIdx < TOTAL_CATS) {
      const nextUrl = fetchCatUrl();
      const img = new Image();
      img.src = nextUrl;
      img.onload = () => {
        setImages(prev => [...prev, nextUrl]);
        setIdx(nextIdx); // advance only when loaded
      };
      img.onerror = () => {
        setImages(prev => [...prev, nextUrl]);
        setIdx(nextIdx); // still advance even if fail
      };
    } else {
      setIdx(nextIdx); // done
    }

    setTimeout(() => { setShowToast(null); setAnimType(null); }, 900);
  }

    // // Load next card dynamically
    // const nextIdx = idx + 1;
    // if (nextIdx < TOTAL_CATS) {
    //   const nextUrl = fetchCatUrl();
    //   const img = new Image();
    //   img.src = nextUrl;
    //   img.onload = () => setImages(prev => [...prev, nextUrl]);
    //   img.onerror = () => setImages(prev => [...prev, nextUrl]);
    // }

  function resetAll() {
    setIdx(0);
    setLiked([]);
    setImages([]);
    setShowToast('Reset — swipe again!');
    setTimeout(() => setShowToast(null), 900);

    // Preload all images
    const urls = Array.from({ length: TOTAL_CATS }, () => fetchCatUrl());
    let loadedCount = 0;
    const loadedImages = [];

    urls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loadedImages[i] = url;
        loadedCount++;
        if (loadedCount === TOTAL_CATS) {
          setImages(loadedImages);
          setLoading(false);
        }
      };
    });
  }


  if (loading) return (
    React.createElement('div',{className:'bg-white/80 rounded-3xl shadow-xl p-8 text-center'},
      React.createElement('div',{className:'text-2xl font-bold mb-2'}, 'MeowPop'),
      React.createElement('p',{className:'text-slate-600'}, 'Fetching your dose of fluff…'),
      React.createElement('div',{className:'mt-6 flex justify-center gap-2'},
        React.createElement('div',{className:'h-3 w-20 rounded-full bg-pink-200 animate-pulse'}),
        React.createElement('div',{className:'h-3 w-20 rounded-full bg-yellow-200 animate-pulse'})
      )
    )
  );

  // Summary
  if (idx >= TOTAL_CATS) {
    return React.createElement('div',{className:'bg-white rounded-3xl shadow-xl p-4 text-center'},
      React.createElement('h2',{className:'text-xl font-bold mb-2'}, 'All done! 😸'),
      React.createElement('p',{className:'mb-4'}, `You liked ${liked.length} ${liked.length === 1 ? 'cat' : 'cats'}!`),
      liked.length > 0 && React.createElement('div',{className:'grid grid-cols-2 gap-2'},
        liked.map((u,i)=>React.createElement('img',{key:i, src:u, className:'w-full h-32 object-cover rounded-lg'}))
      ),
      React.createElement('button',{className:'mt-4 px-4 py-2 bg-pink-500 text-white rounded', onClick:resetAll}, 'Swipe Again')
    );
  }

  // Main swipe interface
  return React.createElement('div',{className:'bg-white rounded-3xl shadow-xl p-4 border relative'},
    // Header
    React.createElement('div',{className:'flex items-center justify-between mb-3'},
      React.createElement('div',{className:'flex items-center gap-3'},
        React.createElement('div',{className:'rounded-full bg-gradient-to-br from-pink-300 to-yellow-200 w-10 h-10 flex items-center justify-center text-xl'},'🐱'),
        React.createElement('div',null,
          React.createElement('div',{className:'font-bold text-lg'},'MeowPop'),
          React.createElement('div',{className:'text-xs text-slate-400'},`Cat ${idx+1} / ${TOTAL_CATS}`)
        )
      )
    ),

    // Card stack
    React.createElement('div',{className:'relative h-[62vh] flex items-center justify-center'},
      images[idx] 
        ? React.createElement(SwipeCard,{img:images[idx],onChoice:choose})
        : React.createElement('div',{className:'w-full h-full bg-gray-200 rounded-2xl animate-pulse'})
    ),

    // Action buttons
    React.createElement('div',{className:'mt-4 flex items-center justify-between'},
      React.createElement('div',{className:'flex items-center gap-3'},
        React.createElement('button',{onClick:()=>choose('dislike'),className:'w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-2xl'},'😿'),
        React.createElement('button',{onClick:()=>choose('like'),className:'w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 text-white shadow-lg flex items-center justify-center text-2xl'},'😻')
      ),
      React.createElement('div',{className:'text-sm text-slate-400'},'Tip: use ← / → keys or tap emojis')
    ),

    showToast && React.createElement('div',{className:'pointer-events-none fixed bottom-8 left-0 right-0 flex justify-center'},
      React.createElement('div',{className:'bg-white/90 px-4 py-2 rounded-full shadow'}, showToast)
    ),

    // Like&dislike animations
    animType==='like' && React.createElement('div',{className:'heart-anim'},'😻'),
    animType==='dislike' && React.createElement('div',{className:'sad-anim'},'😿')
  );
}

function SwipeCard({img,onChoice}){
  const ref=useRef(null), start=useRef({x:0,y:0}), pos=useRef({x:0,y:0}), anim=useRef(null);
  const [style,setStyle] = useState({transform:'translateY(0px) scale(1)',transition:'transform 220ms cubic-bezier(.2,.8,.2,1)'});
  const [badges,setBadges] = useState({like:false,dislike:false});
  const [zoomed,setZoomed] = useState(false);

  function getPoint(e){ return e.touches ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : {x:e.clientX, y:e.clientY} }

  function down(e){ 
    e.preventDefault(); 
    const p = getPoint(e); 
    start.current={x:p.x,y:p.y}; pos.current={x:0,y:0}; 
    setStyle(s=>({...s,transition:''})); 
    window.addEventListener('pointermove',move); 
    window.addEventListener('pointerup',up);
  }

  function move(e){ 
    const p = getPoint(e); 
    const dx = p.x-start.current.x, dy = p.y-start.current.y; 
    pos.current={x:dx,y:dy}; 
    const rot = dx/18; 
    setStyle({transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`,transition:''}); 
    setBadges({like:dx>60,dislike:dx<-60})
  }

  function up(){ 
    window.removeEventListener('pointermove',move); 
    window.removeEventListener('pointerup',up); 
    const dx = pos.current.x, thr = 120; 
    const w = window.innerWidth;
    if(dx>thr){ setStyle({transform:`translate(${w+300}px,${pos.current.y}px) rotate(30deg)`,transition:'transform 400ms ease'}); anim.current=setTimeout(()=>onChoice('like'),420) }
    else if(dx<-thr){ setStyle({transform:`translate(-${w+300}px,${pos.current.y}px) rotate(-30deg)`,transition:'transform 400ms ease'}); anim.current=setTimeout(()=>onChoice('dislike'),420) }
    else { setStyle({transform:'translateY(0px) scale(1)',transition:'transform 300ms cubic-bezier(.2,.8,.2,1)'}); setBadges({like:false,dislike:false}) }
  }

  useEffect(()=>{ 
    const el = ref.current; 
    el && el.addEventListener('pointerdown',down,{passive:false}); 
    return ()=>{ el && el.removeEventListener('pointerdown',down); if(anim.current) clearTimeout(anim.current) } 
  },[]);

  function toggleZoom(){
    if(zoomed){
      setStyle(s=>({...s,transform:'translateY(0px) scale(1)',transition:'transform 300ms ease'}));
    } else {
      setStyle(s=>({...s,transform:'translateY(-10%) scale(1.6)',transition:'transform 300ms ease'}));
    }
    setZoomed(!zoomed);
  }

  return React.createElement('div',{
    ref:ref,
    className:'card bg-white rounded-2xl overflow-hidden shadow-lg w-full h-full no-select',
    style:{transform:style.transform,transition:style.transition},
    onDoubleClick: toggleZoom
  },
    React.createElement('div',{className:'relative flex-1 bg-gradient-to-b from-pink-50 to-yellow-50'},
      React.createElement('img',{src:img,alt:'cute cat',className:'w-full h-full object-cover',draggable:false}),
      React.createElement('div',{className:'pointer-events-none absolute inset-0 p-4 flex items-start justify-between'},
        React.createElement('div',{className:`text-3xl font-extrabold drop-shadow-lg text-white ${badges.like?'badge-show':'badge-like'}`, style:{textShadow:'0 6px 18px rgba(255,107,203,0.25)',color:'var(--accent)'}},'😻'),
        React.createElement('div',{className:`text-3xl font-extrabold drop-shadow-lg text-white ${badges.dislike?'badge-show':'badge-like'}`, style:{textShadow:'0 6px 18px rgba(0,0,0,0.18)',color:'rgba(99,102,241,0.9)'}},'😿')
      )
    ),
    React.createElement('div',{className:'p-3 border-t text-sm text-slate-600'}, zoomed ? 'Tap again to zoom out' : 'Double tap to zoom')
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
