import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "default" | "compact";
}

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading your content. Please try again.",
  onRetry,
  variant = "default" 
}: ErrorStateProps) => {
  return (
    <div className={`text-center ${variant === "default" ? "py-16" : "py-8"}`}>
      <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {message}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
