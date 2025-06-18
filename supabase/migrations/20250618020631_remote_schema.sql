drop trigger if exists "on_auth_user_created" on "public"."profiles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  free_plan_id UUID := '207cd634-648a-44a3-982a-5605ef25fb7c'::UUID;
  free_plan_credits INTEGER;
  profile_id UUID;
BEGIN
  -- First, create the profile record
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at,
    NEW.created_at
  )
  RETURNING id INTO profile_id;

  -- Get the credits per month for the known free plan
  SELECT credits_per_month INTO free_plan_credits
  FROM public.subscription_plans
  WHERE id = free_plan_id AND is_active = true;

  -- If plan not found or not active, use default credits
  IF free_plan_credits IS NULL THEN
    free_plan_credits := 50; -- Default free credits
  END IF;

  -- Create user credits record using profile_id
  INSERT INTO public.user_credits (
    user_id,
    credits_subscription,
    credits_purchase,
    credits_used_this_month,
    last_reset_subscription_date
  ) VALUES (
    profile_id,
    free_plan_credits,
    0,
    0,
    NOW()::date
  );

  -- Create initial credit transaction record using profile_id
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    profile_id,
    free_plan_credits,
    'subscription_grant',
    'Initial free credits from Basic plan subscription'
  );

  -- Create default subscription (free plan) using profile_id
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    profile_id,
    free_plan_id,
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RAISE;
END;
$function$
;


