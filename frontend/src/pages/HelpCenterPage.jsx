import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Clock, Phone, Package, RotateCcw, Headphones, ChevronRight, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpCenterPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    orderId: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission - UI only
    setFormSubmitted(true);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
  };

  const quickLinks = [
    {
      icon: Package,
      title: 'Shipping',
      description: 'Delivery timelines & tracking',
      href: '#shipping'
    },
    {
      icon: RotateCcw,
      title: 'Returns',
      description: 'Return policy & refunds',
      href: '#returns'
    },
    {
      icon: Headphones,
      title: 'Support',
      description: 'Contact our team',
      href: '#support'
    }
  ];

  const shippingFAQs = [
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-7 business days. Express delivery (where available) takes 1-3 business days. Orders are processed within 24-48 hours.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS. You can also track your order by logging into your account.'
    },
    {
      question: 'What are the shipping charges?',
      answer: 'Shipping is FREE on orders above ₹3,000. For orders below ₹3,000, a flat shipping charge of ₹150 applies.'
    },
    {
      question: 'Is Cash on Delivery available?',
      answer: 'Yes! Cash on Delivery (COD) is available for most locations. A nominal COD fee of ₹50 applies to all COD orders.'
    }
  ];

  const returnsFAQs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for most items. Products must be unused, with all tags attached, and in original packaging.'
    },
    {
      question: 'How do I initiate a return?',
      answer: 'Go to My Account > Orders > Select the order > Click "Return Item". Fill in the details and our team will arrange a pickup.'
    },
    {
      question: 'How long does refund processing take?',
      answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.'
    },
    {
      question: 'What items cannot be returned?',
      answer: 'Innerwear, swimwear, and cosmetics are not eligible for return due to hygiene reasons. Sale items are final sale unless defective.'
    }
  ];

  return (
    <div className="min-h-screen" data-testid="help-center-page">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 lg:px-8 bg-secondary/30">
        <div className="max-w-[1600px] mx-auto text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            Help & Support
          </h1>
          <p className="text-lg text-muted-foreground">
            We're here to help you.
          </p>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="group p-6 lg:p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-foreground/5 hover:border-foreground/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <link.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">
                  {link.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {link.description}
                </p>
                <div className="flex items-center text-primary font-medium text-sm">
                  Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Section */}
      <section id="shipping" className="py-16 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">
              Shipping Information
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-secondary/30">
                <h3 className="font-bold text-lg mb-3">Delivery Timeline</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Standard Delivery: 3-7 business days</li>
                  <li>• Express Delivery: 1-3 business days</li>
                  <li>• Order Processing: 24-48 hours</li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/30">
                <h3 className="font-bold text-lg mb-3">Shipping Charges</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Free shipping on orders above ₹3,000</li>
                  <li>• ₹150 for orders below ₹3,000</li>
                  <li>• COD charge: ₹50 per order</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {shippingFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`shipping-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Returns & Refund Section */}
      <section id="returns" className="py-16 px-4 lg:px-8 bg-secondary/30">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">
              Returns & Refunds
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-background">
                <h3 className="font-bold text-lg mb-3">Return Policy</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 7-day return window</li>
                  <li>• Items must be unused with tags attached</li>
                  <li>• Original packaging required</li>
                  <li>• Free pickup for returns</li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-background">
                <h3 className="font-bold text-lg mb-3">Refund Timeline</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Processing: 5-7 business days</li>
                  <li>• Credit to original payment method</li>
                  <li>• Bank transfer takes additional 2-3 days</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {returnsFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`returns-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Support Section */}
      <section id="support" className="py-16 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">
              Customer Support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-secondary/30">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-3">
                For general inquiries
              </p>
              <a 
                href="mailto:support@kleoniverse.com" 
                className="text-primary font-medium hover:underline"
              >
                support@kleoniverse.com
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Support Hours</h3>
              <p className="text-muted-foreground text-sm mb-3">
                We're available
              </p>
              <p className="font-medium">
                Mon - Sat, 10AM - 7PM
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30">
              <Phone className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Call Us</h3>
              <p className="text-muted-foreground text-sm mb-3">
                For urgent assistance
              </p>
              <p className="font-medium">
                +91 98765 43210
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="p-8 lg:p-12 rounded-2xl bg-secondary/30">
              <h3 className="font-display font-bold text-2xl mb-6 text-center">
                Send us a Message
              </h3>
              
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-xl mb-2">Message Sent!</h4>
                  <p className="text-muted-foreground mb-6">
                    We'll get back to you within 24 hours.
                  </p>
                  <Button 
                    onClick={() => setFormSubmitted(false)}
                    variant="outline"
                    className="rounded-full"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        placeholder="Your name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        placeholder="your@email.com"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="orderId">Order ID (Optional)</Label>
                    <Input 
                      id="orderId"
                      value={contactForm.orderId}
                      onChange={(e) => setContactForm({...contactForm, orderId: e.target.value})}
                      placeholder="e.g., ORD-123456"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="How can we help you?"
                      required
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full rounded-full font-bold uppercase tracking-wide"
                  >
                    Send Message <Send className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
