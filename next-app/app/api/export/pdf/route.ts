export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { mdToPdf } from "md-to-pdf";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const pdf = await mdToPdf(
      { content: markdown },
      {
        pdf_options: {
          format: "A4",
          margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
        },
      }
    );

    if (!pdf || !pdf.content) {
      throw new Error("PDF generation failed");
    }

    const filename = `${title || "document"}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdf.content);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to export PDF" },
      { status: 500 }
    );
  }
}
