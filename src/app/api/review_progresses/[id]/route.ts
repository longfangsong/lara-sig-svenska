import { auth } from "@/lib/auth";
import { updateReviewProgress } from "@/lib/data/review_progress";
import { ReviewProgressPatchPayload } from "@/lib/types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = auth((async (
  request: NextRequest,
  { params: { id } }: { params: { id: string } },
) => {
  const req = request as NextRequest & { auth: Session };
  if (!req.auth.user?.email) {
    return new NextResponse(null, { status: 401 });
  }
  const db = getRequestContext().env.DB;
  const payload = await request.json<ReviewProgressPatchPayload>();
  await updateReviewProgress(db, id, payload);
  return NextResponse.json(null);
}) as any);
