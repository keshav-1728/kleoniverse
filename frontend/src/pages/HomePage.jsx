import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { categories, heroSlides } from '@/data/mockData';
import { ArrowRight, Leaf, Award, Truck, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export default function HomePage({ 
  onQuickView, 
  wishlist, 
  onToggleWishlist 
}) {
  const navigate = useNavigate();
  const [currentHero, setCurrentHero] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.get('/products?limit=8');
        if (response.success && response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(0, 4);
  const bestSellers = products.slice(0, 4);

  // Shop by Style data
  const styleCategories = [
    {
      id: 'streetwear',
      name: 'Streetwear',
      description: 'Urban essentials',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Clean lines, timeless',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'athletic',
      name: 'Athletic',
      description: 'Movement & comfort',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    },
  ];

  // Occasion data
  const occasionCategories = [
    {
      id: 'office',
      name: 'Office Ready',
      description: 'Elevated everyday',
      image: 'https://images.unsplash.com/photo-1605763240004-7e93b172d754?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'weekend',
      name: 'Weekend Vibes',
      description: 'Casual comfort',
      image: 'https://images.unsplash.com/photo-1529139574466-a302d20525a4?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'nightout',
      name: 'Night Out',
      description: 'Make a statement',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(300px,auto)]">
            <div 
              className="md:col-span-8 md:row-span-2 relative overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => navigate('/products')}
              style={{
                backgroundImage: `url(${heroSlides[0].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '600px'
              }}
            >
              <div className="hero-gradient-overlay absolute inset-0" />
              <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 text-white">
                <p className="text-sm uppercase tracking-widest mb-2 font-medium">
                  {heroSlides[0].subtitle}
                </p>
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6 max-w-2xl">
                  {heroSlides[0].title}
                </h1>
                <Button 
                  size="lg" 
                  data-testid="hero-cta"
                  className="rounded-full font-bold uppercase tracking-wide w-fit bg-white text-black hover:bg-white/90"
                >
                  {heroSlides[0].cta} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            <div 
              className="md:col-span-4 relative overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => navigate('/category/men')}
              style={{
                backgroundImage: `url(${categories[0].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '300px'
              }}
            >
              <div className="hero-gradient-overlay absolute inset-0" />
              <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <h3 className="font-display font-bold text-2xl tracking-tight mb-2">
                  {categories[0].name}
                </h3>
                <p className="text-sm opacity-90">Explore Collection</p>
              </div>
            </div>

            <div 
              className="md:col-span-4 relative overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => navigate('/category/women')}
              style={{
                backgroundImage: `url(${categories[1].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '300px'
              }}
            >
              <div className="hero-gradient-overlay absolute inset-0" />
              <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <h3 className="font-display font-bold text-2xl tracking-tight mb-2">
                  {categories[1].name}
                </h3>
                <p className="text-sm opacity-90">Explore Collection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Bar */}
      <section className="py-8 px-4 lg:px-8 bg-secondary/30 border-y border-border/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sustainable</p>
                <p className="text-xs text-muted-foreground">Eco-friendly materials</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders above ₹2000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Premium Quality</p>
                <p className="text-xs text-muted-foreground">Crafted to last</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category - Improved */}
      <section className="py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
                Shop by Category
              </h2>
              <p className="text-muted-foreground">Find what you're looking for</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="rounded-full font-bold uppercase tracking-wide"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                  index === 0 ? 'md:row-span-2 min-h-[400px]' : 'min-h-[200px]'
                }`}
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="hero-gradient-overlay absolute inset-0" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <h3 className="font-display font-bold text-3xl lg:text-4xl text-white tracking-tight mb-3">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.subcategories.slice(0, 4).map((sub) => (
                      <span 
                        key={sub} 
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-full w-fit bg-white text-black hover:bg-white/90"
                  >
                    Shop Now <ArrowRight className="ml-2 w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Style */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-secondary/30">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-4">
              Shop by Style
            </h2>
            <p className="text-muted-foreground">Curated for every mood</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {styleCategories.map((style) => (
              <div
                key={style.id}
                onClick={() => navigate(`/search?style=${style.id}`)}
                className="relative overflow-hidden rounded-2xl cursor-pointer group aspect-[4/5]"
              >
                <img 
                  src={style.image} 
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="hero-gradient-overlay absolute inset-0" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
                    {style.name}
                  </h3>
                  <p className="text-sm text-white/80 mb-4">{style.description}</p>
                  <span className="inline-flex items-center text-sm font-bold text-white">
                    Explore <ArrowRight className="ml-1 w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
                New Arrivals
              </h2>
              <p className="text-muted-foreground">Fresh drops for the season</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/new-arrivals')}
              className="rounded-full font-bold uppercase tracking-wide"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-secondary/30">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
                Best Sellers
              </h2>
              <p className="text-muted-foreground">Most loved by our community</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="rounded-full font-bold uppercase tracking-wide"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {bestSellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Occasion */}
      <section className="py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-4">
              Shop by Occasion
            </h2>
            <p className="text-muted-foreground">Perfect for every moment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {occasionCategories.map((occasion) => (
              <div
                key={occasion.id}
                onClick={() => navigate(`/search?occasion=${occasion.id}`)}
                className="relative overflow-hidden rounded-2xl cursor-pointer group aspect-[16/9]"
              >
                <img 
                  src={occasion.image} 
                  alt={occasion.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="hero-gradient-overlay absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center">
                    <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
                      {occasion.name}
                    </h3>
                    <p className="text-sm text-white/80">{occasion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-black text-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-6">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-medium">Sustainability First</span>
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-5xl tracking-tight mb-6">
                Fashion That <br/>
                <span className="text-accent">Respects the Planet</span>
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-lg">
                Every piece is crafted from organic and recycled materials. 
                We believe in sustainable fashion that doesn't compromise on style.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-xl bg-white/10">
                  <p className="font-display font-bold text-3xl mb-1">100%</p>
                  <p className="text-sm opacity-80">Organic Cotton</p>
                </div>
                <div className="p-4 rounded-xl bg-white/10">
                  <p className="font-display font-bold text-3xl mb-1">50%</p>
                  <p className="text-sm opacity-80">Less Water Usage</p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/our-story')}
                className="rounded-full font-bold uppercase tracking-wide bg-white text-primary hover:bg-white/90"
              >
                Our Sustainability Journey <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop"
                alt="Sustainable Fashion"
                className="rounded-2xl shadow-float"
              />
              <div className="absolute -bottom-6 -left-6 p-6 bg-background rounded-xl shadow-float">
                <p className="font-mono text-xs text-muted-foreground mb-1">CERTIFIED</p>
                <p className="font-bold text-lg">GOTS Organic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-secondary/50 px-6 py-12 lg:py-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-4">
                Join the <span className="text-primary">Kleoniverse</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Get early access to new drops, exclusive offers, and style inspiration delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 h-12 px-4 rounded-full border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="rounded-full font-bold uppercase tracking-wide px-8"
                >
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-secondary/30">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight mb-2">
                Trending Now
              </h2>
              <p className="text-muted-foreground">What everyone's wearing</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="rounded-full font-bold uppercase tracking-wide"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {trendingProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brand CTA */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-foreground text-background">
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className="font-display font-bold text-3xl lg:text-5xl tracking-tight mb-6">
            Where Luxury Meets the Pavement
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            Premium streetwear for the digital generation. Sustainable, unapologetic, and grounded in authenticity.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/our-story')}
            className="rounded-full font-bold uppercase tracking-wide bg-background text-foreground hover:bg-background/90"
          >
            Explore Our Story <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
