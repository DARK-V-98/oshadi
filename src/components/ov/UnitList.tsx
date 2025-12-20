'use client';
import { useState } from "react";
import { Search, Eye, Unlock, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const units = [
  { unitNo: "Health/Safety", nameEN: "Health & Safety", nameSI: "සෞඛ්‍ය සුරක්ෂිතභාවය", modelCount: "1", category: "foundation" },
  { unitNo: "Unit 01", nameEN: "Client Consultation", nameSI: "ගනුදෙනුකරු සමඟ සාකච්ඡා", modelCount: "1–2", category: "consultation" },
  { unitNo: "Unit 02", nameEN: "Salon Management", nameSI: "සැලෝන් කළමනාකරණය", modelCount: "1–2", category: "management" },
  { unitNo: "Unit 03", nameEN: "Manicure & Pedicure", nameSI: "නිය සත්කාර සිදු කිරීම", modelCount: "2–3", category: "practical" },
  { unitNo: "Unit 04", nameEN: "Facial", nameSI: "සම සදහා සත්කාර කිරීම", modelCount: "2–3", category: "practical" },
  { unitNo: "Unit 05", nameEN: "Makeup (Bridal & Special)", nameSI: "වේෂ නිරෑපණ කටයුතු සිදු කිරීම", modelCount: "5–10", category: "bridal" },
  { unitNo: "Unit 06", nameEN: "Skin Analysis", nameSI: "සම විශ්ලේෂණය", modelCount: "1–2", category: "consultation" },
  { unitNo: "Unit 07", nameEN: "Tools & Environment Maintenance", nameSI: "උපකරණ සහ පරිසර නඩත්තුව", modelCount: "1", category: "foundation" },
  { unitNo: "Unit 08", nameEN: "Reception Duties", nameSI: "පිළිගැනීමේ රාජකාරිය", modelCount: "1", category: "management" },
  { unitNo: "Unit 09", nameEN: "Hair Removal", nameSI: "අනවශ්‍ය රෝම් ඉවත් කිරීම", modelCount: "1–2", category: "practical" },
  { unitNo: "Unit 10", nameEN: "Etiquette", nameSI: "ආචාර ධර්ම", modelCount: "1", category: "foundation" },
];

const categories = [
  { value: "all", label: "All Units" },
  { value: "foundation", label: "Foundation" },
  { value: "consultation", label: "Consultation" },
  { value: "management", label: "Management" },
  { value: "practical", label: "Practical Skills" },
  { value: "bridal", label: "Bridal & Makeup" },
];

const UnitList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.nameSI.includes(searchQuery) ||
      unit.unitNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || unit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="units" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Complete Syllabus</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Unit List & Model Count
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete overview of the NVQ Level 4 syllabus covered in these notes.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-12">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredUnits.length} of {units.length} units
          </p>

          {/* Units Table */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-secondary/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Unit No</div>
              <div className="col-span-5">Unit Name (EN/SIN)</div>
              <div className="col-span-2 text-center">Models</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-secondary/30 transition-colors duration-300"
                  >
                    {/* Unit Number */}
                    <div className="md:col-span-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        {unit.unitNo}
                      </span>
                    </div>

                    {/* Unit Name */}
                    <div className="md:col-span-5">
                      <p className="font-medium text-foreground">{unit.nameEN}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{unit.nameSI}</p>
                    </div>

                    {/* Model Count */}
                    <div className="md:col-span-2 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-gold/10 text-gold font-semibold text-sm">
                        {unit.modelCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Unlock className="w-4 h-4 mr-1" />
                        Unlock PDF
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No units found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnitList;
