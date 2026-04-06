import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const SizeGuideModal = ({ open, onClose }) => {
  const sizeChart = [
    { size: 'XS', chest: '32-34', waist: '24-26', hips: '34-36' },
    { size: 'S', chest: '34-36', waist: '26-28', hips: '36-38' },
    { size: 'M', chest: '38-40', waist: '30-32', hips: '40-42' },
    { size: 'L', chest: '42-44', waist: '34-36', hips: '44-46' },
    { size: 'XL', chest: '46-48', waist: '38-40', hips: '48-50' },
    { size: 'XXL', chest: '50-52', waist: '42-44', hips: '52-54' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="size-guide-modal">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl">Size Guide</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-semibold">Size</th>
                  <th className="text-left py-3 font-semibold">Chest (inches)</th>
                  <th className="text-left py-3 font-semibold">Waist (inches)</th>
                  <th className="text-left py-3 font-semibold">Hips (inches)</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="border-b last:border-0">
                    <td className="py-3 font-bold">{row.size}</td>
                    <td className="py-3 text-muted-foreground">{row.chest}</td>
                    <td className="py-3 text-muted-foreground">{row.waist}</td>
                    <td className="py-3 text-muted-foreground">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg space-y-2 text-sm">
            <h4 className="font-semibold">How to Measure</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
              <li><strong>Waist:</strong> Measure around your natural waistline</li>
              <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
