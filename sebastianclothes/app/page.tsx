
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
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900">
      {/* Top bar */}
      <div className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="btn" aria-label="menu"><Menu className="h-4 w-4"/></button>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Shirt className="h-6 w-6" />
            <span className="lowercase">sebastian</span>
            <span className="text-pink-600">clothes</span>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2">
            <button className="btn">Nowości</button>
            <button className="btn">Sukienki</button>
            <button className="btn">Wyprzedaż</button>
          </div>
          <button className="btn" onClick={()=>setOpenCart(true)}><ShoppingCart className="mr-2 h-4 w-4"/> Koszyk ({cart.length})</button>
        </div>
      </div>

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
              <button className="btn btn-primary">Przeglądaj nowości</button>
              <button className="btn">Zobacz wyprzedaż</button>
            </div>
          </div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}} className="relative">
            <Image src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop" alt="Hero" width={1200} height={900} className="rounded-3xl shadow-lg aspect-[4/3] object-cover" />
            <span className="badge absolute top-3 left-3">Nowa kolekcja</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
