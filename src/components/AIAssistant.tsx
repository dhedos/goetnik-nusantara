
"use client";

import { useState } from 'react';
import { recommendService, AIServiceRecommendationOutput } from '@/ai/flows/ai-service-recommendation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Sparkles, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AIAssistant() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIServiceRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await recommendService({ problemDescription: description });
      setResult(response);
    } catch (err) {
      setError('Gagal menganalisis masalah. Silakan coba lagi.');
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
          <Badge variant="outline" className="mb-4 py-1 px-4 border-primary/50 text-primary uppercase tracking-widest flex w-fit mx-auto gap-2 items-center">
            <Sparkles size={14} /> AI Diagnostic Tool
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Bingung Pilih Layanan?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ceritakan masalah teknis Anda, dan asisten AI kami akan merekomendasikan paket layanan yang paling tepat untuk Anda.
          </p>
        </div>

        <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare size={16} /> Deskripsikan Masalah Anda
              </label>
              <Textarea 
                placeholder="Contoh: Laptop saya lambat sekali saat membuka Chrome dan sering muncul layar biru (BSOD)..."
                className="min-h-[120px] bg-background/50 text-lg border-white/10 focus:border-primary transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full py-6 text-lg rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              onClick={handleDiagnose}
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sedang Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Dapatkan Rekomendasi AI
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">Rekomendasi Kami:</h4>
                      <h3 className="text-2xl font-bold">{result.recommendedService}</h3>
                    </div>
                    <Badge className="bg-primary text-primary-foreground py-1 px-4 text-sm">Akurasi Tinggi</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {result.serviceDescription}
                  </p>
                  <div className="pt-4 border-t border-primary/10">
                    <p className="text-sm italic text-foreground/80">
                      " {result.reason} "
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button asChild className="flex-1 rounded-xl">
                      <a href="#pesan">Pesan Sekarang</a>
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-primary/30" onClick={() => setResult(null)}>
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
