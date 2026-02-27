import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('kleoni_token');
    const userId = localStorage.getItem('kleoni_user_id');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
        const data = await res.json();
        
        if (data.success) {
          const foundOrder = data.data.orders?.find(o => o.id === orderId || o.order_number === orderId);
          setOrder(foundOrder || null);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-4">Order not found</h1>
          <Button onClick={() => navigate('/account')} className="rounded-full">
            View All Orders
          </Button>
        </div>
      </div>
    );
  }

  // Map order status to timeline
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(order.status) >= 0 ? statusOrder.indexOf(order.status) : 0;

  const timeline = [
    { status: 'Order Placed', completed: true, icon: Package },
    { status: 'Order Confirmed', completed: currentStatusIndex >= 1, icon: CheckCircle2 },
    { status: 'Shipped', completed: currentStatusIndex >= 2, icon: Truck },
    { status: 'Out for Delivery', completed: currentStatusIndex >= 3, icon: Truck },
    { status: 'Delivered', completed: currentStatusIndex >= 4 || order.status === 'delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="order-tracking-page">
      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/account?tab=orders')}
          className="mb-6"
        >
          ← Back to Orders
        </Button>

        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
          Track Order
        </h1>
        <p className="font-mono text-muted-foreground mb-8">
          Order #{order.order_number || order.id}
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-secondary/30 rounded-xl">
              <h2 className="font-display font-bold text-xl mb-4">Order Status</h2>
              <div className="space-y-6">
                {timeline.map((step, idx) => {
                  const Icon = step.completed ? step.icon : Circle;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {idx < timeline.length - 1 && (
                          <div className={`w-0.5 h-12 mt-2 ${
                            step.completed ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`font-semibold ${
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-secondary/30 rounded-xl">
              <h2 className="font-display font-bold text-xl mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono">{order.order_number || order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize font-semibold">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">₹{order.total_amount || order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{order.payment_method || 'COD'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-secondary/30 rounded-xl">
              <h2 className="font-display font-bold text-xl mb-4">Delivery Address</h2>
              {order.address_id && (
                <AddressDisplay addressId={order.address_id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressDisplay({ addressId }) {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const userId = localStorage.getItem('kleoni_user_id');
        const res = await fetch(`${API_URL}/addresses/${addressId}`, {
          headers: { 'x-user-id': userId || '', 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          setAddress(data.data.address);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };
    fetchAddress();
  }, [addressId]);

  if (!address) return <p>Loading address...</p>;

  return (
    <div className="space-y-1">
      <p className="font-semibold">{address.name}</p>
      <p className="text-muted-foreground">{address.address_line1}</p>
      {address.address_line2 && <p className="text-muted-foreground">{address.address_line2}</p>}
      <p className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
      <p className="text-muted-foreground">Phone: {address.phone}</p>
    </div>
  );
}
