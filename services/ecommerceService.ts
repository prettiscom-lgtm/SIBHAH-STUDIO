import { generateImage } from "./geminiService";

export const createEcommerceShot = async (base64Image: string): Promise<Blob> => {
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    Professional Product Extraction & Flat Lay Generator.

    PHASE 1: IDENTIFICATION
    - Analyze the input image. Identify the product type (e.g., Prayer Beads/Tasbih, Jewelry, Watch).
    - Note its exact material, color, pattern, bead count, and tassel details.

    PHASE 2: EXTRACTION & GENERATION
    - Isolate this identified product.
    - Create a "Perfect Flat Lay" shot.
    - **Background**: Pure White (#FFFFFF).
    - **Orientation**: Straight, symmetrical, professional alignment.
    
    CRITICAL RULES:
    1. **REMOVE HANDS/GLOVES**: If held, remove the hand entirely. Reconstruct any hidden parts of the product seamlessly.
    2. **STRICT FIDELITY**: The output product must be IDENTICAL to the input product. Do not change color or texture.
    3. **LIGHTING**: Soft, even studio lighting. No harsh shadows.
    4. **OUTPUT**: 1:1 Aspect Ratio. High resolution.
  `;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    }
  ];

  return await generateImage(model, parts);
};

export const createEcommerceVariant = async (base64Image: string, variantType: string): Promise<Blob> => {
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    Professional Product Photography - Gallery Variant Generator.

    INPUT PRODUCT: Prayer Beads / Tasbih (Strictly preserve identity).
    VARIANT TYPE REQUIRED: ${variantType}

    INSTRUCTIONS:
    Generate a high-quality product shot based on the Variant Type:

    - If "Macro Detail": Zoom in close on the beads/tassel. Show texture and grain. Shallow depth of field.
    - If "Lifestyle (Table)": Place beads naturally on a wooden or marble table. Warm, cozy lighting.
    - If "Packaging": Show the beads neatly arranged in or next to a luxury velvet pouch/box.
    - If "Hand Held": Show a close-up of a hand (natural skin or simple glove) counting the beads.
    - If "Context": Show the beads draped over a religious book or Islamic art background.

    RULES:
    1. The product MUST look exactly like the input image.
    2. Photorealistic, 4K quality.
    3. Aspect Ratio 1:1.
  `;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    }
  ];

  return await generateImage(model, parts);
};