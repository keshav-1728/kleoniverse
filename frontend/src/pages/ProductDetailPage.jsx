import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { ShoppingBag, Heart, Truck, RefreshCw, Shield, Ruler, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ProductCard } from '@/components/ProductCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function ProductDetailPage({ 
  onAddToCart, 
  wishlist, 
  onToggleWishlist,
  onQuickView 
}) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/${productId}`);
        const data = await res.json();
        
        if (data.success && data.data && data.data.product) {
          setProduct(data.data.product);
          
          // Fetch related products
          const relatedRes = await fetch(`${API_URL}/products?category=${data.data.product.category}&limit=4`);
          const relatedData = await relatedRes.json();
          if (relatedData.success && relatedData.data) {
            setRelatedProducts(relatedData.data.products.filter(p => p.id !== productId));
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')} className="rounded-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const isInWishlist = wishlist.includes(product.id);
  const discount = product.discount 
    ? Math.round(((product.discount) / (product.price || 1)) * 100)
    : 0;

  // Handle optional fields with defaults
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;
  const productImages = Array.isArray(product.images) ? product.images : product.images ? [product.images] : [];
  const productSizes = Array.isArray(product.sizes) ? product.sizes : product.sizes ? [product.sizes] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const productColors = Array.isArray(product.colors) ? product.colors : product.colors ? [product.colors] : ['Black', 'White', 'Navy', 'Gray', 'Red'];

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
      image: productImages[0]
    });
    toast.success('Added to cart!');
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({
        available: true,
        estimatedDays: Math.floor(Math.random() * 3) + 2,
        cod: true
      });
      toast.success('Delivery available!');
    } else {
      toast.error('Please enter a valid 6-digit pincode');
    }
  };

  const breadcrumbItems = [
    { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: `/category/${product.category}` },
    { label: product.name }
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="product-detail-page">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted relative">
              <img 
                src={productImages[currentImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
            
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImage ? 'border-foreground' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
              {product.brand}
            </p>
            <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mb-4">
              <p className="font-bold text-3xl">₹{product.price}</p>
              {product.discount > 0 && (
                <>
                  <p className="text-xl text-muted-foreground line-through">₹{Math.round(product.price / (1 - product.discount / 100))}</p>
                  <Badge className="bg-accent text-accent-foreground font-bold">
                    {discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm mb-6 pb-6 border-b">
              <span className="font-semibold">★ {rating}</span>
              <span className="text-muted-foreground">({reviews} reviews)</span>
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

            <div className="space-y-6 mb-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Select Size</label>
                  <button 
                    onClick={() => setSizeGuideOpen(true)}
                    data-testid="size-guide-trigger"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-4 h-4" />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      data-testid={`size-option-${size}`}
                      className={`px-5 py-3 rounded-full border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-foreground text-background border-foreground scale-105'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold mb-3 block">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {productColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      data-testid={`color-option-${color}`}
                      className={`px-5 py-3 rounded-full border text-sm font-medium transition-all ${
                        selectedColor === color
                          ? 'bg-foreground text-background border-foreground scale-105'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold mb-3 block">Check Delivery</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    data-testid="pincode-input"
                    className="rounded-full"
                    maxLength={6}
                  />
                  <Button 
                    onClick={checkDelivery}
                    data-testid="check-delivery"
                    variant="outline"
                    className="rounded-full font-bold uppercase tracking-wide"
                  >
                    Check
                  </Button>
                </div>
                {deliveryInfo && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Delivery in {deliveryInfo.estimatedDays}-{deliveryInfo.estimatedDays + 2} days
                    {deliveryInfo.cod && ' • COD Available'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <Button 
                onClick={handleAddToCart}
                data-testid="add-to-cart-pdp"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => onToggleWishlist(product.id)}
                data-testid="wishlist-toggle-pdp"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
              >
                <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? 'fill-accent text-accent' : ''}`} />
                {isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-6 bg-secondary/30 rounded-xl">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Above ₹1500</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7 Days</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Secure Pay</p>
                <p className="text-xs text-muted-foreground">100% Safe</p>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {relatedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
