interface Env {
  SERVICE_INTERNAL_TOKEN?: string;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function json(data: JsonValue, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers || {}),
    },
  });
}

function ok(data: JsonValue = {}): Response {
  return json({ ok: true, data });
}

function fail(status: number, code: string, message: string): Response {
  return json(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

function isAuthorized(request: Request, env: Env): boolean {
  const token = env.SERVICE_INTERNAL_TOKEN;

  if (!token) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${token}`;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return ok({ service: "template-worker", status: "healthy" });
    }

    if (request.method === "POST" && url.pathname === "/internal/example") {
      if (!isAuthorized(request, env)) {
        return fail(401, "UNAUTHORIZED", "Unauthorized");
      }

      return ok({ received: true });
    }

    return fail(404, "NOT_FOUND", "Not found");
  },
};

export default worker;
