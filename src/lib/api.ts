import { apiRequest } from '@/lib/auth-api';

export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';

export interface ApiUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  image: string;
}

export interface ApiTransaction {
  id: string;
  userId: string;
  amount: number;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string };
}

export interface ApiBooking {
  id: string;
  userId: string;
  status: BookingStatus;
  bookingDate: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string };
}

export interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface DashboardCharts {
  range?: DashboardChartRange;
  revenue: { date: string; value: number }[];
  transactions: { date: string; count: number }[];
}

export type DashboardChartRange = '7d' | '1m' | '3m' | '6m' | '1y';

export interface DashboardAlert {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  subtitle: string;
  createdAt: string;
}

export interface DashboardHealth {
  uptimeSeconds: number;
  averageResponseTimeMs: number | null;
  activeUsers: number;
  runtimeMemoryPercent: number;
  databaseResponseTimeMs: number;
}

export interface DashboardAnalytics {
  period: { fromDate: string; toDate: string };
  totalTransactions: number;
  successfulTransactions: number;
  successRate: number;
  successfulRevenue: number;
  averageTransaction: number;
  bookingsByStatus: { status: BookingStatus; count: number }[];
  daily: { date: string; revenue: number; transactions: number }[];
}

export interface DashboardReport {
  fromDate: string;
  toDate: string;
  transactionCount: number;
  transactionVolume: number;
  transactionsByStatus: { status: TransactionStatus; count: number; amount: number }[];
  bookingCount: number;
  bookingsByStatus: { status: BookingStatus; count: number }[];
}

export interface DashboardSettings {
  id: string;
  maintenanceScheduledAt: string | null;
  runtimeMemoryAlertThreshold: number;
  updatedAt: string;
}

interface ApiList<T, ExtraMeta extends object = Record<string, never>> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number } & ExtraMeta;
}

interface ApiEntity<T> {
  data: T;
}

export interface TransactionSummary {
  totalVolume: number;
  averageTransaction: number;
  successRate: number;
}

export interface TransactionPage {
  data: ApiTransaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    summary?: TransactionSummary;
  };
}

function avatarFor(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="48" fill="#E0E7FF"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#4338CA" font-family="Arial,sans-serif" font-size="32" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function mapUser(user: Omit<ApiUser, 'firstName' | 'lastName' | 'image'>): ApiUser {
  const [firstName, ...lastName] = user.name.trim().split(/\s+/);
  return {
    ...user,
    firstName: firstName ?? '',
    lastName: lastName.join(' '),
    image: avatarFor(user.name),
  };
}

export async function fetchUsers(): Promise<ApiUser[]> {
  const result = await apiRequest<ApiList<Omit<ApiUser, 'firstName' | 'lastName' | 'image'>>>(
    '/users?page=1&limit=100&sortBy=createdAt&sortOrder=desc',
    'GET',
  );
  return result.data.map(mapUser);
}

export async function fetchUserById(id: string): Promise<ApiUser> {
  const result = await apiRequest<ApiEntity<Omit<ApiUser, 'firstName' | 'lastName' | 'image'>>>(
    `/users/${encodeURIComponent(id)}`,
    'GET',
  );
  return mapUser(result.data);
}

export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  status?: UserStatus;
}): Promise<ApiUser> {
  const result = await apiRequest<ApiEntity<Omit<ApiUser, 'firstName' | 'lastName' | 'image'>>>(
    '/users',
    'POST',
    data,
  );
  return mapUser(result.data);
}

export async function updateUser(
  id: string,
  data: Partial<Pick<ApiUser, 'name' | 'email' | 'phone' | 'status'>>,
): Promise<ApiUser> {
  const result = await apiRequest<ApiEntity<Omit<ApiUser, 'firstName' | 'lastName' | 'image'>>>(
    `/users/${encodeURIComponent(id)}`,
    'PATCH',
    data,
  );
  return mapUser(result.data);
}

export async function deleteUser(id: string): Promise<ApiUser> {
  const result = await apiRequest<ApiEntity<Omit<ApiUser, 'firstName' | 'lastName' | 'image'>>>(
    `/users/${encodeURIComponent(id)}`,
    'DELETE',
  );
  return mapUser(result.data);
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const result = await apiRequest<ApiList<ApiTransaction>>(
    '/transactions?page=1&limit=100&sortBy=createdAt&sortOrder=desc',
    'GET',
  );
  return result.data;
}

