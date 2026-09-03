const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("kancil_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("kancil_token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("kancil_token");
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada permintaan API.");
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: { email: string; password: string; name: string; role?: string; nim?: string; phone?: string }) =>
    apiFetch<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => apiFetch<{ user: any }>("/auth/me"),

  // Books
  getBooks: (search?: string, categoryId?: number) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("categoryId", String(categoryId));
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<{ books: any[] }>(`/books${query}`);
  },

  getBookById: (id: number) => apiFetch<{ book: any }>(`/books/${id}`),

  createBook: (bookData: any) =>
    apiFetch<{ message: string; book: any }>("/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    }),

  updateBook: (id: number, bookData: any) =>
    apiFetch<{ message: string; book: any }>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookData),
    }),

  deleteBook: (id: number) =>
    apiFetch<{ message: string }>(`/books/${id}`, {
      method: "DELETE",
      body: JSON.stringify({}),
    }),

  // Borrowings
  requestBorrow: (data: { bookId: number; days?: number; notes?: string }) =>
    apiFetch<{ message: string; borrowing: any }>("/borrowings/request", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createBorrowByAdmin: (data: { userId: number; bookId: number; days?: number; borrowDate?: string; dueDate?: string; notes?: string }) =>
    apiFetch<{ message: string; borrowing: any }>("/borrowings/admin-create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyBorrowings: () => apiFetch<{ borrowings: any[] }>("/borrowings/my"),

  getAllBorrowings: (status?: string) => {
    const query = status ? `?status=${status}` : "";
    return apiFetch<{ borrowings: any[] }>(`/borrowings/all${query}`);
  },

  updateBorrowStatus: (id: number, status: string) =>
    apiFetch<{ message: string; borrowing: any }>(`/borrowings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getStats: () => apiFetch<{ booksCount: number; membersCount: number; categoriesCount: number }>("/stats"),

  // Users
  getUsers: () => apiFetch<{ users: any[] }>("/users"),
};
