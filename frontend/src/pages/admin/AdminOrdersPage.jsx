import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  LogOut,
  Menu,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('kleoni_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const fetchOrders = async () => {
    try {
      const url = new URL(`${API_URL}/admin/orders`);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 10);

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      
      console.log('Orders response:', res.status, data);
      
      if (data.success) {
        setOrders(data.data.orders || []);
      } else if (res.status === 403) {
        toast.error('Access denied. Admin only.');
        navigate('/');
      } else {
        toast.error(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Order status updated');
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Package, label: 'Products', path: '/admin/products' },
  ];

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">KLEONI</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => { localStorage.removeItem('kleoni_token'); navigate('/login'); }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Order Management</h1>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order #</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">No orders found</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{order.order_number || order.id.slice(0,8)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {(order.product_names || (order.items && order.items.length > 0)) ? (
                            <div>
                              <p className="text-sm font-medium truncate" title={order.product_names || order.items?.map(i => i.product_name).join(', ')}>
                                {order.product_names || order.items?.map(i => i.product_name).join(', ')}
                              </p>
                              {(order.product_sizes || (order.items && order.items.some(i => i.size))) && (
                                <p className="text-xs text-gray-500">
                                  Size: {order.product_sizes || order.items?.map(i => i.size).join(', ')}
                                </p>
                              )}
                              {(order.product_colors || (order.items && order.items.some(i => i.color))) && (
                                <p className="text-xs text-gray-500">
                                  Color: {order.product_colors || order.items?.map(i => i.color).join(', ')}
                                </p>
                              )}
                              {order.items_count > 1 && (
                                <p className="text-xs text-gray-500">+{order.items_count - 1} more item{order.items_count > 2 ? 's' : ''}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{order.total_amount || order.total}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2">Page {page}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-mono font-medium">{selectedOrder.order_number || selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold">₹{selectedOrder.total_amount || selectedOrder.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="capitalize">{selectedOrder.payment_method || 'COD'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Customer Details</p>
                <p className="font-medium">{selectedOrder.user?.name}</p>
                <p className="text-sm">{selectedOrder.user?.email}</p>
                <p className="text-sm">{selectedOrder.user?.phone}</p>
              </div>

              {selectedOrder.address && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
                  <p className="text-sm">{selectedOrder.address.name}</p>
                  <p className="text-sm">{selectedOrder.address.address_line1}</p>
                  <p className="text-sm">{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Order Items</p>
                
                {/* Display from orders table directly */}
                {selectedOrder.product_names && (
                  <div className="space-y-2 mb-3">
                    <p className="font-medium">{selectedOrder.product_names}</p>
                    {selectedOrder.product_sizes && (
                      <p className="text-sm text-gray-600">Size: {selectedOrder.product_sizes}</p>
                    )}
                    {selectedOrder.product_colors && (
                      <p className="text-sm text-gray-600">Color: {selectedOrder.product_colors}</p>
                    )}
                  </div>
                )}
                
                {/* Also show from order_items table if available */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.product_name || 'Product'} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {(!selectedOrder.product_names && (!selectedOrder.items || selectedOrder.items.length === 0)) && (
                  <p className="text-sm text-gray-400">No items found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
