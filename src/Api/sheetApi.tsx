const API_BASE_URL = "https://stripe-checkout-backend-production-442a.up.railway.app/api"; // Change if your backend runs elsewhere

export function getJWT() {
  return localStorage.getItem('jwt') || '';
}

export function clearJWT() {
  localStorage.removeItem('jwt');
}

// Helper function to handle token expiration
function handleTokenExpiration() {
  clearJWT();
  // Redirect to login or refresh the page to show login state
  window.location.reload();
}

// Enhanced fetch function that handles token expiration
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getJWT()}`,
      ...options.headers,
    },
  });

  // Check if token is expired or unauthorized
  if (response.status === 401) {
    handleTokenExpiration();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function authorize() {
  return apiRequest(`${API_BASE_URL}/authorize`, {
    method: "GET",
  });
}

export async function first_authorize() {
  return apiRequest(`${API_BASE_URL}/public-auth-url`, {
    method: "GET",
  });
}

export async function readSheet() {
  return apiRequest(`${API_BASE_URL}/readSheet`, {
    method: "POST",
  });
}

export async function readStatus() {
  return apiRequest(`${API_BASE_URL}/status`, {
    method: "POST",
  });
}

export async function readSummary() {
  return apiRequest(`${API_BASE_URL}/summary`, {
    method: "POST",
  });
}

export async function updateStock(id: string, quantity: number) {
  return apiRequest(`${API_BASE_URL}/updateStock`, {
    method: "POST",
    body: JSON.stringify({ id, quantity }),
  });
}

export async function createUrl(
  items: { id: string; quantity: number }[], 
  discount?: { discountAmount: number; type: "%" | "$" } | null
) {
  // Prepare the request body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestBody: any[] = [...items];
  
  // Add discount to the request if it exists
  if (discount && discount.discountAmount > 0) {
    requestBody.push({
      discount: discount.discountAmount,
      type: discount.type
    });
  }

  return apiRequest(`${API_BASE_URL}/sessionUrl`, {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}