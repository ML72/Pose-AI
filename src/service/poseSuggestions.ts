/**
 * Pose Suggestions Service
 * 
 * This service uses OpenAI's GPT-4 Vision model to analyze poses and provide improvement suggestions.
 * 
 * Setup:
 * 1. Get an OpenAI API key
 * 2. Add VITE_OPENAI_API_KEY to your environment variables
 * 
 * Usage Example:
 * ```typescript
 * import { analyzePoses } from './service/poseSuggestions';
 * 
 * // Full analysis with reference poses
 * const result = await analyzePoses({
 *   originalImage: originalFile,
 *   referenceImage1: referenceFile1,
 *   referenceImage2: referenceFile2
 * });
 * 
 * ```
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fixed prompt for pose analysis and suggestions
const POSE_ANALYSIS_PROMPT = `You are an expert pose analyst instructor. I will provide you with three images:

1. Image 1: An original image of a person in a pose
2. Image 2: A reference image showing suggested poses for the original pose
3. Image 3: A reference image showing suggested poses for the original pose

Instructions:
The user wants the desired style of the pose of DESIRED_STYLE.
Prioritize feedback on PRIORITIZED_AREAS.
The language should be more OUTPUT_MODE.

Please analyze the original pose and the two reference poses. Provide detailed feedback to allow person in the origianl pose [Image 1] to mimic each of the reference poses [Image 2] and [Image 3]. Be encouraging but specific in your feedback.
`;

export interface PoseSuggestionRequest {
  originalImage: File;
  referenceImage1: File;
  referenceImage2: File;
  desiredStyle: string[];
  prioritizedAreas: string[];
  outputMode: string;
}

export interface PoseChange {
  referenceImage: number;
  changeDescription: string;
  benefit: string;
}

export interface PoseAnalysisResult {
  suggestedImprovements: string;
  poseChanges: PoseChange[];
  overallFeedback: string;
}

export interface PoseSuggestionResponse {
  success: boolean;
  suggestedImprovements?: string;
  poseChanges?: PoseChange[];
  overallFeedback?: string;
  error?: string;
}

// JSON Schema for structured output
const poseAnalysisSchema = {
  type: "object",
  properties: {
    suggestedImprovements: {
      type: "string",
      description: "Specific advice for improvement based for the person in the original pose [Image 1] to mimic each of the reference poses [Image 2] and [Image 3]"
    },
    poseChanges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          referenceImage: {
            type: "number",
            description: "Reference image number (1 or 2)",
            enum: [1, 2]
          },
          changeDescription: {
            type: "string",
            description: "How to adjust from the original pose [Image 1] to the reference pose [Image 2] or [Image 3]"
          },
          benefit: {
            type: "string",
            description: "Why this change would be beneficial for the person in the original pose [Image 1]"
          }
        },
        required: ["referenceImage", "changeDescription", "benefit"],
        additionalProperties: false
      }
    },
    overallFeedback: {
      type: "string",
      description: "General assessment and encouragement for the person in the original pose [Image 1]"
    }
  },
  required: ["suggestedImprovements", "poseChanges", "overallFeedback"],
  additionalProperties: false
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      resolve(base64.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Analyze poses and get improvement suggestions using Claude API
 */
export const analyzePoses = async ({
  originalImage,
  referenceImage1,
  referenceImage2,
  desiredStyle,
  prioritizedAreas,
  outputMode
}: PoseSuggestionRequest): Promise<PoseSuggestionResponse> => {
  try {
    // Validate input files
    if (!originalImage || !referenceImage1 || !referenceImage2) {
      return {
        success: false,
        error: 'All three images (original and two references) are required'
      };
    }

    // Check file types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const images = [originalImage, referenceImage1, referenceImage2];
    
    for (const image of images) {
      if (!allowedTypes.includes(image.type)) {
        return {
          success: false,
          error: 'Only PNG, JPEG, JPG, and WebP images are supported'
        };
      }
    }

    // Check file sizes (Claude has limits)
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const image of images) {
      if (image.size > maxSize) {
        return {
          success: false,
          error: 'Images must be smaller than 5MB each'
        };
      }
    }

    // Convert images to base64
    const [originalB64, reference1B64, reference2B64] = await Promise.all([
      fileToBase64(originalImage),
      fileToBase64(referenceImage1),
      fileToBase64(referenceImage2)
    ]);

    const prompt = POSE_ANALYSIS_PROMPT.replace('DESIRED_STYLE', desiredStyle.join(', and ')).replace('PRIORITIZED_AREAS', prioritizedAreas.join(', and ')).replace('OUTPUT_MODE', outputMode);
    
    // Prepare the message with images using structured output
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${originalImage.type};base64,${originalB64}`,
                detail: 'high'
              }
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${referenceImage1.type};base64,${reference1B64}`,
                detail: 'high'
              }
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${referenceImage2.type};base64,${reference2B64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pose_analysis",
          schema: poseAnalysisSchema
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: 'Failed to get response from OpenAI API'
      };
    }

    console.log("content", content);

    // Parse the structured JSON response (should always be valid JSON)
    try {
      const analysisResult: PoseAnalysisResult = JSON.parse(content);
      
      return {
        success: true,
        suggestedImprovements: analysisResult.suggestedImprovements,
        poseChanges: analysisResult.poseChanges,
        overallFeedback: analysisResult.overallFeedback,
      };
    } catch (parseError) {
      console.error('Failed to parse structured response as JSON:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis results. The AI response was not in the expected format.'
      };
    }

  } catch (error: any) {
    console.error('Pose analysis error:', error);
    
    // Handle specific OpenAI errors
    if (error?.error?.code === 'invalid_api_key') {
      return {
        success: false,
        error: 'Invalid OpenAI API key. Please check your configuration.'
      };
    }
    
    if (error?.error?.code === 'rate_limit_exceeded') {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      };
    }

    if (error?.error?.code === 'insufficient_quota') {
      return {
        success: false,
        error: 'OpenAI API quota exceeded. Please check your billing.'
      };
    }

    return {
      success: false,
      error: error?.message || 'An unexpected error occurred while analyzing poses'
    };
  }
};

export default {
  analyzePoses
};
