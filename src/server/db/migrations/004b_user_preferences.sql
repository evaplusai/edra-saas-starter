ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"email_marketing": false, "email_product": true, "in_app": true}';
