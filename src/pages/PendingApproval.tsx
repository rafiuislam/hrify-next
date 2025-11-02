import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Clock } from 'lucide-react';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pending Approval</CardTitle>
          <CardDescription>
            Your registration is under review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Thank you for registering, <span className="font-semibold text-foreground">{user?.name || user?.email}</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              Your employee registration has been submitted successfully and is currently awaiting approval from an administrator.
            </p>
            <div className="flex items-start gap-2 pt-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                You will receive an email notification once your account has been reviewed. This usually takes 1-2 business days.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-500/10 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
                What happens next?
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>An HR admin will review your information</li>
                <li>You'll receive an email once approved</li>
                <li>After approval, you can log in and access all features</li>
              </ul>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}