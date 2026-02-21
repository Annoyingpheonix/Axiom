import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedQuestData, StatType, VerificationMethod, VerificationResult, VerificationStatus, UserProfile, ClassType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- AGENT 1: QUEST GENERATION ---

const generatedQuestSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy RPG-style title for the quest chain." },
    description: { type: Type.STRING, description: "Flavor text describing the mission, aligned with the user's class." },
    habits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The specific actionable habit." },
          stat: { type: Type.STRING, enum: [StatType.STR, StatType.INT, StatType.DEX, StatType.CHA] },
          difficulty: { type: Type.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
          verificationMethod: { 
            type: Type.STRING, 
            enum: [
              VerificationMethod.AUTO_CONFIRM, 
              VerificationMethod.TEXT_REFLECTION, 
              VerificationMethod.GPS_CHECK, 
              VerificationMethod.PHOTO_EVIDENCE
            ] 
          },
          estimatedTimeMin: { type: Type.INTEGER, description: "Estimated minutes to complete." }
        },
        required: ["title", "stat", "difficulty", "verificationMethod", "estimatedTimeMin"]
      }
    }
  },
  required: ["title", "description", "habits"]
};

export const generateQuestFromGoal = async (
  goal: string, 
  userProfile: UserProfile, 
  classType: ClassType
): Promise<GeneratedQuestData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      ROLE: You are the Quest Generation Agent for AXIOM, a gamified OS.
      TASK: Generate a daily quest chain based on the user's goal, class, and constraints.
      
      USER CONTEXT:
      - Class: ${classType} (Use archetype flavor text appropriate for this class).
      - Goals: ${userProfile.goals.join(', ') || goal}
      - Constraints: ${userProfile.constraints.join(', ') || 'None'}
      - Trust Score: ${userProfile.trustScore} (If low, assign stricter verification methods).

      INSTRUCTIONS:
      1. Break the goal into 3 actionable daily habits.
      2. Assign an RPG attribute (STR, INT, DEX, CHA) to each.
      3. Assign a Verification Method. If the task is physical or complex, prefer PHOTO_EVIDENCE or TEXT_REFLECTION. If trivial, AUTO_CONFIRM.
      4. Ensure tasks fit within the constraints.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: generatedQuestSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as GeneratedQuestData;
  } catch (error) {
    console.error("Gemini Quest Agent Error:", error);
    return null;
  }
};

// --- AGENT 2: PERSONAL VERIFICATION ---

const verificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fraudScore: { type: Type.INTEGER, description: "0-100 probability of fraud." },
    confidence: { type: Type.INTEGER, description: "0-100 confidence in the assessment." },
    status: { type: Type.STRING, enum: [VerificationStatus.VERIFIED, VerificationStatus.REJECTED, VerificationStatus.SOFT_APPROVE] },
    notes: { type: Type.STRING, description: "Internal reasoning for the decision." }
  },
  required: ["fraudScore", "confidence", "status", "notes"]
};

export const verifyEvidence = async (
  habitTitle: string,
  evidenceText: string,
  userProfile: UserProfile
): Promise<VerificationResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      ROLE: You are the Personal Verification Agent for AXIOM.
      TASK: Analyze the user's submitted evidence for a habit completion.

      CONTEXT:
      - Habit: "${habitTitle}"
      - User's Trust Score: ${userProfile.trustScore}
      - Submitted Evidence: "${evidenceText}"

      INSTRUCTIONS:
      1. Evaluate if the evidence is plausible for the given habit.
      2. Check for low-effort gibberish or unrelated text.
      3. Assign a Fraud Score (0 = Honest, 100 = Blatant Lie).
      4. Determine Status:
         - VERIFIED: Fraud Score < 20
         - SOFT_APPROVE: Fraud Score 20-50 (User gets credit but flagged internally)
         - REJECTED: Fraud Score > 50
      5. Be fair but vigilant.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: verificationSchema,
        temperature: 0.3, // Lower temperature for more analytical/strict output
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as VerificationResult;
  } catch (error) {
    console.error("Gemini Verification Agent Error:", error);
    return null;
  }
};