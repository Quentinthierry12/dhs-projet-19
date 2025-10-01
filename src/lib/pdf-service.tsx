import React from 'react';
import jsPDF from 'jspdf';
import { Candidate, SubModuleScore, CompetitionParticipationResult, PoliceAgent, DisciplinaryRecord, AgentTraining, Module, SubModuleAppreciation } from '@/types';
import { generatePdf } from '@/utils/pdfGenerator';
import { AgentTrainingsPDF } from '@/components/pdf/AgentTrainingsPDF';
import { AgentDisciplinesPDF } from '@/components/pdf/AgentDisciplinesPDF';

// Configuration PDF commune avec template professionnel LETC
const addProfessionalHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // En-tête LETC professionnel
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LETC', 20, 25);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Law Enforcement Training Center', 20, 35);
  
  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);
  
  // Titre du document
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 55);
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, 65);
    return 75;
  }
  
  return 65;
};

const addProfessionalFooter = (doc: jsPDF, yPosition: number) => {
  // Pied de page professionnel
  const footerY = Math.max(yPosition + 20, 270);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Document généré automatiquement par le système LETC - Law Enforcement Training Center', 20, footerY);
  doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 20, footerY + 5);
};

// Fonction pour créer des encadrés informatifs
const addInfoBox = (doc: jsPDF, x: number, y: number, width: number, height: number, title: string, content: string[], bgColor = [240, 240, 240]) => {
  // Fond coloré
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(x, y, width, height, 'F');
  doc.setDrawColor(100, 100, 100);
  doc.rect(x, y, width, height);
  
  // Titre
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 5, y + 10);
  
  // Contenu
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let contentY = y + 20;
  content.forEach(line => {
    doc.text(line, x + 5, contentY);
    contentY += 6;
  });
  
  return y + height + 5;
};

