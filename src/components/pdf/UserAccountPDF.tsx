
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFTemplate } from './PDFTemplate';

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A', // LETC dark blue
  },
  infoBox: {
    backgroundColor: '#EFF6FF', // Light blue
    borderWidth: 1,
    borderColor: '#BFDBFE', // Medium blue
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#1E40AF', // Darker blue
    marginBottom: 10,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 11,
    alignItems: 'center',
  },
  label: {
    width: 120,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#374151', // Dark gray
  },
  value: {
    flex: 1,
    fontFamily: 'Roboto',
    color: '#1F2937', // Nearly black
  },
});

// Définition du type User pour ce composant
interface User {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  role?: string;
}

interface UserAccountPDFProps {
  user: User;
}

export const UserAccountPDF: React.FC<UserAccountPDFProps> = ({ user }) => (
  <PDFTemplate title={`Fiche de Compte - ${user.prenom} ${user.nom}`}>
    <View>
      <Text style={styles.sectionTitle}>Informations du Compte</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Détails de l'utilisateur</Text>
        <View style={styles.field}>
          <Text style={styles.label}>ID Utilisateur :</Text>
          <Text style={styles.value}>{user.id}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Prénom :</Text>
          <Text style={styles.value}>{user.prenom}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Nom :</Text>
          <Text style={styles.value}>{user.nom}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email :</Text>
          <Text style={styles.value}>{user.email || 'Non renseigné'}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Rôle :</Text>
          <Text style={styles.value}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Non défini'}</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Consignes de Sécurité</Text>
      <View style={{ ...styles.infoBox, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
        <Text style={{ ...styles.infoBoxTitle, color: '#B45309' }}>ATTENTION</Text>
        <Text style={{ ...styles.value, fontSize: 10 }}>
          - Les informations de ce document sont confidentielles.
        </Text>
        <Text style={{ ...styles.value, fontSize: 10, marginTop: 5 }}>
          - Ne partagez jamais vos identifiants de connexion.
        </Text>
         <Text style={{ ...styles.value, fontSize: 10, marginTop: 5 }}>
          - Toute activité sur le portail est enregistrée et tracée.
        </Text>
      </View>
    </View>
  </PDFTemplate>
);
