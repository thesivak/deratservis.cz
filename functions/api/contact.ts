interface Env {
  EMAIL_RELAY_URL?: string;
  EMAIL_RELAY_SECRET?: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

type EmailAddress = {
  email: string;
  name?: string;
};

type EmailMessage = {
  to: string | EmailAddress | (string | EmailAddress)[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
};

type PagesContext<E> = {
  request: Request;
  env: E;
};

type PagesFunction<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const requiredFields = ["full_name", "email", "phone", "service_type", "notes"];
const defaultContactToEmail = "info@deratservis.cz";
const defaultContactFromEmail = "info@deratservis.cz";
const maxBodyBytes = 64 * 1024;
const rateLimitWindowMs = 10 * 60 * 1000;
const defaultRateLimitMax = 5;
const attempts = new Map<string, number[]>();
const allowedTurnstileHostnames = new Set(["deratservis.cz", "www.deratservis.cz"]);
const allowedFields = new Set([
  "full_name",
  "email",
  "phone",
  "service_type",
  "notes",
  "company",
  "cf-turnstile-response",
]);
const limits: Record<string, number> = {
  full_name: 120,
  email: 180,
  phone: 40,
  service_type: 80,
  notes: 4000,
  company: 120,
  "cf-turnstile-response": 2048,
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "POST") {
    return json({ message: "Metoda není povolena." }, 405);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBodyBytes) return json({ message: "Neplatný požadavek." }, 413);

  const ip = clientIp(request);
  if (isRateLimited(ip, defaultRateLimitMax)) {
    return json({ message: "Zprávu se nepodařilo odeslat. Zkuste to prosím později." }, 429);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ message: "Neplatný formát požadavku." }, 400);
  }
  for (const [key, value] of formData.entries()) {
    if (!allowedFields.has(key) || typeof value !== "string") {
      return json({ message: "Neplatný požadavek." }, 400);
    }
  }

  if (readField(formData, "company") !== "") {
    return json({ message: "Děkujeme, zpráva byla přijata." });
  }

  for (const field of requiredFields) {
    if (!readField(formData, field)) {
      return json({ message: "Prosím vyplňte všechna povinná pole." }, 422);
    }
  }

  const email = readField(formData, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: "Zadejte platný e-mail." }, 422);
  }
  const phone = readField(formData, "phone");
  if (phone.replace(/\D/g, "").length < 9) {
    return json({ message: "Zadejte platné telefonní číslo." }, 422);
  }

  const token = readField(formData, "cf-turnstile-response");
  if (token) {
    const turnstileOk = await verifyTurnstile(token, request, env);
    if (!turnstileOk) {
      return json({ message: "Ověření formuláře se nezdařilo. Zkuste to prosím znovu." }, 400);
    }
  }

  const payload = {
    fullName: readField(formData, "full_name"),
    email,
    phone,
    serviceType: readField(formData, "service_type"),
    notes: readField(formData, "notes")
  };

  if (!env.EMAIL_RELAY_URL || !env.EMAIL_RELAY_SECRET) {
    return json({ message: "Odesílání není nakonfigurováno." }, 500);
  }

  try {
    const emailSent = await sendViaRelay(env, {
      from: parseEmailAddress(env.CONTACT_FROM_EMAIL || defaultContactFromEmail),
      to: env.CONTACT_TO_EMAIL || defaultContactToEmail,
      replyTo: payload.email,
      subject: `Nová poptávka: ${payload.serviceType}`,
      text: renderTextEmail(payload),
      html: renderEmail(payload)
    });
    if (!emailSent) throw new Error("Relay returned a non-OK response");
  } catch (error) {
    console.error("cloudflare_email_error", error instanceof Error ? error.message : "unknown");
    return json({ message: "Zprávu se nepodařilo odeslat. Zkuste to prosím později." }, 502);
  }

  return json({ message: "Děkujeme, zpráva byla úspěšně odeslána." });
};

async function verifyTurnstile(token: string, request: Request, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;
  const ip = clientIp(request);
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (ip !== "unknown") body.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = await response.json() as { success?: boolean; hostname?: string };
  return result.success === true && Boolean(result.hostname && allowedTurnstileHostnames.has(result.hostname));
}

function readField(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? "");
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, limits[key] ?? 4000);
}

function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string, limit = defaultRateLimitMax): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < rateLimitWindowMs);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > limit;
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

function renderTextEmail(payload: Record<string, string>) {
  return [
    "Nová poptávka z webu DERATservis",
    `Jméno: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Telefon: ${payload.phone}`,
    `Typ služby: ${payload.serviceType}`,
    "",
    payload.notes
  ].join("\n");
}

function parseEmailAddress(value: string): string | EmailAddress {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return value.trim();
  return { name: match[1].replace(/^"|"$/g, "").trim(), email: match[2].trim() };
}

async function sendViaRelay(env: Env, message: EmailMessage): Promise<boolean> {
  const response = await fetch(env.EMAIL_RELAY_URL || "", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.EMAIL_RELAY_SECRET}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });
  return response.ok;
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
