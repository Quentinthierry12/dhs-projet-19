
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Enregistrement d'une police pour une meilleure esthétique
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.ttf' }, // normal
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 'bold' }, // bold
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 35,
    fontFamily: 'Roboto',
    backgroundColor: '#F9FAFB', // Light gray background
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7281',
    marginTop: 4,
  },
  section: {
    flexGrow: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: '#6B7281',
    fontSize: 9,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 25,
    left: 0,
    right: 35,
    textAlign: 'right',
    color: '#6B7281',
  },
});

interface PDFTemplateProps {
  children: React.ReactNode;
  title: string;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ children, title }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <Text style={styles.headerTitle}>
          LETC - Law Enforcement Training Center
        </Text>
        <Text style={styles.headerSubtitle}>
          {title}
        </Text>
      </View>
      <View style={styles.section}>
        {children}
      </View>
      <Text style={styles.footer} fixed>
        Document Confidentiel - Généré le {new Date().toLocaleDateString('fr-FR')}
      </Text>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);
