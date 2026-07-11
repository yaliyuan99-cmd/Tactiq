/**
 * Hand-written types that mirror the SQL schema in
 * `supabase/migrations/0001_init.sql`. If you later install the Supabase CLI you
 * can regenerate this file with:
 *   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type UserCategory =
  | 'blind-low-vision'
  | 'elderly'
  | 'motor-accessibility'
  | 'developer'
  | 'early-adopter'
  | 'other';

export interface WaitlistRow {
  id: string;
  full_name: string;
  email: string;
  user_category: string | null;
  country: string | null;
  joined_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string | null;
  user_category: string | null;
  is_admin: boolean;
  is_banned: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
}

export type PlanId = 'essential' | 'pro';
export type OrderStatus = 'reserved' | 'paid' | 'shipped' | 'cancelled';

export interface OrderRow {
  id: string;
  user_id: string;
  plan: PlanId;
  status: OrderStatus;
  amount_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

/** A saved gesture layout: maps each key id to the command assigned to it. */
export type GestureLayout = Record<string, string>;

export interface GestureConfigRow {
  id: string;
  user_id: string;
  name: string;
  layout: GestureLayout;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: WaitlistRow;
        Insert: Omit<WaitlistRow, 'id' | 'joined_at'> & {
          id?: string;
          joined_at?: string;
        };
        Update: Partial<WaitlistRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at'> & { created_at?: string };
        Update: Partial<ProfileRow>;
      };
      gesture_configs: {
        Row: GestureConfigRow;
        Insert: Omit<GestureConfigRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<GestureConfigRow>;
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at' | 'status' | 'currency'> & {
          id?: string;
          status?: OrderStatus;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<OrderRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
