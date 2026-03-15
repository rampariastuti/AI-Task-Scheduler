import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const getTaskRecommendation = async (tasks: any[]) => {
  const pending = tasks.filter(t => t.status !== "completed");
  const urgent = pending.filter(t => t.priority === 3);
  
  if (pending.length === 0) {
    return "All systems clear. No pending tasks detected.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Context: User has ${pending.length} tasks remaining. ${urgent.length} are URGENT.
    Task List: ${pending.map(t => t.title).join(", ")}

    Provide a 1-sentence feedback. 
    Acknowledge exactly how many tasks are left. 
    Tell them to prioritize the ${urgent.length} urgent ones if they exist.
    Keep it under 15 words. Professional and direct.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    return `You have ${pending.length} tasks remaining. Prioritize urgent items first.`;
  }
};