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

// NOTE: these Row shapes are declared as `type` aliases, not `interface`s, on
// purpose. Supabase's `GenericTable` constraint requires each Row to satisfy
// `Record<string, unknown>`, and an `interface` is *not* assignable to that
// (interfaces have no implicit index signature because they're open to
// declaration merging). A `type` alias is. Using `interface` here silently
// collapses every query result to `never`.
export type WaitlistRow = {
  id: string;
  full_name: string;
  email: string;
  user_category: string | null;
  country: string | null;
  joined_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  user_category: string | null;
  is_admin: boolean;
  is_banned: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
};

export type PlanId = 'essential' | 'pro';
export type OrderStatus = 'reserved' | 'paid' | 'shipped' | 'cancelled';

export type OrderRow = {
  id: string;
  user_id: string;
  plan: PlanId;
  status: OrderStatus;
  amount_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

/** A saved gesture layout: maps each key id to the command assigned to it. */
export type GestureLayout = Record<string, string>;

export type GestureConfigRow = {
  id: string;
  user_id: string;
  name: string;
  layout: GestureLayout;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at'> & { created_at?: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      gesture_configs: {
        Row: GestureConfigRow;
        Insert: Omit<GestureConfigRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<GestureConfigRow>;
        Relationships: [];
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
        Relationships: [];
      };
    };
    // Empty schema sections use the canonical `{ [_ in never]: never }` shape the
    // Supabase type generator emits — required so `public` satisfies the client's
    // `GenericSchema` constraint (otherwise every table degrades to `never`).
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
