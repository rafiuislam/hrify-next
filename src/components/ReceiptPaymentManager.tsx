import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ReceiptPaymentRecord } from '@/types/employee';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Plus, Edit, Trash2, Receipt, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ReceiptPaymentManagerProps {
  canEdit: boolean;
}

export function ReceiptPaymentManager({ canEdit }: ReceiptPaymentManagerProps) {
  const { user } = useAuth();
  const [records, setRecords] = useLocalStorage<ReceiptPaymentRecord[]>('hrms_receipt_payment', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceiptPaymentRecord | null>(null);
  const [formData, setFormData] = useState({
    type: 'receipt' as 'receipt' | 'payment',
    accountName: '',
    amount: '',
    date: '',
    period: '',
    description: ''
  });

  const commonBankAccounts = [
    'ICB Islamic Bank Ltd.',
    'Exim Bank',
    'Dutch-Bangla Bank',
    'Brac Bank',
    'City Bank',
    'Eastern Bank',
    'Cash'
  ];

  useEffect(() => {
    // Initialize with sample data if empty
    if (records.length === 0) {
      const currentDate = new Date().toISOString().split('T')[0];
      const currentPeriod = `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;
      
      const sampleRecords: ReceiptPaymentRecord[] = [
        {
          id: '1',
          type: 'receipt',
          accountName: 'ICB Islamic Bank Ltd.',
          amount: 991626.61,
          date: currentDate,
          period: currentPeriod,
          description: 'Monthly revenue collection',
          createdBy: user?.id || 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'payment',
          accountName: 'Exim Bank',
          amount: 45000,
          date: currentDate,
          period: currentPeriod,
          description: 'Office rent payment',
          createdBy: user?.id || 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      setRecords(sampleRecords);
    }
  }, [records.length, setRecords, user?.id]);

  const totalReceipts = records
    .filter(record => record.type === 'receipt')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalPayments = records
    .filter(record => record.type === 'payment')
    .reduce((sum, record) => sum + record.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to modify records.",
        variant: "destructive"
      });
      return;
    }

    const newRecord: ReceiptPaymentRecord = {
      id: editingRecord?.id || Date.now().toString(),
      type: formData.type,
      accountName: formData.accountName,
      amount: parseFloat(formData.amount),
      date: formData.date,
      period: formData.period,
      description: formData.description,
      createdBy: user?.id || 'admin',
      createdAt: editingRecord?.createdAt || new Date().toISOString()
    };

    if (editingRecord) {
      setRecords(records.map(record => 
        record.id === editingRecord.id ? newRecord : record
      ));
      toast({
        title: "Record Updated",
        description: "Receipt/Payment record has been updated successfully."
      });
    } else {
      setRecords([...records, newRecord]);
      toast({
        title: "Record Added",
        description: "New receipt/payment record has been added successfully."
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'receipt',
      accountName: '',
      amount: '',
      date: '',
      period: '',
      description: ''
    });
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: ReceiptPaymentRecord) => {
    if (!canEdit) return;
    
    setEditingRecord(record);
    setFormData({
      type: record.type,
      accountName: record.accountName,
      amount: record.amount.toString(),
      date: record.date,
      period: record.period,
      description: record.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete records.",
        variant: "destructive"
      });
      return;
    }

    setRecords(records.filter(record => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "Receipt/Payment record has been deleted successfully."
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{totalReceipts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {records.filter(r => r.type === 'receipt').length} receipt(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ৳{totalPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {records.filter(r => r.type === 'payment').length} payment(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Receipt & Payment Records</CardTitle>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Edit Record' : 'Add New Record'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'receipt' | 'payment') => 
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (৳)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Select
                      value={formData.accountName}
                      onValueChange={(value) => setFormData({ ...formData, accountName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonBankAccounts.map((account) => (
                          <SelectItem key={account} value={account}>
                            {account}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="period">Period</Label>
                      <Input
                        id="period"
                        placeholder="e.g., January 2025"
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRecord ? 'Update' : 'Add'} Record
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Description</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Badge 
                      variant={record.type === 'receipt' ? 'default' : 'secondary'}
                      className={record.type === 'receipt' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {record.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.accountName}</TableCell>
                  <TableCell className="font-medium">৳{record.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.period}</TableCell>
                  <TableCell>{record.description || '-'}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}