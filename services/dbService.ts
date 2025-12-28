
import { supabase } from './supabaseClient';
import { UserProfile, HistoryItem } from '../types';

/**
 * Normalizes error messages to identify network failures.
 */
const isNetworkError = (err: any): boolean => {
  const msg = err?.message?.toLowerCase() || "";
  return (
    msg.includes('failed to fetch') || 
    msg.includes('networkerror') || 
    msg.includes('load failed') ||
    err instanceof TypeError
  );
};

export const dbService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId || userId.startsWith('demo-user-')) {
        return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
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
    } catch (err: any) {
      if (isNetworkError(err)) {
        console.warn("Supabase Fetch Error: Network unreachable.");
        throw new Error("NETWORK_ERROR");
      }
      console.error("Supabase Profile Fetch Error:", err);
      throw err;
    }
  },

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
      if (!userId || userId.startsWith('demo-user-')) return;

      const dbProfile: any = { id: userId }; 
      if (profile.name !== undefined) dbProfile.name = profile.name;
      if (profile.email !== undefined) dbProfile.email = profile.email;
      if (profile.phone !== undefined) dbProfile.phone = profile.phone;
      if (profile.businessName !== undefined) dbProfile.business_name = profile.businessName;
      if (profile.businessType !== undefined) dbProfile.business_type = profile.businessType;
      if (profile.city !== undefined) dbProfile.city = profile.city;
      if (profile.defaultLanguage !== undefined) dbProfile.default_language = profile.defaultLanguage;
      if (profile.plan !== undefined) dbProfile.plan = profile.plan;

      try {
        const { error } = await supabase
            .from('profiles')
            .upsert(dbProfile, { onConflict: 'id' });
        if (error) throw error;
      } catch (err: any) {
        if (isNetworkError(err)) throw new Error("NETWORK_ERROR");
        throw err;
      }
  },
  
  async getHistory(userId: string) {
    if (!userId || userId.startsWith('demo-user-')) return [] as HistoryItem[];

    try {
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
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error("NETWORK_ERROR");
      throw err;
    }
  },

  async addToHistory(userId: string, item: HistoryItem) {
      if (!userId || userId.startsWith('demo-user-')) return null;

      try {
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
      } catch (err: any) {
        if (isNetworkError(err)) throw new Error("NETWORK_ERROR");
        throw err;
      }
  },
  
  async deleteHistory(id: string) {
      try {
        const { error } = await supabase.from('history').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        if (isNetworkError(err)) throw new Error("NETWORK_ERROR");
        throw err;
      }
  }
};
