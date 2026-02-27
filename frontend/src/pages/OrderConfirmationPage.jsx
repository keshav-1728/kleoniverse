import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';
import { fetchOrderById } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      const { success, order: orderData, error: orderError } = await fetchOrderById(orderId);
      
      if (success && orderData) {
        setOrder(orderData);
      } else {
        setError(orderError || 'Order not found');
      }
      
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've received your order and will process it shortly.
          </p>
          <p className="text-sm text-gray-500">
            Order ID: <span className="font-mono font-medium">{order?.id?.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Order Details</h2>
          
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order?.order_items?.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image || '/placeholder.png'} 
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} | Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                  </p>
                  <p className="font-medium mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span>₹{order?.shipping_cost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>₹{order?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
          <div className="text-gray-600">
            <p className="font-medium">{order?.shipping_name}</p>
            <p>{order?.shipping_address}</p>
            <p>{order?.shipping_city}, {order?.shipping_state} - {order?.shipping_pincode}</p>
            <p className="mt-2">Phone: {order?.shipping_phone}</p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Order Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium">Order Placed</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-green-500 w-1/2"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-500">Processing</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-gray-200"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Truck className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-500">Shipped</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-gray-200"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-500">Delivered</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link to={`/order-tracking/${orderId}`}>
            <Button>Track Order</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
