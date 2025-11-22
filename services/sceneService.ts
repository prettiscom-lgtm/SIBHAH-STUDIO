import { generateImage } from "./geminiService";

export const composeScene = async (productBase64: string, sceneBase64: string): Promise<Blob> => {
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    Expert AI Product Compositing Tool.

    TASK:
    Composite the "USER PRODUCT" into the "REFERENCE SCENE".

    *** CRITICAL DIRECTIVE: PIXEL-PERFECT PRODUCT PRESERVATION ***
    - The "USER PRODUCT" image is the absolute source of truth.
    - **DO NOT** alter the internal pixels of the product.
    - **DO NOT** change the product's color, brightness, contrast, or saturation.
    - **DO NOT** re-light the product itself. It must retain its original studio lighting appearance.
    - **DO NOT** hallucinate new details or remove existing ones (like logos or patterns).
    - The goal is to make it look like the exact same file was placed into the scene, just with correct perspective and external shadows.

    EXECUTION STEPS:
    1. **SCENE PREPARATION**:
       - Analyze the "REFERENCE SCENE".
       - If there is an existing object in the intended focal point, digitally **REMOVE** it to create a blank space.

    2. **GEOMETRIC PLACEMENT**:
       - Insert the "USER PRODUCT" into the cleared space.
       - **Perspective**: Rotate or skew the product to match the surface plane of the scene (e.g., table surface).
       - **Scale**: Resize it to be physically plausible within the scene.

    3. **NON-DESTRUCTIVE INTEGRATION**:
       - Apply **Cast Shadows** onto the scene surface *around* the product.
       - Apply **Contact Shadows** *beneath* the product.
       - **Reflection**: If the scene surface is glossy, generate a reflection below the product.
       - **NO OVERLAY**: Do not apply color filters or atmosphere haze *over* the product face. Keep it crisp and true to the original.

    INPUTS:
    - Image 1: Reference Scene.
    - Image 2: User Product (The Immutable Source).
  `;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: sceneBase64,
      },
    },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: productBase64,
      },
    }
  ];

  return await generateImage(model, parts);
};