import { NextResponse } from "next/server";
import { recordAnalyticsEvent, type AnalyticsEventInput } from "@/lib/analytics";

type AnalyticsRequest = {
  events?: AnalyticsEventInput[];
};

const maxEventsPerRequest = 20;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AnalyticsRequest;
  const events = Array.isArray(body.events) ? body.events.slice(0, maxEventsPerRequest) : [];

  if (events.length === 0) {
    return NextResponse.json({ error: "No analytics events." }, { status: 400 });
  }

  for (const event of events) {
    await recordAnalyticsEvent(event);
  }

  return NextResponse.json({ ok: true });
}
