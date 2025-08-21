import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader = ({ title, description, breadcrumbs, actions }: PageHeaderProps) => {
  return (
    <div className="bg-surface border-b border-border">
      <div className="container py-8 md:py-12">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4" />
                {item.href ? (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Button>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
