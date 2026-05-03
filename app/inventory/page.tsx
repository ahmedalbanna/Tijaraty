'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Upload, AlertCircle } from 'lucide-react';
import { db, Product } from '@/lib/db';
import { Badge } from '@/components/ui/badge';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const all = await db.products.toArray();
      setProducts(all);
    }
    load();
  }, []);

  const filtered = products.filter(p => p.name.includes(search) || (p.barcode && p.barcode.includes(search)));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">المخزون والمنتجات</h1>
          <p className="text-gray-500">إدارة الأصناف، الأسعار، ومراقبة النواقص</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <Upload className="w-4 h-4 ml-2" />
            استيراد Excel
          </Button>
          <Button className="flex items-center">
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>قائمة المنتجات</CardTitle>
            <div className="relative w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="بحث..." 
                className="pl-4 pr-9 bg-gray-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-bold text-gray-600 text-right">اسم المنتج</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">الباركود</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">سعر الشراء</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">سعر البيع</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">الوحدة</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">حد الطلب (إنذار)</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">خيارات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => (
                <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell className="font-mono text-gray-500 text-sm tracking-widest">{product.barcode || '---'}</TableCell>
                  <TableCell>{product.purchasePrice} ريال</TableCell>
                  <TableCell className="font-bold text-primary">{product.sellingPrice} ريال</TableCell>
                  <TableCell><Badge variant="secondary">{product.unit}</Badge></TableCell>
                  <TableCell>
                    {product.reorderLevel > 0 ? (
                      <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded w-max text-xs font-bold">
                        <AlertCircle className="w-3 h-3 ml-1" />
                        {product.reorderLevel}
                      </span>
                    ) : '---'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-blue-600">تعديل</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    لا توجد بيانات متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
