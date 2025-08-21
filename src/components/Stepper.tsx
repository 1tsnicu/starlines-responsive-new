import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const Stepper = ({ steps, currentStep, onStepClick, className }: StepperProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Step Circle */}
              <button
                onClick={() => onStepClick?.(index)}
                disabled={isUpcoming}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-primary/10 border-primary text-primary",
                  isUpcoming && "bg-muted border-muted text-muted-foreground cursor-not-allowed",
                  !isUpcoming && "cursor-pointer hover:scale-105"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              
              {/* Step Title */}
              <div className="mt-2 text-center">
                <h3 className={cn(
                  "text-sm font-medium transition-colors",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className={cn(
                    "text-xs mt-1 transition-colors",
                    isCompleted && "text-primary/70",
                    isCurrent && "text-primary/70",
                    isUpcoming && "text-muted-foreground/70"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "absolute top-5 left-1/2 w-full h-0.5 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
