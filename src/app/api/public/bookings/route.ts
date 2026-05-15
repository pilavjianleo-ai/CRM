import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createPublicBooking } from "@/lib/server/intake";
import { publicBookingSchema } from "@/lib/validation/intake";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = publicBookingSchema.parse(json);
    const result = await createPublicBooking(payload);

    return NextResponse.json(
      {
        ok: true,
        message: "Bokningen skapades och lades in i systemet.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Bokningsformuläret kunde inte tolkas.",
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
            : "Bokningen kunde inte skapas just nu.",
      },
      { status: 500 },
    );
  }
}
