import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Admin Route Protection Component
 * Checks if user is authenticated and has admin role
 */
export default function AdminRoute({ children }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('kleoni_token');
      
      if (!token) {
        navigate('/login', { state: { from: '/admin' } });
        return;
      }

      try {
        const res = await fetch(`${API_URL}/admin/check`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (data.success && data.data.isAdmin) {
          setIsAdmin(true);
        } else {
          toast.error('Access denied. Admin only.');
          navigate('/');
        }
      } catch (error) {
        console.error('Admin check error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Verifying admin access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}
