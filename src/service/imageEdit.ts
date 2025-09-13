import OpenAI from 'openai';

// Initialize OpenAI client
const client = new OpenAI({
  apiKey:  import.meta.env.VITE_OPENAI_API_KEY, // You'll need to set this in your environment
  dangerouslyAllowBrowser: true // Required for browser usage
});

// Fixed prompt for image editing
const FIXED_PROMPT = "Change the pose of the person in [Image 1] to mimic the person's pose in [Image 2]. Do not modify excessive outside features in [Image 1].";

export interface ImageEditRequest {
  image1: File; // The image to change the pose of
  image2: File; // The image to mimic the pose of
}

export interface ImageEditResponse {
  success: boolean;
  imageB64?: string;
  error?: string;
}


/**
 * Edit two images using GPT-image-1 model
 */
export const editImages = async ({ image1, image2 }: ImageEditRequest): Promise<ImageEditResponse> => {
  try {
    // Validate input files
    if (!image1 || !image2) {
      return {
        success: false,
        error: 'Both images are required'
      };
    }
    
    console.log("image1", image1);

    // Check file types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(image1.type) || !allowedTypes.includes(image2.type)) {
      return {
        success: false,
        error: 'Only PNG, JPEG, JPG, and WebP images are supported'
      };
    }

    console.log("pass check");

    // Check file sizes (OpenAI has limits)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (image1.size > maxSize || image2.size > maxSize) {
      return {
        success: false,
        error: 'Images must be smaller than 4MB each'
      };
    }

    // Call OpenAI API - pass files directly as an array
    const response = await client.images.edit({
      model: "gpt-image-1",
      image: [image1, image2],
      prompt: FIXED_PROMPT,
      n: 1,
      size: "1024x1024"
    });

    console.log("pass openai api check");

    console.log("response", response);

    // Get b64_json from response
    const imageB64 = response.data?.[0]?.b64_json;
    
    if (!imageB64) {
      return {
        success: false,
        error: 'Failed to generate image data from OpenAI response'
      };
    }

    return {
      success: true,
      imageB64,
    };

  } catch (error: any) {
    console.error('Image editing error:', error);
    
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

    return {
      success: false,
      error: error?.message || 'An unexpected error occurred while editing images'
    };
  }
};

/**
 * Convert base64 string to blob
 */
export const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};
