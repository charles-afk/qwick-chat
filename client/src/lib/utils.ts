interface ApiRequest {
  url: string,
  method?: string,
  body?: object | null,
  headers?: Record<string, string>,
  timeout?: number,
  controller?: AbortController | null,
};
export class FetchManager {
  controller: AbortController | null;

  constructor() {
    this.controller = null;
  }

  async apiRequest({
    url = '',
    method = 'GET',
    body = null,
    headers = {},
    //timeout = 10000,
  }: ApiRequest) {
    //if (this.controller) this.controller?.abort();
    this.controller = new AbortController();

    //const timeoutId = setTimeout(() => this.controller?.abort(), timeout);
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json', 
      'Content-Type': 'application/json',
      ...headers,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_ENDPOINT}${url}`, {
        method,
        headers: defaultHeaders,
        credentials: 'include',
        mode: 'cors',
        body: body ? JSON.stringify(body) : null,
        signal: this.controller?.signal,
      });
      //clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      //clearTimeout(timeoutId);
      if (error.message === 'Token Expired') {}
      if (error.name === 'AbortError') console.warn('Request was aborted (timeout or manual abort).');
      throw error;
    };
  }
};