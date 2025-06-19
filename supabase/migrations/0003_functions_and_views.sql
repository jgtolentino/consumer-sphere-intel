-- Migration 0003: Add database functions and views for analytics
-- These functions support the dashboard analytics and data processing

-- Function: Get dashboard summary metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_transactions', COUNT(t.id),
        'total_revenue', COALESCE(SUM(t.total_amount), 0),
        'avg_transaction_value', COALESCE(AVG(t.total_amount), 0),
        'unique_customers', COUNT(DISTINCT t.customer_age || t.customer_gender),
        'active_stores', COUNT(DISTINCT t.store_id),
        'period_start', start_date,
        'period_end', end_date
    ) INTO result
    FROM public.transactions t
    WHERE t.created_at >= start_date AND t.created_at <= end_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get category mix analytics
CREATE OR REPLACE FUNCTION public.get_category_mix()
RETURNS TABLE(
    category VARCHAR,
    total_value NUMERIC,
    total_quantity BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH category_stats AS (
        SELECT 
            p.category,
            SUM(ti.total_price) as total_value,
            SUM(ti.quantity) as total_quantity
        FROM public.transaction_items ti
        JOIN public.products p ON ti.product_id = p.id
        GROUP BY p.category
    ),
    totals AS (
        SELECT SUM(total_value) as grand_total
        FROM category_stats
    )
    SELECT 
        cs.category,
        cs.total_value,
        cs.total_quantity,
        CASE 
            WHEN t.grand_total > 0 THEN ROUND((cs.total_value / t.grand_total * 100), 2)
            ELSE 0
        END as percentage
    FROM category_stats cs
    CROSS JOIN totals t
    ORDER BY cs.total_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get brand performance analytics
CREATE OR REPLACE FUNCTION public.get_brand_performance()
RETURNS TABLE(
    brand_name VARCHAR,
    category VARCHAR,
    total_revenue NUMERIC,
    total_transactions BIGINT,
    avg_transaction_value NUMERIC,
    market_share NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH brand_stats AS (
        SELECT 
            b.name as brand_name,
            b.category,
            SUM(ti.total_price) as total_revenue,
            COUNT(DISTINCT ti.transaction_id) as total_transactions,
            AVG(ti.total_price) as avg_transaction_value
        FROM public.transaction_items ti
        JOIN public.products p ON ti.product_id = p.id
        JOIN public.brands b ON p.brand_id = b.id
        GROUP BY b.id, b.name, b.category
    ),
    totals AS (
        SELECT SUM(total_revenue) as grand_total
        FROM brand_stats
    )
    SELECT 
        bs.brand_name,
        bs.category,
        bs.total_revenue,
        bs.total_transactions,
        bs.avg_transaction_value,
        CASE 
            WHEN t.grand_total > 0 THEN ROUND((bs.total_revenue / t.grand_total * 100), 2)
            ELSE 0
        END as market_share
    FROM brand_stats bs
    CROSS JOIN totals t
    ORDER BY bs.total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get regional performance
CREATE OR REPLACE FUNCTION public.get_regional_performance()
RETURNS TABLE(
    region VARCHAR,
    total_revenue NUMERIC,
    total_transactions BIGINT,
    avg_transaction_value NUMERIC,
    unique_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.store_location as region,
        SUM(t.total_amount) as total_revenue,
        COUNT(t.id) as total_transactions,
        AVG(t.total_amount) as avg_transaction_value,
        COUNT(DISTINCT t.customer_age || t.customer_gender) as unique_customers
    FROM public.transactions t
    WHERE t.store_location IS NOT NULL
    GROUP BY t.store_location
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get product substitution patterns
CREATE OR REPLACE FUNCTION public.get_substitution_patterns()
RETURNS TABLE(
    original_product VARCHAR,
    substitute_product VARCHAR,
    substitution_count BIGINT,
    avg_confidence NUMERIC,
    reason substitution_reason
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.name as original_product,
        ps.name as substitute_product,
        COUNT(s.id) as substitution_count,
        AVG(s.confidence_score) as avg_confidence,
        s.reason
    FROM public.substitutions s
    JOIN public.products po ON s.original_product_id = po.id
    JOIN public.products ps ON s.substitute_product_id = ps.id
    GROUP BY po.name, ps.name, s.reason
    ORDER BY substitution_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get time series data for charts
CREATE OR REPLACE FUNCTION public.get_time_series_data(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    date DATE,
    transaction_count BIGINT,
    total_revenue NUMERIC,
    avg_transaction_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.created_at::DATE as date,
        COUNT(t.id) as transaction_count,
        SUM(t.total_amount) as total_revenue,
        AVG(t.total_amount) as avg_transaction_value
    FROM public.transactions t
    WHERE t.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY t.created_at::DATE
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get customer insights
CREATE OR REPLACE FUNCTION public.get_customer_insights()
RETURNS TABLE(
    age_group VARCHAR,
    gender VARCHAR,
    customer_count BIGINT,
    avg_spent NUMERIC,
    avg_visits NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN c.age < 25 THEN '18-24'
            WHEN c.age < 35 THEN '25-34'
            WHEN c.age < 45 THEN '35-44'
            WHEN c.age < 55 THEN '45-54'
            ELSE '55+'
        END as age_group,
        c.gender,
        COUNT(c.id) as customer_count,
        AVG(c.total_spent) as avg_spent,
        AVG(c.visit_count) as avg_visits
    FROM public.customers c
    GROUP BY age_group, c.gender
    ORDER BY customer_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create materialized view for fast dashboard loading
CREATE MATERIALIZED VIEW public.dashboard_metrics AS
SELECT 
    COUNT(t.id) as total_transactions,
    SUM(t.total_amount) as total_revenue,
    AVG(t.total_amount) as avg_transaction_value,
    COUNT(DISTINCT t.store_id) as active_stores,
    COUNT(DISTINCT p.category) as unique_categories,
    COUNT(DISTINCT b.id) as unique_brands,
    MAX(t.created_at) as last_transaction_date
FROM public.transactions t
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
LEFT JOIN public.products p ON ti.product_id = p.id
LEFT JOIN public.brands b ON p.brand_id = b.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Create index on materialized view
CREATE UNIQUE INDEX idx_dashboard_metrics_refresh ON public.dashboard_metrics ((1));

-- Function to refresh dashboard metrics
CREATE OR REPLACE FUNCTION public.refresh_dashboard_metrics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(DATE, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_mix() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_brand_performance() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_regional_performance() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_substitution_patterns() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_time_series_data(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_insights() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_metrics() TO service_role;

-- Grant select on materialized view
GRANT SELECT ON public.dashboard_metrics TO anon, authenticated;