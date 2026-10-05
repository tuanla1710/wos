import http from "node:http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = new URL(process.env.API_URL ?? "http://127.0.0.1:8080");

function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return (async () => {
    const { path } = await context.params;
    const search = new URL(req.url).search;
    const targetPath = `/api/${path.join("/")}${search}`;
    const raw = ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.from(await req.arrayBuffer());

    return await new Promise<NextResponse>((resolve) => {
      const headers: Record<string, string> = {};
      for (const name of ["cookie", "content-type", "x-workspace-id", "authorization"]) {
        const value = req.headers.get(name);
        if (value) headers[name] = value;
      }
      if (raw && raw.length) headers["content-length"] = String(raw.length);

      const upstream = http.request(
        {
          hostname: BACKEND.hostname,
          port: BACKEND.port || 80,
          path: targetPath,
          method: req.method,
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            const out = new NextResponse(Buffer.concat(chunks), { status: res.statusCode ?? 502 });
            const resType = res.headers["content-type"];
            if (typeof resType === "string") out.headers.set("content-type", resType);
            const disposition = res.headers["content-disposition"];
            if (typeof disposition === "string") out.headers.set("content-disposition", disposition);
            const setCookie = res.headers["set-cookie"];
            if (setCookie) {
              for (const value of setCookie) out.headers.append("set-cookie", value);
            }
            resolve(out);
          });
        },
      );
      upstream.on("error", (error) => {
        resolve(NextResponse.json({ detail: error.message }, { status: 502 }));
      });
      if (raw && raw.length) upstream.write(raw);
      upstream.end();
    });
  })();
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
