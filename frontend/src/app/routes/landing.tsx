import { Link } from 'react-router';
import { Brain, LineChart, MessageSquareText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display text-foreground">MindSync</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to={paths.auth.login.path}>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to={paths.auth.signup.path}>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_50%)] opacity-20" />
          <div className="relative text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Transform Your Journaling Experience with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover patterns, gain insights, and understand yourself better with our AI-powered journaling platform.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link to="/signup">
                <Button size="lg" className="group">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_50%)] opacity-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="group p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-4">AI-Powered Insights</h3>
            <p className="text-muted-foreground">Automatic analysis of your entries for mood, topics, and behavioral patterns.</p>
          </div>
          <div className="group p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <LineChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-4">Interactive Dashboard</h3>
            <p className="text-muted-foreground">Visualize your journey with mood heatmaps and personality insights.</p>
          </div>
          <div className="group p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <MessageSquareText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-4">Smart Journaling</h3>
            <p className="text-muted-foreground">Speech-to-text, auto-drafts, and AI-generated summaries.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;