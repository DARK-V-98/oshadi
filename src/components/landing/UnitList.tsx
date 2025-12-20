import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { units } from "@/lib/data"
import { Download } from "lucide-react"

type UnitListProps = {
  onUnlockClick: () => void;
};

export default function UnitList({ onUnlockClick }: UnitListProps) {
  return (
    <section id="units" className="py-16 sm:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl">Unit List & Model Count</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
            A complete overview of the NVQ Level 4 syllabus covered in these notes.
          </p>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Unit No</TableHead>
                <TableHead className="w-2/5">Unit Name (EN/SIN)</TableHead>
                <TableHead className="w-1/5 text-center">Model Count (මොඩල් ගණන)</TableHead>
                <TableHead className="w-1/5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.unitNo}>
                  <TableCell className="font-medium">{unit.unitNo}</TableCell>
                  <TableCell>
                    <div className="font-medium">{unit.unitNameEn}</div>
                    <div className="text-sm text-muted-foreground">{unit.unitNameSin}</div>
                  </TableCell>
                  <TableCell className="text-center">{unit.modelCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={onUnlockClick}>
                      <Download className="mr-2 h-4 w-4" />
                      Unlock PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
