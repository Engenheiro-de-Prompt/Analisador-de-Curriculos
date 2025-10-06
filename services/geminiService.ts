
import { GoogleGenAI, Type } from "@google/genai";
import type { JobDescription, Candidate } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: base64EncodedData, mimeType: file.type },
  };
};

const buildPrompt = (jobDescription: JobDescription) => {
  return `
    You are an expert HR recruitment specialist with decades of experience. Your task is to analyze the provided resumes against the following job description.

    **Job Description:**
    - **Title:** ${jobDescription.title}
    - **Core Description:** ${jobDescription.description}
    - **Required Skills:** ${jobDescription.requiredSkills}
    - **Desirable Skills:** ${jobDescription.desirableSkills}
    - **Minimum Years of Experience:** ${jobDescription.experience}

    **Your Task:**
    1.  Carefully read and interpret each resume provided.
    2.  Compare each candidate's skills, experience, and qualifications against the job description.
    3.  For each candidate, provide a final score from 0 to 100 representing their suitability for the role. 100 is a perfect match.
    4.  Provide a concise summary of the candidate's profile.
    5.  List their key strengths that align with the job requirements.
    6.  List any notable gaps or areas where they fall short of the requirements.
    7.  Provide a final recommendation: "Recommend for Interview", "Consider for Other Roles", or "Not a Good Fit".
    8.  The candidate's name should be derived from the filename.
    9.  Return the analysis as a JSON array of objects, strictly following the provided schema. Rank the candidates in the final array from highest score to lowest score.
    `;
};

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        position: {
          type: Type.INTEGER,
          description: "The rank of the candidate, starting from 1."
        },
        candidateName: {
          type: Type.STRING,
          description: "The candidate's name, derived from the file name (e.g., 'John_Doe_CV.pdf' becomes 'John Doe')."
        },
        score: {
          type: Type.INTEGER,
          description: "A score from 0-100 indicating the candidate's match to the job description."
        },
        summary: {
          type: Type.STRING,
          description: "A concise 2-3 sentence summary of the candidate's profile and fit for the role."
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of key strengths and qualifications that align with the job."
        },
        gaps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of notable gaps or areas where the candidate falls short."
        },
        recommendation: {
          type: Type.STRING,
          description: "A final recommendation: 'Recommend for Interview', 'Consider for Other Roles', or 'Not a Good Fit'."
        }
      },
      required: ["position", "candidateName", "score", "summary", "strengths", "gaps", "recommendation"]
    }
};

export const analyzeResumes = async (
  jobDescription: JobDescription,
  resumes: File[],
  onProgress: (progress: number, message: string) => void
): Promise<Candidate[]> => {
    onProgress(0.1, 'Building prompt and converting files...');
    const prompt = buildPrompt(jobDescription);
    const resumeParts = await Promise.all(resumes.map(fileToGenerativePart));
    
    // Add filenames to the prompt to help the model identify candidates
    const fileNames = resumes.map((file, index) => `Resume ${index + 1}: ${file.name}`).join('\n');
    const fullPrompt = `${prompt}\n\n**Attached Resumes:**\n${fileNames}`;

    const contents = {
        parts: [{ text: fullPrompt }, ...resumeParts]
    };
    
    onProgress(0.4, 'Sending request to AI model...');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });
        
        onProgress(0.8, 'Parsing AI response...');
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as Candidate[];
        
        // Ensure the result is sorted by score as requested, in case the model didn't.
        result.sort((a, b) => b.score - a.score);
        // Re-assign position after sorting
        const finalResult = result.map((candidate, index) => ({
            ...candidate,
            position: index + 1
        }));

        onProgress(1, 'Analysis complete!');
        return finalResult;
    } catch (e: any) {
        if (e.message.includes('API_KEY_INVALID')) {
            throw new Error('The provided API key is invalid. Please check your environment variables.');
        }
        if (e instanceof SyntaxError) {
             throw new Error('The AI returned an invalid response format. This may be a temporary issue. Please try again.');
        }
        throw new Error(`An error occurred during AI analysis: ${e.message}`);
    }
};
