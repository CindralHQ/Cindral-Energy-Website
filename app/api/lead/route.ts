import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    // Simulate success if no webhook URL is defined locally (e.g. for preview)
    if (!webhookUrl) {
      console.log("No GOOGLE_SHEET_WEBHOOK_URL found. Simulating lead capture:");
      console.log(data);
      return NextResponse.json({ success: true, warning: 'Simulated locally without webhook' });
    }

    // Send to Google Sheets Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
