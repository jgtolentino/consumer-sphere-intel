-- Migration 0004: Seed data for TBWA clients and initial setup
-- Insert initial data for brands, stores, and sample products

-- Insert TBWA client brands
INSERT INTO public.brands (name, category, is_tbwa) VALUES
('JTI', 'Tobacco', true),
('Alaska', 'Dairy & Beverages', true),
('Oishi', 'Snacks', true),
('Del Monte', 'Food Products', true),
('Peerless', 'Beverages', true);

-- Insert competitor brands for substitution analysis
INSERT INTO public.brands (name, category, is_tbwa) VALUES
('Nestle', 'Dairy & Beverages', false),
('Philip Morris', 'Tobacco', false),
('Ricoa', 'Snacks', false),
('CDO', 'Food Products', false),
('Zesto', 'Beverages', false);

-- Insert sample stores across Philippine regions
INSERT INTO public.stores (name, location, region, city, barangay, latitude, longitude) VALUES
('SM Mall of Asia', 'Pasay City, Metro Manila', 'National Capital Region', 'Pasay', 'Barangay 76', 14.5353, 120.9823),
('Ayala Center Cebu', 'Cebu City, Cebu', 'Central Visayas', 'Cebu City', 'Lahug', 10.3181, 123.9017),
('SM City Davao', 'Davao City, Davao del Sur', 'Davao Region', 'Davao City', 'Buhangin', 7.0924, 125.6131),
('Robinsons Place Manila', 'Manila, Metro Manila', 'National Capital Region', 'Manila', 'Malate', 14.5764, 120.9962),
('SM City Baguio', 'Baguio City, Benguet', 'Cordillera Administrative Region', 'Baguio', 'Burnham Park', 16.4023, 120.5960);

-- Insert TBWA client products
INSERT INTO public.products (name, category, brand_id, sku, unit_price) VALUES
-- JTI Products
('JTI Winston Red', 'Tobacco', 1, 'JTI-WIN-RED', 150.00),
('JTI Mevius', 'Tobacco', 1, 'JTI-MEV-BLU', 160.00),
('JTI Camel', 'Tobacco', 1, 'JTI-CAM-YEL', 145.00),

-- Alaska Products  
('Alaska Milk', 'Dairy & Beverages', 2, 'ALA-MILK-1L', 89.00),
('Alaska Condensada', 'Dairy & Beverages', 2, 'ALA-COND-300G', 45.00),
('Alaska Crema', 'Dairy & Beverages', 2, 'ALA-CREM-154ML', 25.00),

-- Oishi Products
('Oishi Prawn Crackers', 'Snacks', 3, 'OIS-PRAWN-60G', 15.00),
('Oishi Smart C+', 'Snacks', 3, 'OIS-SMARTC-200ML', 12.00),
('Oishi Pillows', 'Snacks', 3, 'OIS-PILL-38G', 18.00),

-- Del Monte Products
('Del Monte Corned Beef', 'Food Products', 4, 'DEL-CORN-175G', 85.00),
('Del Monte Italian Style', 'Food Products', 4, 'DEL-ITAL-250G', 42.00),
('Del Monte Tomato Sauce', 'Food Products', 4, 'DEL-TOM-250G', 28.00),

-- Peerless Products
('Peerless Orange', 'Beverages', 5, 'PEE-ORA-200ML', 8.00),
('Peerless Apple', 'Beverages', 5, 'PEE-APP-200ML', 8.00),
('Peerless Lemon', 'Beverages', 5, 'PEE-LEM-200ML', 8.00);

-- Insert competitor products for substitution patterns
INSERT INTO public.products (name, category, brand_id, sku, unit_price) VALUES
-- Nestle Products (Alaska competitors)
('Nestle Bear Brand', 'Dairy & Beverages', 6, 'NES-BEAR-300ML', 92.00),
('Nestle All Purpose Cream', 'Dairy & Beverages', 6, 'NES-APC-250ML', 48.00),

-- Philip Morris Products (JTI competitors)  
('Philip Morris Marlboro', 'Tobacco', 7, 'PM-MARL-RED', 155.00),
('Philip Morris Parliament', 'Tobacco', 7, 'PM-PARL-BLU', 165.00),

-- Ricoa Products (Oishi competitors)
('Ricoa Kracks', 'Snacks', 8, 'RIC-KRAC-65G', 16.00),
('Ricoa Curls', 'Snacks', 8, 'RIC-CURL-50G', 14.00),

-- CDO Products (Del Monte competitors)
('CDO Corned Beef', 'Food Products', 9, 'CDO-CORN-150G', 82.00),
('CDO Meat Loaf', 'Food Products', 9, 'CDO-MEAT-150G', 38.00),

-- Zesto Products (Peerless competitors)
('Zesto Orange', 'Beverages', 10, 'ZES-ORA-200ML', 7.50),
('Zesto Apple', 'Beverages', 10, 'ZES-APP-200ML', 7.50);

