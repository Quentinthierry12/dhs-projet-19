import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DiscordNotificationRequest {
  senderEmail: string;
  senderName?: string;
  senderDiscordId?: string;
  recipientEmails: string[];
  recipientDiscordIds: string[];
  subject: string;
  content: string;
}

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1385876590952710264/7jYrD3yLlj9WU9tQc9xA5AGpIY7D3D2gqGAV2da5Fg3PssWO1paZqMMTOadHLzlHxTYy";

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
      senderDiscordId,
      recipientEmails,
      recipientDiscordIds,
      subject,
      content
    }: DiscordNotificationRequest = await req.json();

    console.log('Discord notification request:', {
      senderEmail,
      senderName,
      senderDiscordId,
      recipientEmails,
      recipientDiscordIds,
      subject
    });

    const validRecipientIds = (recipientDiscordIds || [])
      .filter(id => id && /^\d+$/.test(id.trim()));

    const validSenderId = senderDiscordId && /^\d+$/.test(senderDiscordId.trim())
      ? senderDiscordId.trim()
      : null;

    if (!validSenderId && validRecipientIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No valid Discord IDs to notify' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let pingLine = "";
    if (validSenderId) {
      pingLine = `<@${validSenderId}> `;
    }

    if (validRecipientIds.length > 0) {
      pingLine += validRecipientIds.map(id => `<@${id}>`).join(' ');
    }

    const senderDisplay = senderName || senderEmail;
    const recipientsDisplay = recipientEmails.join(', ');

    const discordMessage = `${pingLine}\n\n` +
      `**Expéditeur :** ${senderDisplay}\n\n` +
      `**Destinataire :** ${recipientsDisplay}\n\n` +
      `**Objet :** ${subject}\n\n` +
      `**Contenu :**\n${content}`;

    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: discordMessage,
        allowed_mentions: {
          users: [...validRecipientIds, ...(validSenderId ? [validSenderId] : [])]
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
        notifiedIds: [...validRecipientIds, ...(validSenderId ? [validSenderId] : [])]
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