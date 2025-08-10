'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Menu, Star, Filter, Search, Shirt, X, Eye } from 'lucide-react';

type Product = {
  id: string; name: string; price: number; oldPrice?: number; rating: number; reviews: number;
  sizes: string[]; colors: string[]; category: string; image: string; tags?: string[];
};
type CartItem = { id: string; name: string; price: number; image: string; size: string; qty: number; };

const FREE_SHIPPING_THRESHOLD = 20000; // 200 zł

/* ---------- ŁADNIEJSZE „ZDJĘCIA” SUKIENEK (SVG) – bez plików zewnętrznych ---------- */
/* Szablony sylwetek: 'satin' | 'wrap' | 'linen' | 'pencil' | 'tulle' | 'silk' | 'pleated' | 'knit' | 'fitflare' | 'lace' */
function dressSVG(
  style: 'satin'|'wrap'|'linen'|'pencil'|'tulle'|'silk'|'pleated'|'knit'|'fitflare'|'lace',
  label: string,
  body = '#f4a3c4',
  accent = '#be185d',
  bg = '#ffffff'
) {
  // elementy wspólne: gradienty, cień, delikatna faktura tkaniny
  const defs = `
    <defs>
      <linearGradient id='gBody' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='${body}' stop-opacity='.98'/>
        <stop offset='1' stop-color='${body}' stop-opacity='.78'/>
      </linearGradient>
      <linearGradient id='gAcc' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${accent}' stop-opacity='.95'/>
        <stop offset='1' stop-color='${accent}' stop-opacity='.65'/>
      </linearGradient>
      <filter id='drop' x='-40%' y='-40%' width='180%' height='180%'>
        <feDropShadow dx='0' dy='10' stdDeviation='14' flood-color='#000' flood-opacity='.18'/>
      </filter>
      <!-- subtelna tekstura materiału -->
      <filter id='tex' x='-10%' y='-10%' width='120%' height='120%'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' result='n'/>
        <feColorMatrix type='saturate' values='0.25'/>
        <feComponentTransfer>
          <feFuncA type='table' tableValues='0 0 .05 0'/>
        </feComponentTransfer>
        <feBlend in='SourceGraphic' in2='n' mode='overlay'/>
      </filter>
      <!-- koronka (kropki) -->
      <pattern id='lace' patternUnits='userSpaceOnUse' width='14' height='14'>
        <circle cx='4' cy='4' r='1.2' fill='#fff' opacity='.5'/>
        <circle cx='10' cy='10' r='1.2' fill='#fff' opacity='.5'/>
      </pattern>
      <!-- dzianina (prążki) -->
      <pattern id='knit' patternUnits='userSpaceOnUse' width='8' height='8' patternTransform='skewX(-15)'>
        <rect width='8' height='8' fill='${body}'/>
        <rect x='0' y='0' width='2' height='8' fill='#000' opacity='.06'/>
      </pattern>
    </defs>
  `;

  // gorset + spódnica zależnie od stylu
  let top = '';
  let skirt = '';
  let overlays = '';
  if (style === 'satin' || style === 'silk') {
    top = `
      <path d='M400 150c-36 0-62 26-70 58l-18 60h176l-18-60c-8-32-34-58-70-58z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M320 268 C300 320 282 390 264 530 L536 530 C518 390 500 320 480 268 Z'
            fill='url(#gBody)' filter='url(#tex)'/>
    `;
    overlays = `
      <!-- połysk -->
      <path d='M360 280 C340 340 332 420 328 520' stroke='#fff' stroke-opacity='.35' stroke-width='8'/>
      <path d='M452 280 C468 340 474 420 476 520' stroke='#000' stroke-opacity='.10' stroke-width='8'/>
      <rect x='300' y='260' width='200' height='18' rx='9' fill='url(#gAcc)'/>
    `;
  }
  if (style === 'wrap') {
    top = `
      <path d='M400 150c-38 0-70 30-72 66l172 0c-2-36-34-66-72-66z' fill='url(#gBody)'/>
      <!-- V-neck -->
      <path d="M328 216 L400 280 L472 216 Z" fill='${bg}' opacity='.35'/>
    `;
    skirt = `
      <path d='M312 266 L488 266 L520 530 L280 530 Z'
            fill='url(#gBody)' filter='url(#tex)'/>
    `;
    overlays = `
      <path d='M320 265 L480 265 L440 530 L360 530 Z' fill='url(#gAcc)' opacity='.18'/>
      <rect x='300' y='258' width='200' height='20' rx='10' fill='url(#gAcc)'/>
    `;
  }
  if (style === 'linen') {
    top = `
      <path d='M400 152c-34 0-60 22-66 50l-10 34h152l-10-34c-6-28-32-50-66-50z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M320 236 C300 300 294 360 290 420 L290 530 L510 530 L510 420
               C506 360 500 300 480 236 Z' fill='url(#gBody)' filter='url(#tex)'/>
    `;
    overlays = `<rect x='300' y='234' width='200' height='16' rx='8' fill='url(#gAcc)' opacity='.7'/>`;
  }
  if (style === 'pencil') {
    top = `
      <path d='M400 150c-30 0-52 18-58 42l-8 28h132l-8-28c-6-24-28-42-58-42z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M316 220 L484 220 L484 530 L316 530 Z' fill='url(#gBody)'/>
    `;
    overlays = `
      <path d='M400 220 L400 530' stroke='#000' stroke-opacity='.10' stroke-width='6'/>
      <rect x='300' y='216' width='200' height='16' rx='8' fill='url(#gAcc)'/>
    `;
  }
  if (style === 'tulle') {
    top = `
      <path d='M400 148c-30 0-50 20-56 40l-10 30h132l-10-30c-6-20-26-40-56-40z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M320 230 C298 320 292 380 280 530 L520 530 C508 380 502 320 480 230 Z'
            fill='url(#gBody)'/>
    `;
    overlays = `
      <!-- warstwa tiulu -->
      <path d='M306 250 C280 330 270 430 262 530 L538 530 C530 430 520 330 494 250 Z'
            fill='${accent}' opacity='.18'/>
      <rect x='300' y='228' width='200' height='18' rx='9' fill='url(#gAcc)'/>
    `;
  }
  if (style === 'pleated') {
    top = `
      <path d='M400 150c-36 0-62 26-70 58l-14 48h168l-14-48c-8-32-34-58-70-58z'
            fill='url(#gBody)'/>
    `;
    let stripes = '';
    for (let x = 320; x <= 480; x += 16) {
      stripes += `<path d='M${x} 258 L ${x + (x<400? -16:16)} 530' stroke='#000' stroke-opacity='.12' stroke-width='6'/>`;
    }
    skirt = `
      <path d='M320 258 C300 310 282 380 264 530 L536 530 C518 380 500 310 480 258 Z'
            fill='url(#gBody)'/>
    `;
    overlays = `<rect x='300' y='256' width='200' height='18' rx='9' fill='url(#gAcc)'/>${stripes}`;
  }
  if (style === 'knit') {
    top = `
      <path d='M400 154c-34 0-60 22-64 48l-8 26h144l-8-26c-4-26-30-48-64-48z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M320 228 C304 280 300 350 298 530 L502 530 C500 350 496 280 480 228 Z'
            fill='url(#gBody)'/>
    `;
    overlays = `
      <rect x='300' y='226' width='200' height='16' rx='8' fill='url(#gAcc)'/>
      <path d='M320 228 C304 280 300 350 298 530 L502 530 C500 350 496 280 480 228 Z'
            fill='url(#knit)' opacity='.28'/>
    `;
  }
  if (style === 'fitflare') {
    top = `
      <path d='M400 150c-28 0-48 14-56 36l-8 26h128l-8-26c-8-22-28-36-56-36z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M308 228 C280 320 274 390 260 530 L540 530 C526 390 520 320 492 228 Z'
            fill='url(#gBody)' filter='url(#tex)'/>
    `;
    overlays = `<rect x='300' y='224' width='200' height='18' rx='9' fill='url(#gAcc)'/>`;
  }
  if (style === 'lace') {
    top = `
      <path d='M400 152c-36 0-62 26-70 58l-18 60h176l-18-60c-8-32-34-58-70-58z'
            fill='url(#gBody)'/>
    `;
    skirt = `
      <path d='M320 268 C300 320 284 392 270 530 L530 530 C516 392 500 320 480 268 Z'
            fill='url(#gBody)'/>
    `;
    overlays = `
      <path d='M320 268 C300 320 284 392 270 530 L530 530 C516 392 500 320 480 268 Z'
            fill='url(#lace)' opacity='.35'/>
      <rect x='300' y='260' width='200' height='18' rx='9' fill='url(#gAcc)'/>
    `;
  }

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
      ${defs}
      <rect width='800' height='600' fill='${bg}'/>
      <g filter='url(#drop)' transform='translate(0,-8)'>
        <!-- subtelny „wieszak” -->
        <path d='M360 128 Q400 94 440 128' fill='none' stroke='#d1d5db' stroke-width='10' stroke-linecap='round'/>
        <!-- sylwetka -->
        ${top}
        ${skirt}
        ${overlays}
      </g>

      <!-- plakietka z nazwą kolekcji -->
      <rect x='40' y='40' rx='12' ry='12' fill='white' stroke='#e5e7eb' width='260' height='42'/>
      <text x='58' y='68' font-family='system-ui,Segoe UI,Roboto,Helvetica,Arial' font-size='20' fill='#111827'>${label}</text>
    </svg>
  `;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function heroSVG() {
  return dressSVG('silk', 'Nowa kolekcja', '#f59e0b', '#e11d48', '#ffffff');
}

/* Bezpieczny <img/> – nic nie pobieramy, ale na wszelki wypadek fallback na „hero” */
function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [s, setS] = useState(src);
  return <img src={s} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setS(heroSVG())} />;
}

/* ---------- Produkty z przypisanym stylem sukienki ---------- */
const PRODUCTS: Product[] = [
  { id:'d1',  name:'Sukienka Mila – satynowa midi', image: dressSVG('satin','Mila – satynowa midi','#f4a3c4','#be185d'),
    price:21900, oldPrice:25900, rating:4.7, reviews:128, sizes:['XS','S','M','L'], colors:['róż pudrowy','czarna','szampańska'], category:'Sukienki', tags:['nowość','bestseller'] },
  { id:'d2',  name:'Sukienka Lea – kopertowa maxi',   image: dressSVG('wrap','Lea – kopertowa maxi','#22c1d6','#2563eb'),
    price:28900, rating:4.8, reviews:203, sizes:['S','M','L','XL'], colors:['butelkowa zieleń','granat'], category:'Sukienki', tags:['wieczorowa'] },
  { id:'d3',  name:'Sukienka Nola – lniana mini',     image: dressSVG('linen','Nola – lniana mini','#cabfa6','#9dbeb2'),
    price:17900, rating:4.5, reviews:76,  sizes:['XS','S','M'], colors:['beż','biała'], category:'Sukienki', tags:['letnia','eko'] },
  { id:'d4',  name:'Sukienka Vera – ołówkowa midi',   image: dressSVG('pencil','Vera – ołówkowa midi','#ef4444','#6b7280'),
    price:24900, rating:4.6, reviews:91,  sizes:['S','M','L'], colors:['czerwona','czarna'], category:'Sukienki', tags:['do pracy'] },
  { id:'d5',  name:'Sukienka Aida – tiulowa midi',     image: dressSVG('tulle','Aida – tiulowa midi','#f472b6','#e11d48'),
    price:31900, oldPrice:34900, rating:4.9, reviews:54,  sizes:['S','M','L'], colors:['pudrowy róż'], category:'Sukienki', tags:['na wesele'] },
  { id:'d6',  name:'Sukienka Lila – jedwabna maxi',    image: dressSVG('silk','Lila – jedwabna maxi','#10b981','#065f46'),
    price:36900, rating:4.8, reviews:61,  sizes:['S','M','L'], colors:['szmaragd','czarna'], category:'Sukienki', tags:['premium'] },
  { id:'d7',  name:'Sukienka Rina – plisowana midi',   image: dressSVG('pleated','Rina – plisowana midi','#8b5cf6','#4f46e5'),
    price:23900, rating:4.6, reviews:84,  sizes:['XS','S','M','L'], colors:['granat','burgund'], category:'Sukienki', tags:['do biura'] },
  { id:'d8',  name:'Sukienka Ola – dzianinowa mini',  image: dressSVG('knit','Ola – dzianinowa mini','#d1d5db','#6b7280'),
    price:16900, rating:4.4, reviews:43,  sizes:['S','M','L'], colors:['krem','czarna'], category:'Sukienki' },
  { id:'d9',  name:'Sukienka Emi – rozkloszowana',    image: dressSVG('fitflare','Emi – rozkloszowana','#f59e0b','#ea580c'),
    price:20900, rating:4.5, reviews:71,  sizes:['XS','S','M','L'], colors:['pudrowy róż','mięta'], category:'Sukienki' },
  { id:'d10', name:'Sukienka Kaja – koronkowa',       image: dressSVG('lace','Kaja – koronkowa','#111827','#e11d48'),
    price:27900, oldPrice:29900, rating:4.7, reviews:95,  sizes:['S','M','L'], colors:['ecru','czarna'], category:'Sukienki' },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents / 100);

/* ---------- Strona ---------- */
export default function Page() {
  // Filtry / widok
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular'|'priceAsc'|'priceDesc'>('popular');
  const [sizeFilter, setSizeFilter] = useState<string|''>('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Pasek promo z odliczaniem (do końca dnia)
  const [remaining, setRemaining] = useState<string>('00:00:00');
  useEffect(() => {
    const update = () => {
      const now = new Date(); const end = new Date(); end.setHours(23,59,59,999);
      const ms = Math.max(0, +end - +now);
      const h = String(Math.floor(ms/3_600_000)).padStart(2,'0');
      const m = String(Math.floor(ms%3_600_000/60_000)).padStart(2,'0');
      const s = String(Math.floor(ms%60_000/1000)).padStart(2,'0');
      setRemaining(`${h}:${m}:${s}`);
    };
    update(); const t = setInterval(update, 1000); return ()=>clearInterval(t);
  }, []);

  // Produkty + infinite scroll
  const [visible, setVisible] = useState(6);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (sizeFilter) list = list.filter(p => p.sizes.includes(sizeFilter));
    if (sort === 'priceAsc') list = [...list].sort((a,b)=>a.price-b.price);
    if (sort === 'priceDesc') list = [...list].sort((a,b)=>b.price-a.price);
    return list;
  }, [query, sort, sizeFilter]);

  useEffect(() => { setVisible(Math.min(6, filtered.length)); },
    [query, sort, sizeFilter, filtered.length]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(v => Math.min(v + 6, filtered.length));
    }, { rootMargin: '200px' });
    io.observe(loadMoreRef.current);
    return () => io.disconnect();
  }, [filtered.length]);

  // Ulubione + podgląd
  const [favIds, setFavIds] = useState<string[]>([]);
  const [favsOpen, setFavsOpen] = useState(false);
  const favProducts = PRODUCTS.filter(p => favIds.includes(p.id));
  const [quick, setQuick] = useState<Product|null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  function openQuick(p: Product) { setQuick(p); setSelectedSize(p.sizes[0]); }

  // Koszyk + darmowa dostawa
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartQty = cart.reduce((s,i)=>s+i.qty, 0);
  const cartTotal = cart.reduce((s,i)=>s+i.qty*i.price, 0);
  const shippingLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const shippingPct = Math.min(100, Math.round(cartTotal / FREE_SHIPPING_THRESHOLD * 100));
  function addToCart(p: Product, size: string) {
    setCart(prev => {
      const id = p.id + '-' + size;
      const ex = prev.find(i => i.id === id);
      if (ex) return prev.map(i => i.id === id ? {...i, qty: i.qty+1} : i);
      return [...prev, { id, name: `${p.name} • ${size}`, price: p.price, image: p.image, size, qty: 1 }];
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900">
      {/* PROMO BAR */}
      <div className="bg-pink-600 text-white text-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="font-medium">-20% na sukienki do końca dnia</span>
          <span className="px-2 py-0.5 rounded bg-white/20 font-mono">{remaining}</span>
        </div>
      </div>

      {/* Top bar */}
      <div className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="btn" aria-label="menu" onClick={()=>setMenuOpen(true)}><Menu className="h-4 w-4"/></button>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Shirt className="h-6 w-6" />
            <span className="lowercase">sebastian</span>
            <span className="text-pink-600">clothes</span>
          </div>
          <div className="flex-1" />
          <button className="btn" onClick={()=>setFavsOpen(true)}><Heart className="mr-2 h-4 w-4"/> Ulubione ({favIds.length})</button>
          <button className="btn"><ShoppingCart className="mr-2 h-4 w-4"/> Koszyk ({cartQty})</button>
        </div>

        {/* Free shipping progress */}
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
            <div className="h-full bg-pink-600" style={{width: `${shippingPct}%`}} />
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {shippingLeft === 0 ? 'Masz darmową dostawę 🎉' : `Brakuje ${formatPrice(shippingLeft)} do darmowej dostawy`}
          </div>
        </div>
      </div>

      {/* Side menu */}
      {menuOpen && (
        <>
          <div className="backdrop" onClick={()=>setMenuOpen(false)} />
          <aside className="sheet z-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kategorie</h3>
              <button className="btn" onClick={()=>setMenuOpen(false)}><X className="h-4 w-4"/></button>
            </div>
            <nav className="mt-4 grid gap-2">
              <button className="btn" onClick={()=>{ setMenuOpen(false); document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); }}>Sukienki</button>
              <button className="btn" onClick={()=>alert('Kategoria „Buty” – do dodania 🙂')}>Buty</button>
              <button className="btn" onClick={()=>alert('Kategoria „Paski” – do dodania 🙂')}>Paski</button>
              <button className="btn" onClick={()=>alert('Kategoria „Skarpety” – do dodania 🙂')}>Skarpety</button>
            </nav>
          </aside>
        </>
      )}

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-3xl md:text-5xl font-bold leading-tight">
              Sukienki, które <span className="text-pink-600">podkreślają</span> Twój styl
            </motion.h1>
            <p className="mt-3 text-neutral-600">
              SebastianClothes – eleganckie, wygodne i dopracowane kroje na co dzień i na wielkie wyjścia.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" onClick={()=>document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}>Przeglądaj nowości</button>
              <button className="btn">Zobacz wyprzedaż</button>
            </div>
          </div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}} className="relative">
            <SafeImg src={heroSVG()} alt="Hero" className="rounded-3xl shadow-lg aspect-[4/3] object-cover w-full" />
            <span className="badge absolute top-3 left-3">Nowa kolekcja</span>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-6xl mx-auto px-4 pb-2">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative md:w-[480px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input className="input pl-9" placeholder="Szukaj sukienek…" value={query} onChange={(e)=>setQuery(e.target.value)} />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4"/>
              <select className="input" value={sizeFilter} onChange={(e)=>setSizeFilter(e.target.value)}>
                <option value="">Rozmiar: dowolny</option>
                {['XS','S','M','L','XL'].map(s=>(<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <select className="input" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
              <option value="popular">Najpopularniejsze</option>
              <option value="priceAsc">Cena: rosnąco</option>
              <option value="priceDesc">Cena: malejąco</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.slice(0, visible).map((p, idx) => {
            const hasSale = p.oldPrice && p.oldPrice > p.price;
            const discount = hasSale ? Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100) : 0;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.25, delay: Math.min(idx*0.03, 0.2) }}
                className="card"
              >
                <div className="relative">
                  <SafeImg src={p.image} alt={p.name} className="h-72 w-full object-cover" />
                  <button
                    className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur p-2 shadow border"
                    onClick={()=>setFavIds(f=>f.includes(p.id)?f.filter(x=>x!==p.id):[...f,p.id])}
                    aria-label="Dodaj do ulubionych"
                  >
                    <Heart className={favIds.includes(p.id)?'h-4 w-4 text-pink-600 fill-pink-600':'h-4 w-4 text-neutral-700'} />
                  </button>
                  {p.tags?.[0] && <span className="badge absolute left-3 top-3">{p.tags[0]}</span>}
                  {hasSale && <span className="badge absolute left-3 top-10 bg-pink-600 text-white border-pink-600">-{discount}%</span>}
                </div>
                <div className="p-4">
                  <div className="font-semibold line-clamp-1">{p.name}</div>
                  <div className="mt-1 text-sm text-neutral-600 flex items-center gap-1">
                    <Star className="h-4 w-4" /> {p.rating} <span className="text-neutral-400">({p.reviews})</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">
                        {formatPrice(p.price)} {hasSale && <span className="text-sm line-through text-neutral-400 ml-2">{formatPrice(p.oldPrice!)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn" onClick={()=>openQuick(p)}><Eye className="h-4 w-4 mr-2"/>Podgląd</button>
                      <button className="btn btn-primary" onClick={()=>addToCart(p, p.sizes[0])}>Do koszyka</button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">Kolory: {p.colors.join(', ')}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Strażnik doładowywania */}
        <div ref={loadMoreRef} className="h-12" />
      </section>

      {/* Ulubione – panel boczny */}
      {favsOpen && (
        <>
          <div className="backdrop" onClick={()=>setFavsOpen(false)} />
          <aside className="sheet z-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ulubione</h3>
              <button className="btn" onClick={()=>setFavsOpen(false)}><X className="h-4 w-4"/></button>
            </div>
            <div className="mt-4 space-y-3 overflow-auto h-[calc(100%-120px)]">
              {favProducts.length === 0 && <p className="text-sm text-neutral-500">Nie masz jeszcze ulubionych.</p>}
              {favProducts.map(p => (
                <div key={p.id} className="flex gap-3">
                  <SafeImg src={p.image} alt={p.name} className="h-16 w-12 object-cover rounded" />
                  <div className="flex-1">
                    <div className="text-sm font-medium line-clamp-2">{p.name}</div>
                    <div className="text-sm">{formatPrice(p.price)}</div>
                  </div>
                  <button className="btn btn-primary" onClick={()=>addToCart(p, p.sizes[0])}>Dodaj</button>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* Pływający mini-koszyk */}
      <div className="fixed bottom-4 right-4 z-50 w-[320px] max-w-[92vw] rounded-2xl border bg-white shadow-xl p-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <div className="font-medium">Koszyk</div>
          <div className="text-xs text-neutral-500">({cartQty} szt.)</div>
          <div className="flex-1" />
          <div className="font-semibold">{formatPrice(cartTotal)}</div>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
          <div className="h-full bg-pink-600" style={{width: `${shippingPct}%`}} />
        </div>
        <div className="mt-1 text-[11px] text-neutral-600">
          {shippingLeft === 0 ? 'Darmowa dostawa aktywna 🎉' : `Brakuje ${formatPrice(shippingLeft)} do darmowej dostawy`}
        </div>
        <button className="mt-2 btn btn-primary w-full" onClick={()=>alert('Tu będzie płatność (Stripe/Przelewy24 BLIK) – mogę dodać w następnym kroku.')}>
          Przejdź do kasy
        </button>
      </div>
    </div>
  );
}
