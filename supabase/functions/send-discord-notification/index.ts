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

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1366518462268309584/iKINV7L2uKe-EUJqe_JocDPhbm-L5_TG_wLn9lT-vMD-o2w5Ixj0-pAqa2gZZBHoeSHA";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[Discord Webhook] Début du traitement...');
    
    const {
      senderEmail,
      senderName,
      senderDiscordId,
      recipientEmails,
      recipientDiscordIds,
      subject,
      content
    }: DiscordNotificationRequest = await req.json();

    console.log('[Discord Webhook] Requête reçue:', {
      senderEmail,
      senderName,
      senderDiscordId,
      recipientEmailsCount: recipientEmails?.length || 0,
      recipientDiscordIdsCount: recipientDiscordIds?.length || 0,
      subject
    });

    // Validation et nettoyage des Discord IDs
    const validRecipientIds = (recipientDiscordIds || [])
      .filter(id => {
        if (!id) return false;
        const trimmedId = String(id).trim();
        const isValid = /^\d+$/.test(trimmedId);
        if (!isValid) {
          console.warn(`[Discord Webhook] Discord ID invalide ignoré: "${id}"`);
        }
        return isValid;
      })
      .map(id => String(id).trim());

    let validSenderId: string | null = null;
    if (senderDiscordId) {
      const trimmedSenderId = String(senderDiscordId).trim();
      if (/^\d+$/.test(trimmedSenderId)) {
        validSenderId = trimmedSenderId;
      } else {
        console.warn(`[Discord Webhook] Discord ID expéditeur invalide: "${senderDiscordId}"`);
      }
    }

    console.log(`[Discord Webhook] IDs valides - Expéditeur: ${validSenderId ? 'oui' : 'non'}, Destinataires: ${validRecipientIds.length}`);

    if (!validSenderId && validRecipientIds.length === 0) {
      console.log('[Discord Webhook] Aucun Discord ID valide, pas de notification à envoyer');
      return new Response(
        JSON.stringify({ success: true, message: 'No valid Discord IDs to notify' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Construire la ligne de ping
    let pingLine = "";
    if (validSenderId) {
      pingLine = `<@${validSenderId}> `;
    }

    if (validRecipientIds.length > 0) {
      pingLine += validRecipientIds.map(id => `<@${id}>`).join(' ');
    }

    const senderDisplay = senderName || senderEmail;
    const recipientsDisplay = (recipientEmails || []).join(', ');

    // Construire le message Discord
    let discordMessage = `${pingLine}\n\n` +
      `**📬 Nouveau message interne**\n\n` +
      `**Expéditeur :** ${senderDisplay}\n` +
      `**Destinataire(s) :** ${recipientsDisplay}\n` +
      `**Objet :** ${subject}\n\n` +
      `**Contenu :**\n${content}`;

    // Discord a une limite de 2000 caractères par message
    if (discordMessage.length > 2000) {
      console.warn(`[Discord Webhook] Message trop long (${discordMessage.length} chars), troncature...`);
      discordMessage = discordMessage.substring(0, 1950) + '\n\n... _(message tronqué)_';
    }

    console.log(`[Discord Webhook] Envoi au webhook Discord (${discordMessage.length} caractères)...`);

    const webhookPayload = {
      content: discordMessage
    };

    console.log('[Discord Webhook] Payload:', JSON.stringify(webhookPayload, null, 2));

    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('[Discord Webhook] Erreur Discord API:', {
        status: discordResponse.status,
        statusText: discordResponse.statusText,
        error: errorText
      });
      throw new Error(`Discord webhook failed: ${discordResponse.status} - ${errorText}`);
    }

    console.log('[Discord Webhook] Notification envoyée avec succès!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Discord notification sent successfully',
        notifiedIds: [...validRecipientIds, ...(validSenderId ? [validSenderId] : [])],
        messageLength: discordMessage.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('[Discord Webhook] Erreur fatale:', error);
    console.error('[Discord Webhook] Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});