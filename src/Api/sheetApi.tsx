const API_BASE_URL = "https://stripe-checkout-backend-production-442a.up.railway.app/api"; // Change if your backend runs elsewhere

export function getJWT() {
  return localStorage.getItem('jwt') || '';
}

export async function authorize() {
  const response = await fetch(`${API_BASE_URL}/authorize`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getJWT()}`
    },
  });
  if (!response.ok) throw new Error("Failed to authorize");
  return response.json();
}

export async function first_authorize() {
  const response = await fetch(`${API_BASE_URL}/public-auth-url`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getJWT()}`
    },
  });
  if (!response.ok) throw new Error("Failed to authorize");
  return response.json();
}

export async function readSheet() {
  const response = await fetch(`${API_BASE_URL}/readSheet`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getJWT()}`
    },
  });
  if (!response.ok) throw new Error("Failed to read sheet");
  return response.json();
}

export async function readStatus() {
  const response = await fetch(`${API_BASE_URL}/status`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getJWT()}`
    },
  });
  if (!response.ok) throw new Error("Failed to read status sheet");
  return response.json();
}

export async function updateStock(id: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/updateStock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${getJWT()}`},
    body: JSON.stringify({ id, quantity }),
  });
  if (!response.ok) throw new Error("Failed to update stock");
  return response.json();
}

export async function updateOrderStatus(orderId: string, status: "paid" | "failed" | "pending") {
  const response = await fetch(`${API_BASE_URL}/updateOrderStatus`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getJWT()}`
    },
    body: JSON.stringify({ orderId, status }),
  });
  if (!response.ok) throw new Error("Failed to update order status");
  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/sessionUrl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${getJWT()}`},
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error("Failed to create session URL");
  return response.json();
}