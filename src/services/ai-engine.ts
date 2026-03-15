"use server";

export async function getAIMatch(volunteer: any, task: any) {
  const apiKey = process.env.AI_API_KEY;

  const prompt = `
    Task: ${task.title} (Requires: ${task.requiredSkill})
    Volunteer: ${volunteer.name} (Skills: ${volunteer.skills.join(", ")})
    
    Based on these details, provide a JSON object with:
    {
      "matchScore": (0-100),
      "reasoning": "A short 1-sentence explanation of the fit"
    }
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or your preferred model
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("AI matching failed:", error);
    return { matchScore: 0, reasoning: "Unable to calculate match at this time." };
  }
}