import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const SizeGuideModal = ({ open, onClose, defaultCategory = 'women' }) => {
  const [activeTab, setActiveTab] = useState(defaultCategory);
  const [unit, setUnit] = useState('inches'); // 'inches' or 'cm'

  const sizeCharts = {
    men: {
      measurements: [
        { size: '38', chest: '38.5', length: '28.9', shoulder: '16.8' },
        { size: '40', chest: '40.8', length: '29.5', shoulder: '17.5' },
        { size: '42', chest: '43.0', length: '30.1', shoulder: '18.2' },
        { size: '44', chest: '45.2', length: '30.7', shoulder: '18.9' },
        { size: '46', chest: '47.4', length: '31.3', shoulder: '19.6' },
        { size: '48', chest: '49.6', length: '31.9', shoulder: '20.3' },
        { size: '50', chest: '51.8', length: '32.5', shoulder: '21.0' },
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
    women: {
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
    unisex: {
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
  };

  const tabs = [
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'unisex', label: 'Unisex' },
  ];

  const currentChart = sizeCharts[activeTab];
  const unitLabel = unit === 'inches' ? 'inches' : 'cm';

  const convertToCm = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value; // Handles ranges like "32-34"
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
        <div className="flex gap-2 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`size-tab-${tab.id}`}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

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
                  {currentChart.columns.map((col) => (
                    <th key={col.key} className="text-left py-3 font-semibold">
                      {col.label} ({unitLabel})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentChart.measurements.map((row) => (
                  <tr key={row.size} className="border-b last:border-0">
                    {currentChart.columns.map((col) => (
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
              {currentChart.howToMeasure.map((item, index) => (
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
