import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { FilterPanel } from '@/components/FilterPanel';
import { SortDropdown } from '@/components/SortDropdown';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function ProductListingPage({ 
  onQuickView, 
  wishlist, 
  onToggleWishlist,
  sort: initialSort
}) {
  const { categoryId } = useParams();
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(() => {
    if (initialSort === 'new') return 'newest';
    return 'popularity';
  });
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const categoryName = categoryId === 'men' ? 'Men' : categoryId === 'women' ? 'Women' : 'All Products';

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products?limit=100`);
        const data = await res.json();
        if (data.success && data.data) {
          setAllProducts(data.data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = categoryId
      ? allProducts.filter(p => p.category === categoryId)
      : allProducts;

    if (filters.categories?.length) {
      filtered = filtered.filter(p => filters.categories.includes(p.subcategory));
    }
    if (filters.sizes?.length) {
      filtered = filtered.filter(p => p.sizes?.some(s => filters.sizes.includes(s)));
    }
    if (filters.colors?.length) {
      filtered = filtered.filter(p => p.colors?.some(c => filters.colors.includes(c)));
    }
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }

    // Sort
    if (sortBy === 'price-low' || sortBy === 'price-low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high' || sortBy === 'price-high-low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest' || sortBy === 'new-arrivals') {
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setDisplayedProducts(filtered.slice(0, page * itemsPerPage));
  }, [categoryId, filters, sortBy, page, allProducts]);

  const hasMore = displayedProducts.length < allProducts.filter(p => 
    !categoryId || p.category === categoryId
  ).length;

  const breadcrumbItems = categoryId
    ? [{ label: categoryName }]
    : [{ label: 'All Products' }];

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="product-listing-page">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
              {categoryName}
            </h1>
            <p className="text-muted-foreground">
              {displayedProducts.length} {displayedProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" className="rounded-full" data-testid="mobile-filter-trigger">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] filter-drawer-blur">
                <FilterPanel filters={filters} onChange={setFilters} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {displayedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={onQuickView}
                      wishlist={wishlist}
                      onToggleWishlist={onToggleWishlist}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => p + 1)}
                      className="rounded-full"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
