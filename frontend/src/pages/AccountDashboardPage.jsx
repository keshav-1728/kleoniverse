import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, MapPin, User, Plus, Trash2, Edit2, Save, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function AccountDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'orders';
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnForm, setReturnForm] = useState({ reason: '', description: '', order_item_id: '' });
  
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', address_line1: '', city: '', state: '', pincode: '', is_default: false
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('kleoni_token');
    const userId = localStorage.getItem('kleoni_user_id');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  const fetchData = useCallback(async () => {
    try {
      // Fetch profile
      const profileRes = await fetch(`${API_URL}/auth/profile`, { headers: getAuthHeaders() });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setProfile(profileData.data.user);
        setProfileForm({ name: profileData.data.user?.name || '', phone: profileData.data.user?.phone || '' });
      }

      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.data.orders || []);
      }

      // Fetch addresses
      const addrRes = await fetch(`${API_URL}/addresses`, { headers: getAuthHeaders() });
      const addrData = await addrRes.json();
      if (addrData.success) {
        setAddresses(addrData.data.addresses || []);
      }

      // Fetch returns
      const returnsRes = await fetch(`${API_URL}/returns`, { headers: getAuthHeaders() });
      const returnsData = await returnsRes.json();
      if (returnsData.success) {
        setReturns(returnsData.data.returns || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('kleoni_user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchData();
    } else {
      navigate('/login');
    }
  }, [navigate, fetchData]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: profileForm.name, phone: profileForm.phone })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.user);
        localStorage.setItem('kleoni_user', JSON.stringify(data.data.user));
        setEditingProfile(false);
        toast.success('Profile updated!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleSaveAddress = async () => {
    try {
      const url = editingAddress ? `${API_URL}/addresses/${editingAddress}` : `${API_URL}/addresses`;
      const method = editingAddress ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setEditingAddress(null);
        setShowNewAddress(false);
        setAddressForm({ name: '', phone: '', address_line1: '', city: '', state: '', pincode: '', is_default: false });
        toast.success(editingAddress ? 'Address updated!' : 'Address added!');
      } else {
        toast.error(data.message || 'Failed to save address');
      }
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        fetchData();
        toast.success('Address deleted!');
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSubmitReturn = async () => {
    if (!returnForm.reason) {
      toast.error('Please select a reason for return');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/returns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          order_id: selectedOrderForReturn.id,
          order_item_id: returnForm.order_item_id || null,
          reason: returnForm.reason,
          description: returnForm.description
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Return request submitted successfully');
        setShowReturnModal(false);
        setReturnForm({ reason: '', description: '', order_item_id: '' });
        setSelectedOrderForReturn(null);
        fetchData(); // Refresh returns list
      } else {
        toast.error(data.message || 'Failed to submit return request');
      }
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`${API_URL}/addresses/${id}/default`, { method: 'PUT', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        fetchData();
        toast.success('Default address updated!');
      }
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'shipped': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-20 lg:pt-24 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="account-page">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-8">My Account</h1>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="orders"><Package className="w-4 h-4 mr-2" /> Orders</TabsTrigger>
            <TabsTrigger value="returns"><RotateCcw className="w-4 h-4 mr-2" /> Returns</TabsTrigger>
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-4 h-4 mr-2" /> Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet</p>
                <Button onClick={() => navigate('/')} className="mt-4 rounded-full">Start Shopping</Button>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-6 bg-secondary/30 rounded-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`font-semibold capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <img src={item.image || 'https://placehold.co/80x112'} alt={item.name} className="w-20 h-28 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.size} | {item.color}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-bold mt-1">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => navigate(`/order-tracking/${order.id}`)} className="rounded-full">Track Order</Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" onClick={() => {
                        setSelectedOrderForReturn(order);
                        setShowReturnModal(true);
                      }} className="rounded-full">
                        <RotateCcw className="w-4 h-4 mr-2" /> Request Return
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            <h2 className="font-display font-bold text-xl mb-6">My Returns</h2>
            {returns.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No return requests yet</p>
                <p className="text-sm mt-2">You can request a return from your order details</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returns.map((returnItem) => (
                  <div key={returnItem.id} className="p-6 bg-secondary/30 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Return for Order #{returnItem.order?.order_number}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {returnItem.order_item?.product_name}
                        </p>
                        {returnItem.order_item && (
                          <p className="text-xs text-muted-foreground">
                            Size: {returnItem.order_item.size || 'N/A'}, Color: {returnItem.order_item.color || 'N/A'}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        returnItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        returnItem.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        returnItem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        returnItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                        returnItem.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm"><span className="font-medium">Reason:</span> {returnItem.reason}</p>
                      {returnItem.description && (
                        <p className="text-sm mt-2"><span className="font-medium">Description:</span> {returnItem.description}</p>
                      )}
                      <p className="text-sm mt-2 text-muted-foreground">
                        Requested on: {new Date(returnItem.created_at).toLocaleDateString('en-IN')}
                      </p>
                      {returnItem.admin_notes && (
                        <p className="text-sm mt-2 p-2 bg-yellow-50 rounded-lg">
                          <span className="font-medium">Admin Notes:</span> {returnItem.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="p-6 bg-secondary/30 rounded-xl max-w-2xl">
              <h2 className="font-display font-bold text-xl mb-6">Profile Information</h2>
              
              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="rounded-full" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="rounded-full" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={profile?.email || user?.email} disabled className="rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} className="rounded-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)} className="rounded-full"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold">{profile?.name || user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-semibold">{profile?.email || user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-semibold">{profile?.phone || user?.phone || 'Not set'}</p>
                  </div>
                  <Button onClick={() => setEditingProfile(true)} className="rounded-full font-bold uppercase tracking-wide">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="space-y-4 max-w-2xl">
              {showNewAddress || editingAddress ? (
                <div className="p-6 bg-secondary/30 rounded-xl">
                  <h3 className="font-bold mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} className="rounded-full" placeholder="Full Name" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} className="rounded-full" placeholder="Phone Number" />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Input value={addressForm.address_line1} onChange={(e) => setAddressForm({...addressForm, address_line1: e.target.value})} className="rounded-full" placeholder="Street Address" />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="rounded-full" placeholder="City" />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="rounded-full" placeholder="State" />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} className="rounded-full" placeholder="Pincode" />
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})} className="mr-2" id="default" />
                      <Label htmlFor="default">Set as default</Label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSaveAddress} className="rounded-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
                    <Button variant="outline" onClick={() => { setEditingAddress(null); setShowNewAddress(false); }} className="rounded-full"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  {addresses.map(address => (
                    <div key={address.id} className="p-6 bg-secondary/30 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold mb-1">{address.name}</p>
                        </div>
                        {address.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{address.address_line1}</p>
                      <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-sm text-muted-foreground mt-2">{address.phone}</p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
                          setEditingAddress(address.id);
                          setAddressForm({
                            name: address.name,
                            phone: address.phone,
                            address_line1: address.address_line1,
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode,
                            is_default: address.is_default
                          });
                        }}>
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        {!address.is_default && (
                          <>
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleSetDefaultAddress(address.id)}>Set Default</Button>
                            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => handleDeleteAddress(address.id)}><Trash2 className="w-4 h-4" /></Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => setShowNewAddress(true)} className="rounded-full font-bold uppercase tracking-wide">
                    <Plus className="w-4 h-4 mr-2" /> Add New Address
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && selectedOrderForReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request Return</h2>
              <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Order #{selectedOrderForReturn.order_number}
            </p>
            <div className="space-y-4">
              <div>
                <Label>Select Item to Return</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  value={returnForm.order_item_id}
                  onChange={(e) => setReturnForm({...returnForm, order_item_id: e.target.value})}
                >
                  <option value="">Full Order</option>
                  {selectedOrderForReturn.items?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} - {item.size || 'N/A'} / {item.color || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Reason for Return</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Defective Product">Defective Product</option>
                  <option value="Wrong Item Received">Wrong Item Received</option>
                  <option value="Size Doesn't Fit">Size Doesn't Fit</option>
                  <option value="Color Not as Shown">Color Not as Shown</option>
                  <option value="Quality Not as Expected">Quality Not as Expected</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  rows={3}
                  value={returnForm.description}
                  onChange={(e) => setReturnForm({...returnForm, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                />
              </div>
              <Button 
                onClick={handleSubmitReturn}
                className="w-full rounded-full"
                disabled={!returnForm.reason}
              >
                Submit Return Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
