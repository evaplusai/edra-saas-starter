CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  stripe_price_id VARCHAR(100) UNIQUE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  price INTEGER NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Seed default plans
INSERT INTO subscription_plans (name, stripe_price_id, tier, price, features) VALUES
  ('Free', NULL, 'free', 0, ARRAY['5 projects', '1 GB storage', 'Community support']),
  ('Pro', 'price_pro_monthly', 'pro', 2900, ARRAY['Unlimited projects', '100 GB storage', 'Priority support', 'Advanced analytics', 'Custom integrations']),
  ('Enterprise', 'price_enterprise_monthly', 'enterprise', 9900, ARRAY['Unlimited everything', '1 TB storage', 'Dedicated support', 'SSO & SAML', 'Custom contracts', 'SLA guarantee']);
