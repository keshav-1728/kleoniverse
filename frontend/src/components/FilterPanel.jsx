import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// Predefined filter options
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLORS = ['Black', 'White', 'Navy', 'Blue', 'Red', 'Green', 'Grey', 'Brown', 'Pink', 'Purple', 'Orange', 'Yellow', 'Beige', 'Maroon', 'Olive', 'Cream'];

export const FilterPanel = ({ filters, onChange, onReset }) => {
  const handleFilterChange = (key, value) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onChange({ ...filters, [key]: newValues });
  };

  const handleReset = () => {
    onChange({});
    if (onReset) onReset();
  };

  return (
    <div className="flex flex-col gap-6" data-testid="filter-panel">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg tracking-tight">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset}
          data-testid="reset-filters"
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="font-semibold text-sm uppercase tracking-wide">Price Range</Label>
        <div className="space-y-3">
          <Slider
            min={0}
            max={10000}
            step={500}
            value={filters.priceRange || [0, 10000]}
            onValueChange={(value) => onChange({ ...filters, priceRange: value })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{filters.priceRange?.[0] || 0}</span>
            <span>₹{filters.priceRange?.[1] || 10000}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-semibold text-sm uppercase tracking-wide">Size</Label>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => handleFilterChange('sizes', size)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                filters.sizes?.includes(size)
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background border-input hover:border-foreground'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-semibold text-sm uppercase tracking-wide">Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => handleFilterChange('colors', color)}
              className={`px-3 py-1.5 text-sm border rounded-full transition-colors ${
                filters.colors?.includes(color)
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background border-input hover:border-foreground'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
