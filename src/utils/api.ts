const API_BASE_URL = 'http://localhost:8787';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include' as RequestCredentials, // This ensures cookies are sent with every request
  };

  return fetch(url, config);
};
