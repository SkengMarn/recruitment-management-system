const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or Service Role Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('execute_sql_query', {
          sql_query: statement + ';'  // Add back the semicolon that was removed by split
        });
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 200) + '...');
          // Continue with next statement instead of exiting
          continue;
        }
        
        console.log(`Statement ${i + 1} executed successfully`);
        if (data && data.length > 0) {
          console.log('Result:', JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 200) + '...');
        // Continue with next statement
      }
    }
    
    console.log('\nSQL execution completed');
  } catch (error) {
    console.error('Error reading SQL file:', error.message);
    process.exit(1);
  }
}

// Get the SQL file path from command line arguments
const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('Error: Please provide the path to the SQL file as an argument');
  process.exit(1);
}

runSqlFile(path.resolve(sqlFilePath));
