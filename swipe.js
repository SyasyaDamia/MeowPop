import React, { useRef, useEffect, useState } from 'https://esm.sh/react@18.2.0';

export function CardStack({images, startIndex=0, onChoice}){
  const at = startIndex;
  return (
    <div className="w-full max-w-md relative" style={{height:'100%'}}>
      <div className="card-stack w-full h-full">
        {images.slice(at).slice(0,6).reverse().map((u,i)=>{
          const stackIndex = i;
          const isTop = i === images.slice(at).slice(0,6).length -1;
          return <SwipeCard key={u} img={u} offset={stackIndex} isTop={isTop} onChoice={onChoice} />
        })}
      </div>
    </div>
  )
}

export function SwipeCard({img, offset=0, isTop=false, onChoice}){
  const ref = useRef(null);
  const start = useRef({x:0,y:0});
  const pos = useRef({x:0,y:0});
  const anim = useRef(null);
  const [style,setStyle] = useState({transform:'translateY(0px) scale(1)', transition:'transform 220ms cubic-bezier(.2,.8,.2,1)'});
  const [badges,setBadges] = useState({like:false,dislike:false});

  useEffect(()=>{
    const base = Math.min(offset,4);
    const scale = 1 - base*0.03;
    const ty = base*8;
    setStyle({transform:`translateY(${ty}px) scale(${scale})`, transition:'transform 220ms cubic-bezier(.2,.8,.2,1)'});
  },[offset]);

  function getPoint(e){
    if(e.touches && e.touches[0]) return {x:e.touches[0].clientX, y:e.touches[0].clientY};
    return {x:e.clientX, y:e.clientY};
  }

  function down(e){
    e.preventDefault();
    const p = getPoint(e);
    start.current={x:p.x,y:p.y};
    pos.current={x:0,y:0};
    setStyle(s=>({...s,transition:''}));
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
  }

  function move(e){
    const p = getPoint(e);
    const dx = p.x - start.current.x;
    const dy = p.y - start.current.y;
    pos.current={x:dx, y:dy};
    const rot = dx/18;
    setStyle({transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`, transition:''});
    if(dx > 60) setBadges({like:true,dislike:false});
    else if(dx < -60) setBadges({like:false,dislike:true});
    else setBadges({like:false,dislike:false});
  }

  function up(){
    window.removeEventListener('pointermove',move);
    window.removeEventListener('pointerup',up);
    const dx = pos.current.x, thr=120;
    if(dx>thr){
      const w = window.innerWidth;
      setStyle({transform:`translate(${w+300}px,${pos.current.y}px) rotate(30deg)`, transition:'transform 300ms ease'});
      anim.current = setTimeout(()=>onChoice('like'),320);
    } else if(dx<-thr){
      const w = window.innerWidth;
      setStyle({transform:`translate(-${w+300}px,${pos.current.y}px) rotate(-30deg)`, transition:'transform 300ms ease'});
      anim.current = setTimeout(()=>onChoice('dislike'),320);
    } else {
      setStyle({transform:'translateY(0px) scale(1)',transition:'transform 220ms cubic-bezier(.2,.8,.2,1)'});
      setBadges({like:false,dislike:false});
    }
  }

  useEffect(()=>{
    const el = ref.current;
    el && el.addEventListener('pointerdown',down,{passive:false});
    return ()=>{ el && el.removeEventListener('pointerdown',down); if(anim.current) clearTimeout(anim.current);}
  },[]);

  return (
    <div ref={ref} className="card bg-white rounded-2xl overflow-hidden shadow-lg w-full h-full no-select"
      style={{transform:style.transform,transition:style.transition,zIndex:1000-offset}}>
      <div className="relative flex-1 bg-gradient-to-b from-pink-50 to-yellow-50">
        <img src={img} alt="cute cat" className="w-full h-full object-cover" draggable={false}/>
        <div className="pointer-events-none absolute inset-0 p-4 flex items-start justify-between">
          <div className={`text-3xl font-extrabold drop-shadow-lg text-white ${badges.like?'badge-show':'badge-like'}`} style={{textShadow:'0 6px 18px rgba(255,107,203,0.25)',color:'var(--accent)'}}>😻</div>
          <div className={`text-3xl font-extrabold drop-shadow-lg text-white ${badges.dislike?'badge-show':'badge-like'}`} style={{textShadow:'0 6px 18px rgba(0,0,0,0.18)',color:'rgba(99,102,241,0.9)'}}>😿</div>
        </div>
      </div>
      <div className="p-3 border-t text-sm text-slate-600">Tap an emoji or swipe — double-tap to zoom</div>
    </div>
  )
}
