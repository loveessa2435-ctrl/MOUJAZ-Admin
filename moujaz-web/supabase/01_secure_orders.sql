-- Run once in Supabase SQL Editor, after the original orders table exists.
-- No direct INSERT/UPDATE/DELETE grants to browser clients.
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_moujaz_order(p_order jsonb)
RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user uuid := (select auth.uid());
  v_service text := p_order->>'service';
  v_pages int;
  v_slides int;
  v_delivery text := p_order->>'delivery';
  v_price int;
  v_result public.orders;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF jsonb_typeof(p_order) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid payload'; END IF;
  IF v_service NOT IN ('report','cover','slides2d','excel') OR v_service IS NULL THEN RAISE EXCEPTION 'Service unavailable'; END IF;
  IF coalesce(length(trim(p_order->>'title')),0) NOT BETWEEN 1 AND 250
     OR coalesce(length(trim(p_order->>'student')),0) NOT BETWEEN 1 AND 150
     OR coalesce(length(trim(p_order->>'university')),0) NOT BETWEEN 1 AND 150
     OR coalesce(length(trim(p_order->>'department')),0) NOT BETWEEN 1 AND 150
     OR coalesce(length(trim(p_order->>'subject')),0) NOT BETWEEN 1 AND 150 THEN
     RAISE EXCEPTION 'Missing or invalid required fields';
  END IF;
  IF coalesce(length(p_order->>'notes'),0)>3000 OR coalesce(length(p_order->>'doctor'),0)>150 THEN RAISE EXCEPTION 'Text too long'; END IF;
  IF coalesce(p_order->>'telegram','') !~ '^@?[A-Za-z][A-Za-z0-9_]{4,31}$' THEN RAISE EXCEPTION 'Invalid Telegram username'; END IF;
  IF p_order->>'language' NOT IN ('ar','en') THEN RAISE EXCEPTION 'Invalid language'; END IF;
  IF p_order->>'payment' NOT IN ('zain','asia','master') THEN RAISE EXCEPTION 'Invalid payment'; END IF;
  IF coalesce(p_order->>'pages','') !~ '^[0-9]{1,3}$' OR coalesce(p_order->>'slides','') !~ '^[0-9]{1,3}$' THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  v_pages := (p_order->>'pages')::int;
  v_slides := (p_order->>'slides')::int;
  IF v_pages NOT BETWEEN 10 AND 30 OR v_slides NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Quantity out of range'; END IF;
  IF v_delivery NOT IN ('normal','fast') THEN RAISE EXCEPTION 'Invalid delivery'; END IF;
  v_price := CASE v_service
    WHEN 'report' THEN 5000 + (((greatest(0,v_pages-10)+1)/2)*1000) + (CASE WHEN v_delivery='fast' THEN 2000 ELSE 0 END)
    WHEN 'cover' THEN 2000
    WHEN 'slides2d' THEN v_slides*1000
    ELSE 0 END;
  INSERT INTO public.orders(user_id,order_number,service,title,student_name,university,department,subject,doctor,language,pages,slides,delivery,telegram,notes,price,payment_method,status)
  VALUES(v_user,'MZ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_service,trim(p_order->>'title'),trim(p_order->>'student'),trim(p_order->>'university'),trim(p_order->>'department'),trim(p_order->>'subject'),nullif(trim(p_order->>'doctor'),''),p_order->>'language',v_pages,v_slides,v_delivery,p_order->>'telegram',p_order->>'notes',v_price,p_order->>'payment','pending')
  RETURNING * INTO v_result;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.create_moujaz_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_moujaz_order(jsonb) TO authenticated;
