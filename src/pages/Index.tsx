import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import hrmsHero from "@/assets/hrms-hero.jpg";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">HRMS</h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Complete Human Resource Management System for modern organizations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-elegant"
              onClick={() => navigate("/login")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Employee Management</h3>
            <p className="text-white/80">Comprehensive employee records and profile management</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Attendance Tracking</h3>
            <p className="text-white/80">Real-time attendance monitoring and reporting</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Payroll System</h3>
            <p className="text-white/80">Automated payroll processing and salary management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