export async function fetchTransactionsPage(options: {
  page: number;
  limit: number;
  search?: string;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
}): Promise<TransactionPage> {
  const query = new URLSearchParams({
    page: String(options.page),
    limit: String(options.limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  if (options.search) query.set('search', options.search);
  if (options.status) query.set('status', options.status);
  if (options.minAmount !== undefined) query.set('minAmount', String(options.minAmount));
  if (options.maxAmount !== undefined) query.set('maxAmount', String(options.maxAmount));

  return apiRequest<TransactionPage>(`/transactions?${query.toString()}`, 'GET');
}

export async function fetchTransactionById(id: string): Promise<ApiTransaction> {
  const result = await apiRequest<ApiEntity<ApiTransaction>>(
    `/transactions/${encodeURIComponent(id)}`,
    'GET',
  );
  return result.data;
}

export async function updateTransactionStatus(
  id: string,
  status: TransactionStatus,
): Promise<ApiTransaction> {
  const result = await apiRequest<ApiEntity<ApiTransaction>>(
    `/transactions/${encodeURIComponent(id)}/status`,
    'PATCH',
    { status },
  );
  return result.data;
}

export async function fetchBookings(): Promise<ApiBooking[]> {
  const result = await apiRequest<ApiList<ApiBooking>>(
    '/bookings?page=1&limit=100&sortBy=bookingDate&sortOrder=desc',
    'GET',
  );
  return result.data;
}

export async function fetchBookingById(id: string): Promise<ApiBooking> {
  const result = await apiRequest<ApiEntity<ApiBooking>>(
    `/bookings/${encodeURIComponent(id)}`,
    'GET',
  );
  return result.data;
}

export async function createBooking(data: {
  userId: string;
  bookingDate: string;
  status: BookingStatus;
}): Promise<ApiBooking> {
  const result = await apiRequest<ApiEntity<ApiBooking>>('/bookings', 'POST', data);
  return result.data;
}

export async function updateBooking(
  id: string,
  data: Partial<Pick<ApiBooking, 'bookingDate' | 'status'>>,
): Promise<ApiBooking> {
  const result = await apiRequest<ApiEntity<ApiBooking>>(
    `/bookings/${encodeURIComponent(id)}`,
    'PATCH',
    data,
  );
  return result.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const result = await apiRequest<ApiEntity<DashboardStats>>('/dashboard/stats', 'GET');
  return result.data;
}

export async function fetchDashboardCharts(range: DashboardChartRange): Promise<DashboardCharts> {
  const result = await apiRequest<ApiEntity<DashboardCharts>>(
    `/dashboard/charts?range=${range}`,
    'GET',
  );
  return result.data;
}

export async function fetchSystemAlerts(): Promise<DashboardAlert[]> {
  const result = await apiRequest<ApiEntity<DashboardAlert[]>>('/dashboard/alerts', 'GET');
  return result.data;
}

export async function fetchBackendHealth(): Promise<DashboardHealth> {
  const result = await apiRequest<ApiEntity<DashboardHealth>>('/dashboard/health', 'GET');
  return result.data;
}

export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const result = await apiRequest<ApiEntity<DashboardAnalytics>>('/dashboard/analytics', 'GET');
  return result.data;
}

export async function fetchDashboardReport(options: {
  fromDate: string;
  toDate: string;
}): Promise<DashboardReport> {
  const query = new URLSearchParams(options);
  const result = await apiRequest<ApiEntity<DashboardReport>>(`/dashboard/reports?${query}`, 'GET');
  return result.data;
}

export async function fetchDashboardSettings(): Promise<DashboardSettings> {
  const result = await apiRequest<ApiEntity<DashboardSettings>>('/dashboard/settings', 'GET');
  return result.data;
}

export async function updateDashboardSettings(data: {
  maintenanceScheduledAt?: string | null;
  runtimeMemoryAlertThreshold?: number;
}): Promise<DashboardSettings> {
  const result = await apiRequest<ApiEntity<DashboardSettings>>('/dashboard/settings', 'PATCH', data);
  return result.data;
}
