const API_BASE_URL = "http://localhost:5000/api"; // Change if your backend runs elsewhere

export async function authorize() {
  const response = await fetch(`${API_BASE_URL}/authorize`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to authorize");
  if (response.status === 200) {
    console.log("Authorization successful");
  }
  return response.json();
}

export async function readSheet() {
  const response = await fetch(`${API_BASE_URL}/readSheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to read sheet");
  return response.json();
}

export async function updateStock(id: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/updateStock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, quantity }),
  });
  if (!response.ok) throw new Error("Failed to update stock");
  return response.json();
}