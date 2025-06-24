set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
free_plan_id UUID;
free_plan_credits INTEGER; -- Variable to hold credits from the free plan
BEGIN
-- Get the free plan ID and credits per month
SELECT id, credits_per_month INTO free_plan_id, free_plan_credits
FROM subscription_plans
WHERE name = 'Basic'
LIMIT 1;

-- Ensure the free plan exists
IF free_plan_id IS NULL THEN
  RAISE EXCEPTION 'Free plan not found in subscription_plans table.';
END IF;

-- Create user credits record
-- Initialize credits_subscription with free plan credits, credits_purchase to 0
-- Initialize credits_used_this_month to 0
-- Set both last_reset dates to NOW()
INSERT INTO user_credits (
  user_id,
  credits_subscription,
  credits_purchase,
  credits_used_this_month,
  last_reset_subscription_date
) VALUES (
  NEW.id,
  free_plan_credits, -- Initial subscription credits from Free plan
  0,                -- No purchased credits initially
  0,                 -- No credits used yet
  NOW()             -- Set subscription reset date to now
);

-- Create initial credit transaction record for the bonus
-- Using 'bonus' type from the transaction_type_enum
INSERT INTO credit_transactions (
  user_id,
  amount,
  type,
  description
) VALUES (
  NEW.id,
  free_plan_credits, -- Amount is the free plan credits
  'monthly_reset',           -- Using 'bonus' type
  'Initial free credits from Free plan subscription' -- Updated description
);

-- Create default subscription (free plan)
-- status defaults to 'active'
-- current_period_start and end calculated based on NOW()
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status, -- 'active' is the default, but explicitly setting is fine
  current_period_start,
  current_period_end
) VALUES (
  NEW.id,
  free_plan_id,
  'active',
  NOW(),
  NOW() + INTERVAL '1 month' -- Assuming monthly billing cycle for free plan
);

RETURN NEW;
END;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_user();


