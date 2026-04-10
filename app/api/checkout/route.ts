import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { location, preferences, mode, email } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&location=${location}&email=${email}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Planora ${mode} Travel Plan`,
              description: `Custom itinerary for ${location}`,
            },
            unit_amount: 900, // $9
          },
          quantity: 1,
        },
      ],
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}