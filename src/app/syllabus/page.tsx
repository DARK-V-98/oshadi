"use client";

import { useState } from "react";
import Navbar from "@/components/ov/Navbar";
import Footer from "@/components/ov/Footer";
import AuthForm from "@/components/AuthForm";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const beautySyllabus = [
    { code: "BM 01", nameEN: "Special Qualities & Attitudes for a Beautician", nameSI: "රූපලාවන්‍ය ශිල්පියෙකුට වර්ධනය කළ යුතු විශේෂ ගුණාංග සහ ආකල්ප" },
    { code: "BM 02", nameEN: "Maintain Tools & Equipment", nameSI: "මෙවලම් සහ උපකරණ නඩත්තු කිරීම" },
    { code: "BM 03", nameEN: "Practice Occupational Health & Safety Measures", nameSI: "වෘත්තීය සෞඛ්‍ය සහ ආරක්ෂිත ක්‍රියාමාර්ග" },
    { code: "M01", nameEN: "Maintain Safe & Pleasant Salon Environment", nameSI: "ආරක්ෂිත සහ සුහද රූපලාවන්‍යාගාර පරිසරයක නඩත්තුව" },
    { code: "M02", nameEN: "Reception Duties", nameSI: "පිළිගැනීමේ රාජකාරි" },
    { code: "M03", nameEN: "Client Consultation", nameSI: "සේවාලාභී උපදේශනය" },
    { code: "M04", nameEN: "Remove Superfluous Hair", nameSI: "අනවශ්‍ය රෝම ඉවත් කිරීම" },
    { code: "M05", nameEN: "Perform Make-up Activities", nameSI: "මේකප්" },
    { code: "M06", nameEN: "Manicure & Pedicure", nameSI: "අත් අලංකරණය සහ පා අලංකරණය" },
    { code: "M07", nameEN: "Analyze Skin", nameSI: "සම විශ්ලේෂණය" },
    { code: "M08-A", nameEN: "Skin Care Treatments (facial)", nameSI: "සම් සත්කාර ප්‍රතිකාර" },
    { code: "M08-B", nameEN: "Salon Management", nameSI: "රූපලාවණ්‍යාගාර කළමනාකරණය" },
];

const bridalSyllabus = [
    { code: "M01", nameEN: "Special Qualities to be Inculcated & Attitudes to be Developed", nameSI: "රූපලාවන්‍ය ශිල්පියෙකුට වර්ධනය කළ යුතු විශේෂ ගුණාංග සහ ආකල්ප" },
    { code: "M02", nameEN: "Analyse Skin", nameSI: "සම විශ්ලේෂණය" },
    { code: "M03", nameEN: "Facial", nameSI: "මුහුණු සත්කාර" },
    { code: "M05", nameEN: "Remove Superfluous Hair", nameSI: "අනවශ්‍ය රෝම ඉවත් කිරීම" },
    { code: "M06", nameEN: "Care Hands & Nails (Manicure)", nameSI: "අත් අලංකරණය" },
    { code: "M07", nameEN: "Care Feet & Nails (Pedicure)", nameSI: "පා අලංකරණය" },
    { code: "M08", nameEN: "Shampoo & conditioning hair", nameSI: "Shampoo කිරීම සහ condition කිරීම" },
    { code: "M09", nameEN: "Treat Scalp & Hair", nameSI: "හිසකෙස් සත්කාර" },
    { code: "M10-A", nameEN: "Style Hair and techniques", nameSI: "කොණ්ඩා මෝස්තර සහ තාක්ෂණය" },
    { code: "M10-B", nameEN: "Hair setting techniques", nameSI: "කොණ්ඩා සැකසුම් සහ තාක්ෂණය" },
    { code: "M11", nameEN: "Makeup", nameSI: "මේකප්" },
    { code: "M12", nameEN: "Bridal attire and its draping", nameSI: "මංගල ඇදුම් සහ එම ඇන්දවීම" },
    { code: "M13", nameEN: "Bridal dresser", nameSI: "මනාලියන් ඇන්දවීම" },
    { code: "M14", nameEN: "Occupational Health & Safety", nameSI: "සෞඛ්‍ය සහ ආරක්ෂාව" },
    { code: "M15", nameEN: "Client Consultation", nameSI: "සේවාලාභී උපදේශනය" },
    { code: "M16", nameEN: "Management of Salon", nameSI: "රූපලාවණ්‍යාගාර කළමනාකරණය" },
    { code: "M17", nameEN: "Maintenance of machinery, tools and equipment", nameSI: "මැශින් සහ උපකරණ නඩත්තුව" },
    { code: "M18", nameEN: "Practice workplace communication and interpersonal relation", nameSI: "වෘත්තීය සන්නිවේදනය සහ අන්තර් පුද්ගල සම්බන්ධතා" },
    { code: "M19", nameEN: "Apply occupational literary and numaracy", nameSI: "සාක්ෂරතාවය සහ සංඛ්‍යාත්මකතාව" },
    { code: "M20", nameEN: "Work in team", nameSI: "කණ්ඩායමක් ලෙස වැඩ කිරීම" },
];

