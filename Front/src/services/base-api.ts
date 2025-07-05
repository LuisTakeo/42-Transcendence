// Get the backend API URL from environment variable or default to localhost
// Determine the backend API URL from environment variable or default to localhost
const API_BASE_URL = (typeof process !== 'undefined' && process.env.BACK_API_BASE_URL)
  ? process.env.BACK_API_BASE_URL
  : 'http://localhost:3142';
export class BaseApiService {
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Start with provided headers
    const headers = { ...options.headers } as Record<string, string>;

    // Only add Content-Type header if there's a body and Content-Type isn't already set
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const defaultOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        // Try to get error details from response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorMessage += ` - ${errorBody.error}`;
          }
          if (errorBody.message) {
            errorMessage += ` - ${errorBody.message}`;
          }
          console.error('API Error Response:', errorBody);
        } catch (e) {
          // If response body isn't JSON, just use status
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Export the base URL for use in other files
export const getBaseUrl = (): string => API_BASE_URL;
