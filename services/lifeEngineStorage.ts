import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  limit, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, AppState, SupportTicket, GlobalSettings, MatrixItem } from '../types';

const STORAGE_KEY_STATE = 'life_engine_state_v8';
const STORAGE_KEY_USER = 'life_engine_user_v8';

const pad30 = <T>(arr: T[], fill: T): T[] => {
  const result = [...arr];
  while (result.length < 30) result.push(fill);
  return result.slice(0, 30);
};

export const DEFAULT_APP_STATE: AppState = {
  tasks: [
    { id: "t1", name: "Kunlik vazifalar rejasi", data: Array(30).fill(false) },
    { id: "t2", name: "Fokusli mehnat (Deep Work)", data: Array(30).fill(false) }
  ],
  habits: [
    { id: "h1", name: "2 litr toza suv ichish", data: Array(30).fill(false) },
    { id: "h2", name: "Ertalabki badantarbiya", data: Array(30).fill(false) },
    { id: "h3", name: "Kitob mutolaasi (20 bet)", data: Array(30).fill(false) },
    { id: "h4", name: "O'z vaqtida uxlash (23:00)", data: Array(30).fill(false) }
  ],
  sleep: [
    { id: "s1", name: "23:00 da uyqu", data: Array(30).fill(false) }
  ],
  sleepHours: Array(30).fill(0),
  sleepSchedules: Array.from({ length: 30 }, (_, e) => ({
    day: e + 1,
    bedTime: "--:--",
    wakeTime: "--:--",
    quality: 0
  })),
  financeIncome: Array(30).fill(0),
  financeExpenses: Array(30).fill(0),
  expenseRecords: [],
  steps: Array(30).fill(0),
  stepGoal: 10000,
  water: Array(30).fill(0),
  waterGoal: 2000,
  moods: Array(30).fill('neutral'),
  weight: Array(30).fill(0),
  weightGoal: 70,
  financeBudget: 0,
  favoriteMusic: [],
  historyMusic: [],
  chartPreferences: { tasks: 'area', habits: 'area', sleep: 'area', finance: 'area' },
  challenges: [
    { 
      id: 'c1', 
      title: 'Kitobxonlik Chellenji', 
      description: 'Har kuni kamida 20 sahifa kitob mutolaasi qilish', 
      duration: 30, 
      currentDay: 0, 
      targetTime: '21:00',
      startDate: new Date().toISOString().split('T')[0],
      completed: false, 
      category: 'mind', 
      rewardStars: 15, 
      icon: 'fa-book-open',
      color: '#8b5cf6'
    },
    { 
      id: 'c2', 
      title: '06:00 Ertalabki Intizom', 
      description: 'Har tong soat 06:00 da uyg\'onish va kunni rejalashtirish', 
      duration: 21, 
      currentDay: 0, 
      targetTime: '06:00',
      startDate: new Date().toISOString().split('T')[0],
      completed: false, 
      category: 'discipline', 
      rewardStars: 20, 
      icon: 'fa-sun',
      color: '#f59e0b'
    },
    { 
      id: 'c3', 
      title: '10,000 Qadam Marafoni', 
      description: 'Kunlik kamida 10,000 qadam yurish va tetiklik', 
      duration: 30, 
      currentDay: 0, 
      targetTime: '18:30',
      startDate: new Date().toISOString().split('T')[0],
      completed: false, 
      category: 'fitness', 
      rewardStars: 12, 
      icon: 'fa-running',
      color: '#10b981'
    }
  ],
  language: 'uz',
  currency: 'UZS',
  theme: 'dark'
};

export const DEFAULT_USER: User = {
  id: 'guest_user',
  username: 'foydalanuvchi',
  displayName: 'Yangi Foydalanuvchi',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=240&auto=format&fit=crop&q=80',
  role: 'user',
  status: 'active',
  joinedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  stars: 0,
  score: 0,
  isPremium: false,
  isLifetime: false,
  isCorporate: false,
  country: '🇺🇿'
};

