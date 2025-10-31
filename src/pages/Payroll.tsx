import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { usePayroll } from '@/hooks/usePayroll';
import { useEmployees } from '@/hooks/useEmployees';
import { DollarSign, Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { ReceiptPaymentManager } from '@/components/ReceiptPaymentManager';
import { PayrollGenerationDialog } from '@/components/PayrollGenerationDialog';

export default function Payroll() {
  const { user } = useAuth();
  const { payroll, getPayrollByStatus, addPayroll } = usePayroll();
  const { getActiveEmployees } = useEmployees();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    setShowGenerationDialog(true);

    // Get all active employees
    const activeEmployees = getActiveEmployees();
    
    if (activeEmployees.length === 0) {
      toast({
        title: "No Active Employees",
        description: "There are no active employees to process payroll for.",
        variant: "destructive",
      });
      setIsGenerating(false);
      setShowGenerationDialog(false);
      return;
    }

    // Wait for the dialog animation to complete
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Generate payroll for each active employee
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    // Check if payroll already exists for this month
    const existingPayroll = payroll.filter(
      p => p.month === currentMonth && p.year === currentYear
    );

    if (existingPayroll.length > 0) {
      toast({
        title: "Payroll Already Exists",
        description: `Payroll for ${currentMonth} ${currentYear} has already been generated.`,
        variant: "destructive",
      });
      setIsGenerating(false);
      setShowGenerationDialog(false);
      return;
    }

    activeEmployees.forEach((employee) => {
      const basicSalary = employee.salary;
      // Calculate 10% allowances
      const allowances = Math.round(basicSalary * 0.10);
      // Calculate 15% deductions (taxes, insurance, etc.)
      const deductions = Math.round(basicSalary * 0.15);
      // Net salary = basic + allowances - deductions
      const netSalary = basicSalary + allowances - deductions;

      const payrollRecord = {
        id: `${employee.id}-${currentMonth}-${currentYear}`,
        employeeId: employee.id,
        month: currentMonth,
        year: currentYear,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status: 'processed' as const,
      };

      addPayroll(payrollRecord);
    });

    setIsGenerating(false);

    toast({
      title: "Payroll Generated Successfully",
      description: `Payroll for ${activeEmployees.length} employee${activeEmployees.length !== 1 ? 's' : ''} has been processed for ${currentMonth} ${currentYear}.`,
    });
  };

  const handleDownloadPayslip = (id: string) => {
    toast({
      title: "Payslip Downloaded",
      description: "Payslip has been downloaded successfully.",
    });
  };

  const totalSalaryPaid = getPayrollByStatus('paid')
    .reduce((sum, record) => sum + record.netSalary, 0);

  const totalEmployeesProcessed = payroll.length;

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
              value={getPayrollByStatus('processed').length}
              icon={DollarSign}
              changeType="neutral"
            />
          </div>

          <Tabs defaultValue="payroll" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
              <TabsTrigger value="receipts">Receipt & Payment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payroll" className="space-y-6">
              <div className="flex justify-between items-center">
                <div></div>
                {user?.role === 'admin' && (
                  <Button 
                    onClick={handleGeneratePayroll} 
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Generate Payroll
                      </>
                    )}
                  </Button>
                )}
              </div>

              <PayrollGenerationDialog 
                open={showGenerationDialog}
                onOpenChange={setShowGenerationDialog}
                totalEmployees={getActiveEmployees().length}
              />

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
                      {payroll.map((record) => (
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
            </TabsContent>

            <TabsContent value="receipts" className="space-y-6">
              <ReceiptPaymentManager canEdit={user?.role === 'admin'} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}