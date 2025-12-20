import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    step: "1",
    title: "Select a Unit PDF",
    description: "Choose the unit you want to download from the table above."
  },
  {
    step: "2",
    title: "Enter Access Code",
    description: "Input the unique one-time code you received after purchase."
  },
  {
    step: "3",
    title: "Download Instantly",
    description: "Your PDF will be downloaded directly to your device. The code will expire after use."
  }
];

export default function PdfAccessGuide() {
  return (
    <section id="pdf-access" className="py-16 sm:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl">Secure PDF Access</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
            Your learning materials are protected. Use the one-time code provided after purchase to securely download your notes.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <Card key={item.step} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-headline font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
