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

/* === AI images ===
 * Używamy generatora obrazów z promptem w URL (bez API key).
 * Dodajemy "seed" aby wynik był stabilny.
 */
const ai = (prompt: string, seed: number) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1200&height=1600&nologo=true`;

// Fallback – neutralna sukienka (też AI)
const FALLBACK_AI = ai(
  'studio photo of an elegant neutral midi dress on invisible mannequin, soft light, plain backdrop, fashion e-commerce',
  999
);

// Bezpieczny <img/> – jeśli AI-URL zawiedzie, wstawiamy fallback
function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [s, setS] = useState(src);
  return (
    <img
      src={s}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => { if (s !== FALLBACK_AI) setS(FALLBACK_AI); }}
      referrerPolicy="no-referrer"
    />
  );
}

/* ===== Produkty (10 sukienek) – AI prompts dobrane pod nazwy i kolory ===== */
const PRODUCTS: Product[] = [
  {
    id: 'd1',
    name: 'Sukienka Mila – satynowa midi',
    image: ai('studio photo satin midi dress, soft pink color, A-line, elegant, on invisible mannequin, softbox lighting, plain light background, high quality', 101),
    price: 21900, oldPrice: 25900, rating: 4.7, reviews: 128,
    sizes: ['XS','S','M','L'], colors: ['róż pudrowy','czarna','szampańska'],
    category: 'Sukienki', tags: ['nowość','bestseller']
  },
  {
    id: 'd2',
    name: 'Sukienka Lea – kopertowa maxi',
    image: ai('studio photo wrap maxi dress, deep green color, waist-tie, V-neck, flowing fabric, on invisible mannequin, fashion ecommerce background', 102),
    price: 28900, rating: 4.8, reviews: 203,
    sizes: ['S','M','L','XL'], colors: ['butelkowa zieleń','granat'],
    category: 'Sukienki', tags: ['wieczorowa']
  },
  {
    id: 'd3',
    name: 'Sukienka Nola – lniana mini',
    image: ai('studio photo linen mini dress, beige color, relaxed summer silhouette, natural texture, on invisible mannequin, bright neutral backdrop', 103),
    price: 17900, rating: 4.5, reviews: 76,
    sizes: ['XS','S','M'], colors: ['beż','biała'],
    category: 'Sukienki', tags: ['letnia','eko']
  },
  {
    id: 'd4',
    name: 'Sukienka Vera – ołówkowa midi',
    image: ai('studio photo pencil bodycon midi dress, red color, elegant office style, clean silhouette, on invisible mannequin, fashion ecommerce lighting', 104),
    price: 24900, rating: 4.6, reviews: 91,
    sizes: ['S','M','L'], colors: ['czerwona','czarna'],
    category: 'Sukienki', tags: ['do pracy']
  },
  {
    id: 'd5',
    name: 'Sukienka Aida – tiulowa midi',
    image: ai('studio photo tulle midi dress, blush pink color, layered skirt, occasion wear, on invisible mannequin, soft airy lighting, plain background', 105),
    price: 31900, oldPrice: 34900, rating: 4.9, reviews: 54,
    sizes: ['S','M','L'], colors: ['pudrowy róż'],
    category: 'Sukienki', tags: ['na wesele']
  },
  {
    id: 'd6',
    name: 'Sukienka Lila – jedwabna maxi',
    image: ai('studio photo silk maxi evening gown, emerald green, subtle sheen, elegant drape, on invisible mannequin, luxury fashion, neutral backdrop', 106),
    price: 36900, rating: 4.8, reviews: 61,
    sizes: ['S','M','L'], colors: ['szmaragd','czarna'],
    category: 'Sukienki', tags: ['premium']
  },
  {
    id: 'd7',
    name: 'Sukienka Rina – plisowana midi',
    image: ai('studio photo pleated midi dress, navy color, fine pleats, elegant waist, on invisible mannequin, ecommerce background, sharp details', 107),
    price: 23900, rating: 4.6, reviews: 84,
    sizes: ['XS','S','M','L'], colors: ['granat','burgund'],
    category: 'Sukienki', tags: ['do biura']
  },
  {
    id: 'd8',
    name: 'Sukienka Ola – dzianinowa mini',
    image: ai('studio photo knit sweater mini dress, cream color, cozy texture, straight silhouette, on invisible mannequin, bright background', 108),
    price: 16900, rating: 4.4, reviews: 43,
    sizes: ['S','M','L'], colors: ['krem','czarna'],
    category: 'Sukienki'
  },
  {
    id: 'd9',
    name: 'Sukienka Emi – rozkloszowana',
    image: ai('studio photo fit-and-flare skater dress, pastel pink, flared skirt, feminine, on invisible mannequin, studio lighting, plain backdrop', 109),
    price: 20900, rating: 4.5, reviews: 71,
    sizes: ['XS','S','M','L'], colors: ['pudrowy róż','mięta'],
    category: 'Sukienki'
  },
  {
    id: 'd10',
    name: 'Sukienka Kaja – koronkowa',
    image: ai('studio photo lace cocktail dress, ecru color, delicate lace pattern, fitted waist, on invisible mannequin, high quality ecommerce photo', 110),
    price: 27900, oldPrice: 29900, rating: 4.7, reviews: 95,
    sizes: ['S','M','L'], colors: ['ecru','czarna'],
    category: 'Sukienki'
  },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents / 100);

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

  // Ulubione + podgląd + koszyk
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
            <SafeImg
              src={ai('studio photo silk maxi dress, golden warm color, elegant premium look, on invisible mannequin, soft light, plain background', 1000)}
              alt="Hero"
              className="rounded-3xl shadow-lg aspect-[4/3] object-cover w-full"
            />
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
