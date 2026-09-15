import { translate, formatComparison } from "../src/core";
import type { Unit } from "../src/core";

// Cloudflare Pages Functions runtime globals (HTMLRewriter, PagesFunction, Request,
// Response) aren't declared here on purpose -- pulling in @cloudflare/workers-types
// collides with the root tsconfig's DOM lib (used by src/), and this file isn't part
// of that build anyway (Cloudflare compiles functions/ separately at deploy time).
// Correctness here is verified at runtime via `wrangler pages dev`, not tsc.
/* eslint-disable @typescript-eslint/no-explicit-any */

const VALID_UNITS: Unit[] = ["in", "ft", "yd", "mi", "cm", "m", "km"];

export const onRequestGet = async (context: any): Promise<any> => {
  const url = new URL(context.request.url);
  const d = url.searchParams.get("d");
  const u = url.searchParams.get("u");

  const response = await context.next();

  if (!d || !u || !VALID_UNITS.includes(u as Unit)) return response;

  const value = Number(d);
  if (!Number.isFinite(value) || value <= 0) return response;

  const result = translate(value, u as Unit);
  if (result.comparisons.length === 0) return response;

  const title = `${value} ${u} — NGenWay Measure`;
  const description = result.comparisons.map(formatComparison).join(" · ");

  const rewriter = new (globalThis as any).HTMLRewriter()
    .on("title", { element: (el: any) => el.setInnerContent(title) })
    .on('meta[name="description"]', { element: (el: any) => el.setAttribute("content", description) })
    .on('meta[property="og:title"]', { element: (el: any) => el.setAttribute("content", title) })
    .on('meta[property="og:description"]', { element: (el: any) => el.setAttribute("content", description) })
    .on('meta[name="twitter:title"]', { element: (el: any) => el.setAttribute("content", title) })
    .on('meta[name="twitter:description"]', { element: (el: any) => el.setAttribute("content", description) });

  return rewriter.transform(response);
};
