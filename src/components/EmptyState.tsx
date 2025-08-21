import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "compact";
}

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  variant = "default" 
}: EmptyStateProps) => {
  return (
    <div className={`text-center ${variant === "default" ? "py-16" : "py-8"}`}>
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