// Nouvelle fonction pour générer une convocation professionnelle
export const generateConvocationPDF = (invitation: any, competitionTitle: string) => {
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, 'CONVOCATION OFFICIELLE', `Concours: ${competitionTitle}`);
  yPosition += 10;
  
  // Date de génération
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE :', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('fr-FR'), 55, yPosition);
  yPosition += 20;
  
  // Informations du candidat dans un encadré
  yPosition = addInfoBox(doc, 20, yPosition, 170, 35, 'CANDIDAT CONVOQUÉ', [
    `Nom: ${invitation.candidateName}`,
    invitation.candidateEmail ? `Email: ${invitation.candidateEmail}` : ''
  ].filter(Boolean));
  
  // Instructions principales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUCTIONS DE CONNEXION', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const instructions = [
    'Vous êtes convoqué(e) à participer au concours mentionné ci-dessus.',
    'Veuillez suivre scrupuleusement les instructions suivantes :',
    '',
    '1. Rendez-vous à l\'adresse suivante :'
  ];
  
  instructions.forEach(instruction => {
    if (instruction) {
      doc.text(instruction, 20, yPosition);
    }
    yPosition += 7;
  });
  
  // Lien d'accès dans un encadré
  doc.setFillColor(230, 245, 255);
  doc.rect(30, yPosition - 3, 150, 12, 'F');
  doc.setDrawColor(50, 150, 200);
  doc.rect(30, yPosition - 3, 150, 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const accessLink = `${window.location.origin}/competition/${invitation.competitionId}/login`;
  doc.text(accessLink, 35, yPosition + 5);
  yPosition += 20;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('2. Utilisez les identifiants suivants pour vous connecter :', 20, yPosition);
  yPosition += 15;
  
  // Identifiants dans des encadrés distincts
  // Identifiant
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFIANT :', 20, yPosition);
  yPosition += 10;
  
  doc.setFillColor(255, 250, 205);
  doc.rect(20, yPosition - 5, 80, 15, 'F');
  doc.setDrawColor(200, 150, 0);
  doc.rect(20, yPosition - 5, 80, 15);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(invitation.loginIdentifier, 25, yPosition + 5);
  
  // Mot de passe
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MOT DE PASSE :', 110, yPosition - 10);
  
  doc.setFillColor(255, 240, 240);
  doc.rect(110, yPosition - 5, 80, 15, 'F');
  doc.setDrawColor(200, 0, 0);
  doc.rect(110, yPosition - 5, 80, 15);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(invitation.loginPassword, 115, yPosition + 5);
  yPosition += 25;
  
  // Instructions supplémentaires
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const additionalInstructions = [
    '3. Une fois connecté(e), suivez les instructions à l\'écran',
    '4. Répondez à toutes les questions dans le temps imparti',
    '5. Validez votre participation avant la fin du délai',
    '',
    'IMPORTANT : Conservez cette convocation jusqu\'à la fin du concours.'
  ];
  
  additionalInstructions.forEach(instruction => {
    if (instruction.startsWith('IMPORTANT')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    }
    if (instruction) {
      doc.text(instruction, 20, yPosition);
    }
    yPosition += 7;
  });
  
  yPosition += 15;
  
  // Informations administratives
  yPosition = addInfoBox(doc, 20, yPosition, 170, 30, 'INFORMATIONS ADMINISTRATIVES', [
    `Statut de l'invitation : ${invitation.status === 'used' ? 'UTILISÉE' : 'EN ATTENTE'}`,
    `Convocation générée le : ${new Date(invitation.createdAt).toLocaleDateString('fr-FR')} à ${new Date(invitation.createdAt).toLocaleTimeString('fr-FR')}`,
    invitation.usedAt ? `Invitation utilisée le : ${new Date(invitation.usedAt).toLocaleDateString('fr-FR')} à ${new Date(invitation.usedAt).toLocaleTimeString('fr-FR')}` : ''
  ].filter(Boolean));
  
  addProfessionalFooter(doc, yPosition);
  
  const filename = `convocation_${invitation.candidateName.replace(/\s+/g, '_')}_${competitionTitle.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

// Export PDF du bulletin FLETC avec template professionnel
export const exportBulletinPDF = (candidate: Candidate, modules: Module[], appreciations: SubModuleAppreciation[]) => {
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, 'BULLETIN DE FORMATION FLETC', `Candidat: ${candidate.name}`);
  yPosition += 10;
  
  // Informations du candidat dans un encadré
  const candidateInfo = [
    `Nom: ${candidate.name}`,
    `ID Serveur: #${candidate.serverId}`,
    `Date d'ajout: ${new Date(candidate.createdAt).toLocaleDateString('fr-FR')}`,
    `Statut: ${candidate.isCertified ? 'Certifié FLETC' : 'En formation'}`
  ];
  
  if (candidate.isCertified && candidate.certificationDate) {
    candidateInfo.push(`Date de certification: ${new Date(candidate.certificationDate).toLocaleDateString('fr-FR')}`);
    if (candidate.certifiedBy) {
      candidateInfo.push(`Certifié par: ${candidate.certifiedBy}`);
    }
  }
  
  yPosition = addInfoBox(doc, 20, yPosition, 170, 50, 'INFORMATIONS CANDIDAT', candidateInfo, [230, 245, 255]);
  
  // Calculer le score global
  const moduleScores = candidate.moduleScores || [];
  const totalScore = moduleScores.reduce((sum, score) => sum + score.score, 0);
  const totalMaxScore = moduleScores.reduce((sum, score) => sum + score.maxScore, 0);
  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  
  // Résultats globaux
  yPosition = addInfoBox(doc, 20, yPosition, 170, 20, 'RÉSULTATS GLOBAUX', [
    `Score total: ${totalScore}/${totalMaxScore} (${percentage}%)`
  ], [245, 255, 245]);
  
  // Détails des modules
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAIL DES MODULES', 20, yPosition);
  yPosition += 15;
  
  modules.forEach((module) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = addProfessionalHeader(doc, 'BULLETIN DE FORMATION FLETC', 'Suite - Détail des modules');
      yPosition += 10;
    }
    
    // Calculer le score du module
    const moduleSubModuleScores = module.subModules?.map(sm => 
      moduleScores.find(score => score.subModuleId === sm.id)
    ).filter(Boolean) || [];
    
    const moduleTotal = moduleSubModuleScores.reduce((sum, score) => sum + (score?.score || 0), 0);
    const moduleMaxTotal = module.subModules?.reduce((sum, sm) => sum + sm.maxScore, 0) || 0;
    const modulePercentage = moduleMaxTotal > 0 ? Math.round((moduleTotal / moduleMaxTotal) * 100) : 0;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${module.name}`, 20, yPosition);
    doc.text(`${moduleTotal}/${moduleMaxTotal} (${modulePercentage}%)`, 120, yPosition);
    yPosition += 10;
    
    if (module.description) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(module.description, 30, yPosition);
      yPosition += 8;
    }
    
    // Sous-modules
    if (module.subModules && module.subModules.length > 0) {
      module.subModules.forEach((subModule) => {
        const score = moduleScores.find(s => s.subModuleId === subModule.id);
        const appreciation = appreciations.find(app => app.subModuleId === subModule.id);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${subModule.name}`, 30, yPosition);
        
        if (score) {
          doc.text(`${score.score}/${subModule.maxScore}`, 120, yPosition);
          const subPercentage = Math.round((score.score / subModule.maxScore) * 100);
          doc.text(`(${subPercentage}%)`, 150, yPosition);
        } else {
          doc.text('Non évalué', 120, yPosition);
        }
        
        yPosition += 6;
        
        // Appréciation et commentaires
        if (appreciation?.appreciation || score?.comment) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          
          if (appreciation?.appreciation) {
            const lines = doc.splitTextToSize(`Appréciation: ${appreciation.appreciation}`, 140);
            lines.forEach((line: string) => {
              doc.text(line, 35, yPosition);
              yPosition += 5;
            });
          }
          
          if (score?.comment) {
            const lines = doc.splitTextToSize(`Commentaire: ${score.comment}`, 140);
            lines.forEach((line: string) => {
              doc.text(line, 35, yPosition);
              yPosition += 5;
            });
          }
        }
        
        yPosition += 3;
      });
    }
    
    yPosition += 10;
  });
  
  addProfessionalFooter(doc, yPosition);
  doc.save(`bulletin_fletc_${candidate.name.replace(/\s+/g, '_')}.pdf`);
};

