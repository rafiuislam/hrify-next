import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { PayrollRecord } from '@/types/employee';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DollarSign, Plus, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';

export default function Payroll() {
  const { user } = useAuth();
  const [payrollRecords, setPayrollRecords] = useLocalStorage<PayrollRecord[]>('hrms_payroll', []);

  useEffect(() => {
    // Initialize with sample data if empty
    if (payrollRecords.length === 0) {
      const currentYear = new Date().getFullYear();
      const sampleRecords: PayrollRecord[] = [
        {
          id: '1',
          employeeId: '1',
          month: 'December',
          year: currentYear,
          basicSalary: 75000,
          allowances: 5000,
          deductions: 8000,
          netSalary: 72000,
          status: 'paid'
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
          status: 'processed'
        },
        {
          id: '3',
          employeeId: '3',
          month: 'December',
          year: currentYear,
          basicSalary: 58000,
          allowances: 2000,
          deductions: 5800,
          netSalary: 54200,
          status: 'draft'
        }
      ];
      setPayrollRecords(sampleRecords);
    }
  }, [payrollRecords.length, setPayrollRecords]);

  const handleGeneratePayroll = () => {
    toast({
      title: "Payroll Generated",
      description: "Monthly payroll has been generated successfully.",
    });
  };

  const handleDownloadPayslip = (id: string) => {
    toast({
      title: "Payslip Downloaded",
      description: "Payslip has been downloaded successfully.",
    });
  };

  const totalSalaryPaid = payrollRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.netSalary, 0);

  const totalEmployeesProcessed = payrollRecords.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Payroll Management</h1>
            <p className="text-muted-foreground">Manage employee salaries and payroll processing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Paid This Month"
              value={`$${totalSalaryPaid.toLocaleString()}`}
              icon={DollarSign}
              changeType="positive"
            />
            <StatsCard
              title="Employees Processed"
              value={totalEmployeesProcessed}
              icon={DollarSign}
              changeType="neutral"
            />
            <StatsCard
              title="Pending Payments"
              value={payrollRecords.filter(r => r.status === 'processed').length}
              icon={DollarSign}
              changeType="neutral"
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div></div>
            {user?.role === 'admin' && (
              <Button onClick={handleGeneratePayroll} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Generate Payroll
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeId}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>{record.year}</TableCell>
                      <TableCell>${record.basicSalary.toLocaleString()}</TableCell>
                      <TableCell>${record.allowances.toLocaleString()}</TableCell>
                      <TableCell>${record.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">${record.netSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            record.status === 'paid' ? 'default' : 
                            record.status === 'processed' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPayslip(record.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}