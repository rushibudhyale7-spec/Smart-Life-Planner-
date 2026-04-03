export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  phone?: string;
  dietPreference?: string;
  travelInterest?: string;
  financialGoalPreference?: string;
  role: 'user' | 'admin';
}

export interface Expense {
  id?: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface Goal {
  id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  monthlySaving: number;
  savedAmount: number;
}

export interface Bookmark {
  id?: string;
  userId: string;
  type: 'recipe' | 'finance' | 'travel' | 'lifestyle';
  title: string;
  description: string;
  imageUrl?: string;
  data?: any;
}

export interface Meal {
  id?: string;
  userId: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}
