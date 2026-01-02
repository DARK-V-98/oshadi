
export type Unit = {
  id: string; // Firestore document ID
  unitNo: string;
  nameEN: string;
  nameSI: string;
  category: 'bridal-dresser' | 'beauty' | 'hair' | 'extra-notes';
  priceNotesSI: string;
  priceAssignmentsSI: string;
  priceNotesEN: string;
  priceAssignmentsEN: string;
  pdfsEN: { partName: string, fileName: string, downloadUrl: string }[];
  pdfsSI: { partName: string, fileName: string, downloadUrl: string }[];
};

// This static data is no longer the source of truth.
// Units are now fetched from the 'units' collection in Firestore.
// This file is kept for type definition but the data array is empty.
export const units: Unit[] = [];
