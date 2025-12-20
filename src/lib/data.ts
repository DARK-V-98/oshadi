export type Unit = {
  unitNo: string;
  nameEN: string;
  nameSI: string;
  modelCount: string;
  category: string;
};

export const units: Unit[] = [
  { unitNo: "Health-Safety", nameEN: "Health & Safety", nameSI: "සෞඛ්‍ය සුරක්ෂිතභාවය", modelCount: "1", category: "foundation" },
  { unitNo: "Unit-01", nameEN: "Client Consultation", nameSI: "ගනුදෙනුකරු සමඟ සාකච්ඡා", modelCount: "1–2", category: "consultation" },
  { unitNo: "Unit-02", nameEN: "Salon Management", nameSI: "සැලෝන් කළමනාකරණය", modelCount: "1–2", category: "management" },
  { unitNo: "Unit-03", nameEN: "Manicure & Pedicure", nameSI: "නිය සත්කාර සිදු කිරීම", modelCount: "2–3", category: "practical" },
  { unitNo: "Unit-04", nameEN: "Facial", nameSI: "සම සදහා සත්කාර කිරීම", modelCount: "2–3", category: "practical" },
  { unitNo: "Unit-05", nameEN: "Makeup (Bridal & Special)", nameSI: "වේෂ නිරෑපණ කටයුතු සිදු කිරීම", modelCount: "5–10", category: "bridal" },
  { unitNo: "Unit-06", nameEN: "Skin Analysis", nameSI: "සම විශ්ලේෂණය", modelCount: "1–2", category: "consultation" },
  { unitNo: "Unit-07", nameEN: "Tools & Environment Maintenance", nameSI: "උපකරණ සහ පරිසර නඩත්තුව", modelCount: "1", category: "foundation" },
  { unitNo: "Unit-08", nameEN: "Reception Duties", nameSI: "පිළිගැනීමේ රාජකාරිය", modelCount: "1", category: "management" },
  { unitNo: "Unit-09", nameEN: "Hair Removal", nameSI: "අනවශ්‍ය රෝම් ඉවත් කිරීම", modelCount: "1–2", category: "practical" },
  { unitNo: "Unit-10", nameEN: "Etiquette", nameSI: "ආචාර ධර්ම", modelCount: "1", category: "foundation" },
];
