export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  dateOfJoining: string;
  salary: number;
  status: 'active' | 'inactive';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  totalHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'sick' | 'vacation' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
}

export interface ReceiptPaymentRecord {
  id: string;
  type: 'receipt' | 'payment';
  accountName: string;
  amount: number;
  date: string;
  period: string;
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  rating: number; // 1-5
  goals: Goal[];
  feedback: string;
  reviewedBy: string;
  reviewDate: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  description: string;
  completionPercentage: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed';
}