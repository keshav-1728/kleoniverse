import { Shield, Lock, Eye, Cookie, User, Mail, Phone, MapPin, CreditCard, ShoppingBag, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="privacy-policy-page">
      {/* Hero Section */}
      <section className="bg-secondary/30 py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-muted-foreground leading-relaxed">
                At Kleoniverse, we value your privacy and are committed to protecting your personal information. 
                This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit 
                our website and make purchases from our store.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Information We Collect</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                We may collect the following types of information:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Name</strong> - Your full name for order processing and communication</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Email Address</strong> - For order confirmations, updates, and marketing communications</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Phone Number</strong> - For order-related communications and delivery updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Shipping Address</strong> - For delivering your orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Billing Information</strong> - For payment processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Order History</strong> - To process returns and provide customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Device and Browsing Data</strong> - IP address, browser type, and usage patterns</span>
                </li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">How We Use Your Information</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                The information we collect is used for the following purposes:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary mt-0.5" />
                  <span>Processing and fulfilling your orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <span>Delivering products to your specified address</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <span>Communicating order updates, shipping notifications, and promotional offers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-0.5" />
                  <span>Improving our website experience and customer service</span>
                </li>
                <li className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <span>Providing personalized support and handling inquiries</span>
                </li>
              </ul>
            </div>

            {/* Sharing of Information */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Sharing of Information</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                We <strong>do not sell</strong> your personal information to third parties. 
                Your data may only be shared with:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Payment Providers</strong> - To process your transactions securely</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Shipping Partners</strong> - To deliver your orders to your address</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Service Providers</strong> - Essential third parties required to operate our store</span>
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We implement reasonable security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. This includes SSL encryption for data transmission 
                and secure storage of your information. However, no method of transmission over the Internet is 
                100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Cookies</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience. Cookies are small data files stored on your 
                device that help us remember your preferences, analyze website traffic, and improve our services. 
                You can choose to disable cookies through your browser settings, though this may affect certain 
                features of our website.
              </p>
            </div>

            {/* User Rights */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Your Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to request access to, correction of, or deletion of your personal data. 
                You may also opt-out of marketing communications at any time. To exercise these rights or 
                request updates to your personal information, please contact our customer support team.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Contact Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our data practices, 
                please contact our support team at: <strong>support@kleoniverse.com</strong>
              </p>
            </div>

            {/* Last Updated */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Last Updated:</strong> February 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
