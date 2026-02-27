import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const statusOptions = ['pending', 'approved', 'rejected', 'completed', 'refunded'];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = statusFilter 
        ? `${API_URL}/api/v1/admin/returns?status=${statusFilter}`
        : `${API_URL}/api/v1/admin/returns`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setReturns(data.data.returns || []);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch returns',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedReturn) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/admin/returns/${selectedReturn.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes,
          refund_amount: refundAmount ? parseFloat(refundAmount) : null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Return status updated successfully'
        });
        setSelectedReturn(null);
        setAdminNotes('');
        setRefundAmount('');
        fetchReturns();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update return status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating return:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">All Status</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Returns Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Return ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Refund Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-4 text-center">No returns found</td></tr>
              ) : (
                returns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">
                      {returnItem.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{returnItem.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{returnItem.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{returnItem.order_item?.product_name || returnItem.order?.order_number}</p>
                        {returnItem.order_item && (
                          <p className="text-xs text-gray-500">
                            Size: {returnItem.order_item.size || 'N/A'}, Color: {returnItem.order_item.color || 'N/A'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm max-w-xs truncate" title={returnItem.reason}>
                        {returnItem.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(returnItem.refund_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(returnItem.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedReturn(returnItem);
                          setAdminNotes(returnItem.admin_notes || '');
                          setRefundAmount(returnItem.refund_amount?.toString() || '');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Return Request Details</h2>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <p><span className="text-gray-500">Name:</span> {selectedReturn.user?.full_name || 'N/A'}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedReturn.user?.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedReturn.user?.phone || 'N/A'}</p>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <p><span className="text-gray-500">Order Number:</span> {selectedReturn.order?.order_number || 'N/A'}</p>
                  <p><span className="text-gray-500">Order Total:</span> {formatCurrency(selectedReturn.order?.total_amount)}</p>
                  <p><span className="text-gray-500">Order Date:</span> {formatDate(selectedReturn.order?.created_at)}</p>
                </div>

                {/* Product Info */}
                {selectedReturn.order_item && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Product Information</h3>
                    <p><span className="text-gray-500">Product:</span> {selectedReturn.order_item.product_name}</p>
                    <p><span className="text-gray-500">Size:</span> {selectedReturn.order_item.size || 'N/A'}</p>
                    <p><span className="text-gray-500">Color:</span> {selectedReturn.order_item.color || 'N/A'}</p>
                    <p><span className="text-gray-500">Quantity:</span> {selectedReturn.order_item.quantity}</p>
                    <p><span className="text-gray-500">Price:</span> {formatCurrency(selectedReturn.order_item.price)}</p>
                  </div>
                )}

                {/* Return Reason */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Return Reason</h3>
                  <p className="text-lg font-medium">{selectedReturn.reason}</p>
                  {selectedReturn.description && (
                    <p className="text-gray-600 mt-2">{selectedReturn.description}</p>
                  )}
                </div>

                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <span className={`px-3 py-2 rounded-lg font-medium ${getStatusColor(selectedReturn.status)}`}>
                    {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                  </span>
                </div>

                {/* Refund Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter refund amount"
                  />
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Add notes about this return request"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedReturn.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={updating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Approve Return
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={updating}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject Return
                      </button>
                    </>
                  )}
                  {selectedReturn.status === 'approved' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('completed')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('refunded')}
                        disabled={updating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        Process Refund
                      </button>
                    </>
                  )}
                  {selectedReturn.status === 'completed' && (
                    <button
                      onClick={() => handleStatusUpdate('refunded')}
                      disabled={updating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
