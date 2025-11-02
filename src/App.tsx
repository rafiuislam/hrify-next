import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import EmployeeRegister from "./pages/EmployeeRegister";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import NewLeaveRequest from "./pages/NewLeaveRequest";
import Payroll from "./pages/Payroll";
import PerformanceReviews from "./pages/PerformanceReviews";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/employee-register" element={<ProtectedRoute requireActive={false}><EmployeeRegister /></ProtectedRoute>} />
            <Route path="/pending-approval" element={<ProtectedRoute requireActive={false}><PendingApproval /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><Employees /></RoleGuard></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
            <Route path="/add-employee" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><AddEmployee /></RoleGuard></ProtectedRoute>} />
            <Route path="/edit-employee/:id" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><EditEmployee /></RoleGuard></ProtectedRoute>} />
            <Route path="/new-leave-request" element={<ProtectedRoute><NewLeaveRequest /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><Payroll /></RoleGuard></ProtectedRoute>} />
            <Route path="/performance-reviews" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><PerformanceReviews /></RoleGuard></ProtectedRoute>} />
            <Route path="/reports-analytics" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><ReportsAnalytics /></RoleGuard></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
