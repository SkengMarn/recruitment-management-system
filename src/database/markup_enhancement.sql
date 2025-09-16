-- Enhanced Markup System: Add support for flat and percentage-based markups
-- This script adds new columns to support flexible markup calculations

-- Add new columns to positions table for markup types
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS markup_company_type VARCHAR(20) DEFAULT 'flat' CHECK (markup_company_type IN ('flat', 'percentage')),
ADD COLUMN IF NOT EXISTS markup_agency_type VARCHAR(20) DEFAULT 'flat' CHECK (markup_agency_type IN ('flat', 'percentage'));

-- Add comments for clarity
COMMENT ON COLUMN public.positions.markup_company_type IS 'Type of company markup: flat (direct amount) or percentage (% of input_fee)';
COMMENT ON COLUMN public.positions.markup_agency_type IS 'Type of agency markup: flat (direct amount) or percentage (% of input_fee)';

-- Update existing records to have default markup types
UPDATE public.positions 
SET markup_company_type = 'flat', markup_agency_type = 'flat' 
WHERE markup_company_type IS NULL OR markup_agency_type IS NULL;

-- Create function to calculate final fee with markup types
CREATE OR REPLACE FUNCTION calculate_final_fee_with_types(
    p_input_fee NUMERIC,
    p_input_fee_currency VARCHAR(10),
    p_markup_agency NUMERIC,
    p_markup_agency_type VARCHAR(20),
    p_markup_company NUMERIC,
    p_markup_company_type VARCHAR(20),
    p_payment_type VARCHAR(50) DEFAULT NULL,
    p_exchange_rate NUMERIC DEFAULT 1
) RETURNS NUMERIC AS $$
DECLARE
    input_fee_ugx NUMERIC;
    agency_markup_ugx NUMERIC;
    company_markup_ugx NUMERIC;
    final_amount NUMERIC;
BEGIN
    -- Convert input fee to UGX
    input_fee_ugx := p_input_fee * p_exchange_rate;
    
    -- Calculate agency markup based on type
    IF p_markup_agency_type = 'percentage' THEN
        agency_markup_ugx := input_fee_ugx * (p_markup_agency / 100);
    ELSE
        agency_markup_ugx := p_markup_agency;
    END IF;
    
    -- Calculate company markup based on type
    IF p_markup_company_type = 'percentage' THEN
        company_markup_ugx := input_fee_ugx * (p_markup_company / 100);
    ELSE
        company_markup_ugx := p_markup_company;
    END IF;
    
    -- Calculate final amount based on payment type
    CASE p_payment_type
        WHEN 'employer_funded' THEN
            final_amount := agency_markup_ugx;
        WHEN 'candidate_funded' THEN
            final_amount := input_fee_ugx + company_markup_ugx;
        WHEN 'hybrid' THEN
            final_amount := input_fee_ugx + agency_markup_ugx + company_markup_ugx;
        ELSE
            final_amount := input_fee_ugx + agency_markup_ugx + company_markup_ugx;
    END CASE;
    
    RETURN COALESCE(final_amount, 0);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_final_fee_with_types(NUMERIC, VARCHAR, NUMERIC, VARCHAR, NUMERIC, VARCHAR, VARCHAR, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_final_fee_with_types(NUMERIC, VARCHAR, NUMERIC, VARCHAR, NUMERIC, VARCHAR, VARCHAR, NUMERIC) TO service_role;
