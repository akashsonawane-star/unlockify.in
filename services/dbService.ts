
import { supabase } from './supabaseClient';
import { UserProfile, HistoryItem } from '../types';

export const dbService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Prevent querying Supabase with non-UUID demo IDs to avoid Postgres syntax errors
    if (userId.startsWith('demo-user-')) {
        return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
        // Log the error and throw it so the caller knows the DB query failed
        console.error("Supabase Profile Fetch Error:", error.message || error);
        throw error;
    }

    if (!data) {
        return null;
    }
    
    return {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        businessName: data.business_name || '',
        businessType: data.business_type || 'Salon',
        city: data.city || '',
        defaultLanguage: (data.default_language as any) || 'Hinglish',
        plan: (data.plan as any) || 'free'
    };
  },

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
      // Demo users don't have persistent database records
      if (userId.startsWith('demo-user-')) {
          return;
      }

      const dbProfile: any = { id: userId }; 
      if (profile.name !== undefined) dbProfile.name = profile.name;
      if (profile.email !== undefined) dbProfile.email = profile.email;
      if (profile.phone !== undefined) dbProfile.phone = profile.phone;
      if (profile.businessName !== undefined) dbProfile.business_name = profile.businessName;
      if (profile.businessType !== undefined) dbProfile.business_type = profile.businessType;
      if (profile.city !== undefined) dbProfile.city = profile.city;
      if (profile.defaultLanguage !== undefined) dbProfile.default_language = profile.defaultLanguage;
      if (profile.plan !== undefined) dbProfile.plan = profile.plan;

      const { error } = await supabase
          .from('profiles')
          .upsert(dbProfile, { onConflict: 'id' });
          
      if (error) throw error;
  },
  
  async upgradePlan(userId: string) {
      if (userId.startsWith('demo-user-')) {
          return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'paid' })
        .eq('id', userId);
      if (error) throw error;
  },

  async getHistory(userId: string) {
    // Demo users start with an empty history
    if (userId.startsWith('demo-user-')) {
        return [] as HistoryItem[];
    }

    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at).getTime(),
        feature: item.feature,
        input: item.input_data,
        output: item.output_data
    })) as HistoryItem[];
  },

  async addToHistory(userId: string, item: HistoryItem) {
      if (userId.startsWith('demo-user-')) {
          return null;
      }

      const { data, error } = await supabase
          .from('history')
          .insert({
              user_id: userId,
              feature: item.feature,
              input_data: item.input,
              output_data: item.output,
              created_at: new Date(item.timestamp).toISOString()
          })
          .select()
          .single();
          
      if (error) throw error;
      return data;
  },
  
  async deleteHistory(id: string) {
      const { error } = await supabase.from('history').delete().eq('id', id);
      if (error) throw error;
  }
};
