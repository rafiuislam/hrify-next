import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  onClick?: () => void;
  comingSoon?: boolean;
}

export function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  buttonText, 
  onClick,
  comingSoon = false 
}: FeatureCardProps) {
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50 relative overflow-hidden">
      {comingSoon && (
        <div className="absolute top-4 right-4 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full font-medium">
          Coming Soon
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        
        <Button 
          onClick={onClick} 
          className="w-full group/btn bg-primary hover:bg-primary-light"
          disabled={comingSoon}
        >
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}