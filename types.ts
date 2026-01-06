
export interface IngredientSource {
  ingredient: string;
  location: string;
  story: string;
  link: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starter' | 'Main' | 'Dessert' | 'Beverage';
  imageUrl: string;
  dietary?: string[];
  sourcing?: IngredientSource[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderType = 'takeaway' | 'delivery' | 'table';

export interface OrderHistoryItem {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  type: OrderType;
  address?: string;
  tableNumber?: number;
  instructions?: string;
}

export interface Reservation {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'Explorer' | 'Voyager' | 'Ambassador';
}
