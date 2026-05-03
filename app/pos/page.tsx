'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { db, Product, Transaction, TransactionItem } from '@/lib/db';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function POSPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<(Product & { cartQuantity: number })[]>([]);
  
  // Load products or seed them
  useEffect(() => {
    async function loadProducts() {
      let allProducts = await db.products.toArray();
      if (allProducts.length === 0) {
        // Seed dummy products for testing
        const seedProducts: Product[] = [
          { id: '1', name: 'حليب المراعي', purchasePrice: 4, sellingPrice: 5, unit: 'حبة', reorderLevel: 10, createdAt: Date.now() },
          { id: '2', name: 'خبز أبيض', purchasePrice: 0.8, sellingPrice: 1, unit: 'كيس', reorderLevel: 20, createdAt: Date.now() },
          { id: '3', name: 'عصير برتقال', purchasePrice: 2.5, sellingPrice: 3.5, unit: 'حبة', reorderLevel: 15, createdAt: Date.now() },
          { id: '4', name: 'شوكولاتة جلاكسي', purchasePrice: 2, sellingPrice: 3, unit: 'حبة', reorderLevel: 30, createdAt: Date.now() },
          { id: '5', name: 'أرز بسمتي 5 كيلو', purchasePrice: 30, sellingPrice: 38, unit: 'كيس', reorderLevel: 5, createdAt: Date.now() },
          { id: '6', name: 'سكر 1 كيلو', purchasePrice: 3, sellingPrice: 4, unit: 'كيس', reorderLevel: 20, createdAt: Date.now() },
        ];
        await db.products.bulkAdd(seedProducts);
        allProducts = seedProducts;
      }
      setProducts(allProducts);
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => p.name.includes(searchQuery) || (p.barcode && p.barcode.includes(searchQuery)));

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.cartQuantity), 0);

  const handleCheckout = async (paymentMethod: 'cash' | 'shellen' | 'card' | 'debt') => {
    if (cart.length === 0) return;

    try {
      const transactionId = crypto.randomUUID();
      
      const transaction: Transaction = {
        id: transactionId,
        branchId: 'branch_1', // Default
        cashierId: user?.uid || 'unknown',
        type: 'sale',
        totalAmount,
        discount: 0,
        paymentMethod,
        status: 'completed',
        createdAt: Date.now(),
        synced: false,
      };

      const items: TransactionItem[] = cart.map(item => ({
        id: crypto.randomUUID(),
        transactionId,
        productId: item.id,
        name: item.name,
        quantity: item.cartQuantity,
        unitPrice: item.sellingPrice,
        totalPrice: item.sellingPrice * item.cartQuantity,
      }));

      await db.transaction('rw', db.transactions, db.transactionItems, async () => {
        await db.transactions.add(transaction);
        await db.transactionItems.bulkAdd(items);
      });

      toast.success('تم إتمام عملية البيع بنجاح');
      setCart([]);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-gray-100 overflow-hidden">
      
      {/* Right side - Cart & Checkout (RTL format) */}
      <div className="w-full md:w-[400px] bg-white border-l flex flex-col shadow-xl z-10 flex-shrink-0">
        <div className="p-4 bg-primary text-primary-foreground">
          <h2 className="text-lg font-bold flex items-center">
            <ShoppingBag className="w-5 h-5 ml-2" />
            سلة المشتريات
          </h2>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p>السلة فارغة</p>
              <p className="text-sm">قم بإضافة منتجات من القائمة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <span className="text-sm text-primary font-bold">{item.sellingPrice} ريال</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-bold">{item.cartQuantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 mr-2 hover:text-red-700 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Checkout Section */}
        <div className="p-6 bg-slate-50 border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-medium text-lg">الإجمالي</span>
            <span className="text-3xl font-black text-primary">{totalAmount.toFixed(2)} <span className="text-lg">ريال</span></span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-14 font-bold text-lg bg-green-600 hover:bg-green-700" onClick={() => handleCheckout('cash')} disabled={cart.length === 0}>
              <Banknote className="w-5 h-5 ml-2" /> نقداً
            </Button>
            <Button className="h-14 font-bold text-lg bg-blue-600 hover:bg-blue-700" onClick={() => handleCheckout('shellen')} disabled={cart.length === 0}>
              دفع عبر شِلّن
            </Button>
            <Button variant="outline" className="h-12 font-semibold" onClick={() => handleCheckout('card')} disabled={cart.length === 0}>
              <CreditCard className="w-4 h-4 ml-2" /> بطاقة بنكية
            </Button>
            <Button variant="outline" className="h-12 font-semibold text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => handleCheckout('debt')} disabled={cart.length === 0}>
              دفع آجل (دين)
            </Button>
          </div>
        </div>
      </div>

      {/* Left side - Products Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 bg-white border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              className="pl-4 pr-10 h-12 text-lg bg-gray-100 border-transparent focus:bg-white focus:border-primary transition-colors" 
              placeholder="ابحث بالاسم أو الباركود..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="h-12 px-4 text-sm whitespace-nowrap bg-green-50 text-green-700 border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse" />
            النظام يعمل (بدون اتصال)
          </Badge>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:border-primary transition-all hover:shadow-md active:scale-95"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2">{product.name}</h3>
                  <Badge variant="secondary" className="mt-auto font-bold text-sm bg-primary/10 text-primary">
                    {product.sellingPrice} ريال
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              لم يتم العثور على منتجات مطابقة لـ "{searchQuery}"
            </div>
          )}
        </ScrollArea>
      </div>

    </div>
  );
}
