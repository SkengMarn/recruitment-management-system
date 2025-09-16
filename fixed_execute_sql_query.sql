-- Fixed SQL function to safely execute SELECT queries with proper semicolon handling
CREATE OR REPLACE FUNCTION execute_sql_query(sql_query text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query_lower text;
    result_record record;
    result_array jsonb[] := '{}';
    cleaned_query text;
    statement_parts text[];
    non_empty_parts text[];
BEGIN
    -- Clean the query by trimming whitespace and removing trailing semicolon
    cleaned_query := trim(sql_query);
    IF right(cleaned_query, 1) = ';' THEN
        cleaned_query := left(cleaned_query, length(cleaned_query) - 1);
    END IF;
    
    -- Basic security check: only allow SELECT statements
    query_lower := lower(trim(cleaned_query));
    
    IF NOT query_lower LIKE 'select%' THEN
        RAISE EXCEPTION 'Only SELECT statements are allowed';
    END IF;
    
    -- Prevent multiple statements by checking for semicolons in the middle
    statement_parts := string_to_array(cleaned_query, ';');
    
    -- Filter out empty parts
    FOR i IN 1..array_length(statement_parts, 1) LOOP
        IF trim(statement_parts[i]) != '' THEN
            non_empty_parts := non_empty_parts || trim(statement_parts[i]);
        END IF;
    END LOOP;
    
    IF array_length(non_empty_parts, 1) > 1 THEN
        RAISE EXCEPTION 'Multiple statements are not allowed';
    END IF;
    
    -- Execute the query and return results as JSONB
    FOR result_record IN EXECUTE cleaned_query LOOP
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION execute_sql_query(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_query(text) TO service_role;
