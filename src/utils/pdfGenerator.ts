
import React from 'react';
import { pdf } from '@react-pdf/renderer';

export const generatePdf = async (docElement: React.ReactElement, fileName: string) => {
  try {
    const blob = await pdf(docElement).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    // Optionnel: afficher un toast d'erreur à l'utilisateur
  }
};
