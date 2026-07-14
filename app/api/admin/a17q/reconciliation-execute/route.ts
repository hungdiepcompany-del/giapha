import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const retiredExecutionResponse = {
  ok: false,
  status: "RETIRED",
  code: "A17Q_RECONCILIATION_ALREADY_COMPLETED",
  message:
    "A-17Q reconciliation has already completed and this execution endpoint is permanently retired.",
  rpcCalled: false,
} as const;

function respondRetired() {
  return NextResponse.json(retiredExecutionResponse, { status: 410 });
}

export async function GET() {
  return respondRetired();
}

export async function POST() {
  return respondRetired();
}

export async function PUT() {
  return respondRetired();
}

export async function PATCH() {
  return respondRetired();
}

export async function DELETE() {
  return respondRetired();
}
