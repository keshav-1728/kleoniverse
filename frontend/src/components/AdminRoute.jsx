import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Admin Route Protection Component
 * Checks if user is authenticated and has admin role
 */
export default function AdminRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('kleoni_token');
      const userData = localStorage.getItem('kleoni_user');
      
      // Check if we have a token and user data
      if (!token || !userData) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      try {
        // Parse user data to check role
        const user = JSON.parse(userData);
        
        // Check if user is admin from local storage first (faster)
        if (user.role === 'admin') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        
        // Verify token is valid by calling profile API
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        
        if (data.success && data.data.user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          // Token invalid or not admin
          toast.error('Access denied. Admin only.');
          navigate('/');
        }
      } catch (error) {
        console.error('Admin check error:', error);
        // On error, try to check if user exists in localStorage
        const user = JSON.parse(userData || '{}');
        if (user.role === 'admin') {
          setIsAdmin(true);
        } else {
          navigate('/login', { state: { from: location.pathname } });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate, location]);

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
