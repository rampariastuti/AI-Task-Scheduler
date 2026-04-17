import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const getSingleTaskAnalysis = async (task: {
  title: string;
  description: string;
  priority: number;
  status: string;
  deadline?: string;
}) => {
  // If no API key, return fallback immediately
  if (!apiKey) {
    return getFallbackResponse(task);
  }

  try {
    // Use the correct model name from your working curl command
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const priorityText = task.priority === 3 ? "CRITICAL" : task.priority === 2 ? "MEDIUM" : "LOW";
    const statusText = task.status === "completed" ? "COMPLETED" : "IN PROGRESS";
    const deadlineText = task.deadline ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}` : "No deadline set";

    const prompt = `
      Analyze this single task and provide helpful feedback:
      
      TASK DETAILS:
      Title: "${task.title}"
      Description: "${task.description}"
      Priority: ${priorityText} (${task.priority}/3)
      Status: ${statusText}
      ${deadlineText}

      Please provide a comprehensive analysis with the following structure:

      1. TASK SUMMARY: Briefly restate what needs to be done
      2. PRIORITY ASSESSMENT: Why this priority level makes sense for this task
      3. TIME CONSIDERATION: ${task.deadline ? "Comment on the deadline urgency" : "No deadline - suggest setting one if time-sensitive"}
      4. ACTIONABLE RECOMMENDATIONS: 2-3 specific next steps
      5. ESTIMATED EFFORT: Low/Medium/High and why

      Keep the tone professional, helpful, and concise. Use bullet points for recommendations.
      Format the response nicely with clear sections.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackResponse(task);
  }
};

// Helper function for fallback response
function getFallbackResponse(task: {
  title: string;
  priority: number;
  deadline?: string;
}) {
  const priorityText = task.priority === 3 ? "CRITICAL" : task.priority === 2 ? "MEDIUM" : "LOW";
  
  return `📋 TASK ANALYSIS: "${task.title}"

⚠️ PRIORITY: ${priorityText} - ${task.priority === 3 ? "Immediate action required" : task.priority === 2 ? "Schedule accordingly" : "Can be handled when free"}

💡 RECOMMENDATIONS:
• Review the task requirements carefully
• Break down into smaller subtasks
• ${task.deadline ? `Meet the deadline: ${new Date(task.deadline).toLocaleDateString()}` : "Consider setting a deadline for better tracking"}

⏱️ ESTIMATED EFFORT: ${task.priority === 3 ? "High - Critical path item" : task.priority === 2 ? "Medium - Requires focus" : "Low - Quick win"}`;
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