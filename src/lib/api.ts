export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  company?: {
    name: string;
    title: string;
    department: string;
  };
  address?: {
    address: string;
    city: string;
    state: string;
  };
  birthDate?: string;
  role?: string;
}

export interface ApiCart {
  id: number;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  userId: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}

export interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

// Fetch 30 real users from public API
export async function fetchUsers(): Promise<ApiUser[]> {
  const res = await fetch('https://dummyjson.com/users?limit=30');
  if (!res.ok) throw new Error('Failed to fetch users');
  const data: { users: ApiUser[] } = await res.json();
  return data.users;
}

// Fetch single user detail by ID from public API
export async function fetchUserById(id: number | string): Promise<ApiUser> {
  const numId = typeof id === 'string' ? id.replace(/\D/g, '') || '1' : id;
  const res = await fetch(`https://dummyjson.com/users/${numId}`);
  if (!res.ok) throw new Error('Failed to fetch user detail');
  return await res.json();
}

// Fetch 20 real financial transaction cart records from public API
export async function fetchTransactions(): Promise<ApiCart[]> {
  const res = await fetch('https://dummyjson.com/carts?limit=20');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data: { carts: ApiCart[] } = await res.json();
  return data.carts;
}

// Fetch real booking/service todos from public API
export async function fetchBookings(): Promise<ApiTodo[]> {
  const res = await fetch('https://dummyjson.com/todos?limit=20');
  if (!res.ok) throw new Error('Failed to fetch bookings');
  const data: { todos: ApiTodo[] } = await res.json();
  return data.todos;
}
