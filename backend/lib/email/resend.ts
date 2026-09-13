const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "AdotaPerto <onboarding@resend.dev>";
const REQUEST_TIMEOUT_MS = 10_000;

type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type ResendErrorResponse = {
  message?: string;
};

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: TransactionalEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY n\u00e3o est\u00e1 configurada no ambiente do backend.",
    );
  }

  let response: Response;
  try {
    response = await fetch(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM?.trim() || DEFAULT_FROM,
        to: [to],
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "erro de rede";
    throw new Error(`N\u00e3o foi poss\u00edvel acessar o Resend: ${reason}`);
  }

  if (!response.ok) {
    const body = await readResendError(response);
    const detail = body?.message ? `: ${body.message}` : "";
    throw new Error(`O Resend recusou o envio (${response.status})${detail}`);
  }
}

async function readResendError(response: Response) {
  try {
    return (await response.json()) as ResendErrorResponse;
  } catch {
    return null;
  }
}

export function passwordResetEmail(otp: string) {
  return {
    subject: "Seu c\u00f3digo para redefinir a senha",
    text: [
      "AdotaPerto",
      "",
      `Use o c\u00f3digo ${otp} para redefinir sua senha.`,
      "O c\u00f3digo expira em 10 minutos.",
      "",
      "Se voc\u00ea n\u00e3o solicitou esta altera\u00e7\u00e3o, ignore este e-mail.",
    ].join("\n"),
    html: emailLayout({
      preview: `Seu c\u00f3digo de recupera\u00e7\u00e3o \u00e9 ${otp}`,
      title: "Redefini\u00e7\u00e3o de senha",
      content: `<p style="margin:0 0 20px">Use o c&oacute;digo abaixo para redefinir sua senha:</p><p style="margin:0 0 20px;font-size:32px;font-weight:800;letter-spacing:8px;color:#0f5d39">${escapeHtml(otp)}</p><p style="margin:0">O c&oacute;digo expira em 10 minutos.</p>`,
      footer:
        "Se voc&ecirc; n&atilde;o solicitou esta altera&ccedil;&atilde;o, ignore este e-mail.",
    }),
  };
}

export function emailVerificationEmail(url: string) {
  return {
    subject: "Confirme seu novo e-mail",
    text: [
      "AdotaPerto",
      "",
      "Confirme seu novo endere\u00e7o de e-mail acessando o link abaixo:",
      url,
      "",
      "Se voc\u00ea n\u00e3o solicitou esta altera\u00e7\u00e3o, ignore este e-mail.",
    ].join("\n"),
    html: emailLayout({
      preview: "Confirme seu novo endere\u00e7o de e-mail no AdotaPerto",
      title: "Confirme seu novo e-mail",
      content: `<p style="margin:0 0 22px">Clique no bot&atilde;o para confirmar seu novo endere&ccedil;o de e-mail.</p><p style="margin:0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#256441;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Confirmar novo e-mail</a></p>`,
      footer:
        "Se voc&ecirc; n&atilde;o solicitou esta altera&ccedil;&atilde;o, ignore este e-mail.",
    }),
  };
}

function emailLayout({
  preview,
  title,
  content,
  footer,
}: {
  preview: string;
  title: string;
  content: string;
  footer: string;
}) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f3f7f4;padding:24px"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div><main style="max-width:560px;margin:0 auto;border:1px solid #d7e6da;border-radius:12px;background:#ffffff;padding:32px;font-family:Arial,sans-serif;color:#243129"><p style="margin:0 0 22px;font-size:20px;font-weight:800;color:#0f5d39">AdotaPerto</p><h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#121e17">${escapeHtml(title)}</h1>${content}<hr style="margin:28px 0 20px;border:0;border-top:1px solid #d7e6da"><p style="margin:0;font-size:13px;line-height:1.6;color:#68726b">${footer}</p></main></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!,
  );
}
