import { motion } from 'framer-motion';
import {
  Shield,
  CreditCard,
  LayoutDashboard,
  Users,
  Zap,
  Lock,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const features = [
  {
    icon: Shield,
    title: 'Authentication',
    description:
      'Secure login, signup, and password reset flows with JWT tokens and role-based access control.',
  },
  {
    icon: CreditCard,
    title: 'Billing & Subscriptions',
    description:
      'Stripe integration with checkout, subscription management, and usage-based pricing support.',
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    description:
      'Full-featured admin panel with user management, analytics, and activity monitoring.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description:
      'Multi-tenant support with team invitations, role assignments, and organization settings.',
  },
  {
    icon: Zap,
    title: 'API Keys',
    description:
      'Generate and manage API keys with scoping, rate limiting, and usage tracking built in.',
  },
  {
    icon: Lock,
    title: 'Security First',
    description:
      'CSRF protection, rate limiting, input validation, and security headers configured by default.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to launch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop rebuilding the same features. Start with a solid foundation and
            focus on what makes your product unique.
          </p>
        </div>

        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="h-full">
                <CardHeader>
                  <feature.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
