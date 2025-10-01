import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DiscordNotificationRequest {
  senderEmail: string;
  senderName?: string;
  senderDiscordId?: string; // <-- ajouté pour pinger l'expéditeur
  recipientEmails: string[];
  recipientDiscordIds: string[];
  subject: string;
  content: string;
}

const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL") ?? "https://discord.com/api/webhooks/1423024547866607789/andgHH1qqc2V3c-fFgEU5iosLhyAJlKEY7hWvkTR8IUSIe6TlsWKPGa1zHi4EPw8pKnb"; // <-- sécurise l’URL via variable d’env

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

    // Vérifie qu'il y a bien des destinataires
    const validRecipientIds = (recipientDiscordIds || [])
      .filter(id => id && /^\d+$/.test(id.trim()));

    // Vérifie expéditeur
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

    // Mentions formatées
    const senderMention = validSenderId
      ? `<@${validSenderId}>`
      : (senderName || senderEmail);

    const recipientMentions = validRecipientIds.length > 0
      ? validRecipientIds.map(id => `<@${id}>`).join(', ')
      : recipientEmails.join(', ');

    // Construction du message final
    const discordMessage = `**📧 Nouveau Message Interne**\n\n` +
      `📤 **De :** ${senderMention}\n` +
      `📥 **À :** ${recipientMentions}\n` +
      `📋 **Objet :** ${subject}\n\n` +
      `💬 ${content}\n\n` +
      `🔗 Consultez le portail agent pour répondre`;

    // Envoi à Discord
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
