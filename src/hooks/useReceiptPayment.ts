import { useData } from '@/contexts/DataContext';
import { ReceiptPaymentRecord } from '@/types/employee';

export function useReceiptPayment() {
  const { receiptPayments, addReceiptPayment, updateReceiptPayment, deleteReceiptPayment } = useData();

  const getReceiptsByPeriod = (period: string): ReceiptPaymentRecord[] => {
    return receiptPayments.filter(r => r.type === 'receipt' && r.period === period);
  };

  const getPaymentsByPeriod = (period: string): ReceiptPaymentRecord[] => {
    return receiptPayments.filter(r => r.type === 'payment' && r.period === period);
  };

  const getTotalReceipts = (): number => {
    return receiptPayments
      .filter(r => r.type === 'receipt')
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const getTotalPayments = (): number => {
    return receiptPayments
      .filter(r => r.type === 'payment')
      .reduce((sum, r) => sum + r.amount, 0);
  };

  return {
    receiptPayments,
    addReceiptPayment,
    updateReceiptPayment,
    deleteReceiptPayment,
    getReceiptsByPeriod,
    getPaymentsByPeriod,
    getTotalReceipts,
    getTotalPayments,
  };
}
