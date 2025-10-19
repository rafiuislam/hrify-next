import { useData } from '@/contexts/DataContext';
import { PayrollRecord } from '@/types/employee';

export function usePayroll() {
  const { payroll, addPayroll, updatePayroll } = useData();

  const getPayrollByEmployeeId = (employeeId: string): PayrollRecord[] => {
    return payroll.filter(p => p.employeeId === employeeId);
  };

  const getPayrollByStatus = (status: 'draft' | 'processed' | 'paid'): PayrollRecord[] => {
    return payroll.filter(p => p.status === status);
  };

  const getCurrentMonthPayroll = (): PayrollRecord[] => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    return payroll.filter(p => p.month === currentMonth && p.year === currentYear);
  };

  return {
    payroll,
    addPayroll,
    updatePayroll,
    getPayrollByEmployeeId,
    getPayrollByStatus,
    getCurrentMonthPayroll,
  };
}
