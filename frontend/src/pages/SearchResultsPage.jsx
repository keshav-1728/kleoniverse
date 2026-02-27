import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { SortDropdown } from '@/components/SortDropdown';
import { products } from '@/data/mockData';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchResultsPage({ 
  onQuickView, 
  wishlist, 
  onToggleWishlist 
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [sortBy, setSortBy] = useState('popularity');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      let filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

      if (sortBy === 'price-low-high') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high-low') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      setResults(filtered);
    }
  }, [query, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="search-results-page">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input-page"
              className="pl-12 h-14 rounded-full text-lg"
            />
          </div>
        </form>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
              Search Results
            </h1>
            {query && (
              <p className="text-muted-foreground">
                {results.length} results for "{query}"
              </p>
            )}
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {results.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-display font-bold text-2xl mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-display font-bold text-2xl mb-2">Start Searching</h2>
            <p className="text-muted-foreground">Enter a keyword to find products</p>
          </div>
        )}
      </div>
    </div>
  );
}
