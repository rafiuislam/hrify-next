import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Employee } from '@/types/employee';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useLocalStorage<Employee[]>('hrms_employees', []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: Number(formData.salary),
      status: 'active',
      address: formData.address,
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelationship
      }
    };

    setEmployees(prev => [...prev, newEmployee]);
    
    toast({
      title: "Employee Added",
      description: "New employee has been successfully added to the system.",
    });
    
    navigate('/employees');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <Button variant="outline" onClick={() => navigate('/employees')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Add New Employee</h1>
            <p className="text-muted-foreground">Enter employee information to create a new record</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select onValueChange={(value) => handleInputChange('department', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">Human Resources</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Annual Salary *</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Select onValueChange={(value) => handleInputChange('emergencyContactRelationship', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/employees')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Employee
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}