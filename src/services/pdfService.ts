
import { ChecklistHistory } from '@/types/checklist';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

export const sendEmailWithPDF = (checklist: ChecklistHistory, email: string): void => {
  // Esta é uma simulação, em um cenário real você enviaria para o seu backend
  toast.success(`Email seria enviado para ${email} com o PDF do checklist`);
  
  // Em uma implementação real, você enviaria o PDF para um endpoint no backend:
  /*
  try {
    const doc = generatePDF(checklist);
    const pdfBase64 = doc.output('datauristring');
    
    fetch('/api/send-email', {
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
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    toast.error('Erro ao enviar e-mail');
  }
  */
};
