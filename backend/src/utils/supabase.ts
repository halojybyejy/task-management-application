require('dotenv').config();

// Base fetch wrapper
export const supabaseFetch = async (path: string, options: RequestInit & { useServiceRole?: boolean } = {}) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
    const { useServiceRole, ...restOptions } = options;

    // Choose which key to use
    const apiKey = useServiceRole 
                  ? SUPABASE_SERVICE_KEY 
                  : SUPABASE_ANON_KEY;
    
    const finalHeaders = {
      ...(restOptions.headers || {}), // take user headers first
      apikey: apiKey,  // inject the appropriate api key
      ...(useServiceRole ? { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } : {}),
      'Content-Type': 'application/json', // always enforce JSON
    };

    try {
        console.log('Fetching:', `${SUPABASE_URL}${path}`);
        console.log('Request method:', options.method);
        console.log('Request headers:', finalHeaders);
        if (options.body) {
            console.log('Request body:', options.body);
        }
        
        const res = await fetch(`${SUPABASE_URL}${path}`, {
            ...restOptions,
            headers: finalHeaders,
        });
        
        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));
        
        // Get the response text first
        const text = await res.text();
        console.log('Response text:', text);
        
            // Try to parse as JSON
        let data;
        try {
            data = text ? JSON.parse(text) : null;
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error(`Failed to parse response as JSON: ${text.substring(0, 100)}...`);
        }
        
        if (!res.ok) {
            if(data.code === 422 && data.error_code == 'user_already_exists') {
                return 'User already exists';
            }
            else{
                console.error('Error response:', data)
            };
            const error = data?.error_description || data?.error?.message || data?.message || 'Something went wrong';
            throw new Error(error);
        }
      
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};
  