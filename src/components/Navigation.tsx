import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Settings,
  FileText
} from "lucide-react";

interface NavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "leave", label: "Leave Management", icon: Calendar },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Navigation({ activeSection = "dashboard", onSectionChange }: NavigationProps) {
  return (
    <nav className="w-64 bg-card border-r border-border/50 min-h-screen p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onSectionChange?.(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 pt-8 border-t border-border/50">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 px-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Leave Request
          </Button>
        </div>
      </div>
    </nav>
  );
}