// Export PDF des agents avec template professionnel
export const exportAgentsPDF = (agents: any[], title = 'Liste des Agents') => {
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, title, `${agents.length} agent(s) recensé(s)`);
  yPosition += 10;
  
  if (agents.length === 0) {
    doc.setFontSize(12);
    doc.text('Aucun agent trouvé', 20, yPosition);
  } else {
    agents.forEach((agent, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = addProfessionalHeader(doc, title, 'Suite de la liste');
        yPosition += 10;
      }
      
      // Informations de l'agent dans un encadré
      const agentInfo = [
        `Badge: ${agent.badgeNumber}`,
        `Agence: ${agent.agencyName || 'N/A'}`,
        `Grade: ${agent.gradeName || 'N/A'}`,
        `Statut: ${agent.status}`
      ];
      
      yPosition = addInfoBox(doc, 20, yPosition, 170, 30, `${index + 1}. ${agent.name}`, agentInfo);
    });
  }
  
  addProfessionalFooter(doc, yPosition);
  doc.save(`agents_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export PDF des résultats de concours avec template professionnel
export const exportCompetitionResultsPDF = (results: CompetitionParticipationResult[], participantName?: string) => {
  const doc = new jsPDF();
  
  const title = participantName ? `Résultats de concours - ${participantName}` : 'Résultats de concours';
  let yPosition = addProfessionalHeader(doc, title, `${results.length} résultat(s)`);
  yPosition += 10;
  
  if (results.length === 0) {
    doc.setFontSize(12);
    doc.text('Aucun résultat trouvé', 20, yPosition);
  } else {
    results.forEach((result, index) => {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = addProfessionalHeader(doc, title, 'Suite des résultats');
        yPosition += 10;
      }
      
      // Informations du résultat dans un encadré
      const resultInfo = [
        `Participant: ${result.participantName}`,
        result.participantRio ? `RIO: ${result.participantRio}` : '',
        `Score: ${result.score}/${result.maxScore} (${result.percentage}%)`,
        `Soumis le: ${new Date(result.submittedAt).toLocaleDateString('fr-FR')}`,
        result.comment ? `Commentaire: ${result.comment}` : ''
      ].filter(Boolean);
      
      yPosition = addInfoBox(doc, 20, yPosition, 170, 35, `${index + 1}. ${result.competitionTitle}`, resultInfo);
    });
  }
  
  addProfessionalFooter(doc, yPosition);
  
  const filename = participantName 
    ? `resultats_concours_${participantName.replace(/\s+/g, '_')}.pdf`
    : `resultats_concours_${new Date().toISOString().split('T')[0]}.pdf`;
    
  doc.save(filename);
};

// Export PDF des invitations de concours avec template professionnel
export const exportCompetitionInvitationsPDF = (invitations: any[], competitionTitle: string) => {
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, `Invitations - ${competitionTitle}`, `${invitations.length} invitation(s) créée(s)`);
  yPosition += 10;
  
  if (invitations.length === 0) {
    doc.setFontSize(12);
    doc.text('Aucune invitation créée', 20, yPosition);
  } else {
    // Statistiques dans un encadré
    const totalInvitations = invitations.length;
    const usedInvitations = invitations.filter(inv => inv.status === 'used').length;
    const pendingInvitations = totalInvitations - usedInvitations;
    
    const statsInfo = [
      `Total des invitations: ${totalInvitations}`,
      `Invitations utilisées: ${usedInvitations}`,
      `Invitations en attente: ${pendingInvitations}`
    ];
    
    yPosition = addInfoBox(doc, 20, yPosition, 170, 25, 'STATISTIQUES', statsInfo, [255, 248, 220]);
    
    // Liste des invitations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTE DES INVITATIONS', 20, yPosition);
    yPosition += 15;
    
    invitations.forEach((invitation, index) => {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = addProfessionalHeader(doc, `Invitations - ${competitionTitle}`, 'Suite de la liste');
        yPosition += 10;
      }
      
      // Informations de l'invitation dans un encadré
      const invitationInfo = [
        invitation.candidateEmail ? `Email: ${invitation.candidateEmail}` : '',
        `Identifiant: ${invitation.loginIdentifier}`,
        `Mot de passe: ${invitation.loginPassword}`,
        `Statut: ${invitation.status === 'used' ? 'Utilisée' : 'En attente'}`,
        `Créée le: ${new Date(invitation.createdAt).toLocaleDateString('fr-FR')} à ${new Date(invitation.createdAt).toLocaleTimeString('fr-FR')}`,
        invitation.usedAt ? `Utilisée le: ${new Date(invitation.usedAt).toLocaleDateString('fr-FR')} à ${new Date(invitation.usedAt).toLocaleTimeString('fr-FR')}` : ''
      ].filter(Boolean);
      
      const bgColor = invitation.status === 'used' ? [240, 255, 240] : [255, 250, 240];
      yPosition = addInfoBox(doc, 20, yPosition, 170, 45, `${index + 1}. ${invitation.candidateName}`, invitationInfo, bgColor);
    });
  }
  
  addProfessionalFooter(doc, yPosition);
  doc.save(`invitations_${competitionTitle.replace(/\s+/g, '_')}.pdf`);
};

// Export PDF d'une invitation individuelle avec template professionnel
export const exportSingleInvitationPDF = (invitation: any, competitionTitle: string) => {
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, 'Invitation au concours', competitionTitle);
  yPosition += 10;
  
  // Informations du candidat
  const candidateInfo = [
    `Candidat: ${invitation.candidateName}`,
    invitation.candidateEmail ? `Email: ${invitation.candidateEmail}` : '',
    `Concours: ${competitionTitle}`
  ].filter(Boolean);
  
  yPosition = addInfoBox(doc, 20, yPosition, 170, 25, 'INVITATION INDIVIDUELLE', candidateInfo, [230, 245, 255]);
  
  // Identifiants de connexion
  const loginInfo = [
    `Identifiant: ${invitation.loginIdentifier}`,
    `Mot de passe: ${invitation.loginPassword}`
  ];
  
  yPosition = addInfoBox(doc, 20, yPosition, 170, 20, 'IDENTIFIANTS DE CONNEXION', loginInfo, [255, 250, 205]);
  
  // Lien d'accès
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LIEN D\'ACCÈS', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const accessLink = `${window.location.origin}/competition/${invitation.competitionId}/login`;
  doc.text(accessLink, 20, yPosition);
  yPosition += 15;
  
  // Instructions
  const instructionsInfo = [
    '1. Rendez-vous sur le lien d\'accès ci-dessus',
    '2. Saisissez votre identifiant et mot de passe',
    '3. Suivez les instructions pour participer au concours',
    '4. Conservez ce document jusqu\'à la fin du concours'
  ];
  
  yPosition = addInfoBox(doc, 20, yPosition, 170, 30, 'INSTRUCTIONS', instructionsInfo, [245, 255, 245]);
  
  // Informations sur l'invitation
  const statusInfo = [
    `Statut: ${invitation.status === 'used' ? 'Utilisée' : 'En attente'}`,
    `Créée le: ${new Date(invitation.createdAt).toLocaleDateString('fr-FR')} à ${new Date(invitation.createdAt).toLocaleTimeString('fr-FR')}`,
    invitation.usedAt ? `Utilisée le: ${new Date(invitation.usedAt).toLocaleDateString('fr-FR')} à ${new Date(invitation.usedAt).toLocaleTimeString('fr-FR')}` : ''
  ].filter(Boolean);
  
  yPosition = addInfoBox(doc, 20, yPosition, 170, 25, 'INFORMATIONS SUR L\'INVITATION', statusInfo);
  
  addProfessionalFooter(doc, yPosition);
  
  const filename = `invitation_${invitation.candidateName.replace(/\s+/g, '_')}_${competitionTitle.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

// Export PDF des modules d'un candidat avec template professionnel
export const exportCandidateModulesPDF = (candidate: Candidate, moduleScores: SubModuleScore[], modules: any[]) => {
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, 'Résultats des modules', `Candidat: ${candidate.name}`);
  yPosition += 10;
  
  // Informations candidat
  const candidateInfo = [
    `Nom: ${candidate.name}`,
    `ID Serveur: ${candidate.serverId}`,
    `Statut: ${candidate.isCertified ? 'Certifié FLETC' : 'En formation'}`,
    candidate.isCertified && candidate.certificationDate ? `Certifié le: ${new Date(candidate.certificationDate).toLocaleDateString('fr-FR')}` : '',
    candidate.isCertified && candidate.certifiedBy ? `Certifié par: ${candidate.certifiedBy}` : ''
  ].filter(Boolean);
  
  yPosition = addInfoBox(doc, 20, yPosition, 170, 35, 'INFORMATIONS CANDIDAT', candidateInfo, [230, 245, 255]);
  
  // Résultats des modules
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSULTATS DES MODULES', 20, yPosition);
  yPosition += 15;
  
  modules.forEach((module) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = addProfessionalHeader(doc, 'Résultats des modules', 'Suite');
      yPosition += 10;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Module: ${module.name}`, 20, yPosition);
    yPosition += 10;
    
    if (module.subModules && module.subModules.length > 0) {
      module.subModules.forEach((subModule: any) => {
        const score = moduleScores.find(s => s.subModuleId === subModule.id);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${subModule.name}:`, 30, yPosition);
        
        if (score) {
          doc.text(`${score.score}/${subModule.maxScore} points`, 120, yPosition);
          if (score.comment) {
            yPosition += 5;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text(`  Commentaire: ${score.comment}`, 35, yPosition);
          }
        } else {
          doc.text('Non validé', 120, yPosition);
        }
        
        yPosition += 8;
      });
    }
    
    yPosition += 10;
  });
  
  addProfessionalFooter(doc, yPosition);
  doc.save(`modules_${candidate.name.replace(/\s+/g, '_')}.pdf`);
};

// Export PDF des formations d'un agent avec template professionnel
export const exportAgentTrainingsPDF = async (agent: PoliceAgent, trainings: AgentTraining[]) => {
  await generatePdf(
    <AgentTrainingsPDF agent={agent} trainings={trainings} />,
    `formations_${agent.name.replace(/\s+/g, '_')}.pdf`
  );
};

// Export PDF des sanctions disciplinaires d'un agent avec template professionnel
export const exportAgentDisciplinesPDF = async (agent: PoliceAgent, disciplines: DisciplinaryRecord[]) => {
  await generatePdf(
    <AgentDisciplinesPDF agent={agent} disciplines={disciplines} />,
    `sanctions_${agent.name.replace(/\s+/g, '_')}.pdf`
  );
};

// Alias functions for backward compatibility
export const generateAgentsPDF = exportAgentsPDF;
export const generateCompetitionResultsPDF = exportCompetitionResultsPDF;
export const generateAgentTrainingPDF = exportAgentTrainingsPDF;
export const generateAgentDisciplinaryPDF = exportAgentDisciplinesPDF;
