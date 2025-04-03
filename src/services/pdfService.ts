
import { ChecklistHistory, Sector } from '@/types/checklist';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { API_URL } from './sqlServerService';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (checklist: ChecklistHistory): jsPDF => {
  const doc = new jsPDF();
  
  // Adicionar título
  doc.setFontSize(20);
  doc.text('Relatório de Checklist', 105, 15, { align: 'center' });
  
  // Adicionar informações do checklist
  doc.setFontSize(12);
  doc.text(`Equipamento: ${checklist.equipmentId} - ${checklist.equipmentName}`, 14, 30);
  doc.text(`Operador: ${checklist.operatorName} (${checklist.operatorId})`, 14, 40);
  doc.text(`Setor: ${checklist.sector}`, 14, 50);
  doc.text(`Data: ${new Date(checklist.date).toLocaleString('pt-BR')}`, 14, 60);
  
  // Adicionar tabela com itens do checklist
  const tableColumn = ["Nº", "Pergunta", "Resposta"];
  const tableRows = checklist.items.map((item, index) => [
    index + 1,
    item.question,
    item.answer || "Não respondido"
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    theme: 'striped',
    headStyles: { fillColor: [139, 0, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Adicionar assinatura se disponível
  if (checklist.signature) {
    try {
      const imgHeight = 30;
      const imgWidth = 100;
      const pageHeight = doc.internal.pageSize.height;
      let finalY = (doc as any).lastAutoTable.finalY || 70;
      
      if (finalY + imgHeight > pageHeight) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.text("Assinatura do Operador:", 14, finalY + 10);
      doc.addImage(checklist.signature, 'PNG', 14, finalY + 15, imgWidth, imgHeight);
    } catch (error) {
      console.error('Erro ao adicionar assinatura:', error);
    }
  }
  
  return doc;
};

export const savePDF = (checklist: ChecklistHistory): void => {
  try {
    const doc = generatePDF(checklist);
    doc.save(`checklist_${checklist.equipmentId}_${new Date(checklist.date).toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF gerado e salvo com sucesso');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error('Erro ao gerar PDF');
  }
};

export const sendEmailWithPDF = async (checklist: ChecklistHistory, email: string): Promise<boolean> => {
  try {
    const doc = generatePDF(checklist);
    const pdfBase64 = doc.output('datauristring');
    
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        subject: `Checklist de ${checklist.equipmentName} - ${new Date(checklist.date).toLocaleDateString()}`,
        pdfBase64,
        equipmentName: checklist.equipmentName,
        operatorName: checklist.operatorName,
        sector: checklist.sector,
        date: checklist.date
      })
    });
    
    if (response.ok) {
      toast.success(`Email enviado com sucesso para ${email}`);
      return true;
    } else {
      const errorData = await response.json();
      console.error('Erro ao enviar e-mail:', errorData);
      toast.error(`Erro ao enviar e-mail: ${errorData.message || 'Erro desconhecido'}`);
      return false;
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    toast.error('Erro ao enviar e-mail. Verifique a conexão com o servidor.');
    return false;
  }
};

// Enviar automaticamente o PDF para o email do setor
export const sendChecklistToSectorEmail = async (checklist: ChecklistHistory, sectors: Sector[]): Promise<boolean> => {
  try {
    // Encontrar o setor correspondente
    const sectorData = sectors.find(s => s.name === checklist.sector);
    
    if (!sectorData || !sectorData.email) {
      toast.error(`Não foi possível enviar o e-mail: Setor ${checklist.sector} não possui e-mail cadastrado`);
      return false;
    }
    
    return await sendEmailWithPDF(checklist, sectorData.email);
  } catch (error) {
    console.error('Erro ao enviar checklist para o setor:', error);
    toast.error('Erro ao processar o envio do checklist');
    return false;
  }
};
