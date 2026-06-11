
"use client";

import { useState } from 'react';
import { recommendService, AIServiceRecommendationOutput } from '@/ai/flows/ai-service-recommendation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface AIAssistantProps {
  businessId: string;
}

export function AIAssistant({ businessId }: AIAssistantProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIServiceRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firestore = useFirestore();
  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'businesses', businessId, 'services') : null, 
    [firestore, businessId]
  );
  const { data: services } = useCollection(servicesQuery);

  const handleDiagnose = async () => {
    if (!description.trim() || !services) return;
    
    setLoading(true);
    setError(null);
    try {
      const availableServices = services.map(s => ({
        name: s.name,
        description: s.description
      }));

      const response = await recommendService({ 
        problemDescription: description,
        availableServices
      });
      setResult(response);
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('high demand')) {
        setError('Server AI sedang sangat sibuk. Silakan coba lagi dalam beberapa detik.');
      } else {
        setError('Gagal menganalisis masalah. Silakan coba lagi.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-headline mb-4">Bingung Pilih Layanan?</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-2">
            Ceritakan masalah teknis Anda, dan asisten AI kami akan merekomendasikan paket layanan yang paling tepat.
          </p>
        </div>

        <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare size={16} /> Deskripsikan Masalah Anda
              </label>
              <Textarea 
                placeholder="Contoh: Laptop saya lambat sekali saat membuka Chrome..."
                className="min-h-[120px] bg-background/50 text-base md:text-lg border-white/10 focus:border-primary transition-all rounded-xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full py-6 md:py-7 text-base md:text-lg rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              onClick={handleDiagnose}
              disabled={loading || !description.trim() || !services}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Rekomendasi AI
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-4 rounded-xl">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 md:p-6 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Rekomendasi Kami:</h4>
                      <h3 className="text-xl md:text-2xl font-bold">{result.recommendedService}</h3>
                    </div>
                    <Badge className="bg-primary text-primary-foreground py-1 px-3 text-[10px] md:text-xs w-fit">Akurasi Tinggi</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 text-xs md:text-base leading-relaxed">
                    {result.serviceDescription}
                  </p>
                  <div className="pt-4 border-t border-primary/10">
                    <p className="text-[11px] md:text-sm italic text-foreground/80">
                      " {result.reason} "
                    </p>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1 rounded-xl h-12">
                      <a href="#pesan">Pesan Sekarang</a>
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-primary/30" onClick={() => setResult(null)}>
                      Analisis Lagi
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
