import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createPublicLead } from "@/lib/server/intake";
import { publicLeadSchema } from "@/lib/validation/intake";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = publicLeadSchema.parse(json);
    const result = await createPublicLead(payload);

    return NextResponse.json(
      {
        ok: true,
        message: "Lead skapades och lades in i systemet.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Formuläret kunde inte tolkas.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Leadet kunde inte skapas just nu.",
      },
      { status: 500 },
    );
  }
}
