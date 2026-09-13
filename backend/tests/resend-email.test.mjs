import assert from "node:assert/strict";
import test from "node:test";
import {
  emailVerificationEmail,
  passwordResetEmail,
  sendTransactionalEmail,
} from "../lib/email/resend.ts";

test("envia o e-mail pela API do Resend com chave e remetente do ambiente", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.AUTH_EMAIL_FROM;
  let request;

  process.env.RESEND_API_KEY = "re_test_key";
  process.env.AUTH_EMAIL_FROM = "AdotaPerto <contato@example.com>";
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify({ id: "email_test" }), { status: 200 });
  };

  try {
    const message = passwordResetEmail("1234");
    await sendTransactionalEmail({ to: "pessoa@example.com", ...message });

    assert.equal(request.url, "https://api.resend.com/emails");
    assert.equal(request.init.method, "POST");
    assert.equal(request.init.headers.Authorization, "Bearer re_test_key");

    const body = JSON.parse(request.init.body);
    assert.equal(body.from, "AdotaPerto <contato@example.com>");
    assert.deepEqual(body.to, ["pessoa@example.com"]);
    assert.match(body.subject, /c\u00f3digo/i);
    assert.match(body.html, /1234/);
    assert.match(body.text, /1234/);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment("RESEND_API_KEY", originalKey);
    restoreEnvironment("AUTH_EMAIL_FROM", originalFrom);
  }
});

test("recusa o envio quando RESEND_API_KEY n\u00e3o est\u00e1 configurada", async () => {
  const originalKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  try {
    await assert.rejects(
      sendTransactionalEmail({
        to: "pessoa@example.com",
        subject: "Teste",
        html: "<p>Teste</p>",
        text: "Teste",
      }),
      /RESEND_API_KEY/,
    );
  } finally {
    restoreEnvironment("RESEND_API_KEY", originalKey);
  }
});

test("escapa a URL antes de inseri-la no HTML de confirma\u00e7\u00e3o", () => {
  const message = emailVerificationEmail(
    'https://example.com/verificar?token=1&next="perfil"',
  );

  assert.match(message.html, /token=1&amp;next=&quot;perfil&quot;/);
  assert.match(message.text, /token=1&next="perfil"/);
});

function restoreEnvironment(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
