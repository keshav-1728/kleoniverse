import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_META = {
  title: 'Kleoni Verse - Premium Fashion & Lifestyle Brand in India',
  description: 'Discover the latest fashion trends at Kleoni Verse. Shop premium clothing, accessories, and lifestyle products. Free shipping across India. 100% authentic quality.',
  image: 'https://kleoniverse.com/images/og-image.jpg',
  url: 'https://kleoniverse.com',
};

export function SEO({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  product,
  breadcrumbs 
}) {
  const location = useLocation();
  
  // Combine with defaults
  const fullTitle = title ? `${title} | Kleoni Verse` : DEFAULT_META.title;
  const fullDescription = description || DEFAULT_META.description;
  const fullImage = image || DEFAULT_META.image;
  const fullUrl = url || `${DEFAULT_META.url}${location.pathname}`;
  
  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    updateMetaTag('meta[name="description"]', 'name', 'description', fullDescription);
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', getKeywords(type));
    
    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', fullDescription);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', fullImage);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', fullUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    
    // Update Twitter tags
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', fullDescription);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', fullImage);
    updateMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', fullUrl);
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;
    
    // Update structured data
    updateStructuredData(type, product, breadcrumbs);
    
  }, [fullTitle, fullDescription, fullImage, fullUrl, type, product, breadcrumbs]);
  
  return null; // This component doesn't render anything
}

// Helper function to update meta tags
function updateMetaTag(selector, attribute, name, content) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

// Get keywords based on page type
function getKeywords(type) {
  const baseKeywords = 'fashion, clothing, online shopping, premium wear, India, Kleoni Verse';
  
  switch (type) {
    case 'product':
      return `${baseKeywords}, buy clothes, designer wear, fashion online`;
    case 'category':
      return `${baseKeywords}, category, shop by style, ethnic wear`;
    case 'article':
      return `${baseKeywords}, blog, fashion tips, style guide`;
    default:
      return baseKeywords;
  }
}

// Update structured data (JSON-LD)
function updateStructuredData(type, product, breadcrumbs) {
  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-dynamic]');
  existingScripts.forEach(script => script.remove());
  
  let schema;
  
  switch (type) {
    case 'product':
      if (product) {
        schema = generateProductSchema(product);
      }
      break;
    case 'breadcrumb':
      if (breadcrumbs) {
        schema = generateBreadcrumbSchema(breadcrumbs);
      }
      break;
    default:
      // Keep the default organization and website schemas from index.html
      return;
  }
  
  if (schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

// Generate Product Schema
function generateProductSchema(product) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name || '',
    "description": product.description || '',
    "image": product.images || [],
    "sku": product.id || '',
    "brand": {
      "@type": "Brand",
      "name": "Kleoni Verse"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://kleoniverse.com/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price || 0,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Kleoni Verse"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "4.5",
      "reviewCount": product.reviewCount || "100"
    }
  };
}

// Generate Breadcrumb Schema
function generateBreadcrumbSchema(breadcrumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}

export default SEO;
