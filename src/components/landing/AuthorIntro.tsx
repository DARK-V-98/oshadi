import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export default function AuthorIntro() {
  const authorImage = PlaceHolderImages.find(p => p.id === 'author-portrait');

  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="container">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 sm:p-12">
                <h2 className="font-headline text-3xl md:text-4xl">
                  M.K.D Oshadi Vidarshana Perera
                </h2>
                <p className="mt-2 text-primary font-medium">Content Developer</p>
                <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
                  Welcome! I’m a qualified Bridal Dresser (NVQ Level 4). If you are studying NVQ Level 4 in Bridal & Beauty, මේ notes collection එක specially create කරපු එකක්.
                </p>
              </div>
              {authorImage && (
                <div className="relative h-64 md:h-full min-h-[300px]">
                  <Image
                    src={authorImage.imageUrl}
                    alt={authorImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={authorImage.imageHint}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
