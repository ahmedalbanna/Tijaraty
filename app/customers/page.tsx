'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, UserDown, Phone, ShieldAlert } from 'lucide-react';
import { db, Customer } from '@/lib/db';
import { Badge } from '@/components/ui/badge';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      let all = await db.customers.toArray();
      if (all.length === 0) {
        const seedCustomers: Customer[] = [
          { id: 'c1', name: 'أحمد البنا', phone: '0501234567', points: 450, debtBalance: 120, creditLimit: 500, customerType: 'retail', createdAt: Date.now() },
          { id: 'c2', name: 'سالم الدوسري', phone: '0559876543', points: 100, debtBalance: 0, creditLimit: 1000, customerType: 'wholesale', createdAt: Date.now() },
          { id: 'c3', name: 'محمد صابر (مطعم)', phone: '0590001111', points: 1200, debtBalance: -450, creditLimit: 2000, customerType: 'wholesale', createdAt: Date.now() },
        ];
        await db.customers.bulkAdd(seedCustomers);
        all = seedCustomers;
      }
      setCustomers(all);
    }
    load();
  }, []);

  const filtered = customers.filter(c => c.name.includes(search) || (c.phone && c.phone.includes(search)));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">العملاء والديون (الدائن والمدين)</h1>
          <p className="text-gray-500">إدارة حسابات العملاء الموثوقين ونقاط الولاء</p>
        </div>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 ml-2" />
          إضافة عميل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">إجمالي الديون (لنا)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600">
              {customers.filter(c => c.debtBalance > 0).reduce((acc, c) => acc + c.debtBalance, 0).toFixed(2)} ريال
            </div>
            <p className="text-xs text-red-500 mt-1">أموال مستحقة لدى العملاء</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">إجمالي الأرصدة (لهم)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-600">
              {Math.abs(customers.filter(c => c.debtBalance < 0).reduce((acc, c) => acc + c.debtBalance, 0)).toFixed(2)} ريال
            </div>
            <p className="text-xs text-green-500 mt-1">مبالغ دائنة للعملاء</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>سجل العملاء</CardTitle>
            <div className="relative w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="ابحث برقم الجوال أو الاسم..." 
                className="pl-4 pr-9 bg-gray-50 text-right"
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
                <TableHead className="font-bold text-gray-600 text-right">العميل</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">رقم الهاتف</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">التصنيف</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">نقاط الولاء</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">الرصيد / الدين</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">الحد الائتماني</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(customer => {
                const isOverLimit = customer.debtBalance > customer.creditLimit * 0.8;
                return (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <TableCell className="font-semibold text-lg">{customer.name}</TableCell>
                    <TableCell className="text-gray-500 font-mono tracking-wider">{customer.phone}</TableCell>
                    <TableCell>
                      <Badge variant={customer.customerType === 'wholesale' ? 'default' : 'secondary'}>
                        {customer.customerType === 'wholesale' ? 'جملة' : 'تجزئة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-yellow-600 text-lg">{customer.points}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-black text-lg ${customer.debtBalance > 0 ? 'text-red-500' : customer.debtBalance < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                          {customer.debtBalance === 0 ? '0.00' : customer.debtBalance > 0 ? `${customer.debtBalance} (له)` : `${Math.abs(customer.debtBalance)} (لنا)`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500">{customer.creditLimit} ريال</span>
                      {isOverLimit && (
                        <ShieldAlert className="w-4 h-4 text-orange-500 inline-block mr-2" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="font-semibold">تسديد / سحب</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    لا يوجد عملاء
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
