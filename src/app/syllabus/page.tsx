
"use client";

import { useState } from "react";
import Navbar from "@/components/ov/Navbar";
import Footer from "@/components/ov/Footer";
import AuthForm from "@/components/AuthForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const syllabusData = {
  "bridal-dresser": {
    label: 'Bridal Dresser',
    modules: [
      { code: "BD-M01", nameEN: "Special Qualities to be Inculcated & Attitudes to be Developed", nameSI: "රූපලාවන්‍ය ශිල්පියෙකුට වර්ධනය කළ යුතු විශේෂ ගුණාංග සහ ආකල්ප" },
      { code: "BD-M02", nameEN: "Analyse Skin", nameSI: "සම විශ්ලේෂණය" },
      { code: "BD-M03", nameEN: "Facial", nameSI: "මුහුණු සත්කාර" },
      { code: "BD-M05", nameEN: "Remove Superfluous Hair", nameSI: "අනවශ්‍ය රෝම ඉවත් කිරීම" },
      { code: "BD-M06", nameEN: "Care Hands & Nails (Manicure)", nameSI: "අත් අලංකරණය" },
      { code: "BD-M07", nameEN: "Care Feet & Nails (Pedicure)", nameSI: "පා අලංකරණය" },
      { code: "BD-M08", nameEN: "Shampoo & conditioning hair", nameSI: "Shampoo කිරීම සහ condition කිරීම" },
      { code: "BD-M09", nameEN: "Treat Scalp & Hair", nameSI: "හිසකෙස් සත්කාර" },
      { code: "BD-M10", nameEN: "Style Hair and techniques", nameSI: "කොණ්ඩා මෝස්තර සහ තාක්ෂණය" },
      { code: "BD-M10-2", nameEN: "Hair setting techniques", nameSI: "කොණ්ඩා සැකසුම් සහ තාක්ෂණය" },
      { code: "BD-M11", nameEN: "Makeup", nameSI: "මේකප්" },
      { code: "BD-M12", nameEN: "Bridal attire and its draping", nameSI: "මංගල ඇදුම් සහ එය ඇන්දවීම" },
      { code: "BD-M13", nameEN: "Bridal dresser", nameSI: "මනාලියන් ඇන්දවීම" },
      { code: "BD-M14", nameEN: "Occupational Health & Safety", nameSI: "සෞඛ්‍ය සහ ආරක්ෂාව" },
      { code: "BD-M15", nameEN: "Client Consultation", nameSI: "සේවාලාභී උපදේශනය" },
      { code: "BD-M16", nameEN: "Management of Salon", nameSI: "රූපලාවන්‍යාගාර කළමනාකරණය" },
      { code: "BD-M17", nameEN: "Maintenance of machinery, tools and equipment", nameSI: "මැෂින් සහ උපකරණ නඩත්තුව" },
      { code: "BD-M18", nameEN: "Practice workplace communication and interpersonal relation", nameSI: "වෘත්තීය සන්නිවේදනය සහ අන්තර් පුද්ගල සම්බන්ධතා" },
      { code: "BD-M19", nameEN: "Apply occupational literary and numaracy", nameSI: "සාක්ෂරතාවය සහ සංඛ්‍යාත්මකතාව" },
      { code: "BD-M20", nameEN: "Work in team", nameSI: "කණ්ඩායමක් ලෙස වැඩ කිරීම" },
    ]
  },
  "beauty": {
    label: 'Beauty',
    modules: [
      { code: "BM 01", nameEN: "Special Qualities & Attitudes for a Beautician", nameSI: "රූපලාවන්‍ය ශිල්පියෙකුට වර්ධනය කළ යුතු විශේෂ ගුණාංග සහ ආකල්ප" },
      { code: "BM 02", nameEN: "Maintain Tools & Equipment", nameSI: "මෙවලම් සහ උපකරණ නඩත්තු කිරීම" },
      { code: "BM 03", nameEN: "Practice Occupational Health & Safety Measures", nameSI: "වෘත්තීය සෞඛ්‍ය සහ ආරක්ෂිත ක්‍රියාමාර්ග" },
      { code: "M01", nameEN: "Maintain Safe & Pleasant Salon Environment", nameSI: "ආරක්ෂිත සහ සුහද රූපලාවන්‍යාගාර පරිසරය නඩත්තතුව" },
      { code: "M02", nameEN: "Reception Duties", nameSI: "පිළිගැනීමේ රාජකාරි" },
      { code: "M03", nameEN: "Client Consultation", nameSI: "සේවාලාභී උපදේශනය" },
      { code: "M04", nameEN: "Remove Superfluous Hair", nameSI: "අනවශ්‍ය රෝම ඉවත් කිරීම" },
      { code: "M05", nameEN: "Perform Make-up Activities", nameSI: "මේකප්" },
      { code: "M06", nameEN: "Manicure & Pedicure", nameSI: "අත් අලංකරණය සහ පා අලංකරණය" },
      { code: "M07", nameEN: "Analyze Skin", nameSI: "සම විශ්ලේෂණය" },
      { code: "M08", nameEN: "Skin Care Treatments (facial)", nameSI: "සම් සත්කාර ප්‍රතිකාර" },
      { code: "M08-2", nameEN: "Salon Management", nameSI: "රූපලාවන්‍යාගාර කළමනාකරණය" },
    ]
  },
  "hair": {
    label: 'Hair Dresser',
    modules: [
      { code: "HD-M01", nameEN: "Special qualities & attitudes to be developed by a Hairdresser", nameSI: "කොණ්ඩ මෝස්තර ශිල්පියෙකු විසින් ප්‍රගුණ කළ යුතු ගුණාංග" },
      { code: "HD-M02", nameEN: "Maintain Machinery, Tools and Equipment", nameSI: "යන්ත්‍ර, උපකරණ හා භාණ්ඩ නඩත්තුව" },
      { code: "HD-M03", nameEN: "Shampoo & conditioning hair", nameSI: "හිසකෙස් shampoo කිරීම හා condition කිරීම" },
      { code: "HD-M04", nameEN: "Maintain safe & pleasant salon environment", nameSI: "පරිසර නඩත්තුව" },
      { code: "HD-M05", nameEN: "Client’s consultation services", nameSI: "සේවාලාභී උපදේශනය" },
      { code: "HD-M06", nameEN: "Hair & scalp treatments", nameSI: "හිසකෙස් සහ scalp සත්කාර" },
      { code: "HD-M07", nameEN: "Cutting & setting ladies hair", nameSI: "කාන්තා හිසකෙස් කැපීම හා සැකසීම" },
      { code: "HD-M08", nameEN: "Cutting & setting men’s hair, moustache & beard", nameSI: "පිරිමි හිසකෙස් කැපීම හා සැකසීම සහ රැවුල" },
      { code: "HD-M09", nameEN: "Styling & dressing hair", nameSI: "හිසකෙස් මෝස්තර හා සැකසීම" },
      { code: "HD-M10", nameEN: "Permanent wave (perm)", nameSI: "පර්ම් කිරීම" },
      { code: "HD-M11", nameEN: "Relaxing / straightening services", nameSI: "හිසකෙස් කෙලින් කිරීම / relaxing" },
      { code: "HD-M12", nameEN: "Colour hair", nameSI: "හිසකෙස් වර්ණ කිරීම" },
      { code: "HD-M13", nameEN: "Promotion & selling hair care products & services", nameSI: "නිෂ්පාදන ප්‍රවර්ධන හා විකිණීම" },
      { code: "HD-M14", nameEN: "Hairdressing salon management", nameSI: "සැලෝන් කළමනාකරණය" },
      { code: "HD-BM01", nameEN: "Communication skills for workplace", nameSI: "රැකියා ස්ථාන සහ සන්නිවේදන කුසලතා" },
      { code: "HD-BM02", nameEN: "Team work", nameSI: "කණ්ඩායම් වැඩ" },
      { code: "HD-BM03", nameEN: "Occupational Safety & Health & Environmental Aspects", nameSI: "වෘත්තීය ආරක්ෂාව, සෞඛ්‍ය හා පරීක්ෂණය" },
    ]
  },
  "extra-notes": {
    label: "Extra Notes",
    modules: [
        { code: "EN-01", nameEN: "History of Beauty", nameSI: "රූපලාවන්‍ය ඉතිහාසය" },
        { code: "EN-02", nameEN: "History of Cosmetics", nameSI: "කේශලාවන්‍ය ඉතිහාසය" },
    ]
  }
};

const SyllabusPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const categories = Object.keys(syllabusData);

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-grow">
            <section className="py-20 md:py-32 bg-soft-gradient">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 animate-fade-in">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">Course Content</span>
                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
                                Full Syllabus Overview
                            </h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Here is a complete list of all modules available for our NVQ Level 4 courses, organized by category.
                            </p>
                        </div>
                        
                        <Accordion type="multiple" defaultValue={categories} className="w-full space-y-6">
                            {categories.map(key => {
                                const category = syllabusData[key as keyof typeof syllabusData];
                                return (
                                    <AccordionItem value={key} key={key} className="bg-background/70 backdrop-blur-sm border rounded-2xl shadow-card p-2 md:p-4">
                                        <AccordionTrigger className="text-xl md:text-2xl font-bold font-heading hover:no-underline px-4">{category.label}</AccordionTrigger>
                                        <AccordionContent className="p-2 md:p-4">
                                            <div className="space-y-3">
                                                {category.modules.map(mod => (
                                                    <div key={mod.code} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-secondary/50">
                                                        <div className="col-span-2">
                                                            <span className="font-mono text-sm font-semibold text-primary">{mod.code}</span>
                                                        </div>
                                                        <div className="col-span-10">
                                                            <p className="font-medium text-foreground">{mod.nameEN}</p>
                                                            <p className="text-sm text-muted-foreground">{mod.nameSI}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
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