-- Insert sample customers
INSERT INTO public.customers (customer_id, name, age, gender, region, city, barangay, loyalty_tier, total_spent, visit_count) VALUES
('CUST-001', 'Juan Dela Cruz', 28, 'Male', 'National Capital Region', 'Manila', 'Tondo', 'silver', 1250.00, 5),
('CUST-002', 'Maria Santos', 34, 'Female', 'Central Visayas', 'Cebu City', 'Lahug', 'gold', 2100.00, 8),
('CUST-003', 'Pedro Rodriguez', 42, 'Male', 'Davao Region', 'Davao City', 'Poblacion', 'regular', 850.00, 3),
('CUST-004', 'Ana Garcia', 25, 'Female', 'National Capital Region', 'Quezon City', 'Diliman', 'platinum', 3200.00, 12),
('CUST-005', 'Carlos Reyes', 55, 'Male', 'Cordillera Administrative Region', 'Baguio', 'Session Road', 'silver', 1680.00, 6);

-- Insert sample devices for edge computing
INSERT INTO public.devices (device_id, device_name, store_id, device_type, status) VALUES
('POS-001-MOA', 'Main Counter POS', 1, 'pos', 'online'),
('POS-002-MOA', 'Self-Service Kiosk', 1, 'kiosk', 'online'),
('CAM-001-CEB', 'Product Detection Camera', 2, 'camera', 'online'),
('POS-001-DAV', 'Checkout Terminal', 3, 'pos', 'online'),
('IOT-001-MAN', 'Smart Shelf Sensor', 4, 'sensor', 'maintenance');

-- Insert sample substitution patterns (TBWA → Competitor)
INSERT INTO public.substitutions (original_product_id, substitute_product_id, reason, confidence_score) VALUES
(4, 16, 'price_sensitive', 0.85),  -- Alaska Milk → Nestle Bear Brand
(1, 18, 'out_of_stock', 0.92),    -- JTI Winston → Philip Morris Marlboro
(7, 20, 'brand_preference', 0.78), -- Oishi Prawn Crackers → Ricoa Kracks
(10, 22, 'recommendation', 0.88),  -- Del Monte Corned Beef → CDO Corned Beef
(13, 25, 'price_sensitive', 0.83); -- Peerless Orange → Zesto Orange

-- Create function to generate sample transaction data
CREATE OR REPLACE FUNCTION public.generate_sample_transactions(num_transactions INTEGER DEFAULT 100)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_customer_id INTEGER;
    random_store_id INTEGER;
    random_product_id INTEGER;
    random_quantity INTEGER;
    transaction_id INTEGER;
BEGIN
    FOR i IN 1..num_transactions LOOP
        -- Random customer (or create anonymous transaction)
        SELECT id INTO random_customer_id 
        FROM public.customers 
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- Random store
        SELECT id INTO random_store_id 
        FROM public.stores 
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- Insert transaction
        INSERT INTO public.transactions (
            total_amount, 
            customer_age, 
            customer_gender, 
            store_location, 
            store_id,
            checkout_seconds,
            is_weekend,
            payment_method,
            created_at
        ) VALUES (
            (RANDOM() * 1000 + 50)::NUMERIC(10,2),
            (RANDOM() * 40 + 18)::INTEGER,
            CASE WHEN RANDOM() > 0.5 THEN 'Male' ELSE 'Female' END,
            (SELECT location FROM public.stores WHERE id = random_store_id),
            random_store_id,
            (RANDOM() * 300 + 30)::INTEGER,
            EXTRACT(DOW FROM CURRENT_DATE - (RANDOM() * 30)::INTEGER) IN (0, 6),
            CASE 
                WHEN RANDOM() > 0.7 THEN 'card'
                WHEN RANDOM() > 0.4 THEN 'cash'
                ELSE 'mobile'
            END,
            CURRENT_DATE - (RANDOM() * 30)::INTEGER + (RANDOM() * INTERVAL '24 hours')
        ) RETURNING id INTO transaction_id;
        
        -- Add 1-5 random items to each transaction
        FOR j IN 1..(RANDOM() * 4 + 1)::INTEGER LOOP
            SELECT id INTO random_product_id 
            FROM public.products 
            ORDER BY RANDOM() 
            LIMIT 1;
            
            random_quantity := (RANDOM() * 3 + 1)::INTEGER;
            
            INSERT INTO public.transaction_items (
                transaction_id,
                product_id,
                quantity,
                unit_price
            ) VALUES (
                transaction_id,
                random_product_id,
                random_quantity,
                (SELECT unit_price FROM public.products WHERE id = random_product_id)
            );
        END LOOP;
        
        -- Update transaction total based on items
        UPDATE public.transactions 
        SET total_amount = (
            SELECT SUM(total_price) 
            FROM public.transaction_items 
            WHERE transaction_id = transactions.id
        )
        WHERE id = transaction_id;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate initial sample data (comment out if you don't want sample transactions)
-- SELECT public.generate_sample_transactions(50);