import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Heart, Star } from 'lucide-react';

export default function OurStoryPage() {
  const navigate = useNavigate();

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '50+', label: 'Exclusive Drops' },
    { value: '25+', label: 'Countries Shipped' },
    { value: '4.9', label: 'Rating' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Authenticity',
      description: 'We stay true to our roots. No shortcuts, no compromises. Every piece tells a real story.',
    },
    {
      icon: Sparkles,
      title: 'Creativity',
      description: 'Innovation is our DNA. We push boundaries to create what\'s next in streetwear.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We\'re more than a brand. We\'re a movement of dreamers, creators, and rebels.',
    },
    {
      icon: Star,
      title: 'Quality',
      description: 'Premium materials, expert craftsmanship. Built to last, designed to turn heads.',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="our-story-page">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90 font-medium">
            Our Journey
          </p>
          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6">
            More Than Fashion.
            <br />
            <span className="text-primary-foreground/90">A Movement.</span>
          </h1>
          <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Born from the streets, built for the bold. Kleoniverse is where underground culture meets high fashion.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/products')}
            className="rounded-full font-bold uppercase tracking-wide bg-white text-black hover:bg-white/90"
          >
            Explore Collection <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Brand Origin Section */}
      <section className="py-24 lg:py-32 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
              <img 
                src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop"
                alt="Kleoniverse Origin Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">
                The Beginning
              </p>
              <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight mb-6">
                Born on the Streets
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Kleoniverse started in 2021 when a group of friends wanted something different. 
                Not the mass-produced fashion flooding every store. Not the overpriced "luxury" that lost its soul.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We wanted streetwear that spoke truth. That made a statement without saying a word. 
                That connected with the generation that grew up online but values what's real.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, Kleoniverse is more than a brand—it's a cultural statement. A collective of 
                artists, musicians, creators, and dreamers who believe fashion is the ultimate form of self-expression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24 lg:py-32 px-4 lg:px-8 bg-secondary/30">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">
              What Drives Us
            </p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight">
              Vision & Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-background p-8 lg:p-12 rounded-2xl border border-foreground/5 hover:border-foreground/10 transition-colors">
              <h3 className="font-display font-bold text-2xl lg:text-3xl mb-4">
                Our Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the defining voice of Gen-Z streetwear—bridging the gap between 
                underground culture and mainstream fashion. We envision a world where everyone 
                can express their true self through what they wear, without compromise.
              </p>
            </div>
            <div className="bg-background p-8 lg:p-12 rounded-2xl border border-foreground/5 hover:border-foreground/10 transition-colors">
              <h3 className="font-display font-bold text-2xl lg:text-3xl mb-4">
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                To create premium, sustainable streetwear that resonates with the digital generation. 
                Every piece we make is designed to empower individuality, celebrate creativity, 
                and build a community of unapologetic self-expression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 lg:py-32 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">
              Our Foundation
            </p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight">
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group p-6 lg:p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 border border-transparent hover:border-foreground/10"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl lg:text-2xl mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community/Culture Section */}
      <section className="py-24 lg:py-32 px-4 lg:px-8 bg-black text-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop"
                      alt="Community 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop"
                      alt="Community 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1550246140-29f40b909ea2?q=80&w=600&auto=format&fit=crop"
                      alt="Community 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
                      alt="Community 4"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/70 mb-4 font-semibold">
                The Culture
              </p>
              <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight mb-6">
                More Than a Brand. A Community.
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Kleoniverse isn't just about what you wear—it's about who you are. Our community 
                is made up of artists, musicians, creators, and dreamers from every corner of the globe.
              </p>
              <p className="text-lg text-white/80 mb-12 leading-relaxed">
                We don't just sell clothes. We curate experiences. We celebrate individuality. 
                We create a space where everyone belongs.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-display font-bold text-3xl lg:text-4xl text-primary-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-primary rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10">
              <h2 className="font-display font-bold text-4xl lg:text-6xl tracking-tight mb-6 text-white">
                Ready to Make a Statement?
              </h2>
              <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join the movement. Express yourself. Be unapologetically you.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/products')}
                className="rounded-full font-bold uppercase tracking-wide bg-white text-primary hover:bg-white/90 px-10 py-6 text-lg"
              >
                Shop Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
