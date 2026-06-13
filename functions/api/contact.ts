interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

type PagesContext<E> = {
  request: Request;
  env: E;
};

type PagesFunction<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const requiredFields = ["full_name", "email", "phone", "service_type", "notes"];
const defaultContactToEmail = "info@deratservis.cz";
const defaultContactFromEmail = "info@deratservis.cz";

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "POST") {
    return json({ message: "Metoda není povolena." }, 405);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ message: "Neplatný formát požadavku." }, 400);
  }

  if (String(formData.get("company") || "").trim() !== "") {
    return json({ message: "Děkujeme, zpráva byla přijata." });
  }

  for (const field of requiredFields) {
    if (!String(formData.get(field) || "").trim()) {
      return json({ message: "Prosím vyplňte všechna povinná pole." }, 422);
    }
  }

  const email = String(formData.get("email"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: "Zadejte platný e-mail." }, 422);
  }

  const token = String(formData.get("cf-turnstile-response") || "");
  const turnstileOk = await verifyTurnstile(token, request, env);
  if (!turnstileOk) {
    return json({ message: "Ověření formuláře se nezdařilo. Zkuste to prosím znovu." }, 400);
  }

  const payload = {
    fullName: String(formData.get("full_name")),
    email,
    phone: String(formData.get("phone")),
    serviceType: String(formData.get("service_type")),
    notes: String(formData.get("notes"))
  };

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL || defaultContactFromEmail,
      to: [env.CONTACT_TO_EMAIL || defaultContactToEmail],
      reply_to: payload.email,
      subject: `Nová poptávka: ${payload.serviceType}`,
      html: renderEmail(payload)
    })
  });

  if (!resendResponse.ok) {
    return json({ message: "Zprávu se nepodařilo odeslat. Zkuste to prosím později." }, 502);
  }

  return json({ message: "Děkujeme, zpráva byla úspěšně odeslána." });
};

async function verifyTurnstile(token: string, request: Request, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = await response.json() as { success?: boolean };
  return Boolean(result.success);
}

function renderEmail(payload: Record<string, string>) {
  return `
    <h1>Nová poptávka z webu DERATservis</h1>
    <p><strong>Jméno:</strong> ${escapeHtml(payload.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(payload.phone)}</p>
    <p><strong>Typ služby:</strong> ${escapeHtml(payload.serviceType)}</p>
    <p><strong>Zpráva:</strong></p>
    <p>${escapeHtml(payload.notes).replace(/\n/g, "<br>")}</p>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
