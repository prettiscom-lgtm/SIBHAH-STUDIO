import { generateImage } from "./geminiService";

export const editGloveImage = async (base64Image: string, referenceBase64?: string): Promise<Blob> => {
  const model = 'gemini-2.5-flash-image';

  // Crafted prompt based on user requirements
  // Includes logic for Reference Image to ensure unification
  const prompt = `
    Professional Product Retouching Task: Glove Refinement.

    INSTRUCTIONS:
    You are an expert digital retoucher. Your task is to edit the "Target Image" to match the style of the "Reference Image" (if provided) or the default specifications.

    ${referenceBase64 ? 
      "**REFERENCE IMAGE PROVIDED**: The FIRST image is the 'Style Reference'. Use it as the ABSOLUTE GROUND TRUTH for the glove's Color (Light Beige) and Texture (Soft Cotton)." : 
      "**NO REFERENCE IMAGE**: Use the default spec: Light Beige (#F5F5DC) Soft Matte Cotton."
    }

    **TARGET IMAGE**: The ${referenceBase64 ? "SECOND" : ""} image is the input you must edit.

    STRICT REQUIREMENTS:

    1. **PRESERVE GEOMETRY (CRITICAL)**:
       - **DO NOT CHANGE THE HAND POSE**. The fingers, wrist, and palm position must remain EXACTLY identical to the Target Image.
       - **DO NOT TOUCH PRAYER BEADS OR JEWELRY**. They must remain pixel-perfect. Do not paint over them.
       - **UNIFYING POSE**: While you must keep the hand structure, ensure the glove fits tightly like a "second skin". Remove all loose fabric wrinkles that distort the hand shape.

    2. **TEXTURE & COLOR TRANSFER**:
       - Apply the **Light Beige Cotton** texture to the glove area only.
       - If a Reference Image is provided, the output glove must look like it belongs in the same photoshoot as the Reference Image.
       - Eliminate shiny leather textures. Make it matte soft fabric.

    3. **OUTPUT**:
       - Aspect Ratio: 1:1 (Square).
       - High definition, photorealistic.
  `;

  const parts: any[] = [
    { text: prompt }
  ];

  // Add Reference Image first if it exists
  if (referenceBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: referenceBase64,
      },
    });
  }

  // Add Target Image last
  parts.push({
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  });

  return await generateImage(model, parts);
};