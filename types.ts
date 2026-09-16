export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  status: 'active' | 'banned';
  joinedAt: string;
  lastLogin: string;
  lastActive: string;
  lastStarDeduction?: string;
  stars: number;
  score: number;
  isPremium: boolean;
  isLifetime: boolean;
  isCorporate: boolean;
  corporateName?: string;
  pin?: string;
  country: string;
}

export interface MatrixItem {
  id: string;
  name: string;
  data: boolean[]; // 30-day boolean array
  title?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  streak?: number;
  color?: string;
}

export type Task = MatrixItem;
export type Habit = MatrixItem;

export interface SleepSchedule {
  day: number;
  bedTime: string;
  wakeTime: string;
  quality: number;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface ChallengeDayRecord {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO string
}

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  duration: number; // custom number of days (e.g., 7, 14, 21, 30, 60, 100)
  currentDay: number; // completed days count
  targetTime?: string; // e.g. "07:00", "20:00"
  startDate?: string; // YYYY-MM-DD or ISO
  lastCheckInDate?: string; // YYYY-MM-DD
  completed: boolean;
  category: 'health' | 'mind' | 'discipline' | 'finance' | 'fitness' | 'learning';
  rewardStars: number;
  icon: string;
  color?: string;
  history?: ChallengeDayRecord[];
  isCustom?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  category: string;
  icon: string;
  frequency: string;
  description: string;
}

export interface AppState {
  tasks: MatrixItem[];
  habits: MatrixItem[];
  sleep: MatrixItem[];
  sleepHours: number[];
  sleepSchedules: SleepSchedule[];
  financeIncome: number[];
  financeExpenses: number[];
  expenseRecords: ExpenseRecord[];
  steps: number[];
  stepGoal: number;
  water: number[];
  waterGoal: number;
  moods: string[];
  weight: number[];
  weightGoal: number;
  financeBudget: number;
  favoriteMusic: string[];
  historyMusic: string[];
  chartPreferences: {
    tasks: 'area' | 'bar' | 'circle';
    habits: 'area' | 'bar' | 'circle';
    sleep: 'area' | 'bar' | 'circle';
    finance: 'area' | 'bar' | 'circle';
  };
  challenges: ChallengeItem[];
  language: 'uz' | 'ru' | 'en';
  currency: 'UZS' | 'USD';
  theme: 'dark' | 'light';
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  status: 'pending' | 'replied';
  timestamp: string;
}

export type HolidayType = 'none' | 'ramadan' | 'navruz' | 'autumn' | 'newyear';

export interface GlobalSettings {
  holiday: HolidayType;
  shopStatus: 'active' | 'frozen';
  announcement?: string;
}

export type TabType = 
  | 'tasks' 
  | 'habits' 
  | 'challenges' 
  | 'community' 
  | 'fitness' 
  | 'timer' 
  | 'music' 
  | 'ai_chat' 
  | 'sleep' 
  | 'finance' 
  | 'analytics' 
  | 'premium' 
  | 'questions' 
  | 'profile' 
  | 'admin';

export interface AuthState {
  user: User | null;
  loading: boolean;
}
