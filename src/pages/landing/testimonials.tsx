import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    quote:
      'Edra saved us months of development time. We launched our product in weeks instead of months.',
    name: 'Sarah Chen',
    title: 'CTO at LaunchPad',
    avatar: '',
    initials: 'SC',
  },
  {
    quote:
      'The authentication and billing integrations work flawlessly out of the box. Exactly what we needed.',
    name: 'Marcus Johnson',
    title: 'Founder of DevTools Inc',
    avatar: '',
    initials: 'MJ',
  },
  {
    quote:
      'Best SaaS starter kit I have used. Clean code, great architecture, and excellent documentation.',
    name: 'Aisha Patel',
    title: 'Lead Engineer at ScaleUp',
    avatar: '',
    initials: 'AP',
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

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by developers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what builders are saying about Edra.
          </p>
        </div>

        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={cardVariants}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <blockquote className="text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar>
                      {testimonial.avatar && (
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                      )}
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
