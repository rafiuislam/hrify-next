import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  date_of_joining: string;
  salary: number | null;
  status: 'pending' | 'active' | 'rejected';
}

export default function Employees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; employee: Employee | null; salary: string }>({
    open: false,
    employee: null,
    salary: ''
  });

  useEffect(() => {
    loadEmployees();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        () => loadEmployees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = employees;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    }
  };

  const handleApprove = (employee: Employee) => {
    setApprovalDialog({ open: true, employee, salary: '' });
  };

  const confirmApproval = async () => {
    if (!approvalDialog.employee) return;

    try {
      const { error } = await supabase.functions.invoke('employee-approval', {
        body: {
          employee_id: approvalDialog.employee.id,
          action: 'approve',
          salary: parseFloat(approvalDialog.salary)
        }
      });

      if (error) throw error;

      toast({
        title: "Employee Approved",
        description: `${approvalDialog.employee.name} has been approved and can now access the system.`,
      });

      setApprovalDialog({ open: false, employee: null, salary: '' });
      loadEmployees();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve employee",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to reject ${employee.name}?`)) return;

    try {
      const { error } = await supabase.functions.invoke('employee-approval', {
        body: {
          employee_id: employee.id,
          action: 'reject'
        }
      });

      if (error) throw error;

      toast({
        title: "Employee Rejected",
        description: `${employee.name}'s application has been rejected.`,
      });

      loadEmployees();
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Employee Deleted",
        description: "Employee has been successfully removed from the system.",
      });

      loadEmployees();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Employee Management</h1>
            <p className="text-muted-foreground">Manage your organization's employees</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {(user?.role === 'admin' || user?.role === 'hr') && (
              <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/add-employee')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="mb-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending {employees.filter(e => e.status === 'pending').length > 0 && 
                      `(${employees.filter(e => e.status === 'pending').length})`}
                  </TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{new Date(employee.date_of_joining).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          employee.status === 'active' ? 'default' : 
                          employee.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(user?.role === 'admin' || user?.role === 'hr') && (
                          <div className="flex space-x-2">
                            {employee.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApprove(employee)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReject(employee)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {employee.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/edit-employee/${employee.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {user?.role === 'admin' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Employee</DialogTitle>
                <DialogDescription>
                  Set the annual salary for {approvalDialog.employee?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={approvalDialog.salary}
                    onChange={(e) => setApprovalDialog({ ...approvalDialog, salary: e.target.value })}
                    placeholder="Enter annual salary"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setApprovalDialog({ open: false, employee: null, salary: '' })}>
                  Cancel
                </Button>
                <Button onClick={confirmApproval} disabled={!approvalDialog.salary}>
                  Approve Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}