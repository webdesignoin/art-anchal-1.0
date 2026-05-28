import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kozqszupqkueqagptwbr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_KEY in env.");
  process.exit(1);
}

async function getTables() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.definitions) {
      for (const [tableName, definition] of Object.entries(data.definitions)) {
        console.log(`=== TABLE: ${tableName} ===`);
        if (definition.properties) {
          for (const [propName, propDef] of Object.entries(definition.properties)) {
            console.log(`  - ${propName}: ${propDef.type} (${propDef.format || 'no format'})`);
          }
        }
      }
    } else {
      console.log("No definitions found in OpenAPI spec.");
    }
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

getTables();
