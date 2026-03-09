import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'https://kleoniverse-backend.onrender.com/api/v1';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('kleoni_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const url = new URL(`${API_URL}/admin/users`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 10);

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      
      if (data.success) {
        // Normalize users for MongoDB _id field
        const normalizedUsers = (data.data.users || []).map(user => ({
          ...user,
          id: user._id || user.id
        }));
        setUsers(normalizedUsers);
      } else if (res.status === 403) {
        toast.error('Access denied. Admin only.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('User role updated');
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Package, label: 'Products', path: '/admin/products' },
  ];

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

      {/* Main content - full width */}
      <div className="w-full">
        <div className="p-6 lg:p-8">
          <h1 className="text-2xl font-bold mb-6">User Management</h1>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Orders</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.totalOrders || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
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
      </div>
    </div>
  );
}
