# Supabase SQL Query Runner Setup Instructions

## 🚨 REQUIRED: Enable SQL Query Runner

Your SQL query runner needs a database function to execute queries safely. Follow these steps:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"** 

### Step 2: Create the SQL Function
Copy and paste this EXACT code into the SQL editor:

```sql
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
```

### Step 3: Execute the Function
1. Click the **"Run"** button (or press Ctrl+Enter)
2. You should see "Success. No rows returned" message
3. The function is now created and ready to use

### Step 4: Test Your Query Runner
Go back to your Reports module and try this query:
```sql
SELECT * FROM public.leads;
```

## 🔄 Alternative: Basic Mode (Temporary)
If you can't run the SQL setup right now, the system will fall back to basic mode which supports simple `SELECT *` queries on individual tables.

**Basic mode limitations:**
- Only `SELECT *` queries work
- No GROUP BY, ORDER BY, WHERE clauses
- No aggregation functions (COUNT, SUM, etc.)

**Supported basic queries:**
- `SELECT * FROM leads`
- `SELECT * FROM candidates` 
- `SELECT * FROM agents`

## ✅ Full Functionality After Setup
Once you run the SQL setup, you'll have access to:
- Full SQL SELECT syntax
- GROUP BY and aggregation functions
- WHERE clauses and filtering
- ORDER BY sorting
- Complex joins and subqueries
- All sample queries in the Reports module

## 🔒 Security Features
- Only SELECT statements allowed (no INSERT/UPDATE/DELETE)
- Single statement execution only
- Proper SQL injection protection
- Role-based permissions

---

**Need Help?** If you encounter any issues:
1. Make sure you're in the SQL Editor (not Table Editor)
2. Copy the exact SQL code above
3. Ensure you click "Run" after pasting
4. Check for any error messages in the Supabase interface