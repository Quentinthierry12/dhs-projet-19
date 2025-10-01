
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFTemplate } from './PDFTemplate';
import { PoliceAgent, AgentTraining } from '@/types/police';

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
  table: {
    // @ts-ignore
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#EFF6FF',
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
    fontFamily: 'Roboto',
  }
});

interface AgentTrainingsPDFProps {
  agent: PoliceAgent;
  trainings: AgentTraining[];
}

export const AgentTrainingsPDF: React.FC<AgentTrainingsPDFProps> = ({ agent, trainings }) => (
  <PDFTemplate title={`Formations de l'agent - ${agent.name}`}>
    <View>
      <Text style={styles.sectionTitle}>Informations de l'Agent</Text>
      <View style={styles.infoBox}>
        <View style={styles.field}>
          <Text style={styles.label}>Nom :</Text>
          <Text style={styles.value}>{agent.name}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Matricule :</Text>
          <Text style={styles.value}>{agent.badgeNumber}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Agence :</Text>
          <Text style={styles.value}>{agent.agencyName || 'N/A'}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Grade :</Text>
          <Text style={styles.value}>{agent.gradeName || 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Formations Suivies</Text>
      
      {trainings.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{...styles.tableColHeader, width: '40%'}}>
              <Text style={styles.tableCellHeader}>Formation</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Validé par</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Score</Text>
            </View>
          </View>
          {trainings.map(training => (
            <View style={styles.tableRow} key={training.id}>
              <View style={{...styles.tableCol, width: '40%'}}>
                <Text style={styles.tableCell}>{training.trainingTitle}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{new Date(training.completionDate).toLocaleDateString('fr-FR')}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{training.validatedBy}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{training.score || 'N/A'}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.value}>Aucune formation enregistrée pour cet agent.</Text>
      )}
    </View>
  </PDFTemplate>
);
