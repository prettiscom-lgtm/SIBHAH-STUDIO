import { generateImage } from "./geminiService";

export const createProductVariant = async (base64Image: string): Promise<Blob> => {
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    Professional Product Photography Generator: Luxury Lifestyle Variant.

    TASK:
    Take the input product (Prayer Beads/Tasbih) and generate a "Cinematic Luxury Lifestyle Shot".

    REQUIREMENTS:
    1. **PRODUCT PRESERVATION**: The prayer beads (material, color, tassel, bead shape) must look IDENTICAL to the input image.
    2. **SCENE**: The beads must be held elegantly by a hand wearing a **High-End Luxury Glove**.
    3. **GLOVE STYLE**: The glove should look expensive and cinematic. Materials like fine leather, velvet, or silk. Fit must be perfect (second skin). Color should complement the beads (e.g., black, dark brown, or deep navy depending on the beads) or use a classic neutral luxury tone.
    4. **COMPOSITION**: The hand should be holding the beads in a natural, reverent, or display pose. Focus is on the product.
    5. **LIGHTING & VIBE**: Cinematic, moody, "Luxury Watch/Jewelry Advertisement" style lighting. Bokeh background. High contrast, high detail.
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