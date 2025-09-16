-- SQL function to safely execute SELECT queries
-- Run this in your Supabase SQL Editor to enable the SQL query runner

CREATE OR REPLACE FUNCTION execute_sql_query(sql_query text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query_lower text;
    result_record record;
    result_array jsonb[] := '{}';
    result_json jsonb;
BEGIN
    -- Basic security check: only allow SELECT statements
    query_lower := lower(trim(sql_query));
    
    IF NOT query_lower LIKE 'select%' THEN
        RAISE EXCEPTION 'Only SELECT statements are allowed';
    END IF;
    
    -- Prevent multiple statements
    IF position(';' in sql_query) > 0 AND 
       array_length(string_to_array(sql_query, ';'), 1) > 1 THEN
        RAISE EXCEPTION 'Multiple statements are not allowed';
    END IF;
    
    -- Execute the query and return results as JSONB
    FOR result_record IN EXECUTE sql_query LOOP
        result_array := result_array || to_jsonb(result_record);
    END LOOP;
    
    -- Return each result as a separate row
    FOR i IN 1..array_length(result_array, 1) LOOP
        result := result_array[i];
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql_query(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_query(text) TO service_role;

-- Example usage:
-- SELECT * FROM execute_sql_query('SELECT * FROM public.leads LIMIT 5');