const hairSyllabus = [
    { code: "M01", nameEN: "Special qualities & attitudes to be developed by a Hairdresser", nameSI: "කොණ්ඩ මෝස්තර ශිල්පියෙකු විසින් ප්‍රගුණ කළ යුතු ගුණාංග" },
    { code: "M02", nameEN: "Maintain Machinery, Tools and Equipment", nameSI: "යන්ත්‍ර, උපකරණ හා භාණ්ඩ නඩත්තුව" },
    { code: "M03", nameEN: "Shampoo & conditioning hair", nameSI: "හිසකෙස් shampoo කිරීම හා condition කිරීම" },
    { code: "M04", nameEN: "Maintain safe & pleasant salon environment", nameSI: "පරිසර නඩත්තුව" },
    { code: "M05", nameEN: "Client’s consultation services", nameSI: "සේවාලාභී උපදේශනය" },
    { code: "M06", nameEN: "Hair & scalp treatments", nameSI: "හිසකෙස් සහ scalp සත්කාර" },
    { code: "M07", nameEN: "Cutting & setting ladies hair", nameSI: "කාන්තා හිසකෙස් කැපීම හා සැකසීම" },
    { code: "M08", nameEN: "Cutting & setting men’s hair, moustache & beard", nameSI: "පිරිමි හිසකෙස් කැපීම හා සැකසීම සහ රැවුල" },
    { code: "M09", nameEN: "Styling & dressing hair", nameSI: "හිසකෙස් මෝස්තර හා සැකසීම" },
    { code: "M10", nameEN: "Permanent wave (perm)", nameSI: "පර්ම් කිරීම" },
    { code: "M11", nameEN: "Relaxing / straightening services", nameSI: "හිසකෙස් කෙලින් කිරීම / relaxing" },
    { code: "M12", nameEN: "Colour hair", nameSI: "හිසකෙස් වර්ණ කිරීම" },
    { code: "M13", nameEN: "Promotion & selling hair care products & services", nameSI: "නිෂ්පාදන ප්‍රවර්ධන හා විකිණීම" },
    { code: "M14", nameEN: "Hairdressing salon management", nameSI: "සැලෝන් කළමනාකරණය" },
    { code: "BM01", nameEN: "Communication skills for workplace", nameSI: "රැකියා ස්ථාන සහ සන්නිවේදන කුසලතා" },
    { code: "BM02", nameEN: "Team work", nameSI: "කණ්ඩායම් වැඩ" },
    { code: "BM03", nameEN: "Occupational Safety & Health & Environmental Aspects", nameSI: "වෘත්තීය ආරක්ෂාව, සෞඛ්‍ය හා පරීක්ෂණය" },
];

const extraNotes = [
    { code: "Extra-01", nameEN: "History of Beauty", nameSI: "රූපලාවන්‍ය ඉතිහාසය" },
    { code: "Extra-02", nameEN: "History of Cosmetics", nameSI: "විකේෂ් ලාවණය ඉතිහාසය" },
]

const SyllabusTable = ({ modules }: { modules: {code: string; nameEN: string; nameSI: string}[]}) => (
    <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[150px]">Module Code</TableHead>
                <TableHead>Module Name (English)</TableHead>
                <TableHead>Module Name (Sinhala)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map((mod) => (
                    <TableRow key={mod.code}>
                        <TableCell className="font-medium">{mod.code}</TableCell>
                        <TableCell>{mod.nameEN}</TableCell>
                        <TableCell>{mod.nameSI}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

const SyllabusPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-grow pt-20">
            <section className="py-20 md:py-32 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 animate-fade-in">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">Course Content</span>
                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
                                Full Syllabus Overview
                            </h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Here is a complete list of all modules available for our NVQ Level 4 courses.
                            </p>
                        </div>
                        <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-6">
                            <AccordionItem value="item-1" className="bg-card border rounded-2xl p-2 md:p-4">
                                <AccordionTrigger className="text-xl md:text-2xl font-bold font-heading hover:no-underline px-4">Beauty Culture New Syllabus</AccordionTrigger>
                                <AccordionContent className="p-4">
                                    <SyllabusTable modules={beautySyllabus} />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="bg-card border rounded-2xl p-2 md:p-4">
                                <AccordionTrigger className="text-xl md:text-2xl font-bold font-heading hover:no-underline px-4">Bridal Dresser New Syllabus</AccordionTrigger>
                                <AccordionContent className="p-4">
                                    <SyllabusTable modules={bridalSyllabus} />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="bg-card border rounded-2xl p-2 md:p-4">
                                <AccordionTrigger className="text-xl md:text-2xl font-bold font-heading hover:no-underline px-4">Hair Dresser Syllabus</AccordionTrigger>
                                <AccordionContent className="p-4">
                                    <SyllabusTable modules={hairSyllabus} />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4" className="bg-card border rounded-2xl p-2 md:p-4">
                                <AccordionTrigger className="text-xl md:text-2xl font-bold font-heading hover:no-underline px-4">Extra Notes</AccordionTrigger>
                                <AccordionContent className="p-4">
                                    <SyllabusTable modules={extraNotes} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </section>
        </main>
        <Footer />
        <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
};

export default SyllabusPage;
