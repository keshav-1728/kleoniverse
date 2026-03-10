export const categories = [
  {
    id: 'men',
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Shirts', 'Pants', 'Jackets', 'Shoes']
  },
  {
    id: 'women',
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Tops', 'Dresses', 'Bottoms', 'Shoes']
  }
];

export const products = [
  {
    id: 'prod-1',
    name: 'Organic Cotton Tee',
    brand: 'Kleoniverse',
    price: 2499,
    originalPrice: 3499,
    category: 'men',
    subcategory: 'Shirts',
    images: [
      'https://images.unsplash.com/photo-1550246140-29f40b90ea27?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Black', 'Bone'],
    rating: 4.5,
    reviews: 128,
    description: 'Premium organic cotton with a relaxed fit. Perfect for everyday wear.',
    isNew: true,
    inStock: true
  },
  {
    id: 'prod-2',
    name: 'Heritage Denim Jacket',
    brand: 'Kleoniverse',
    price: 5999,
    originalPrice: 7999,
    category: 'men',
    subcategory: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo', 'Black'],
    rating: 4.8,
    reviews: 89,
    description: 'Classic denim with modern details. Timeless style.',
    isNew: false,
    inStock: true
  },
  {
    id: 'prod-5',
    name: 'Oversized Hoodie',
    brand: 'Kleoniverse',
    price: 3999,
    originalPrice: 4999,
    category: 'men',
    subcategory: 'Shirts',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Sage', 'Charcoal', 'Cream'],
    rating: 4.9,
    reviews: 312,
    description: 'Streetwear staple. Premium heavyweight cotton.',
    isNew: true,
    inStock: true
  },
  {
    id: 'prod-6',
    name: 'Tailored Wide-Leg Pants',
    brand: 'Kleoniverse',
    price: 4499,
    originalPrice: null,
    category: 'women',
    subcategory: 'Bottoms',
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c809a10?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Camel', 'Navy'],
    rating: 4.4,
    reviews: 67,
    description: 'Elegant silhouette with modern cut. Office to evening.',
    isNew: false,
    inStock: true
  },
  {
    id: 'prod-8',
    name: 'Ribbed Knit Dress',
    brand: 'Kleoniverse',
    price: 5499,
    originalPrice: null,
    category: 'women',
    subcategory: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Oat', 'Moss', 'Charcoal'],
    rating: 4.7,
    reviews: 156,
    description: 'Cozy meets chic. Form-flattering silhouette.',
    isNew: false,
    inStock: true
  }
];

export const heroSlides = [
  {
    id: 1,
    title: 'Where Luxury Meets the Pavement',
    subtitle: 'New Season Collection',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
    cta: 'Shop Now'
  },
  {
    id: 2,
    title: 'Organic. Unapologetic.',
    subtitle: 'Sustainable Streetwear',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
    cta: 'Explore'
  }
];

export const mockUser = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex@kleoniverse.com',
  phone: '+91 98765 43210',
  addresses: [
    {
      id: 'addr-1',
      type: 'home',
      name: 'Alex Morgan',
      phone: '+91 98765 43210',
      addressLine1: '123 Green Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true
    }
  ]
};

export const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    items: [
      {
        productId: 'prod-1',
        name: 'Organic Cotton Tee',
        size: 'M',
        color: 'Olive',
        quantity: 2,
        price: 2499,
        image: 'https://images.unsplash.com/photo-1550246140-29f40b90ea27?q=80&w=600&auto=format&fit=crop'
      }
    ],
    total: 4998,
    shippingAddress: mockUser.addresses[0],
    trackingNumber: 'TRK123456789'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    items: [
      {
        productId: 'prod-2',
        name: 'Heritage Denim Jacket',
        size: 'L',
        color: 'Indigo',
        quantity: 1,
        price: 5999,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop'
      }
    ],
    total: 5999,
    shippingAddress: mockUser.addresses[0],
    trackingNumber: 'TRK987654321'
  }
];
