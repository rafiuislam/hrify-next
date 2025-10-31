import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useData } from "@/contexts/DataContext";
import { usePerformanceReviews } from "@/hooks/usePerformanceReviews";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, FileText, TrendingUp, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReportsAnalytics() {
  const { toast } = useToast();
  const { employees, attendance, leaves, payroll } = useData();
  const { performanceReviews, getAverageRating, getGoalCompletionRate } = usePerformanceReviews();
  
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  // Get unique departments
  const departments = ["all", ...Array.from(new Set(employees.map(e => e.department)))];

  // Filter employees based on department
  const filteredEmployees = filterDepartment === "all" 
    ? employees 
    : employees.filter(e => e.department === filterDepartment);

  // Department Performance Data
  const departmentPerformance = departments
    .filter(d => d !== "all")
    .map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptReviews = performanceReviews.filter(r => 
        deptEmployees.some(e => e.id === r.employeeId)
      );
      const avgRating = deptReviews.length > 0
        ? deptReviews.reduce((acc, r) => acc + r.rating, 0) / deptReviews.length
        : 0;
      
      return {
        name: dept,
        rating: parseFloat(avgRating.toFixed(2)),
        employees: deptEmployees.length,
      };
    });

  // Attendance Trend Data (last 7 days)
  const attendanceTrend = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayAttendance = attendance.filter(a => a.date === dateStr);
    const present = dayAttendance.filter(a => a.status === 'present').length;
    const absent = dayAttendance.filter(a => a.status === 'absent').length;
    const late = dayAttendance.filter(a => a.status === 'late').length;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present,
      absent,
      late,
    };
  });

  // Leave Status Distribution
  const leaveStatusData = [
    { name: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: '#10b981' },
    { name: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: '#ef4444' },
  ];

  // Payroll Summary by Department
  const payrollByDepartment = departments
    .filter(d => d !== "all")
    .map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptPayroll = payroll.filter(p => 
        deptEmployees.some(e => e.id === p.employeeId)
      );
      const total = deptPayroll.reduce((acc, p) => acc + p.netSalary, 0);
      
      return {
        name: dept,
        total: total,
      };
    });

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({ title: "No data", description: "No data available to export", variant: "destructive" });
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({ title: "Success", description: `${filename} exported successfully` });
  };

  const exportPDF = () => {
    toast({ 
      title: "PDF Export", 
      description: "PDF export functionality would be implemented with a library like jsPDF" 
    });
  };

  // Summary Statistics
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter(e => e.status === 'active').length;
  const avgPerformanceRating = getAverageRating();
  const avgGoalCompletion = getGoalCompletionRate();
  const totalPayroll = payroll.reduce((acc, p) => acc + p.netSalary, 0);
  const avgSalary = totalPayroll / payroll.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                  Comprehensive HR analytics, custom reports, and data-driven insights
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportToCSV(departmentPerformance, "department_performance")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={exportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Customize your report view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept === "all" ? "All Departments" : dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeEmployees} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgPerformanceRating.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">
                    Average rating
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgGoalCompletion.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${avgSalary.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Per employee
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Department</CardTitle>
                  <CardDescription>Average performance ratings across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rating" fill="hsl(var(--primary))" name="Avg Rating" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                  <CardDescription>Last 7 days attendance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                      <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                      <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Leave Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Leave Status Distribution</CardTitle>
                  <CardDescription>Current leave request statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leaveStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leaveStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payroll by Department */}
              <Card>
                <CardHeader>
                  <CardTitle>Payroll by Department</CardTitle>
                  <CardDescription>Total payroll expenditure per department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={payrollByDepartment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Payroll ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
                <CardDescription>Overview of key metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Department</th>
                        <th className="text-right p-2">Employees</th>
                        <th className="text-right p-2">Avg Rating</th>
                        <th className="text-right p-2">Total Payroll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentPerformance.map((dept, index) => {
                        const deptPayroll = payrollByDepartment.find(p => p.name === dept.name);
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{dept.name}</td>
                            <td className="text-right p-2">{dept.employees}</td>
                            <td className="text-right p-2">{dept.rating.toFixed(1)}/5</td>
                            <td className="text-right p-2">${deptPayroll?.total.toLocaleString() || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
