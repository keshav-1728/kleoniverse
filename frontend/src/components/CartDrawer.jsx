import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const CartDrawer = ({ open, onClose, cart, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();
  
  // Filter out invalid cart items (those without price or with NaN)
  const validCart = cart.filter(item => item && typeof item.price === 'number' && !isNaN(item.price) && item.price > 0);
  
  const subtotal = validCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    onClose();
    const token = localStorage.getItem('kleoni_token');
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col" data-testid="cart-drawer">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="font-display font-bold text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({validCart.length})
          </SheetTitle>
        </SheetHeader>

        {validCart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-display font-bold text-lg mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">Add items to get started</p>
            <Button 
              onClick={() => {
                onClose();
                navigate('/products');
              }}
              className="rounded-full"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {validCart.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-28 object-cover rounded-lg bg-muted"
                    />
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.size} | {item.color}</p>
                      <p className="font-bold text-sm mt-1">₹{item.price}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 border rounded-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => onUpdateQuantity(item.id, item.size, item.color, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => onUpdateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onRemoveItem(item.id, item.size, item.color)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {subtotal < 1500 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{1500 - subtotal} more for free shipping
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                data-testid="checkout-button"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
