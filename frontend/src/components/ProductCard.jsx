import { Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ProductCard = ({ product, onQuickView, wishlist = [], onToggleWishlist }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  
  // Handle both array and single ID wishlist
  const isInWishlist = Array.isArray(wishlist) 
    ? wishlist.includes(product.id)
    : false;
    
  // Calculate discount from backend data
  const discount = product.discount || 0;
  const originalPrice = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : null;

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Get images array - handle both string and array formats
  const images = Array.isArray(product.images) ? product.images : product.images ? [product.images] : [];
  const currentImg = images[currentImage] || images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

  return (
    <div 
      className="group relative flex flex-col gap-3 cursor-pointer"
      data-testid={`product-card-${product.id}`}
    >
      <div 
        className="aspect-[3/4] overflow-hidden rounded-xl bg-muted relative shadow-card hover:shadow-card-hover transition-shadow duration-300"
        onMouseEnter={() => images[1] && setCurrentImage(1)}
        onMouseLeave={() => setCurrentImage(0)}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={currentImg} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        
        {product.isNew && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold text-xs">
            NEW
          </Badge>
        )}
        
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-bold text-xs">
            {discount}% OFF
          </Badge>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          data-testid={`quick-view-${product.id}`}
          className="quick-view-btn absolute inset-x-4 bottom-4 mx-auto w-full max-w-[200px] h-11 bg-background/95 backdrop-blur-sm rounded-full flex items-center justify-center gap-2 font-semibold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <Eye className="w-4 h-4" />
          Quick View
        </button>
      </div>

      <button
        onClick={handleWishlistToggle}
        data-testid={`wishlist-toggle-${product.id}`}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-soft hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Heart 
          className={`w-5 h-5 transition-colors duration-200 ${isInWishlist ? 'fill-accent text-accent' : 'text-foreground'}`}
        />
      </button>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {product.brand || 'Kleoniverse'}
        </p>
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="font-bold text-lg text-foreground">₹{product.price?.toLocaleString('en-IN') || '0'}</p>
          {originalPrice && (
            <p className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">★ {product.rating}</span>
            {product.reviews && <span>({product.reviews})</span>}
          </div>
        )}
      </div>
    </div>
  );
};
