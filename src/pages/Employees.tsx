import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Employee } from '@/types/employee';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useLocalStorage<Employee[]>('hrms_employees', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    // Initialize with sample data if empty
    if (employees.length === 0) {
      const sampleEmployees: Employee[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          department: 'Engineering',
          position: 'Senior Developer',
          dateOfJoining: '2023-01-15',
          salary: 75000,
          status: 'active',
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
          status: 'active',
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
          status: 'active',
          address: '789 Pine St, City, State 12345',
          emergencyContact: {
            name: 'Lisa Chen',
            phone: '+1-555-0128',
            relationship: 'Sister'
          }
        }
      ];
      setEmployees(sampleEmployees);
    }
  }, [employees.length, setEmployees]);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    toast({
      title: "Employee Deleted",
      description: "Employee has been successfully removed from the system.",
    });
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
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/add-employee')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell>{new Date(employee.dateOfJoining).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/edit-employee/${employee.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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