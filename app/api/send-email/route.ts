import { Resend } from "resend";
import PDFDocument from "pdfkit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, location, plan } = await req.json();

    const doc = new PDFDocument({
      margin: 50,
    });

    const chunks: any[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBufferPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // ===== HEADER =====
    doc
      .fontSize(28)
      .fillColor("#000")
      .text("Planora", { align: "center" });

    doc
      .fontSize(12)
      .fillColor("#666")
      .text("Luxury Travel Itinerary", { align: "center" });

    doc.moveDown(2);

    // ===== DESTINATION =====
    doc
      .fontSize(20)
      .fillColor("#000")
      .text(location.toUpperCase(), { align: "center" });

    doc.moveDown(2);

    // ===== DIVIDER =====
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#ccc").stroke();
    doc.moveDown(2);

    // ===== DAYS =====
    plan.days.forEach((day: any[], i: number) => {
      // Day Title
      doc
        .fontSize(16)
        .fillColor("#000")
        .text(`Day ${i + 1}`, { underline: true });

      doc.moveDown();

      day.forEach((item: any) => {
        // Activity Title
        doc
          .fontSize(13)
          .fillColor("#000")
          .text(item.name);

        // Description
        doc
          .fontSize(11)
          .fillColor("#555")
          .text(item.description, {
            lineGap: 2,
          });

        doc.moveDown();
      });

      doc.moveDown();
    });

    // ===== FOOTER =====
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("#888")
      .text(
        "Designed by Planora — Personalized travel, perfectly planned.",
        { align: "center" }
      );

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    // ===== SEND EMAIL =====
    await resend.emails.send({
      from: "Planora <onboarding@resend.dev>",
      to: email,
      subject: `Your ${location} Luxury Itinerary ✨`,
      html: `
        <h1>Your Planora Itinerary</h1>
        <p>Your luxury trip to <b>${location}</b> is ready.</p>
        <p>Your premium PDF is attached below.</p>
      `,
      attachments: [
        {
          filename: `Planora-${location}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}