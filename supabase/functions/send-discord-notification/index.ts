import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiscordNotificationRequest {
  discordIds: string[];
  message: string;
  portalLink?: string;
}

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1407623895783178332/ls7n07Jbhpsb5ItLJ0Dm3NL5-UU-sdz9gNEwh8snwjRfB4pJryxVaTd52ToBQPJz5cYQ";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discordIds, message, portalLink }: DiscordNotificationRequest = await req.json();

    console.log('Discord notification request:', { discordIds, message, portalLink });

    if (!discordIds || discordIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No Discord IDs provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Filtrer les Discord IDs valides (doivent être des nombres)
    const validDiscordIds = discordIds.filter(id => id && /^\d+$/.test(id.trim()));
    
    if (validDiscordIds.length === 0) {
      console.log('No valid Discord IDs found');
      return new Response(
        JSON.stringify({ success: true, message: 'No valid Discord IDs to notify' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Créer les mentions Discord
    const mentions = validDiscordIds.map(id => `<@${id.trim()}>`).join(', ');
    
    // Construire le message Discord
    let discordMessage = `${mentions}\n\n${message}`;
    
    if (portalLink) {
      discordMessage += `\n\n🔗 **Lien du portail:** ${portalLink}`;
    }

    // Envoyer le webhook Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: discordMessage,
        allowed_mentions: {
          users: validDiscordIds
        }
      }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord webhook error:', errorText);
      throw new Error(`Discord webhook failed: ${discordResponse.status} ${errorText}`);
    }

    console.log('Discord notification sent successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Discord notification sent successfully',
        notifiedIds: validDiscordIds
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-discord-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
