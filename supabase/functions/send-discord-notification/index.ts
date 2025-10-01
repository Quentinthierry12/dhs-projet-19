import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DiscordNotificationRequest {
  senderEmail: string;
  senderName?: string;
  recipientEmails: string[];
  recipientDiscordIds: string[];
  subject: string;
  content: string;
}

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1423024547866607789/andgHH1qqc2V3c-fFgEU5iosLhyAJlKEY7hWvkTR8IUSIe6TlsWKPGa1zHi4EPw8pKnb";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      senderEmail,
      senderName,
      recipientEmails,
      recipientDiscordIds,
      subject,
      content
    }: DiscordNotificationRequest = await req.json();

    console.log('Discord notification request:', {
      senderEmail,
      senderName,
      recipientEmails,
      recipientDiscordIds,
      subject
    });

    if (!recipientDiscordIds || recipientDiscordIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No Discord IDs to notify' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const validDiscordIds = recipientDiscordIds.filter(id => id && /^\d+$/.test(id.trim()));

    if (validDiscordIds.length === 0) {
      console.log('No valid Discord IDs found');
      return new Response(
        JSON.stringify({ success: true, message: 'No valid Discord IDs to notify' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const mentions = validDiscordIds.map(id => `<@${id.trim()}>`).join(' ');

    const displaySender = senderName || senderEmail;
    const recipientsList = recipientEmails.join(', ');

    const discordMessage = `${mentions}\n\n**📧 Nouveau Message Interne**\n\n📤 **De :** ${displaySender}\n📥 **À :** ${recipientsList}\n📋 **Objet :** ${subject}\n\n💬 ${content}\n\n🔗 Consultez le portail agent pour répondre`;

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
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-discord-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});