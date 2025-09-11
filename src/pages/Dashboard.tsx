import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { StatsCard } from "@/components/StatsCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  UserCheck,
  UserX,
  Clock3,
  AlertCircle,
  Plus,
  FileText,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hrms-hero.jpg";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();

  const handleFeatureClick = (feature: string) => {
    toast({
      title: "Connect to Supabase",
      description: `${feature} will be available once you connect your Supabase database. Click the green Supabase button to get started!`,
      duration: 5000,
    });
  };

  const statsData = [
    {
      title: "Total Employees",
      value: "247",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active employees"
    },
    {
      title: "Present Today",
      value: "234",
      change: "94.7%",
      changeType: "positive" as const,
      icon: UserCheck,
      description: "Attendance rate"
    },
    {
      title: "Pending Leaves",
      value: "18",
      change: "+3",
      changeType: "neutral" as const,
      icon: Calendar,
      description: "Awaiting approval"
    },
    {
      title: "Monthly Payroll",
      value: "$89.2K",
      change: "+5.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Total this month"
    }
  ];

  const features = [
    {
      title: "Employee Management",
      description: "Comprehensive employee records, onboarding, and profile management with document storage.",
      icon: Users,
      buttonText: "Manage Employees"
    },
    {
      title: "Attendance Tracking",
      description: "Real-time attendance monitoring with check-in/out, overtime tracking, and detailed reports.",
      icon: Clock,
      buttonText: "View Attendance"
    },
    {
      title: "Leave Management",
      description: "Streamlined leave requests, approvals, and balance tracking for all leave types.",
      icon: Calendar,
      buttonText: "Manage Leaves"
    },
    {
      title: "Payroll System",
      description: "Automated payroll processing, salary calculations, tax deductions, and slip generation.",
      icon: DollarSign,
      buttonText: "Process Payroll"
    },
    {
      title: "Performance Reviews",
      description: "Employee performance evaluations, goal tracking, and feedback management.",
      icon: TrendingUp,
      buttonText: "View Performance"
    },
    {
      title: "Reports & Analytics",
      description: "Comprehensive HR analytics, custom reports, and data-driven insights.",
      icon: FileText,
      buttonText: "Generate Reports"
    }
  ];

  const recentActivities = [
    { type: "leave", message: "Sarah Johnson submitted sick leave request", time: "2 hours ago", status: "pending" },
    { type: "attendance", message: "5 employees marked late today", time: "3 hours ago", status: "warning" },
    { type: "payroll", message: "October payroll processed successfully", time: "1 day ago", status: "success" },
    { type: "employee", message: "New employee Alex Chen onboarded", time: "2 days ago", status: "success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation />
        
        <main className="flex-1 p-8">
          {/* Hero Section */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-primary">
            <div className="absolute inset-0">
              <img 
                src={heroImage} 
                alt="HRMS Dashboard" 
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative p-8 text-primary-foreground">
              <h1 className="text-4xl font-bold mb-2">Welcome to HRPro</h1>
              <p className="text-xl opacity-90 mb-6">Your complete Human Resources Management Solution</p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => handleFeatureClick("Employee Management")}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Employee
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => handleFeatureClick("Reports")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  View Reports
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Features Grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">HR Modules</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Connect Supabase to activate
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    {...feature}
                    onClick={() => handleFeatureClick(feature.title)}
                    comingSoon={true}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-primary" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge 
                          variant={activity.status === "success" ? "default" : activity.status === "warning" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6 bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Quick Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Departments</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Open Positions</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Performance</span>
                      <span className="font-semibold text-success">4.2/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Retention Rate</span>
                      <span className="font-semibold text-success">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-primary text-primary-foreground border-0">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
              <p className="text-lg opacity-90 mb-6">
                Connect your Supabase database to unlock all HRMS features including employee management, 
                attendance tracking, payroll processing, and more.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Settings className="mr-2 h-5 w-5" />
                Connect Supabase Now
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;