
import { supabase } from "@/integrations/supabase/client";

export const debugCompetitionRouting = async (competitionId: string) => {
  console.log('=== Competition Routing Debug ===');
  console.log('Competition ID:', competitionId);
  console.log('Current URL:', window.location.pathname);
  
  try {
    const { data: competition, error } = await supabase
      .from('dhs_competitions')
      .select('id, title')
      .eq('id', competitionId)
      .single();
    
    console.log('Competition exists:', !!competition);
    console.log('Competition data:', competition);
    console.log('Query error:', error);
    
    if (competition) {
      console.log('✅ Competition found:', competition.title);
    } else {
      console.log('❌ Competition not found');
      
      // List all competitions to help debug
      const { data: allCompetitions } = await supabase
        .from('dhs_competitions')
        .select('id, title')
        .limit(10);
      
      console.log('Available competitions:', allCompetitions);
    }
  } catch (err) {
    console.error('Debug error:', err);
  }
  
  console.log('=== End Debug ===');
};
