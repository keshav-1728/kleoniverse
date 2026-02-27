import { X, ShoppingBag, Heart } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const QuickViewModal = ({ open, onClose, product, onAddToCart, wishlist = [], onToggleWishlist }) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  
  if (!product) return null;

  const isInWishlist = wishlist.includes(product.id);
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    onAddToCart({
      ...product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      image: product.images[0]
    });
    toast.success('Added to cart!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0" data-testid="quick-view-modal">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative bg-muted">
            <img 
              src={product.images[currentImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImage ? 'bg-background w-6' : 'bg-background/50'
                    }`}
                  />
                ))}
              </div>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold">
                NEW
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold">
                {discount}% OFF
              </Badge>
            )}
          </div>

          <div className="p-8 flex flex-col">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                {product.brand}
              </p>
              <h2 className="font-display font-bold text-2xl mb-4">{product.name}</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <p className="font-bold text-2xl">₹{product.price}</p>
                {product.originalPrice && (
                  <p className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm mb-6">
                <span className="font-semibold">★ {product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <p className="text-sm text-muted-foreground mb-6">{product.description}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        data-testid={`size-${size}`}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Select Color</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        data-testid={`color-${color}`}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedColor === color
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                data-testid="add-to-cart-quick"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => onToggleWishlist(product.id)}
                  data-testid="wishlist-toggle-quick"
                  className="flex-1 rounded-full font-bold uppercase tracking-wide"
                  size="lg"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-accent text-accent' : ''}`} />
                  {isInWishlist ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.id}`);
                  }}
                  className="flex-1 rounded-full font-bold uppercase tracking-wide"
                  size="lg"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
