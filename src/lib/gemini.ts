import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface TaskAnalysis {
  summary: string;
  priorityReason: string;
  timeNote: string;
  recommendations: string[];
  effort: "Low" | "Medium" | "High";
}

export const getSingleTaskAnalysis = async (task: {
  title: string;
  description: string;
  priority: number;
  status: string;
  deadline?: string;
}): Promise<TaskAnalysis> => {
  if (!apiKey) return getFallbackAnalysis(task);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const priorityText = task.priority === 3 ? "CRITICAL" : task.priority === 2 ? "MEDIUM" : "LOW";
    const deadlineText = task.deadline
      ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}`
      : "No deadline set";

    const prompt = `
      Analyze this task and respond ONLY with a valid JSON object — no markdown, no explanation.

      Task: "${task.title}"
      Description: "${task.description}"
      Priority: ${priorityText}
      Status: ${task.status === "completed" ? "COMPLETED" : "IN PROGRESS"}
      ${deadlineText}

      Return exactly this JSON shape:
      {
        "summary": "1-2 sentences describing what needs to be done",
        "priorityReason": "1-2 sentences explaining why this priority level fits",
        "timeNote": "${task.deadline ? "1-2 sentences on deadline urgency and time remaining" : "1-2 sentences suggesting when to tackle this without a deadline"}",
        "recommendations": ["specific step 1", "specific step 2", "specific step 3"],
        "effort": "Low" or "Medium" or "High"
      }

      Be concise and professional. Return ONLY the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "",
        priorityReason: parsed.priorityReason || "",
        timeNote: parsed.timeNote || "",
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        effort: ["Low", "Medium", "High"].includes(parsed.effort) ? parsed.effort : "Medium",
      };
    }
    return getFallbackAnalysis(task);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackAnalysis(task);
  }
};

function getFallbackAnalysis(task: {
  title: string;
  priority: number;
  deadline?: string;
}): TaskAnalysis {
  const priorityText = task.priority === 3 ? "Critical" : task.priority === 2 ? "Medium" : "Low";
  return {
    summary: `This task — "${task.title}" — requires your attention and action.`,
    priorityReason: `Rated ${priorityText} based on its scope and impact.`,
    timeNote: task.deadline
      ? `Deadline is ${new Date(task.deadline).toLocaleDateString()}. Plan accordingly.`
      : "No deadline set. Consider adding one for better tracking.",
    recommendations: [
      "Review all task requirements before starting.",
      "Break it into smaller subtasks for easier execution.",
      task.deadline ? "Work backwards from the deadline to set milestones." : "Set a personal deadline to stay on track.",
    ],
    effort: task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low",
  };
}

export const getAIPriority = async (title: string, description: string): Promise<number> => {
  if (!apiKey) return 2;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Task Title: "${title}"
      Task Description: "${description}"

      Assign a priority level. Reply with ONLY a single digit — 1, 2, or 3. Nothing else.
      1 = Low (routine, no urgency)
      2 = Medium (important, moderate urgency)
      3 = Critical (urgent, high-impact, time-sensitive)
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const p = parseInt(text.match(/[1-3]/)?.[0] || "2");
    return [1, 2, 3].includes(p) ? p : 2;
  } catch {
    return 2;
  }
};

export const createTaskFromIdea = async (idea: string): Promise<{
  title: string;
  description: string;
  priority: number;
  deadline: string;
  tags: string[];
}> => {
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 16);

  const fallback = {
    title: idea.length > 60 ? idea.slice(0, 57) + "..." : idea,
    description: `Task based on idea: "${idea}". Add more details to get started.`,
    priority: 2,
    deadline: sevenDaysLater,
    tags: ["idea", "ai-generated"],
  };

  if (!apiKey) return fallback;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `
      You are a smart task management AI assistant. The user has this idea: "${idea}"
      Today's date is ${today}.

      Create a complete actionable task from this idea. Respond ONLY with valid JSON — no markdown, no explanation:
      {
        "title": "action-oriented task title under 60 chars",
        "description": "2-3 specific sentences on what to do and how",
        "priority": 2,
        "deadline": "YYYY-MM-DDTHH:MM",
        "tags": ["tag1", "tag2"]
      }

      Priority rules:
      - 3 = Critical: urgent, high-impact, time-sensitive
      - 2 = Medium: important but not immediately urgent
      - 1 = Low: nice-to-have, low stakes

      Deadline: realistic date from today (days to weeks ahead).
      Title must start with an action verb (e.g., Build, Create, Research, Fix, Design).
      Return ONLY the JSON object, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || fallback.title,
        description: parsed.description || fallback.description,
        priority: [1, 2, 3].includes(parsed.priority) ? parsed.priority : 2,
        deadline: parsed.deadline || sevenDaysLater,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ["ai-generated"],
      };
    }
    return fallback;
  } catch (error) {
    console.error("Gemini createTaskFromIdea error:", error);
    return fallback;
  }
};

export const getTaskRecommendation = async (tasks: any[]) => {
  const pending = tasks.filter((t: any) => t.status !== "completed");
  const urgent = pending.filter((t: any) => t.priority === 3);
  
  if (pending.length === 0) {
    return "✨ All systems clear! You've completed all tasks. Great job! 🎉";
  }

  // If no API key, return fallback
  if (!apiKey) {
    if (urgent.length > 0) {
      return `⚠️ You have ${pending.length} tasks (${urgent.length} urgent). Focus on critical items first.`;
    } else {
      return `📋 ${pending.length} tasks remaining. Prioritize by deadline and importance.`;
    }
  }

  try {
    // Use the correct model name from your working curl command
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Context: User has ${pending.length} tasks remaining. ${urgent.length} are URGENT.
      Task List: ${pending.map((t: any) => t.title).join(", ")}

      Provide a 1-sentence feedback. 
      Acknowledge exactly how many tasks are left. 
      Tell them to prioritize the ${urgent.length} urgent ones if they exist.
      Keep it under 15 words. Professional and direct.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (urgent.length > 0) {
      return `⚠️ You have ${pending.length} tasks (${urgent.length} urgent). Focus on critical items first.`;
    } else {
      return `📋 ${pending.length} tasks remaining. Prioritize by deadline and importance.`;
    }
  }
};