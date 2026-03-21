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
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'https://kleoniverse-backend.onrender.com/api/v1';

// Predefined options for product attributes
const SIZE_OPTIONS = ['Free Size', 'One Size', '28', '30', '32', '34', '36', '38', '40', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

const COLOR_OPTIONS = [
  'Black', 'White', 'Navy', 'Blue', 'Red', 'Green', 'Grey', 'Brown', 
  'Pink', 'Purple', 'Orange', 'Yellow', 'Beige', 'Maroon', 'Olive', 'Cream',
  'Peach', 'Mauve', 'Multicolor'
];

const SUBCATEGORY_OPTIONS = {
  men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Sweaters', 'Kurta', 'Shorts', 'Co-ord Sets'],
  women: ['Tops', 'Dresses', 'Jeans', 'Skirts', 'Jackets', 'Hoodies', 'Sweaters', 'Kurtas', 'Leggings', 'Co-ord Sets']
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'men',
    subcategory: '',
    price: '',
    discount: '',
    stock: '',
    sizes: [],
    colors: [],
    imageUrls: ['']
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('kleoni_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, search, page]);

  const fetchProducts = async () => {
    try {
      const url = new URL(`${API_URL}/admin/products`);
      if (categoryFilter) url.searchParams.append('category', categoryFilter);
      if (search) url.searchParams.append('search', search);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 10);

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      
      if (data.success) {
        // Normalize product data to handle different field names from backend
        const normalizedProducts = data.data.products.map(product => ({
          ...product,
          // Handle price field mapping (backend may return basePrice)
          price: product.basePrice || product.price,
          // Handle status field (backend sends 'active'/'inactive', frontend expects is_active)
          is_active: product.status === 'active',
          // Also keep status for reference
          status: product.status || 'active'
        }));
        setProducts(normalizedProducts);
      } else if (res.status === 403) {
        toast.error('Access denied. Admin only.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty image URLs
    const images = formData.imageUrls.filter(url => url.trim() !== '');
    
    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory || null,
      base_price: parseFloat(formData.price),
      discount: parseFloat(formData.discount) || 0,
      stock: parseInt(formData.stock) || 0,
      sizes: formData.sizes,
      colors: formData.colors,
      images: images
    };

    try {
      const url = editingProduct 
        ? `${API_URL}/admin/products/${editingProduct.id}`
        : `${API_URL}/admin/products`;
      
      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          name: '', description: '', category: 'men', subcategory: '', price: '', 
          discount: '', stock: '', sizes: [], colors: [], imageUrls: ['']
        });
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'men',
      subcategory: product.subcategory || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '',
      stock: product.stock?.toString() || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      imageUrls: product.images && product.images.length > 0 ? product.images : ['']
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete product');
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Product Management</h1>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-xs"
            />
            <select
              className="px-4 py-2 border rounded-lg"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unifit">Unifit</option>
            </select>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">No products found</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">{product.category}</td>
                      <td className="px-6 py-4">₹{product.price}</td>
                      <td className="px-6 py-4">{product.discount || 0}%</td>
                      <td className="px-6 py-4">
                        <span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
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

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <Button variant="ghost" onClick={() => { setShowModal(false); setEditingProduct(null); }}>✕</Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unifit">Unifit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subcategory</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  >
                    <option value="">Select Subcategory</option>
                    {(SUBCATEGORY_OPTIONS[formData.category] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <Input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Discount (%)</label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sizes</label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-4 gap-2">
                  {SIZE_OPTIONS.map(size => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, sizes: [...formData.sizes, size]});
                          } else {
                            setFormData({...formData, sizes: formData.sizes.filter(s => s !== size)});
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Colors</label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.colors.includes(color)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, colors: [...formData.colors, color]});
                          } else {
                            setFormData({...formData, colors: formData.colors.filter(c => c !== color)});
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (Multiple)</label>
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.imageUrls];
                        newUrls[index] = e.target.value;
                        setFormData({...formData, imageUrls: newUrls});
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    {formData.imageUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newUrls = formData.imageUrls.filter((_, i) => i !== index);
                          setFormData({...formData, imageUrls: newUrls});
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({...formData, imageUrls: [...formData.imageUrls, '']})}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Image
                </Button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Or Upload Images from System</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        // Convert files to data URLs and add to imageUrls
                        files.forEach((file, index) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({
                              ...prev,
                              imageUrls: [...prev.imageUrls, reader.result]
                            }));
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
                {formData.imageUrls.some(url => url.startsWith('data:')) && (
                  <p className="text-xs text-green-600 mt-2">✓ {formData.imageUrls.filter(url => url.startsWith('data:')).length} image(s) uploaded</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
