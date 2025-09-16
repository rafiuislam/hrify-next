import { Users, Clock, Calendar, DollarSign, TrendingUp, FileText, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: Home, href: '/dashboard' }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Employees', icon: Users, href: '/employees' },
        { name: 'Attendance', icon: Clock, href: '/attendance' },
        { name: 'Leave Management', icon: Calendar, href: '/leave' },
        { name: 'Payroll', icon: DollarSign, href: '/payroll' },
        { name: 'Performance', icon: TrendingUp, href: '#' },
        { name: 'Reports', icon: FileText, href: '#' },
      ];
    } else if (user?.role === 'hr') {
      return [
        ...baseItems,
        { name: 'Employees', icon: Users, href: '/employees' },
        { name: 'Attendance', icon: Clock, href: '/attendance' },
        { name: 'Leave Management', icon: Calendar, href: '/leave' },
        { name: 'Payroll', icon: DollarSign, href: '/payroll' },
        { name: 'Performance', icon: TrendingUp, href: '#' },
        { name: 'Reports', icon: FileText, href: '#' },
      ];
    } else if (user?.role === 'employee') {
      return [
        ...baseItems,
        { name: 'Attendance', icon: Clock, href: '/attendance' },
        { name: 'Leave Management', icon: Calendar, href: '/leave' },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavItems();
  
  return (
    <aside className="w-64 bg-card border-r border-border/50 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">HR</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">HRPro</h2>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}