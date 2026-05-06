import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const SizeGuideModal = ({ open, onClose, defaultCategory = 'women', productSubcategory = '' }) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [activeVariant, setActiveVariant] = useState('');
  const [unit, setUnit] = useState('inches'); // 'inches' or 'cm'

  // Structured size charts with variants per category
  const sizeCharts = {
    men: {
      variants: [
        {
          id: 'oversized-tshirt',
          label: 'Oversized T-Shirt',
          measurements: [
            { size: 'S', chest: '22', shoulder: '20.9', length: '27.6', sleeve: '8.2' },
            { size: 'M', chest: '22.8', shoulder: '21.7', length: '28.3', sleeve: '8.5' },
            { size: 'L', chest: '23.6', shoulder: '22.4', length: '29.1', sleeve: '8.7' },
            { size: 'XL', chest: '24.4', shoulder: '23.2', length: '29.9', sleeve: '9' },
            { size: 'XXL', chest: '25.2', shoulder: '24', length: '30.7', sleeve: '9.3' },
          ],
          columns: [
            { key: 'size', label: 'Size' },
            { key: 'chest', label: 'Chest' },
            { key: 'shoulder', label: 'Shoulder' },
            { key: 'length', label: 'Length' },
            { key: 'sleeve', label: 'Sleeve' },
          ],
          howToMeasure: [
            { label: 'Chest', instruction: 'Measure around the fullest part of your chest' },
            { label: 'Shoulder', instruction: 'Measure from shoulder point to shoulder point' },
            { label: 'Length', instruction: 'Measure from the top of the shoulder to the bottom hem' },
            { label: 'Sleeve', instruction: 'Measure from shoulder to sleeve hem' },
          ],
        },
        {
          id: 'fitted-shirt',
          label: 'Fitted Shirt',
          measurements: [
            { size: 'Small', neck: '15.5-16', chest: '36-38', waist: '31-32', sleeveLength: '32.5-33' },
            { size: 'Medium', neck: '16.5-17', chest: '39-41', waist: '33-35', sleeveLength: '33-33.5' },
            { size: 'Large', neck: '17-17.5', chest: '42-44', waist: '36-38', sleeveLength: '33.5-34' },
            { size: 'XL', neck: '18-18.5', chest: '45-48', waist: '39-43', sleeveLength: '34-34.5' },
            { size: '2XL', neck: '18.5-19', chest: '49-52', waist: '44-48', sleeveLength: '34.5-35' },
            { size: '3XL', neck: '19.5-20.5', chest: '54-56', waist: '49-53', sleeveLength: '35-36' },
            { size: '4XL', neck: '20.5-21', chest: '57-60', waist: '54-57', sleeveLength: '36-37' },
            { size: '5XL', neck: '21-21.5', chest: '61-64', waist: '58-60', sleeveLength: '37-38' },
          ],
          columns: [
            { key: 'size', label: 'Size' },
            { key: 'neck', label: 'Neck' },
            { key: 'chest', label: 'Chest' },
            { key: 'waist', label: 'Waist' },
            { key: 'sleeveLength', label: 'Sleeve Length' },
          ],
          howToMeasure: [
            { label: 'Neck', instruction: 'Measure around the base of your neck' },
            { label: 'Chest', instruction: 'Measure around the fullest part of your chest' },
            { label: 'Waist', instruction: 'Measure around your natural waistline' },
            { label: 'Sleeve Length', instruction: 'Measure from shoulder to wrist' },
          ],
        },
      ],
      defaultVariant: 'oversized-tshirt',
    },
    women: {
      variants: [
        {
          id: 'general',
          label: 'General Size Chart',
          measurements: [
            { size: 'XS', chest: '32-34', waist: '24-26', hips: '34-36' },
            { size: 'S', chest: '34-36', waist: '26-28', hips: '36-38' },
            { size: 'M', chest: '38-40', waist: '30-32', hips: '40-42' },
            { size: 'L', chest: '42-44', waist: '34-36', hips: '44-46' },
            { size: 'XL', chest: '46-48', waist: '38-40', hips: '48-50' },
            { size: 'XXL', chest: '50-52', waist: '42-44', hips: '52-54' },
          ],
          columns: [
            { key: 'size', label: 'Size' },
            { key: 'chest', label: 'Chest' },
            { key: 'waist', label: 'Waist' },
            { key: 'hips', label: 'Hips' },
          ],
          howToMeasure: [
            { label: 'Chest', instruction: 'Measure around the fullest part of your chest' },
            { label: 'Waist', instruction: 'Measure around your natural waistline' },
            { label: 'Hips', instruction: 'Measure around the fullest part of your hips' },
          ],
        },
      ],
      defaultVariant: 'general',
    },
    unisex: {
      variants: [
        {
          id: 'general',
          label: 'General Size Chart',
          measurements: [
            { size: 'XS', chest: '32-34', length: '26.5', shoulder: '16.0' },
            { size: 'S', chest: '34-36', length: '27.0', shoulder: '16.5' },
            { size: 'M', chest: '38-40', length: '27.5', shoulder: '17.0' },
            { size: 'L', chest: '42-44', length: '28.0', shoulder: '17.5' },
            { size: 'XL', chest: '46-48', length: '28.5', shoulder: '18.0' },
            { size: 'XXL', chest: '50-52', length: '29.0', shoulder: '18.5' },
          ],
          columns: [
            { key: 'size', label: 'Size' },
            { key: 'chest', label: 'Chest' },
            { key: 'length', label: 'Length' },
            { key: 'shoulder', label: 'Shoulder' },
          ],
          howToMeasure: [
            { label: 'Chest', instruction: 'Measure around the fullest part of your chest' },
            { label: 'Length', instruction: 'Measure from the top of the shoulder to the bottom hem' },
            { label: 'Shoulder', instruction: 'Measure from shoulder point to shoulder point' },
          ],
        },
      ],
      defaultVariant: 'general',
    },
  };

  const categories = [
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'unisex', label: 'Unisex' },
  ];

  // Determine default variant based on subcategory
  const getDefaultVariant = (category, subcategory) => {
    const cat = sizeCharts[category];
    if (!cat) return cat?.defaultVariant || '';

    const sub = subcategory?.toLowerCase() || '';
    if (category === 'men') {
      if (sub.includes('t-shirt') || sub.includes('tee') || sub.includes('oversized')) {
        return 'oversized-tshirt';
      }
      if (sub.includes('shirt') || sub.includes('formal') || sub.includes('casual')) {
        return 'fitted-shirt';
      }
    }
    return cat.defaultVariant;
  };

  // Initialize active variant based on props
  useEffect(() => {
    const defaultVar = getDefaultVariant(defaultCategory, productSubcategory);
    setActiveVariant(defaultVar);
    setActiveCategory(defaultCategory);
  }, [defaultCategory, productSubcategory]);

  // Handle category change - reset variant
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    const defaultVar = getDefaultVariant(catId, productSubcategory);
    setActiveVariant(defaultVar);
  };

  const currentCategoryData = sizeCharts[activeCategory];
  const currentVariant = currentCategoryData?.variants.find((v) => v.id === activeVariant) || currentCategoryData?.variants[0];
  const unitLabel = unit === 'inches' ? 'inches' : 'cm';

  const convertToCm = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value; // Handles ranges like "15.5-16"
    return (num * 2.54).toFixed(1);
  };

  const formatMeasurement = (value) => {
    if (unit === 'inches') return value;
    if (value.includes('-')) {
      const parts = value.split('-').map(convertToCm).join('-');
      return parts;
    }
    return convertToCm(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="size-guide-modal">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl">Size Guide</DialogTitle>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b mb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              data-testid={`size-tab-${cat.id}`}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeCategory === cat.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
              {activeCategory === cat.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Variant/Sub-type Tabs (within selected category) */}
        {currentCategoryData?.variants && currentCategoryData.variants.length > 1 && (
          <div className="flex gap-2 mb-4">
            {currentCategoryData.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setActiveVariant(variant.id)}
                data-testid={`variant-tab-${variant.id}`}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border rounded-full ${
                  activeVariant === variant.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={unit === 'inches' ? 'font-medium' : 'text-muted-foreground'}>Inches</span>
            <button
              onClick={() => setUnit(unit === 'inches' ? 'cm' : 'inches')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              data-testid="unit-toggle"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
                  unit === 'inches' ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
            <span className={unit === 'cm' ? 'font-medium' : 'text-muted-foreground'}>CM</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {currentVariant?.columns.map((col) => (
                    <th key={col.key} className="text-left py-3 font-semibold">
                      {col.label} ({unitLabel})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentVariant?.measurements.map((row) => (
                  <tr key={row.size} className="border-b last:border-0">
                    {currentVariant?.columns.map((col) => (
                      <td
                        key={`${row.size}-${col.key}`}
                        className={`py-3 ${
                          col.key === 'size' ? 'font-bold' : 'text-muted-foreground'
                        }`}
                      >
                        {formatMeasurement(row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure Section */}
          <div className="bg-secondary/30 p-4 rounded-lg space-y-2 text-sm">
            <h4 className="font-semibold">How to Measure</h4>
            <ul className="space-y-1 text-muted-foreground">
              {currentVariant?.howToMeasure.map((item, index) => (
                <li key={index}>
                  <strong>{item.label}:</strong> {item.instruction}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
