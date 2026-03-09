import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WishlistPage({ 
  wishlist, 
  onToggleWishlist, 
  onQuickView 
}) {
  const navigate = useNavigate();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="wishlist-page">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8" />
          <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">
            My Wishlist
          </h1>
          <span className="text-muted-foreground">({wishlistProducts.length})</span>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-display font-bold text-2xl mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save your favorite items here</p>
            <Button 
              onClick={() => navigate('/products')}
              className="rounded-full font-bold uppercase tracking-wide"
              size="lg"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {wishlistProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
