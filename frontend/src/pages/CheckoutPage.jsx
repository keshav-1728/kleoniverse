import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MapPin, Lock, Plus, Loader2 } from 'lucide-react';
import { saveAddress, createOrder } from '@/services/supabaseService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function CheckoutPage({ cart, onLogin, setCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Add new address form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });
  
  // Login/Signup forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('kleoni_token');
    const userId = localStorage.getItem('kleoni_user_id');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  useEffect(() => {
    const token = localStorage.getItem('kleoni_token');
    const userData = localStorage.getItem('kleoni_user');
    let userId = localStorage.getItem('kleoni_user_id');
    
    // If no user_id stored but we have user data, get id from user object
    if (!userId && userData) {
      const parsed = JSON.parse(userData);
      userId = parsed?.id;
      if (userId) localStorage.setItem('kleoni_user_id', userId);
    }
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/addresses`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data.addresses || []);
        // Select default address
        const defaultAddr = data.data.addresses?.find(a => a.is_default);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('kleoni_token', data.data.session.access_token);
        localStorage.setItem('kleoni_refresh_token', data.data.session.refresh_token);
        localStorage.setItem('kleoni_user_id', data.data.session.user_id);
        localStorage.setItem('kleoni_user', JSON.stringify(data.data.user));
        setIsAuthenticated(true);
        setUser(data.data.user);
        fetchAddresses();
        toast.success('Logged in successfully!');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, password: signupPassword, name: signupName, phone: signupPhone })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Account created! Please login.');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    // Validate mandatory fields
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    setSavingAddress(true);
    try {
      // Use backend API directly
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAddress)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Address saved successfully!');
        setShowAddAddress(false);
        setNewAddress({
          name: '',
          phone: '',
          email: '',
          address: '',
          apartment: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          isDefault: false,
        });
        // Refresh addresses
        fetchAddresses();
        // Select the new address
        if (data.data?.address) {
          setSelectedAddress(data.data.address.id);
        }
      } else {
        toast.error(data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    
    setPlacingOrder(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          address_id: selectedAddress,
          payment_method: paymentMethod,
          items: validCart.map(item => ({
            product_id: item.id,
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order placed successfully!');
        
        // Clear cart in backend
        try {
          await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
        } catch (e) {
          console.log('Cart clear error:', e);
        }
        
        // Clear cart - update both local state and localStorage
        setCart([]);
        localStorage.setItem('kleoniverse_cart', JSON.stringify([]));
        if (onLogin) onLogin([]);
        setTimeout(() => {
          navigate('/account?tab=orders');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Filter out invalid cart items (those without price or with NaN)
  const validCart = cart.filter(item => item && typeof item.price === 'number' && !isNaN(item.price) && item.price > 0);
  
  const subtotal = validCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = paymentMethod === 'cod' ? 50 : (subtotal > 1500 ? 0 : 50);
  const total = subtotal + shipping;

  // Redirect if cart is empty (after filtering invalid items)
  if (validCart.length === 0) {
    // Clear any invalid cart data
    setCart([]);
    localStorage.setItem('kleoniverse_cart', JSON.stringify([]));
    navigate('/cart');
    return null;
  }

  // Show login/signup if not authenticated
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 lg:pt-24" data-testid="checkout-page">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="p-6 bg-secondary/30 rounded-xl text-center mb-6">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h2 className="font-display font-bold text-xl mb-2">Login Required</h2>
            <p className="text-muted-foreground">Please login or create an account to complete your order</p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 p-6 bg-secondary/30 rounded-xl">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="rounded-full" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="rounded-full" />
                </div>
                <Button type="submit" className="w-full rounded-full font-bold uppercase">Login</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 p-6 bg-secondary/30 rounded-xl">
                <div>
                  <Label>Name</Label>
                  <Input value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="rounded-full" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="rounded-full" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="rounded-full" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required className="rounded-full" />
                </div>
                <Button type="submit" className="w-full rounded-full font-bold uppercase">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full mt-4">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="checkout-page">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-secondary/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl"><MapPin className="w-5 h-5 inline mr-2" />1. Delivery Address</h2>
                {step > 1 && <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit</Button>}
              </div>
              
              {step === 1 ? (
                <div className="space-y-4">
                  {addresses.length === 0 && !showAddAddress ? (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground mb-4">No addresses saved</p>
                      <Button onClick={() => setShowAddAddress(true)} className="rounded-full">
                        <Plus className="w-4 h-4 mr-2" /> Add New Address
                      </Button>
                    </div>
                  ) : showAddAddress ? (
                    <form onSubmit={handleSaveAddress} className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-semibold mb-4">Add New Address</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            placeholder="9876543210"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newAddress.email}
                            onChange={(e) => setNewAddress({...newAddress, email: e.target.value})}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="address">Street Address *</Label>
                          <Input
                            id="address"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            placeholder="123 Main Street"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="apartment">Apartment/ Landmark (Optional)</Label>
                          <Input
                            id="apartment"
                            value={newAddress.apartment}
                            onChange={(e) => setNewAddress({...newAddress, apartment: e.target.value})}
                            placeholder="Apt 4B, Near Mall"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            placeholder="Mumbai"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            placeholder="Maharashtra"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Postal Code *</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                            placeholder="400001"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            value={newAddress.country}
                            onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                            placeholder="India"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                        />
                        <Label htmlFor="isDefault" className="text-sm">Set as default address</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={savingAddress} className="rounded-full">
                          {savingAddress && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save Address
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddAddress(false)} className="rounded-full">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <Button onClick={() => setShowAddAddress(true)} variant="outline" className="rounded-full">
                        <Plus className="w-4 h-4 mr-2" /> Add New Address
                      </Button>
                      <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map(addr => (
                        <div key={addr.id} className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : ''}`}>
                          <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                          <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                            <p className="font-semibold">{addr.name} {addr.is_default && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-2">DEFAULT</span>}</p>
                            <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                          </Label>
                        </div>
                      ))}
                      </RadioGroup>
                    </>
                  )}
                  
                  {selectedAddress && (
                    <Button 
                      onClick={() => setStep(2)}
                      data-testid="continue-to-payment"
                      className="rounded-full font-bold uppercase tracking-wide"
                    >
                      Continue to Payment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {addresses.find(a => a.id === selectedAddress) && (
                    <p>Delivering to {addresses.find(a => a.id === selectedAddress).city}, {addresses.find(a => a.id === selectedAddress).pincode}</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-secondary/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl">2. Payment Method</h2>
                {step > 2 && <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Edit</Button>}
              </div>
              {step >= 2 ? (
                <div className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="prepaid" id="prepaid" />
                      <Label htmlFor="prepaid" className="flex-1 cursor-pointer">
                        <p className="font-semibold">Card / UPI / Net Banking</p>
                        <p className="text-xs text-muted-foreground">Pay online securely</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                      </Label>
                    </div>
                  </RadioGroup>
                  {step === 2 && (
                    <Button onClick={() => setStep(3)} className="rounded-full font-bold uppercase tracking-wide">
                      Continue to Review
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Complete address to proceed</div>
              )}
            </div>

            <div className="p-6 bg-secondary/30 rounded-xl">
              <h2 className="font-display font-bold text-xl mb-4">3. Review Order</h2>
              {step >= 3 ? (
                <div className="space-y-4">
                  {validCart.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-28 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.size} | {item.color}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-bold text-sm mt-1">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    onClick={handlePlaceOrder}
                    data-testid="place-order"
                    className="w-full rounded-full font-bold uppercase tracking-wide"
                    size="lg"
                    disabled={placingOrder}
                  >
                    {placingOrder ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Complete payment to proceed</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-secondary/30 rounded-xl space-y-4">
              <h2 className="font-display font-bold text-xl">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({validCart.length})</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
