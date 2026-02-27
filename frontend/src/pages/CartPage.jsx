import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

export default function CartPage({ cart, onUpdateQuantity, onRemoveItem }) {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Filter out invalid cart items (those without price or with NaN)
  const validCart = cart.filter(item => item && typeof item.price === 'number' && !isNaN(item.price) && item.price > 0);
  
  // Update parent if there are invalid items
  useEffect(() => {
    if (validCart.length !== cart.length) {
      // Clear invalid items from localStorage
      localStorage.setItem('kleoniverse_cart', JSON.stringify(validCart));
    }
  }, [validCart.length, cart.length]);

  const subtotal = validCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = subtotal + shipping - discount;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(Math.floor(subtotal * 0.1));
    }
  };

  if (validCart.length === 0) {
    return (
      <div className="min-h-screen pt-20 lg:pt-24" data-testid="cart-page">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-display font-bold text-3xl mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add items to get started</p>
          <Button 
            onClick={() => navigate('/products')}
            className="rounded-full font-bold uppercase tracking-wide"
            size="lg"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="cart-page">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-8">
          Shopping Cart ({validCart.length})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {validCart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6 p-6 bg-secondary/30 rounded-xl">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-32 h-40 object-cover rounded-lg bg-muted cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.size} | {item.color}
                      </p>
                      <p className="font-bold text-xl">₹{item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id, item.size, item.color)}
                      data-testid={`remove-${item.id}`}
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 border rounded-full w-fit mt-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.size, item.color, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-base font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-secondary/30 rounded-xl space-y-6">
              <h2 className="font-display font-bold text-xl">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                )}
                {subtotal < 1500 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{1500 - subtotal} more for free shipping
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Promo Code</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="rounded-full"
                  />
                  <Button 
                    onClick={applyPromo}
                    variant="outline"
                    className="rounded-full font-bold"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Button 
                onClick={() => {
                  const token = localStorage.getItem('kleoni_token');
                  if (!token) {
                    navigate('/login', { state: { from: '/checkout' } });
                  } else {
                    navigate('/checkout');
                  }
                }}
                data-testid="proceed-checkout"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
