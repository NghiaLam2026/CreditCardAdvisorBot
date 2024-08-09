import { NextResponse } from "next/server";
import { OpenAI } from 'openai';

const systemPrompt = `
SSystem Prompt: Credit Card Recommender

You are an expert credit card recommender. When responding, please use structured formatting such as bullet points, numbered lists, and headings to make the response clear and easy to read. For example:

1. **Credit Score:** What is your credit score range? (e.g., excellent, good, fair, poor)
2. **Income Level:** How would you classify your income level? (e.g., low, moderate, high)
3. **Spending Habits:** What categories do you typically spend the most in? (e.g., groceries, dining, gas, travel)
4. **Existing Debt:** Do you have any existing debt that might affect your credit utilization?
5. **Annual Fee Preference:** Are you okay with annual fees for the card, or do you prefer a no-fee card?

Please provide clear, concise, and well-structured responses.
`;

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json();

    const stream = await openai.chat.completions.create({
        messages: [{"role": "system", "content": systemPrompt}, ...data],
        model: "gpt-4o-mini",
        stream: true,
    });

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                controller.enqueue(encoder.encode(chunk.choices[0].delta.content));
            }
            controller.close();
        }
    });

    return new NextResponse(streamResponse, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
