
export type Unit = {
  unitNo: string;
  nameEN: string;
  nameSI: string;
  modelCount?: string;
  category: 'bridal-dresser' | 'beauty' | 'hair' | 'extra-notes';
  priceNotesSI?: string;
  priceAssignmentsSI?: string;
  priceNotesEN?: string;
  priceAssignmentsEN?: string;
};

export const units: Unit[] = [
  // Beauty New Syllabus
  { unitNo: "BM 01", nameEN: "Special Qualities & Attitudes for a Beautician", nameSI: "රූපලාවන්‍ය ශිල්පියෙකුට වර්ධනය කළ යුතු විශේෂ ගුණාංග සහ ආකල්ප", category: "beauty" },
  { unitNo: "BM 02", nameEN: "Maintain Tools & Equipment", nameSI: "මෙවලම් සහ උපකරණ නඩත්තු කිරීම", category: "beauty" },
  { unitNo: "BM 03", nameEN: "Practice Occupational Health & Safety Measures", nameSI: "වෘත්තීය සෞඛ්‍ය සහ ආරක්ෂිත ක්‍රියාමාර්ග", category: "beauty" },
  { unitNo: "M01", nameEN: "Maintain Safe & Pleasant Salon Environment", nameSI: "ආරක්ෂිත සහ සුහද රූපලාවන්‍යාගාර පරිසරයක නඩත්තුව", category: "beauty" },
  { unitNo: "M02", nameEN: "Reception Duties", nameSI: "පිළිගැනීමේ රාජකාරි", category: "beauty" },
  { unitNo: "M03", nameEN: "Client Consultation", nameSI: "සේවාලාභී උපදේශනය", category: "beauty" },
  { unitNo: "M04", nameEN: "Remove Superfluous Hair", nameSI: "අනවශ්‍ය රෝම ඉවත් කිරීම", category: "beauty" },
  { unitNo: "M05", nameEN: "Perform Make-up Activities", nameSI: "මේකප්", category: "beauty" },
  { unitNo: "M06", nameEN: "Manicure & Pedicure", nameSI: "අත් අලංකරණය සහ පා අලංකරණය", category: "beauty" },
  { unitNo: "M07", nameEN: "Analyze Skin", nameSI: "සම විශ්ලේෂණය", category: "beauty" },
  { unitNo: "M08-A", nameEN: "Skin Care Treatments (facial)", nameSI: "සම් සත්කාර ප්‍රතිකාර", category: "beauty" },
  { unitNo: "M08-B", nameEN: "Salon Management", nameSI: "රූපලාවණ්‍යාගාර කළමනාකරණය", category: "beauty" },

  // Bridal New Syllabus
  { unitNo: "M01", nameEN: "Special Qualities to be Inculcated & Attitudes to be Developed", nameSI: "රූපලාවන්‍ය ශිල්පියෙකුට වර්ධනය කළ යුතු විශේෂ ගුණාංග සහ ආකල්ප", category: "bridal-dresser" },
  { unitNo: "M02", nameEN: "Analyse Skin", nameSI: "සම විශ්ලේෂණය", category: "bridal-dresser" },
  { unitNo: "M03", nameEN: "Facial", nameSI: "මුහුණු සත්කාර", category: "bridal-dresser" },
  { unitNo: "M05", nameEN: "Remove Superfluous Hair", nameSI: "අනවශ්‍ය රෝම ඉවත් කිරීම", category: "bridal-dresser" },
  { unitNo: "M06", nameEN: "Care Hands & Nails (Manicure)", nameSI: "අත් අලංකරණය", category: "bridal-dresser" },
  { unitNo: "M07", nameEN: "Care Feet & Nails (Pedicure)", nameSI: "පා අලංකරණය", category: "bridal-dresser" },
  { unitNo: "M08", nameEN: "Shampoo & conditioning hair", nameSI: "Shampoo කිරීම සහ condition කිරීම", category: "bridal-dresser" },
  { unitNo: "M09", nameEN: "Treat Scalp & Hair", nameSI: "හිසකෙස් සත්කාර", category: "bridal-dresser" },
  { unitNo: "M10-A", nameEN: "Style Hair and techniques", nameSI: "කොණ්ඩා මෝස්තර සහ තාක්ෂණය", category: "bridal-dresser" },
  { unitNo: "M10-B", nameEN: "Hair setting techniques", nameSI: "කොණ්ඩා සැකසුම් සහ තාක්ෂණය", category: "bridal-dresser" },
  { unitNo: "M11", nameEN: "Makeup", nameSI: "මේකප්", category: "bridal-dresser" },
  { unitNo: "M12", nameEN: "Bridal attire and its draping", nameSI: "මංගල ඇදුම් සහ එම ඇන්දවීම", category: "bridal-dresser" },
  { unitNo: "M13", nameEN: "Bridal dresser", nameSI: "මනාලියන් ඇන්දවීම", category: "bridal-dresser" },
  { unitNo: "M14", nameEN: "Occupational Health & Safety", nameSI: "සෞඛ්‍ය සහ ආරක්ෂාව", category: "bridal-dresser" },
  { unitNo: "M15", nameEN: "Client Consultation", nameSI: "සේවාලාභී උපදේශනය", category: "bridal-dresser" },
  { unitNo: "M16", nameEN: "Management of Salon", nameSI: "රූපලාවණ්‍යාගාර කළමනාකරණය", category: "bridal-dresser" },
  { unitNo: "M17", nameEN: "Maintenance of machinery, tools and equipment", nameSI: "මැශින් සහ උපකරණ නඩත්තුව", category: "bridal-dresser" },
  { unitNo: "M18", nameEN: "Practice workplace communication and interpersonal relation", nameSI: "වෘත්තීය සන්නිවේදනය සහ අන්තර් පුද්ගල සම්බන්ධතා", category: "bridal-dresser" },
  { unitNo: "M19", nameEN: "Apply occupational literary and numaracy", nameSI: "සාක්ෂරතාවය සහ සංඛ්‍යාත්මකතාව", category: "bridal-dresser" },
  { unitNo: "M20", nameEN: "Work in team", nameSI: "කණ්ඩායමක් ලෙස වැඩ කිරීම", category: "bridal-dresser" },

  // Hair Dresser Syllabus
  { unitNo: "M01", nameEN: "Special qualities & attitudes to be developed by a Hairdresser", nameSI: "කොණ්ඩො මෝස්තර ශිල්පියෙකු විසින් ප්‍රගුණ කළ යුතු ගුණාංග", category: "hair" },
  { unitNo: "M02", nameEN: "Maintain Machinery, Tools and Equipment", nameSI: "යන්ත්‍ර, උපකරණ හා භාණ්ඩ නඩත්තුව", category: "hair" },
  { unitNo: "M03", nameEN: "Shampoo & conditioning hair", nameSI: "හිසකෙස් shampoo කිරීම හා condition කිරීම", category: "hair" },
  { unitNo: "M04", nameEN: "Maintain safe & pleasant salon environment", nameSI: "පරිසර නඩත්තුව", category: "hair" },
  { unitNo: "M05", nameEN: "Client’s consultation services", nameSI: "සේවාලාභී උපදේශනය", category: "hair" },
  { unitNo: "M06", nameEN: "Hair & scalp treatments", nameSI: "හිසකෙස් සහ scalp සත්කාර", category: "hair" },
  { unitNo: "M07", nameEN: "Cutting & setting ladies hair", nameSI: "කාන්තා හිසකෙස් කැපීම හා සැකසීම", category: "hair" },
  { unitNo: "M08", nameEN: "Cutting & setting men’s hair, moustache & beard", nameSI: "පිරිමි හිසකෙස් කැපීම හා සැකසීම සහ රැවුල", category: "hair" },
  { unitNo: "M09", nameEN: "Styling & dressing hair", nameSI: "හිසකෙස් මෝස්තර හා සැකසීම", category: "hair" },
  { unitNo: "M10", nameEN: "Permanent wave (perm)", nameSI: "පර්ම් කිරීම", category: "hair" },
  { unitNo: "M11", nameEN: "Relaxing / straightening services", nameSI: "හිසකෙස් කෙලින් කිරීම / relaxing", category: "hair" },
  { unitNo: "M12", nameEN: "Colour hair", nameSI: "හිසකෙස් වර්ණ කිරීම", category: "hair" },
  { unitNo: "M13", nameEN: "Promotion & selling hair care products & services", nameSI: "නිෂ්පාදන ප්‍රවර්ධන හා විකිණීම", category: "hair" },
  { unitNo: "M14", nameEN: "Hairdressing salon management", nameSI: "සැලෝන් කළමනාකරණය", category: "hair" },
  { unitNo: "BM01", nameEN: "Communication skills for workplace", nameSI: "රැකියා ස්ථාන සහ සන්නිවේදන කුසලතා", category: "hair" },
  { unitNo: "BM02", nameEN: "Team work", nameSI: "කණ්ඩායම් වැඩ", category: "hair" },
  { unitNo: "BM03", nameEN: "Occupational Safety & Health & Environmental Aspects", nameSI: "වෘත්තීය ආරක්ෂාව, සෞඛ්‍ය හා පරීක්ෂණය", category: "hair" },

  // Beauty old syllabus and extra note
  { unitNo: "Extra-01", nameEN: "History of Beauty", nameSI: "රූපලාවන්‍ය ඉතිහාසය", category: "extra-notes" },
  { unitNo: "Extra-02", nameEN: "History of Cosmetics", nameSI: "විකේෂ් ලාවණය ඉතිහාසය", category: "extra-notes" },
];
