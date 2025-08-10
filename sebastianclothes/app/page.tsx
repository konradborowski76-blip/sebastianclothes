
'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Menu, Star, Filter, Search, Shirt, Trash2, Minus, Plus, X } from 'lucide-react';

type Product = {
  id: string; name: string; price: number; rating: number; reviews: number;
  sizes: string[]; colors: string[]; category: string; image: string; tags?: string[];
};

const PRODUCTS: Product[] = [
  { id: 'd1', name: 'Sukienka Mila – satynowa midi', price: 21900, rating: 4.7, reviews: 128, sizes: ['XS','S','M','L'], colors: ['róż pudrowy','czarna','szampańska'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop', tags:['nowość','bestseller'] },
  { id: 'd2', name: 'Sukienka Lea – kopertowa maxi', price: 28900, rating: 4.8, reviews: 203, sizes: ['S','M','L','XL'], colors: ['butelkowa zieleń','granat'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1600&auto=format&fit=crop', tags:['wieczorowa'] },
  { id: 'd3', name: 'Sukienka Nola – lniana mini', price: 17900, rating: 4.5, reviews: 76, sizes: ['XS','S','M'], colors: ['beż','biała'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1542060748-10c28b62716c?q=80&w=1600&auto=format&fit=crop', tags:['letnia','eko'] },
  { id: 'd4', name: 'Sukienka Vera – ołówkowa midi', price: 24900, rating: 4.6, reviews: 91, sizes: ['S','M','L'], colors: ['czerwona','czarna'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-c65b6c98a4d0?q=80&w=1600&auto=format&fit=crop', tags:['do pracy'] },
  { id: 'd5', name: 'Sukienka Aida – tiulowa midi', price: 31900, rating: 4.9, reviews: 54, sizes: ['S','M','L'], colors: ['pudrowy róż'], category: 'Sukienki', image: 'https://images.unsplash.com/photo-1520975922215-223e0a9991b9?q=80&w=1600&auto=format&fit=crop', tags:['na wesele'] },
];

type CartItem = { id: string; name: string; price: number; image: string; size: string; qty: number; };

const formatPrice = (cents: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents/100);

export default function Page() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular'|'priceAsc'|'priceDesc'>('popular');
  const [sizeFilter, setSizeFilter] = useState<string|''>('');
  const [openCart, setOpenCart] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<Product|null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (sizeFilter) list = list.filter(p => p.sizes.includes(sizeFilter));
    if (sort === 'priceAsc') list = [...list].sort((a,b)=>a.price-b.price);
    if (sort === 'priceDesc') list = [...list].sort((a,b)=>b.price-a.price);
    return list;
  }, [query, sort, sizeFilter]);

  const subtotal = cart.reduce((s,i)=>s+i.qty*i.price, 0);

  function addToCart(p: Product, size: string) {
    setCart(prev => {
      const id = p.id+size;
      const exists = prev.find(i => i.id===id);
      if (exists) return prev.map(i => i.id===id ? {...i, qty:i.qty+1} : i);
      return [...prev, { id, name: `${p.name} • ${size}`, price: p.price, image: p.image, size, qty: 1 }];
    });
    setOpenCart(true);
  }

  function changeQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id===id ? {...i, qty: Math.max(1, i.qty+delta)} : i));
  }

  function removeItem(id: string) { setCart(prev => prev.filter(i => i.id!==id)); }

  function mockCheckout() {
    alert('Tu wpinamy Stripe/Przelewy24 (BLIK) i przekierowanie do płatności. To wersja demo UI.');
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900\">
      {/* Top bar */}
      <div className=\"border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40\">
        <div className=\"max-w-6xl mx-auto px-4 py-3 flex items-center gap-3\">
          <button className=\"btn\" aria-label=\"menu\"><Menu className=\"h-4 w-4\"/></button>
          <div className=\"flex items-center gap-2 font-bold text-xl tracking-tight\">
            <Shirt className=\"h-6 w-6\" />
            <span className=\"lowercase\">sebastian</span>
            <span className=\"text-pink-600\">clothes</span>
          </div>
          <div className=\"flex-1\" />
          <div className=\"hidden md:flex items-center gap-2\">
            <button className=\"btn\">Nowości</button>
            <button className=\"btn\">Sukienki</button>
            <button className=\"btn\">Wyprzedaż</button>
          </div>
          <button className=\"btn\" onClick={()=>setOpenCart(true)}><ShoppingCart className=\"mr-2 h-4 w-4\"/> Koszyk ({cart.length})</button>
        </div>
      </div>

      {/* Hero */}
      <section className=\"max-w-6xl mx-auto px-4 pt-10 pb-6\">
        <div className=\"grid md:grid-cols-2 gap-6 items-center\">
          <div>
            <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className=\"text-3xl md:text-5xl font-bold leading-tight\">
              Sukienki, które <span className=\"text-pink-600\">podkreślają</span> Twój styl
            </motion.h1>
            <p className=\"mt-3 text-neutral-600\">
              SebastianClothes – eleganckie, wygodne i dopracowane kroje na co dzień i na wielkie wyjścia.
            </p>
            <div className=\"mt-4 flex gap-2\">
              <button className=\"btn btn-primary\">Przeglądaj nowości</button>
              <button className=\"btn\">Zobacz wyprzedaż</button>
            </div>
          </div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}} className=\"relative\">
            <Image src=\"https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop\" alt=\"Hero\" width={1200} height={900} className=\"rounded-3xl shadow-lg aspect-[4/3] object-cover\" />
            <span className=\"badge absolute top-3 left-3\">Nowa kolekcja</span>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className=\"max-w-6xl mx-auto px-4 pb-2\">
        <div className=\"flex flex-col md:flex-row gap-3 md:items-center\">
          <div className=\"relative md:w-[480px]\">
            <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400\" />
            <input className=\"input pl-9\" placeholder=\"Szukaj sukienek…\" value={query} onChange={(e)=>setQuery(e.target.value)} />
          </div>
          <div className=\"flex-1\" />
          <div className=\"flex items-center gap-2\">
            <div className=\"flex items-center gap-2\">
              <Filter className=\"h-4 w-4\"/>
              <select className=\"input\" value={sizeFilter} onChange={(e)=>setSizeFilter(e.target.value)}>
                <option value=\"\">Rozmiar: dowolny</option>
                {['XS','S','M','L','XL'].map(s=>(<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <select className=\"input\" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
              <option value=\"popular\">Najpopularniejsze</option>
              <option value=\"priceAsc\">Cena: rosnąco</option>
              <option value=\"priceDesc\">Cena: malejąco</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className=\"max-w-6xl mx-auto px-4 pb-14\">
        <div className=\"grid sm:grid-cols-2 lg:grid-cols-3 gap-5\">
          {filtered.map(p => (
            <motion.div key={p.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className=\"card\">
              <div className=\"relative\">
                <Image src={p.image} alt={p.name} width={800} height={600} className=\"h-72 w-full object-cover\"/>
                <button
                  className=\"absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur p-2 shadow border\"
                  onClick={()=>setFavIds(f=>f.includes(p.id)?f.filter(x=>x!==p.id):[...f,p.id])}
                  aria-label=\"Dodaj do ulubionych\"
                >
                  <Heart className={favIds.includes(p.id)?'h-4 w-4 text-pink-600 fill-pink-600':'h-4 w-4 text-neutral-700'} />
                </button>
                {p.tags?.[0] && <span className=\"badge absolute left-3 top-3\">{p.tags[0]}</span>}
              </div>
              <div className=\"p-4\">
                <div className=\"font-semibold line-clamp-1\">{p.name}</div>
                <div className=\"mt-1 text-sm text-neutral-600 flex items-center gap-1\">
                  <Star className=\"h-4 w-4\" /> {p.rating} <span className=\"text-neutral-400\">({p.reviews})</span>
                </div>
                <div className=\"mt-2 text-xs text-neutral-500\">Rozmiary: {p.sizes.join(', ')}</div>
                <div className=\"mt-3 flex items-center justify-between\">
                  <div className=\"text-lg font-semibold\">{formatPrice(p.price)}</div>
                  <div className=\"flex items-center gap-2\">
                    <button className=\"btn\" onClick={()=>setDetail(p)}>Szczegóły</button>
                    <button className=\"btn btn-primary\" onClick={()=>addToCart(p, p.sizes[0])}><ShoppingCart className=\"mr-2 h-4 w-4\"/>Dodaj</button>
                  </div>
                </div>
                <div className=\"mt-2 text-xs text-neutral-500\">Kolory: {p.colors.join(', ')}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className=\"bg-white border-t\">
        <div className=\"max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 items-center\">
          <div>
            <h2 className=\"text-2xl font-semibold\">Zapisz się do newslettera</h2>
            <p className=\"text-neutral-600\">Zyskaj -10% na pierwsze zamówienie.</p>
          </div>
          <div className=\"flex gap-2\">
            <input className=\"input\" placeholder=\"Twój e-mail\" />
            <button className=\"btn btn-primary\">Zapisz</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=\"bg-neutral-950 text-neutral-200\">\n        <div className=\"max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6\">
          <div>
            <div className=\"flex items-center gap-2 font-bold text-lg\">
              <Shirt className=\"h-5 w-5\" /> sebastian<span className=\"text-pink-500\">clothes</span>
            </div>
            <p className=\"mt-2 text-sm text-neutral-400\">Elegancja i komfort na każdą okazję.</p>
          </div>
          <div>
            <div className=\"font-medium mb-2\">Sklep</div>
            <ul className=\"space-y-1 text-sm text-neutral-400\">
              <li>Nowości</li>
              <li>Sukienki</li>
              <li>Wyprzedaż</li>
            </ul>
          </div>
          <div>
            <div className=\"font-medium mb-2\">Informacje</div>
            <ul className=\"space-y-1 text-sm text-neutral-400\">
              <li>Regulamin</li>
              <li>Polityka prywatności</li>
              <li>Dostawa i zwroty</li>
            </ul>
          </div>
          <div>
            <div className=\"font-medium mb-2\">Kontakt</div>
            <ul className=\"space-y-1 text-sm text-neutral-400\">
              <li>kontakt@sebastianclothes.pl</li>
              <li>+48 600 000 000</li>
            </ul>
          </div>
        </div>
        <div className=\"border-t border-neutral-800\">
          <div className=\"max-w-6xl mx-auto px-4 py-4 text-xs text-neutral-500 flex items-center\">
            © {new Date().getFullYear()} SebastianClothes. Wszelkie prawa zastrzeżone.
            <div className=\"flex-1\" />
            <span>Made with ♥</span>
          </div>
        </div>
      </footer>

      {/* Cart sheet */}
      {openCart && (
        <>
          <div className=\"backdrop\" onClick={()=>setOpenCart(false)} />
          <aside className=\"sheet z-50\">
            <div className=\"flex items-center justify-between\">
              <h3 className=\"text-lg font-semibold\">Twój koszyk</h3>
              <button className=\"btn\" onClick={()=>setOpenCart(false)}><X className=\"h-4 w-4\"/></button>
            </div>
            <div className=\"mt-4 space-y-4 overflow-auto h-[calc(100%-180px)]\">
              {cart.length===0 && <p className=\"text-sm text-neutral-500\">Koszyk jest pusty.</p>}
              {cart.map(i => (
                <div key={i.id} className=\"flex gap-3\">
                  <Image src={PRODUCTS.find(p=>i.id.startsWith(p.id))?.image || ''} alt={i.name} width={80} height={100} className=\"h-20 w-16 object-cover rounded\"/>
                  <div className=\"flex-1\">
                    <div className=\"font-medium text-sm line-clamp-2\">{i.name}</div>
                    <div className=\"mt-1 flex items-center gap-2\">
                      <button className=\"btn\" onClick={()=>changeQty(i.id, -1)}><Minus className=\"h-4 w-4\"/></button>
                      <span className=\"w-6 text-center text-sm\">{i.qty}</span>
                      <button className=\"btn\" onClick={()=>changeQty(i.id, +1)}><Plus className=\"h-4 w-4\"/></button>
                      <div className=\"flex-1\" />
                      <div className=\"text-sm font-semibold\">{formatPrice(i.price * i.qty)}</div>
                      <button className=\"btn\" onClick={()=>removeItem(i.id)}><Trash2 className=\"h-4 w-4\"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className=\"mt-4 space-y-3 border-t pt-4\">
              <div className=\"flex items-center justify-between text-sm\">
                <span>Suma</span>
                <span className=\"font-semibold\">{formatPrice(subtotal)}</span>
              </div>
              <button className=\"btn btn-primary w-full\" disabled={cart.length===0} onClick={mockCheckout}>
                Przejdź do płatności (BLIK/karta)
              </button>
              <p className=\"text-[11px] text-neutral-500 text-center\">
                *W wersji produkcyjnej podpinamy Stripe/Przelewy24 (BLIK) + webhook do zapisu zamówienia.
              </p>
            </div>
          </aside>
        </>
      )}

      {/* Detail modal */}
      {detail && (
        <>
          <div className=\"backdrop\" onClick={()=>setDetail(null)} />
          <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4\">
            <div className=\"w-full max-w-2xl rounded-2xl bg-white border p-4 shadow-2xl\">
              <div className=\"flex items-center justify-between mb-3\">
                <h3 className=\"text-lg font-semibold line-clamp-1\">{detail.name}</h3>
                <button className=\"btn\" onClick={()=>setDetail(null)}><X className=\"h-4 w-4\"/></button>
              </div>
              <div className=\"grid md:grid-cols-2 gap-4\">
                <Image src={detail.image} alt={detail.name} width={800} height={1000} className=\"rounded-lg aspect-[4/5] object-cover\"/>
                <div>
                  <div className=\"text-2xl font-semibold\">{formatPrice(detail.price)}</div>
                  <div className=\"mt-2 text-sm text-neutral-600 flex items-center gap-1\">
                    <Star className=\"h-4 w-4\"/> {detail.rating} ({detail.reviews} opinii)
                  </div>
                  <div className=\"mt-4\">
                    <div className=\"text-xs uppercase text-neutral-500 mb-1\">Rozmiar</div>
                    <div className=\"flex flex-wrap gap-2\">
                      {detail.sizes.map(s => (
                        <button key={s} className=\"btn\" onClick={()=>addToCart(detail, s)}>
                          Dodaj • {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className=\"mt-4 flex gap-2 flex-wrap\">
                    {detail.tags?.map(t => (<span key={t} className=\"badge\">{t}</span>))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
