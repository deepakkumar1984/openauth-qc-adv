const API_BASE_URL = 'http://localhost:8787';

// Base fetch function with error handling and JSON parsing
const baseFetchApi = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include' as RequestCredentials, // Ensures cookies are sent
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData;
    try {
      // Attempt to parse error response as JSON
      errorData = await response.json();
    } catch (e) {
      // If not JSON, use the response text
      errorData = { error: await response.text() };
    }
    // Create an error object that includes response status and data
    const error: any = new Error(response.statusText || 'API request failed');
    error.response = response; // Attach the raw response object
    error.data = errorData;     // Attach parsed error data
    error.status = response.status; // Attach status code
    throw error;
  }

  // Handle 204 No Content responses, which don't have a JSON body
  if (response.status === 204) {
    return { data: null as T }; // Or undefined, or an empty object as per contract
  }
  
  // For successful responses, parse JSON and wrap in a 'data' object
  const data = await response.json();
  return { data: data as T }; 
};

// Exported API object with HTTP methods
export const api = {
  get: async <T = any>(endpoint: string, options?: RequestInit): Promise<{ data: T }> => {
    return baseFetchApi<T>(endpoint, { ...options, method: 'GET' });
  },
  post: async <T = any>(endpoint:string, body: any, options?: RequestInit): Promise<{ data: T }> => {
    return baseFetchApi<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },
  put: async <T = any>(endpoint: string, body: any, options?: RequestInit): Promise<{ data: T }> => {
    return baseFetchApi<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },
  delete: async <T = any>(endpoint: string, options?: RequestInit): Promise<{ data: T }> => { 
    // For DELETE, T might often be void or a simple success message structure
    return baseFetchApi<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
