import { Inngest} from "inngest";

export const inngest = new Inngest({
    id: 'MoneyMint Inngest',
    ai: { gemini: { apiKey: process.env.GEMINI_API_KEY! }}
})