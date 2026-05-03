'use client';

import { useState, useEffect } from 'react';
import { db, Product, CartItem } from '@/lib/db';
import { Home, LayoutGrid, Package, Users, Settings, Search, Volume2, Plus, Minus } from 'lucide-react';

const CATEGORIES = ['الكل', 'البقوليات', 'المنظفات', 'الألبان', 'المشروبات'];

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    async function initDb() {
      // Seed initial products if empty
      const c = await db.products.count();
      if (c === 0) {
        await db.products.bulkAdd([
          { id: '1', name: 'حليب نيدو 2.5كجم', price: 28000, category: 'الألبان', barcode: 'NID-1029', sku: 'NID-1029', stock: 10, isLoyaltyEligible: false },
          { id: '2', name: 'معكرونة الريحان', price: 1250, category: 'البقوليات', barcode: 'RY-001', sku: 'RY-001', stock: 5, isLoyaltyEligible: false },
          { id: '3', name: 'صابون غسيل لوكس', price: 3500, category: 'المنظفات', barcode: 'LUX-442', sku: 'LUX-442', stock: 20, isLoyaltyEligible: false },
          { id: '4', name: 'سكر ناعم 1كجم', price: 1500, category: 'البقوليات', barcode: 'SUG-001', sku: 'SUG-001', stock: 50, isLoyaltyEligible: true },
        ]);
      }
      const all = await db.products.toArray();
      setProducts(all);
    }
    initDb();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = Math.max(0, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQ };
      }
      return item;
    }).filter(item => item.cartQuantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="flex flex-row-reverse h-full w-full bg-[#F3F4F6] text-[#1F2937] font-sans overflow-hidden" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-[#111827] flex flex-col items-center py-6 gap-8 z-10">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">ت</div>
        <nav className="flex flex-col gap-6 w-full items-center">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg cursor-pointer transition-colors w-12 h-12 flex items-center justify-center" title="نقاط البيع">
            <Home className="w-6 h-6" />
          </div>
          <div className="p-3 text-gray-400 hover:text-white cursor-pointer transition-colors w-12 h-12 flex items-center justify-center" title="المخزون">
            <Package className="w-6 h-6" />
          </div>
          <div className="p-3 text-gray-400 hover:text-white cursor-pointer transition-colors w-12 h-12 flex items-center justify-center" title="العملاء">
            <Users className="w-6 h-6" />
          </div>
          <div className="p-3 text-gray-400 hover:text-white cursor-pointer transition-colors w-12 h-12 flex items-center justify-center" title="التقارير">
            <LayoutGrid className="w-6 h-6" />
          </div>
        </nav>
        <div className="mt-auto mb-4 w-full flex justify-center">
          <div className="p-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg cursor-pointer transition-colors w-12 h-12 flex items-center justify-center" title="الإعدادات">
            <Settings className="w-6 h-6" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">نقاط البيع - فرع المنصور</h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm border border-green-200/50">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> متصل الآن
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors shadow-sm border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">التقرير الصوتي اليومي</span>
            </button>
            <div className="flex items-center gap-3 border-r border-gray-200 pr-5">
              <div className="text-left">
                <p className="text-sm font-bold leading-none text-gray-800">أحمد محمد</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">كاشير رئيسي</p>
              </div>
              <div className="w-10 h-10 bg-blue-100/50 rounded-full border border-blue-200 shadow-sm flex items-center justify-center text-blue-700 font-bold text-sm">أ.م</div>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <main className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Cart Section (Left/Right depending on RTL) */}
          <div className="w-[400px] flex flex-col gap-4 shrink-0 h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 text-base">السلة الحالية</h2>
                <span className="text-xs font-mono font-medium text-gray-500 px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">#12093</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 opacity-60">
                    <Package className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-sm font-medium">السلة فارغة</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-transparent hover:border-gray-100 transition-colors group">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-gray-400 font-mono text-xs shadow-inner shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">BAR</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.cartQuantity} قطع × {item.price.toLocaleString()} د.ع</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-800">{(item.price * item.cartQuantity).toLocaleString()} د.ع</p>
                        <div className="flex items-center gap-2 mt-1.5 justify-end">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-red-500 active:scale-95 transition-all"><Minus className="w-3 h-3"/></button>
                          <span className="text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 active:scale-95 transition-all"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2 text-gray-600 font-medium">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-sm mb-4 text-gray-500 border-b border-gray-200/60 pb-4">
                  <span>الضريبة (0%)</span>
                  <span>{tax.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-blue-800 tracking-tight">
                  <span>الإجمالي</span>
                  <span>{total.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-3 h-[88px] shrink-0">
              <button disabled={cart.length === 0} className="relative overflow-hidden bg-[#FF7A00] text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="text-[11px] opacity-90 font-medium tracking-wide relative z-10 w-full text-center">الدفع عبر</span>
                <span className="text-xl uppercase tracking-widest relative z-10 w-full text-center">Shillen</span>
              </button>
              <button disabled={cart.length === 0} className="relative overflow-hidden bg-green-600 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="text-[11px] opacity-90 font-medium tracking-wide relative z-10 w-full text-center">نــقــداً</span>
                <span className="text-xl relative z-10 w-full text-center tracking-tight">إتمام البيع</span>
              </button>
            </div>
          </div>

          {/* Product Selection (Right/Left) */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 h-full">
            {/* Search & Filter */}
            <div className="flex gap-4 shrink-0">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم أو الباركود..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 bg-white rounded-xl border border-gray-200 outline-none shadow-sm pl-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
                <Search className="w-5 h-5 absolute right-4 top-3.5 text-gray-400" />
              </div>
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 h-12 rounded-xl border text-sm font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                      ? 'bg-white border-blue-500/30 text-blue-700 shadow-sm' 
                      : 'bg-white/60 border-transparent text-gray-500 hover:bg-white hover:text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pb-4 content-start pr-2">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-500 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.97] group flex flex-col h-[180px]"
                >
                  <div className="w-full aspect-square max-h-[80px] bg-gray-50/80 rounded-xl mb-3 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-300 transition-colors shrink-0">
                    <Package className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <p className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug">{product.name}</p>
                    <div className="mt-1">
                      <p className="text-blue-600 font-extrabold text-sm tracking-tight">{product.price.toLocaleString()} د.ع</p>
                      <div className="flex items-center justify-between mt-1.5 h-[14px]">
                        {product.stock <= 5 ? (
                          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide truncate">{product.stock} قطع متبقية</p>
                        ) : (
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">SKU: {product.sku}</p>
                        )}
                        {product.isLoyaltyEligible && (
                          <span className="bg-blue-50 text-blue-700 text-[9px] px-1.5 py-[2px] rounded font-bold italic truncate shadow-sm border border-blue-100/50">كرم</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-white/40 p-4 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center flex-col gap-3 cursor-pointer hover:bg-white hover:border-gray-400 hover:text-gray-800 transition-colors text-gray-400 h-[180px]">
                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center drop-shadow-sm"><Plus className="w-6 h-6" /></div>
                 <span className="text-[11px] font-bold tracking-wide">إضافة صنف سريع</span>
              </div>
            </div>

            {/* Loyalty Section */}
            <div className="bg-gradient-to-l from-blue-800 to-blue-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-md shrink-0 border border-blue-700">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg border border-white/20 shadow-inner">⭐</div>
                  <div>
                     <p className="text-[11px] text-blue-200 font-medium mb-0.5 tracking-wide">برنامج ولاء تجارتي كرم</p>
                     <p className="font-bold text-sm tracking-tight drop-shadow-sm">العميل: محمد عبدالله (1,450 نقطة)</p>
                  </div>
               </div>
               <button className="px-5 py-2.5 bg-white text-blue-900 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-50 active:scale-95 transition-all">
                 استبدال النقاط
               </button>
            </div>
          </div>
        </main>

        {/* Footer Actions bar */}
        <footer className="h-12 bg-white border-t border-gray-200 px-6 flex items-center justify-between text-[11px] text-gray-500 shrink-0 font-medium">
          <div className="flex gap-8">
            <span>إجمالي مبيعات الوردية: <strong className="text-gray-800 text-xs tracking-tight ml-1">452,000 د.ع</strong></span>
            <span>الفواتير: <strong className="text-gray-800 text-xs ml-1">32</strong></span>
          </div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_4px_rgba(59,130,246,0.5)] animate-pulse"></span> مزامنة البيانات تلقائية</span>
            <span className="opacity-80">رقم النسخة 2.4.1 (Offline-First)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
