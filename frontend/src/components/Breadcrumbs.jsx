import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumbs">
      <Link to="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
