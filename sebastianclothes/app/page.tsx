'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Menu, Star, Filter, Search, Shirt, X, Moon, Sun, Eye
} from 'lucide-react';

type Product = {
  id: string; name: string; price: number; oldPrice?: number; rating: number; reviews: number;
  sizes: string[]; colors: string[]; category: string; image: string; tags?: string[];
};

type CartItem = { id: string; name: string; price: number; image: string; size: string; qty: number; };

const FREE_SHIPPING_THRESHOLD = 20000; // 200 zł

// Obrazek z fallbackiem – jeśli URL padnie, pokaże zapasowy
function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [s, setS] = useState(src);
  const FALLBACK =
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop';
  return <img src={s} alt={alt} className={className} loading="lazy" onError={() => setS(FALLBACK)} />;
}

const PRODUCTS: Product[] = [
  { id: 'd1',  name: 'Sukienka Mila – satynowa midi', price: 21900, oldPrice: 25900, rating: 4.7, reviews: 128, sizes: ['XS','S','M','L'], colors: ['róż pudrowy','czarna','szampańska'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop', tags:['nowość','bestseller'] },
  { id: 'd2',  name: 'Sukienka Lea – kopertowa maxi',   price: 28900, rating: 4.8, reviews: 203, sizes: ['S','M','L','XL'], colors: ['butelkowa zieleń','granat'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1600&auto=format&fit=crop', tags:['wieczorowa'] },
  { id: 'd3',  name: 'Sukienka Nola – lniana mini',     price: 17900, rating: 4.5, reviews: 76,  sizes: ['XS','S','M'], colors: ['beż','biała'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1542060748-10c28b62716c?q=80&w=1600&auto=format&fit=crop', tags:['letnia','eko'] },
  { id: 'd4',  name: 'Sukienka Vera – ołówkowa midi',   price: 24900, rating: 4.6, reviews: 91,  sizes: ['S','M','L'], colors: ['czerwona','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-c65b6c98a4d0?q=80&w=1600&auto=format&fit=crop', tags:['do pracy'] },
  { id: 'd5',  name: 'Sukienka Aida – tiulowa midi',     price: 31900, oldPrice: 34900, rating: 4.9, reviews: 54,  sizes: ['S','M','L'], colors: ['pudrowy róż'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-223e0a9991b9?q=80&w=1600&auto=format&fit=crop', tags:['na wesele'] },
  { id: 'd6',  name: 'Sukienka Lila – jedwabna maxi',    price: 36900, rating: 4.8, reviews: 61,  sizes: ['S','M','L'], colors: ['szmaragd','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop', tags:['premium'] },
  { id: 'd7',  name: 'Sukienka Rina – plisowana midi',   price: 23900, rating: 4.6, reviews: 84,  sizes: ['XS','S','M','L'], colors: ['granat','burgund'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop', tags:['do biura'] },
  { id: 'd8',  name: 'Sukienka Ola – dzianinowa mini',  price: 16900, rating: 4.4, reviews: 43,  sizes: ['S','M','L'], colors: ['krem','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop' },
  { id: 'd9',  name: 'Sukienka Emi – rozkloszowana',    price: 20900, rating: 4.5, reviews: 71,  sizes: ['XS','S','M','L'], colors: ['pudrowy róż','mięta'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop' },
  { id: 'd10', name: 'Sukienka Kaja – koronkowa',       price: 27900, oldPrice: 29900, rating: 4.7, reviews: 95,  sizes: ['S','M','L'], colors: ['ecru','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop' },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents / 100);

export default function Page() {
  // Filtry / widok
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular'|'priceAsc'|'priceDesc'>('popular');
  const [sizeFilter, setSizeFilter] = useState<string|''>('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Trendy: Dark mode
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    setDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);
  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  // Trendy: Countdown promo (np. do końca dnia)
  const [remaining, setRemaining] = useState<string>('00:00:00');
  useEffect(() => {
    function update() {
      const now = new Date();
      const end = new Date();
      end.setHours(23,59,59,999);
      const ms = Math.max(0, +end - +now);
      const h = String(Math.floor(ms/3_600_000)).padStart(2,'0');
      const m = String(Math.floor(ms%3_600_000/60_000)).padStart(2,'0');
      const s = String(Math.floor(ms%60_000/1000)).padStart(2,'0');
      setRemaining(`${h}:${m}:${s}`);
    }
    update();
    const t = setInterval(update, 1000);
    return ()=>clearInterval(t);
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

  // Trendy: Ulubione + panel
  const [favIds, setFavIds] = useState<string[]>([]);
  const [favsOpen, setFavsOpen] = useState(false);
  const favProducts = PRODUCTS.filter(p => favIds.includes(p.id));

  // Trendy: Quick View + „ostatnio oglądane”
  const [quick, setQuick] = useState<Product|null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  function openQuick(p: Product) {
    setQuick(p);
    setSelectedSize(p.sizes[0]);
    setRecentIds(prev => {
      const arr = [p.id, ...prev.filter(id => id !== p.id)];
      return arr.slice(0, 8);
    });
  }
  const recent = recentIds.map(id => PRODUCTS.find(p => p.id === id)!).filter(Boolean);

  // Trendy: koszyk + darmowa dostawa – progress
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
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-950">
      {/* PROMO BAR */}
      <div className="bg-pink-600 text-white text-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="font-medium">-20% na sukienki do końca dnia</span>
          <span className="px-2 py-0.5 rounded bg-white/20 font-mono">{remaining}</span>
          <div className="flex-1" />
          <button onClick={toggleDark} className="btn bg-white/10 border-white/20 hover:bg-white/20">
            {dark ? <Sun className="h-4 w-4 mr-2"/> : <Moon className="h-4 w-4 mr-2"/>}
            {dark ? 'Jasny' : 'Ciemny'} motyw
          </button>
        </div>
      </div>

      {/* Top bar */}
      <div className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:border-neutral-800 sticky top-0 z-40">
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
          <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-pink-600" style={{width: `${shippingPct}%`}} />
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
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
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              SebastianClothes – eleganckie, wygodne i dopracowane kroje na co dzień i na wielkie wyjścia.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" onClick={()=>document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}>Przeglądaj nowości</button>
              <button className="btn">Zobacz wyprzedaż</button>
            </div>
          </div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}} className="relative">
            <SafeImg src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop" alt="Hero" className="rounded-3xl shadow-lg aspect-[4/3] object-cover w-full" />
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
                  <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
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
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Kolory: {p.colors.join(', ')}</div>
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

      {/* Quick View – modal */}
      {quick && (
        <>
          <div className="backdrop" onClick={()=>setQuick(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border dark:border-neutral-800 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold line-clamp-1">{quick.name}</h3>
                <button className="btn" onClick={()=>setQuick(null)}><X className="h-4 w-4"/></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <SafeImg src={quick.image} alt={quick.name} className="rounded-lg aspect-[4/5] object-cover w-full" />
                <div>
                  <div className="text-2xl font-semibold">{formatPrice(quick.price)}</div>
                  <div className="mt-4">
                    <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400 mb-1">Rozmiar</div>
                    <div className="flex flex-wrap gap-2">
                      {quick.sizes.map(s => (
                        <button key={s} className={`btn ${selectedSize===s?'btn-primary':''}`} onClick={()=>setSelectedSize(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5">
                    <button className="btn btn-primary w-full" onClick={()=>{ addToCart(quick, selectedSize || quick.sizes[0]); setQuick(null); }}>
                      Dodaj do koszyka
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ostatnio oglądane */}
      {recent.length > 0 && (
        <section className="bg-white dark:bg-neutral-900 border-t dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h3 className="text-lg font-semibold mb-4">Ostatnio oglądane</h3>
            <div className="grid grid-flow-col auto-cols-[220px] gap-4 overflow-x-auto pb-2">
              {recent.map(p => (
                <div key={p.id} className="card min-w-[220px]">
                  <SafeImg src={p.image} alt={p.name} className="h-36 w-full object-cover" />
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-2">{p.name}</div>
                    <div className="text-sm">{formatPrice(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pływający mini-koszyk */}
      <div className="fixed bottom-4 right-4 z-50 w-[320px] max-w-[92vw] rounded-2xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-xl p-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <div className="font-medium">Koszyk</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">({cartQty} szt.)</div>
          <div className="flex-1" />
          <div className="font-semibold">{formatPrice(cartTotal)}</div>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div className="h-full bg-pink-600" style={{width: `${shippingPct}%`}} />
        </div>
        <div className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-300">
          {shippingLeft === 0 ? 'Darmowa dostawa aktywna 🎉' : `Brakuje ${formatPrice(shippingLeft)} do darmowej dostawy`}
        </div>
        <button className="mt-2 btn btn-primary w-full" onClick={()=>alert('Tu wpinamy Stripe/Przelewy24 (BLIK) – mogę dodać w następnym kroku.')}>
          Przejdź do kasy
        </button>
      </div>
    </div>
  );
}
