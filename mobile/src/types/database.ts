export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'client';
export type ProductCategory = 'general' | 'mju' | 'retro';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          phone: string | null;
          role: UserRole;
          gucci_points: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email?: string | null;
          phone?: string | null;
          role?: UserRole;
          gucci_points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          phone?: string | null;
          role?: UserRole;
          gucci_points?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          category: ProductCategory;
          platform: string;
          image_url: string;
          points_reward: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          category?: ProductCategory;
          platform: string;
          image_url: string;
          points_reward?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          category?: ProductCategory;
          platform?: string;
          image_url?: string;
          points_reward?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          points_change: number;
          reason: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points_change: number;
          reason: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points_change?: number;
          reason?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          total_price: number;
          points_earned: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          total_price: number;
          points_earned?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          total_price?: number;
          points_earned?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_title: string;
          unit_price: number;
          quantity: number;
          image_url: string | null;
          platform: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_title: string;
          unit_price: number;
          quantity?: number;
          image_url?: string | null;
          platform?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_title?: string;
          unit_price?: number;
          quantity?: number;
          image_url?: string | null;
          platform?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_email_by_username: {
        Args: {
          p_username: string;
        };
        Returns: string | null;
      };
      get_user_email_for_recovery: {
        Args: {
          p_identifier: string;
        };
        Returns: string | null;
      };
      validate_user_recovery: {
        Args: {
          p_identifier: string;
          p_email: string;
        };
        Returns: boolean;
      };
      reset_user_password_direct: {
        Args: {
          p_identifier: string;
          p_email: string;
          p_new_password: string;
        };
        Returns: boolean;
      };
      set_user_role: {
        Args: {
          p_user_id: string;
          p_role: UserRole;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      product_category: ProductCategory;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
