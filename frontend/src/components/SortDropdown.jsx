import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SortDropdown = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger 
        className="w-[200px] rounded-full font-medium" 
        data-testid="sort-dropdown"
      >
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popularity">Popularity</SelectItem>
        <SelectItem value="price-low-high">Price: Low to High</SelectItem>
        <SelectItem value="price-high-low">Price: High to Low</SelectItem>
        <SelectItem value="new-arrivals">New Arrivals</SelectItem>
        <SelectItem value="rating">Customer Rating</SelectItem>
      </SelectContent>
    </Select>
  );
};
