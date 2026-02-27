import { Search, ShoppingBag, User, Menu, Heart, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = ({ cartCount = 0, onCartOpen, wishlistCount = 0, isAuthenticated = false, user = null, onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { label: 'Men', path: '/category/men' },
    { label: 'Women', path: '/category/women' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Sale', path: '/sale' },
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-soft transition-all duration-300"
      data-testid="navbar"
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-6 lg:gap-10">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger" className="hover:bg-secondary">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-background">
                <nav className="flex flex-col gap-6 mt-8">
                  {menuItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-semibold hover:text-primary transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="font-display font-bold text-xl lg:text-2xl tracking-tight hover:opacity-80 transition-opacity">
              KLEONIVERSE
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group py-1"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                  className="pl-10 w-56 lg:w-64 rounded-full bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
            </form>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/search')}
              className="md:hidden hover:bg-secondary"
              data-testid="search-icon-mobile"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/wishlist')}
              data-testid="wishlist-icon"
              className="relative hover:bg-secondary"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartOpen}
              data-testid="cart-icon"
              className="relative hover:bg-secondary"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  data-testid="account-icon"
                  className="hover:bg-secondary"
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
