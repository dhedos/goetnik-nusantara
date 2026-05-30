'use server';
/**
 * @fileOverview An AI service assistant that recommends the most suitable service package based on dynamic services provided.
 *
 * - recommendService - A function that handles the service recommendation process.
 * - AIServiceRecommendationInput - The input type for the recommendService function.
 * - AIServiceRecommendationOutput - The return type for the recommendService function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const AIServiceRecommendationInputSchema = z.object({
  problemDescription: z
    .string()
    .describe("A natural language description of the user's computer or design problem."),
  availableServices: z.array(ServiceSchema).describe("The list of currently available services from the business."),
});
export type AIServiceRecommendationInput = z.infer<typeof AIServiceRecommendationInputSchema>;

const AIServiceRecommendationOutputSchema = z.object({
  recommendedService: z.string().describe('The name of the most suitable service package.'),
  serviceDescription: z.string().describe('A brief description of the recommended service.'),
  reason: z.string().describe('An explanation of why this service is recommended based on the user\'s problem.'),
});
export type AIServiceRecommendationOutput = z.infer<typeof AIServiceRecommendationOutputSchema>;

export async function recommendService(input: AIServiceRecommendationInput): Promise<AIServiceRecommendationOutput> {
  return aiServiceRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiServiceRecommendationPrompt',
  input: { schema: AIServiceRecommendationInputSchema },
  output: { schema: AIServiceRecommendationOutputSchema },
  prompt: `Anda adalah asisten AI untuk bisnis jasa teknologi dan desain. Berikut adalah daftar layanan yang kami tawarkan saat ini:

{{#each availableServices}}
  - Nama Layanan: {{{this.name}}}
    Deskripsi: {{{this.description}}}

{{/each}}

Analisis masalah pengguna berikut dan rekomendasikan SATU layanan yang paling tepat. Berikan alasan yang logis.

Masalah Pengguna: {{{problemDescription}}}

Rekomendasi terbaik adalah:`,
});

const aiServiceRecommendationFlow = ai.defineFlow(
  {
    name: 'aiServiceRecommendationFlow',
    inputSchema: AIServiceRecommendationInputSchema,
    outputSchema: AIServiceRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
