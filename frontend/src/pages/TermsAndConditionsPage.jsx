import { FileText, ShoppingBag, CreditCard, Truck, RotateCcw, Shield, AlertCircle, RefreshCw, Mail } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="terms-and-conditions-page">
      {/* Hero Section */}
      <section className="bg-secondary/30 py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">Terms and Conditions</h1>
            <p className="text-lg text-muted-foreground">
              Please read these terms carefully before using our website and making purchases.
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
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Introduction</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Kleoniverse. By accessing and using our website, you agree to be bound by 
                these Terms and Conditions. If you do not agree to these terms, please do not use our website. 
                We reserve the right to update these terms at any time without prior notice.
              </p>
            </div>

            {/* Products and Orders */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Products and Orders</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All product listings, prices, and availability are subject to change without notice. 
                We make every effort to display accurate product information, but errors may occur. 
                In the event of a pricing error or product unavailability, we reserve the right to 
                cancel any order placed.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Product images are for illustrative purposes only</li>
                <li>• Colors may vary slightly from what appears on screen</li>
                <li>• We reserve the right to limit quantities per customer</li>
                <li>• Orders are subject to availability confirmation</li>
              </ul>
            </div>

            {/* Payments */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Payments</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All payments must be completed before order processing begins. We accept various payment 
                methods including credit/debit cards and other secure payment options. By providing 
                payment information, you authorize us to charge the specified amount.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Payment must be received in full before shipping</li>
                <li>• All transactions are secure and encrypted</li>
                <li>• Failed payments may result in order cancellation</li>
              </ul>
            </div>

            {/* Shipping */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Shipping and Delivery</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Delivery times may vary depending on your location and the shipping method selected. 
                Free shipping is available for orders above ₹1,500. Standard shipping charges of ₹50 
                apply to orders below this amount.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Estimated delivery time: 5-7 business days</li>
                <li>• International shipping available to select countries</li>
                <li>• Order tracking information will be provided via email</li>
                <li>• Delivery times may be longer during peak seasons</li>
              </ul>
            </div>

            {/* Returns and Exchanges */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Returns and Exchanges</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We want you to be completely satisfied with your purchase. Returns and exchanges may 
                be accepted within 7 days of delivery, subject to the following conditions:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Items must be unused, unwashed, and in original packaging</li>
                <li>• Tags must be attached and intact</li>
                <li>• Proof of purchase is required</li>
                <li>• Return shipping costs may apply</li>
                <li>• Sale items are final sale unless defective</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Intellectual Property</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including images, logos, product designs, graphics, 
                text, and branding, are the intellectual property of Kleoniverse. Unauthorized 
                reproduction, distribution, or use of any content without prior written consent 
                is strictly prohibited.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Limitation of Liability</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kleoniverse shall not be liable for any indirect, incidental, special, or consequential 
                damages arising from the use of our website or purchase of products. This includes:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Loss of profits or revenue</li>
                <li>• Data loss or corruption</li>
                <li>• Personal injury resulting from product use</li>
                <li>• Website downtime or technical issues</li>
              </ul>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl">Changes to Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, update, or replace these Terms and Conditions at any time. 
                Any changes will be effective immediately upon posting to this page. Your continued 
                use of the website after any changes constitutes acceptance of the new terms. We 
                encourage you to review this page periodically to stay informed about our policies.
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
                For any questions or concerns regarding these Terms and Conditions, please contact 
                our customer support team at: <strong>support@kleoniverse.com</strong>
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