const sanitizeMatrixItem = (item: any, fallbackName: string, prefix: string, index: number): MatrixItem => {
  const data = Array.isArray(item?.data)
    ? pad30(item.data.map(Boolean), false)
    : Array(30).fill(false);
  return {
    id: typeof item?.id === 'string' && item.id.trim() ? item.id : `${prefix}_${index}_${Date.now()}`,
    name: typeof item?.name === 'string' && item.name.trim() ? item.name : fallbackName,
    data,
    color: item?.color,
    streak: typeof item?.streak === 'number' ? item.streak : 0
  };
};

export class LifeEngineService {
  // Local state
  static getLocalState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const tasks = Array.isArray(parsed.tasks) && parsed.tasks.length > 0
            ? parsed.tasks.map((t: any, i: number) => sanitizeMatrixItem(t, `Vazifa ${i + 1}`, 't', i))
            : DEFAULT_APP_STATE.tasks;

          const habits = Array.isArray(parsed.habits) && parsed.habits.length > 0
            ? parsed.habits.map((h: any, i: number) => sanitizeMatrixItem(h, `Odat ${i + 1}`, 'h', i))
            : DEFAULT_APP_STATE.habits;

          const sleep = Array.isArray(parsed.sleep) && parsed.sleep.length > 0
            ? parsed.sleep.map((s: any, i: number) => sanitizeMatrixItem(s, `Uyqu ${i + 1}`, 's', i))
            : DEFAULT_APP_STATE.sleep;

