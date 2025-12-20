import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type HeroProps = {
  onUnlockClick: () => void;
};

export default function Hero({ onUnlockClick }: HeroProps) {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <section id="overview" className="relative w-full h-[60dvh] min-h-[500px] flex items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 container max-w-4xl px-4">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl leading-tight text-shadow">
          📘 Bridal & Beauty NVQ Level 4 – Complete Notes Collection
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-shadow-sm">
          Unlock all NVQ Level 4 theory, practical, assignments & sample answers in one place!
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Buy Notes
          </Button>
          <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onUnlockClick}>
            Unlock PDF
          </Button>
        </div>
      </div>
    </section>
  );
}
