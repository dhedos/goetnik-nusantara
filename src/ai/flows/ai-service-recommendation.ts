'use server';
/**
 * @fileOverview An AI service assistant that recommends the most suitable service package based on a user's problem description.
 *
 * - recommendService - A function that handles the service recommendation process.
 * - AIServiceRecommendationInput - The input type for the recommendService function.
 * - AIServiceRecommendationOutput - The return type for the recommendService function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const servicePackages = [
  {
    name: 'Instal Ulang OS/Software',
    description: 'Layanan untuk instalasi ulang sistem operasi (Windows, macOS, Linux) dan berbagai perangkat lunak (Microsoft Office, desain, multimedia, dll). Cocok untuk masalah performa lambat, virus, atau ingin memulai dengan sistem bersih.',
  },
  {
    name: 'Service Laptop/Komputer (Hardware & Software)',
    description: 'Perbaikan menyeluruh untuk masalah hardware (penggantian komponen, perbaikan motherboard, pembersihan) dan software (penghapusan virus, optimasi sistem, perbaikan error aplikasi).',
  },
  {
    name: 'Jasa Desain Grafis (Logo, Banner, Poster)',
    description: 'Pembuatan desain profesional untuk kebutuhan bisnis seperti logo, banner promosi, poster acara, kartu nama, dan materi branding lainnya.',
  },
  {
    name: 'Pembuatan Aplikasi Sederhana/Website',
    description: 'Pengembangan website statis, dinamis, landing page, toko online sederhana, atau aplikasi web dasar sesuai kebutuhan bisnis Anda. Ideal untuk promosi online dan meningkatkan kehadiran digital.',
  },
];

const AIServiceRecommendationInputSchema = z.object({
  problemDescription: z
    .string()
    .describe('A natural language description of the user\u0027s computer or design problem.'),
});
export type AIServiceRecommendationInput = z.infer<typeof AIServiceRecommendationInputSchema>;

const AIServiceRecommendationOutputSchema = z.object({
  recommendedService: z.string().describe('The name of the most suitable service package.'),
  serviceDescription: z.string().describe('A brief description of the recommended service.'),
  reason: z.string().describe('An explanation of why this service is recommended based on the user\u0027s problem.'),
});
export type AIServiceRecommendationOutput = z.infer<typeof AIServiceRecommendationOutputSchema>;

export async function recommendService(input: AIServiceRecommendationInput): Promise<AIServiceRecommendationOutput> {
  return aiServiceRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiServiceRecommendationPrompt',
  input: { schema: AIServiceRecommendationInputSchema },
  output: { schema: AIServiceRecommendationOutputSchema },
  prompt: `Anda adalah asisten AI yang bertugas merekomendasikan layanan bisnis usaha mandiri. Berikut adalah daftar layanan yang tersedia:

{{#each servicePackages}}
  - Nama Layanan: {{{this.name}}}
    Deskripsi: {{{this.description}}}

{{/each}}

Pengguna akan memberikan deskripsi masalah mereka. Tugas Anda adalah menganalisis deskripsi tersebut dan merekomendasikan SATU layanan yang paling sesuai dari daftar di atas. Berikan juga alasan mengapa layanan tersebut direkomendasikan.

Deskripsi Masalah Pengguna: {{{problemDescription}}}

Berdasarkan deskripsi masalah pengguna, rekomendasi layanan terbaik adalah:`,
});

const aiServiceRecommendationFlow = ai.defineFlow(
  {
    name: 'aiServiceRecommendationFlow',
    inputSchema: AIServiceRecommendationInputSchema,
    outputSchema: AIServiceRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ ...input, servicePackages });
    return output!;
  }
);