          return {
            ...DEFAULT_APP_STATE,
            ...parsed,
            tasks,
            habits,
            sleep,
            sleepHours: Array.isArray(parsed.sleepHours) ? pad30(parsed.sleepHours, 0) : DEFAULT_APP_STATE.sleepHours,
            sleepSchedules: Array.isArray(parsed.sleepSchedules) ? parsed.sleepSchedules : DEFAULT_APP_STATE.sleepSchedules,
            financeIncome: Array.isArray(parsed.financeIncome) ? pad30(parsed.financeIncome, 0) : DEFAULT_APP_STATE.financeIncome,
            financeExpenses: Array.isArray(parsed.financeExpenses) ? pad30(parsed.financeExpenses, 0) : DEFAULT_APP_STATE.financeExpenses,
            expenseRecords: Array.isArray(parsed.expenseRecords) ? parsed.expenseRecords : DEFAULT_APP_STATE.expenseRecords,
            steps: Array.isArray(parsed.steps) ? pad30(parsed.steps, 0) : DEFAULT_APP_STATE.steps,
            water: Array.isArray(parsed.water) ? pad30(parsed.water, 0) : DEFAULT_APP_STATE.water,
            moods: Array.isArray(parsed.moods) ? pad30(parsed.moods, 'neutral') : DEFAULT_APP_STATE.moods,
            weight: Array.isArray(parsed.weight) ? pad30(parsed.weight, 0) : DEFAULT_APP_STATE.weight,
            challenges: Array.isArray(parsed.challenges) && parsed.challenges.length > 0 ? parsed.challenges : DEFAULT_APP_STATE.challenges,
            chartPreferences: parsed.chartPreferences || DEFAULT_APP_STATE.chartPreferences
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse local app state:', e);
    }
    return DEFAULT_APP_STATE;
  }

  // Complete reset to 0 for clean install / fresh user
  static resetToZero(): { user: User; state: AppState } {
    localStorage.removeItem(STORAGE_KEY_STATE);
    localStorage.removeItem(STORAGE_KEY_USER);
    this.saveLocalState(DEFAULT_APP_STATE);
    this.saveLocalUser(DEFAULT_USER);
    return { user: DEFAULT_USER, state: DEFAULT_APP_STATE };
  }

  static saveLocalState(state: AppState) {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  static getLocalUser(): User {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_USER,
            ...parsed,
            avatar: parsed.avatar || DEFAULT_USER.avatar,
            displayName: parsed.displayName || DEFAULT_USER.displayName,
            username: parsed.username || DEFAULT_USER.username,
            role: parsed.role || DEFAULT_USER.role,
            stars: typeof parsed.stars === 'number' ? parsed.stars : DEFAULT_USER.stars,
            score: typeof parsed.score === 'number' ? parsed.score : DEFAULT_USER.score,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse local user:', e);
    }
    return DEFAULT_USER;
  }

  static saveLocalUser(user: User) {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  }

  static saveUser(user: User) {
    this.saveLocalUser(user);
  }

  // Cloud sync
  static async syncToCloud(user: User, state: AppState): Promise<boolean> {
    try {
      if (!user?.id) return false;
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        joinedAt: user.joinedAt || new Date().toISOString(),
        lastLogin: user.lastLogin || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        stars: user.stars || 0,
        score: user.score || 0,
        isPremium: Boolean(user.isPremium),
        isLifetime: Boolean(user.isLifetime),
        isCorporate: Boolean(user.isCorporate),
        country: user.country || '🇺🇿'
      }, { merge: true });

      const stateRef = doc(db, 'users', user.id, 'data', 'state');
      await setDoc(stateRef, state, { merge: true });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user?.id}`);
      return false;
    }
  }

  static async loadFromCloud(userId: string): Promise<{ user?: User; state?: AppState } | null> {
    try {
      if (!userId) return null;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      const stateRef = doc(db, 'users', userId, 'data', 'state');
      const stateSnap = await getDoc(stateRef);

      return {
        user: userSnap.exists() ? (userSnap.data() as User) : undefined,
        state: stateSnap.exists() ? (stateSnap.data() as AppState) : undefined
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${userId}`);
      return null;
    }
  }

  // Leaderboard fetch (Real Firestore Users only - Spark optimized)
  static async getLeaderboard(limitCount = 50): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'), 
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const users: User[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.status !== 'banned') {
          users.push({
            id: d.id,
            username: data.username || 'user_' + d.id.slice(0, 4),
            displayName: data.displayName || data.username || 'Life User',
            email: data.email || '',
            avatar: data.avatar || `https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=240&auto=format&fit=crop&q=80`,
            role: data.role || 'user',
            status: data.status || 'active',
            joinedAt: data.joinedAt || '',
            lastLogin: data.lastLogin || '',
            lastActive: data.lastActive || '',
            stars: typeof data.stars === 'number' ? data.stars : 0,
            score: typeof data.score === 'number' ? data.score : 0,
            isPremium: Boolean(data.isPremium),
            isLifetime: Boolean(data.isLifetime),
            isCorporate: Boolean(data.isCorporate),
            country: data.country || '🇺🇿'
          });
        }
      });
      // Sort descending by score, then stars
      return users.sort((a, b) => (b.score || 0) - (a.score || 0) || (b.stars || 0) - (a.stars || 0));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
      return [];
    }
  }

  // Support tickets
  static async createTicket(userId: string, userName: string, question: string): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: 'ticket_' + Date.now(),
      userId,
      userName,
      question,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    try {
      const ticketRef = doc(db, 'tickets', ticket.id);
      await setDoc(ticketRef, ticket);
    } catch (e) {
      console.warn('Firestore ticket create failed, saving to local list', e);
    }
    return ticket;
  }

  static async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const q = query(collection(db, 'tickets'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const tickets: SupportTicket[] = [];
      snap.forEach(d => tickets.push(d.data() as SupportTicket));
      return tickets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.warn('Failed to load tickets:', e);
      return [];
    }
  }

  // Global settings
  static async getGlobalSettings(): Promise<GlobalSettings> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        return snap.data() as GlobalSettings;
      }
    } catch (e) {
      console.warn('Global settings fetch error:', e);
    }
    return { holiday: 'none', shopStatus: 'active' };
  }
}
