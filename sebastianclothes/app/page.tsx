'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Menu, Star, Filter, Search, Shirt, X } from 'lucide-react';

type Product = {
  id: string; name: string; price: number; rating: number; reviews: number;
  sizes: string[]; colors: string[]; category: string; image: string; tags?: string[];
};

const PRODUCTS: Product[] = [
  { id: 'd1', name: 'Sukienka Mila – satynowa midi', price: 21900, rating: 4.7, reviews: 128, sizes: ['XS','S','M','L'], colors: ['róż pudrowy','czarna','szampańska'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop', tags:['nowość','bestseller'] },
  { id: 'd2', name: 'Sukienka Lea – kopertowa maxi',   price: 28900, rating: 4.8, reviews: 203, sizes: ['S','M','L','XL'], colors: ['butelkowa zieleń','granat'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1600&auto=format&fit=crop', tags:['wieczorowa'] },
  { id: 'd3', name: 'Sukienka Nola – lniana mini',     price: 17900, rating: 4.5, reviews: 76,  sizes: ['XS','S','M'], colors: ['beż','biała'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1542060748-10c28b62716c?q=80&w=1600&auto=format&fit=crop', tags:['letnia','eko'] },
  { id: 'd4', name: 'Sukienka Vera – ołówkowa midi',   price: 24900, rating: 4.6, reviews: 91,  sizes: ['S','M','L'], colors: ['czerwona','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-c65b6c98a4d0?q=80&w=1600&auto=format&fit=crop', tags:['do pracy'] },
  { id: 'd5', name: 'Sukienka Aida – tiulowa midi',     price: 31900, rating: 4.9, reviews: 54,  sizes: ['S','M','L'], colors: ['pudrowy róż'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-223e0a9991b9?q=80&w=1600&auto=format&fit=crop', tags:['na wesele'] },
  { id: 'd6', name: 'Sukienka Lila – jedwabna maxi',    price: 36900, rating: 4.8, reviews: 61,  sizes: ['S','M','L'], colors: ['szmaragd','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1600&auto=format&fit=crop', tags:['premium'] },
  { id: 'd7', name: 'Sukienka Rina – plisowana midi',   price: 23900, rating: 4.6, reviews: 84,  sizes: ['XS','S','M','L'], colors: ['granat','burgund'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop', tags:['do biura'] },
  { id: 'd8', name: 'Sukienka Ola – dzianinowa mini',  price: 16900, rating: 4.4, reviews: 43,  sizes: ['S','M','L'], colors: ['krem','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1542060748-10c28b62716c?q=80&w=1600&auto=format&fit=crop' },
  { id: 'd9', name: 'Sukienka Emi – rozkloszowana',    price: 20900, rating: 4.5, reviews: 71,  sizes: ['XS','S','M','L'], colors: ['pudrowy róż','mięta'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-c65b6c98a4d0?q=80&w=1600&auto=format&fit=crop' },
  { id: 'd10',name: 'Sukienka Kaja – koronkowa',       price: 27900, rating: 4.7, reviews: 95,  sizes: ['S','M','L'], colors: ['ecru','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-223e0a9991b9?q=80&w=1600&auto=format&fit=crop' },
];

const formatPrice = (cents: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents/100);

export default function Page() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular'|'priceAsc'|'priceDesc'>('popular');
  const [sizeFilter, setSizeFilter] = useState<string|''>('');
  const [favIds, setFavIds] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // --- auto-doładowanie podczas przewijania ---
  const [visible, setVisible] = useState(6);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (sizeFilter) list = list.filter(p => p.sizes.includes(sizeFilter));
    if (sort === 'priceAsc') list = [...list].sort((a,b)=>a.price-b.price);
    if (sort === 'priceDesc') list = [...list].sort((a,b)=>b.price-a.price);
    return list;
  }, [query, sort, sizeFilter]);

  useEffect(() => { setVisible(Math.min(6, filtered.length)); }, [query, sort, sizeFilter, filtered.length]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(v => Math.min(v + 6, filtered.length));
    }, { rootMargin: '200px' });
    io.observe(loadMoreRef.current);
    return () => io.disconnect();
  }, [filtered.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900">
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
          <div className="hidden md:flex items-center gap-2">
            <button className="btn">Nowości</button>
            <button className="btn" onClick={()=>document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}>Sukienki</button>
            <button className="btn">Wyprzedaż</button>
          </div>
          <button className="btn"><ShoppingCart className="mr-2 h-4 w-4"/> Koszyk (0)</button>
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
            <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop" alt="Hero" className="rounded-3xl shadow-lg aspect-[4/3] object-cover w-full" loading="lazy" />
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
          {filtered.slice(0, visible).map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.25, delay: Math.min(idx*0.03, 0.2) }}
              className="card"
            >
              <div className="relative">
                <img src={p.image} alt={p.name} className="h-72 w-full object-cover" loading="lazy" />
                <button
                  className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur p-2 shadow border"
                  onClick={()=>setFavIds(f=>f.includes(p.id)?f.filter(x=>x!==p.id):[...f,p.id])}
                  aria-label="Dodaj do ulubionych"
                >
                  <Heart className={favIds.includes(p.id)?'h-4 w-4 text-pink-600 fill-pink-600':'h-4 w-4 text-neutral-700'} />
                </button>
                {p.tags?.[0] && <span className="badge absolute left-3 top-3">{p.tags[0]}</span>}
              </div>
              <div className="p-4">
                <div className="font-semibold line-clamp-1">{p.name}</div>
                <div className="mt-1 text-sm text-neutral-600 flex items-center gap-1">
                  <Star className="h-4 w-4" /> {p.rating} <span className="text-neutral-400">({p.reviews})</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-semibold">{formatPrice(p.price)}</div>
                  <button className="btn btn-primary">Dodaj do koszyka</button>
                </div>
                <div className="mt-2 text-xs text-neutral-500">Kolory: {p.colors.join(', ')}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Strażnik doładowywania */}
        <div ref={loadMoreRef} className="h-12" />
      </section>
    </div>
  );
}
