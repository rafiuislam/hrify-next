import React, { createContext, useContext, useEffect, useState } from 'react';
import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, ReceiptPaymentRecord } from '@/types/employee';

interface DataContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  receiptPayments: ReceiptPaymentRecord[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addAttendance: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, record: AttendanceRecord) => void;
  addLeave: (leave: LeaveRequest) => void;
  updateLeave: (id: string, leave: LeaveRequest) => void;
  addPayroll: (record: PayrollRecord) => void;
  updatePayroll: (id: string, record: PayrollRecord) => void;
  addReceiptPayment: (record: ReceiptPaymentRecord) => void;
  updateReceiptPayment: (id: string, record: ReceiptPaymentRecord) => void;
  deleteReceiptPayment: (id: string) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Event system for cross-tab synchronization
const DATA_CHANGE_EVENT = 'hrms-data-change';

const broadcastChange = () => {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [receiptPayments, setReceiptPayments] = useState<ReceiptPaymentRecord[]>([]);

  // Load initial data from localStorage
  const loadData = () => {
    const storedEmployees = localStorage.getItem('hrms_employees');
    const storedAttendance = localStorage.getItem('hrms_attendance');
    const storedLeaves = localStorage.getItem('hrms_leaves');
    const storedPayroll = localStorage.getItem('hrms_payroll');
    const storedReceiptPayments = localStorage.getItem('hrms_receipt_payments');

    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      // Initialize with sample employees
      const sampleEmployees = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          department: 'Engineering',
          position: 'Senior Developer',
          dateOfJoining: '2023-01-15',
          salary: 75000,
          status: 'active' as const,
          address: '123 Main St, City, State 12345',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+1-555-0124',
            relationship: 'Spouse'
          }
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@company.com',
          phone: '+1-555-0125',
          department: 'Marketing',
          position: 'Marketing Manager',
          dateOfJoining: '2022-08-20',
          salary: 65000,
          status: 'active' as const,
          address: '456 Oak Ave, City, State 12345',
          emergencyContact: {
            name: 'Mike Wilson',
            phone: '+1-555-0126',
            relationship: 'Spouse'
          }
        },
        {
          id: '3',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          phone: '+1-555-0127',
          department: 'Finance',
          position: 'Financial Analyst',
          dateOfJoining: '2023-03-10',
          salary: 58000,
          status: 'active' as const,
          address: '789 Pine St, City, State 12345',
          emergencyContact: {
            name: 'Lisa Chen',
            phone: '+1-555-0128',
            relationship: 'Sister'
          }
        }
      ];
      setEmployees(sampleEmployees);
      localStorage.setItem('hrms_employees', JSON.stringify(sampleEmployees));
    }

    if (storedAttendance) {
      setAttendance(JSON.parse(storedAttendance));
    } else {
      // Initialize with sample attendance
      const today = new Date();
      const sampleRecords = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        ['1', '2', '3'].forEach(employeeId => {
          sampleRecords.push({
            id: `${employeeId}-${date.toISOString().split('T')[0]}`,
            employeeId,
            date: date.toISOString().split('T')[0],
            checkIn: '09:00',
            checkOut: '17:30',
            status: (Math.random() > 0.1 ? 'present' : 'absent') as 'present' | 'absent' | 'late' | 'half-day',
            totalHours: 8.5
          });
        });
      }
      setAttendance(sampleRecords);
      localStorage.setItem('hrms_attendance', JSON.stringify(sampleRecords));
    }

    if (storedLeaves) {
      setLeaves(JSON.parse(storedLeaves));
    } else {
      // Initialize with sample leaves
      const sampleLeaves = [
        {
          id: '1',
          employeeId: '1',
          type: 'vacation' as const,
          startDate: '2024-01-20',
          endDate: '2024-01-25',
          reason: 'Family vacation',
          status: 'approved' as const,
          appliedDate: '2024-01-10',
          approvedBy: 'HR Manager',
          approvedDate: '2024-01-12'
        },
        {
          id: '2',
          employeeId: '2',
          type: 'sick' as const,
          startDate: '2024-01-15',
          endDate: '2024-01-16',
          reason: 'Medical appointment',
          status: 'pending' as const,
          appliedDate: '2024-01-14'
        }
      ];
      setLeaves(sampleLeaves);
      localStorage.setItem('hrms_leaves', JSON.stringify(sampleLeaves));
    }

    if (storedPayroll) {
      setPayroll(JSON.parse(storedPayroll));
    } else {
      // Initialize with sample payroll
      const currentYear = new Date().getFullYear();
      const samplePayroll = [
        {
          id: '1',
          employeeId: '1',
          month: 'December',
          year: currentYear,
          basicSalary: 75000,
          allowances: 5000,
          deductions: 8000,
          netSalary: 72000,
          status: 'paid' as const
        },
        {
          id: '2',
          employeeId: '2',
          month: 'December',
          year: currentYear,
          basicSalary: 65000,
          allowances: 3000,
          deductions: 6500,
          netSalary: 61500,
          status: 'processed' as const
        }
      ];
      setPayroll(samplePayroll);
      localStorage.setItem('hrms_payroll', JSON.stringify(samplePayroll));
    }

    if (storedReceiptPayments) {
      setReceiptPayments(JSON.parse(storedReceiptPayments));
    } else {
      // Initialize with sample receipt/payment records
      const currentDate = new Date().toISOString().split('T')[0];
      const sampleRecords = [
        {
          id: '1',
          type: 'receipt' as const,
          accountName: 'Cash Sales',
          amount: 991626.61,
          date: currentDate,
          period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
          description: 'Monthly revenue collection',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'payment' as const,
          accountName: 'Rent',
          amount: 45000,
          date: currentDate,
          period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
          description: 'Office rent payment',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      setReceiptPayments(sampleRecords);
      localStorage.setItem('hrms_receipt_payments', JSON.stringify(sampleRecords));
    }
  };

  useEffect(() => {
    loadData();

    // Listen for changes from other components/tabs
    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  // Employee operations
  const addEmployee = (employee: Employee) => {
    const updated = [...employees, employee];
    setEmployees(updated);
    localStorage.setItem('hrms_employees', JSON.stringify(updated));
    broadcastChange();
  };

  const updateEmployee = (id: string, employee: Employee) => {
    const updated = employees.map(e => e.id === id ? employee : e);
    setEmployees(updated);
    localStorage.setItem('hrms_employees', JSON.stringify(updated));
    broadcastChange();
  };

  const deleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem('hrms_employees', JSON.stringify(updated));
    broadcastChange();
  };

  // Attendance operations
  const addAttendance = (record: AttendanceRecord) => {
    const updated = [...attendance, record];
    setAttendance(updated);
    localStorage.setItem('hrms_attendance', JSON.stringify(updated));
    broadcastChange();
  };

  const updateAttendance = (id: string, record: AttendanceRecord) => {
    const updated = attendance.map(a => a.id === id ? record : a);
    setAttendance(updated);
    localStorage.setItem('hrms_attendance', JSON.stringify(updated));
    broadcastChange();
  };

  // Leave operations
  const addLeave = (leave: LeaveRequest) => {
    const updated = [...leaves, leave];
    setLeaves(updated);
    localStorage.setItem('hrms_leaves', JSON.stringify(updated));
    broadcastChange();
  };

  const updateLeave = (id: string, leave: LeaveRequest) => {
    const updated = leaves.map(l => l.id === id ? leave : l);
    setLeaves(updated);
    localStorage.setItem('hrms_leaves', JSON.stringify(updated));
    broadcastChange();
  };

  // Payroll operations
  const addPayroll = (record: PayrollRecord) => {
    const updated = [...payroll, record];
    setPayroll(updated);
    localStorage.setItem('hrms_payroll', JSON.stringify(updated));
    broadcastChange();
  };

  const updatePayroll = (id: string, record: PayrollRecord) => {
    const updated = payroll.map(p => p.id === id ? record : p);
    setPayroll(updated);
    localStorage.setItem('hrms_payroll', JSON.stringify(updated));
    broadcastChange();
  };

  // Receipt/Payment operations
  const addReceiptPayment = (record: ReceiptPaymentRecord) => {
    const updated = [...receiptPayments, record];
    setReceiptPayments(updated);
    localStorage.setItem('hrms_receipt_payments', JSON.stringify(updated));
    broadcastChange();
  };

  const updateReceiptPayment = (id: string, record: ReceiptPaymentRecord) => {
    const updated = receiptPayments.map(r => r.id === id ? record : r);
    setReceiptPayments(updated);
    localStorage.setItem('hrms_receipt_payments', JSON.stringify(updated));
    broadcastChange();
  };

  const deleteReceiptPayment = (id: string) => {
    const updated = receiptPayments.filter(r => r.id !== id);
    setReceiptPayments(updated);
    localStorage.setItem('hrms_receipt_payments', JSON.stringify(updated));
    broadcastChange();
  };

  const refreshData = () => {
    loadData();
  };

  return (
    <DataContext.Provider
      value={{
        employees,
        attendance,
        leaves,
        payroll,
        receiptPayments,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addAttendance,
        updateAttendance,
        addLeave,
        updateLeave,
        addPayroll,
        updatePayroll,
        addReceiptPayment,
        updateReceiptPayment,
        deleteReceiptPayment,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
