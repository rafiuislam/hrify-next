import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface PayrollGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalEmployees: number;
}

type ProcessStep = 'calculating' | 'deductions' | 'generating' | 'completed';

export function PayrollGenerationDialog({ 
  open, 
  onOpenChange, 
  totalEmployees 
}: PayrollGenerationDialogProps) {
  const [currentStep, setCurrentStep] = useState<ProcessStep>('calculating');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentStep('calculating');
      setProgress(0);

      const timer1 = setTimeout(() => {
        setCurrentStep('calculating');
        setProgress(25);
      }, 500);

      const timer2 = setTimeout(() => {
        setCurrentStep('deductions');
        setProgress(50);
      }, 1500);

      const timer3 = setTimeout(() => {
        setCurrentStep('generating');
        setProgress(75);
      }, 2500);

      const timer4 = setTimeout(() => {
        setCurrentStep('completed');
        setProgress(100);
      }, 3500);

      const timer5 = setTimeout(() => {
        onOpenChange(false);
      }, 4500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [open, onOpenChange]);

  const steps = [
    { id: 'calculating', label: 'Calculating Salaries', description: 'Processing employee base salaries' },
    { id: 'deductions', label: 'Applying Deductions', description: 'Computing tax and other deductions' },
    { id: 'generating', label: 'Generating Slips', description: 'Creating payroll records' },
    { id: 'completed', label: 'Completed', description: 'Payroll processing finished' },
  ];

  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processing Payroll</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : status === 'active' ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      status === 'active' ? 'text-foreground' : 
                      status === 'completed' ? 'text-muted-foreground' : 
                      'text-muted-foreground/60'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Processing payroll for {totalEmployees} employee{totalEmployees !== 1 ? 's' : ''}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
