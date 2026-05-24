import dotenv from 'dotenv';
dotenv.config();

const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/artisans?select=*`;
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } })
.then(res => res.json())
.then(data => { console.log("Artisans Response:", data.length ? data.length + " rows" : data); })
.catch(err => console.error(err));
