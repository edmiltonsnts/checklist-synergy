
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checklist, ChecklistItem, Equipment, Operator } from '@/types/checklist';
import { saveChecklist } from '@/services/checklistService';
import { toast } from "sonner";
import SignatureCanvas from './SignatureCanvas';
import { Button } from '@/components/ui/button';

interface ChecklistFormProps {
  initialEquipment: Equipment;
  initialOperator: Operator;
}

const ChecklistForm = ({ initialEquipment, initialOperator }: ChecklistFormProps) => {
  const [equipmentNumber, setEquipmentNumber] = useState(initialEquipment.id);
  const [operatorName, setOperatorName] = useState(initialOperator.name);
  const [operatorId, setOperatorId] = useState(initialOperator.id);
  const [equipment, setEquipment] = useState(initialEquipment.name);
  const [sector, setSector] = useState(initialEquipment.sector);
  const [capacity, setCapacity] = useState(initialEquipment.capacity);
  const [signature, setSignature] = useState('');
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 1, question: 'Os cabos de aço apresentam fios partidos?', answer: null },
    { id: 2, question: 'Os cabos de aço apresentam pontos de amassamento?', answer: null },
    { id: 3, question: 'Os cabos de aço apresentam alguma dobra?', answer: null },
    { id: 4, question: 'O sistema de freios do guincho está funcionando?', answer: null },
    { id: 5, question: 'O gancho está girando sem dificuldades?', answer: null },
    { id: 6, question: 'O gancho possui trava de segurança funcionando?', answer: null },
    { id: 7, question: 'O gancho possui sinais de alongamento?', answer: null },
    { id: 8, question: 'Os ganchos da corrente possuem sinais de desgaste?', answer: null },
    { id: 9, question: 'As travas de segurança dos ganchos estão funcionando?', answer: null },
    { id: 10, question: 'A corrente possui a plaqueta de identificação instalada?', answer: null },
    { id: 11, question: 'As polias estão girando sem dificuldades?', answer: null },
    { id: 12, question: 'A sinalização sonora funciona durante a movimentação?', answer: null },
    { id: 13, question: 'O controle possui botão danificado?', answer: null },
    { id: 14, question: 'O botão de emergência está funcionando?', answer: null },
    { id: 15, question: 'A estrutura possui grandes danos?', answer: null },
    { id: 16, question: 'O sistema de freios do Troller está funcionando?', answer: null },
    { id: 17, question: 'Os elos da corrente possuem sinais de desgaste?', answer: null },
    { id: 18, question: 'Os elos da corrente possuem sinais de "alargamento"?', answer: null },
    { id: 19, question: 'Os elos da corrente possuem sinais de "alongamento"?', answer: null },
    { id: 20, question: 'O fim de curso superior está funcionando?', answer: null },
    { id: 21, question: 'O fim de curso inferior está funcionando?', answer: null },
    { id: 22, question: 'O fim de curso direito está funcionando?', answer: null },
    { id: 23, question: 'O fim de curso esquerdo está funcionando?', answer: null },
    { id: 24, question: 'O equipamento apresenta ruídos estranhos?', answer: null }
  ]);

  const handleAnswerChange = (id: number, value: string) => {
    setChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, answer: value } : item
      )
    );
  };

  const handleSignatureSave = (signatureImage: string) => {
    setSignature(signatureImage);
  };

  const saveChecklistData = async () => {
    const unansweredItems = checklistItems.filter(item => item.answer === null);
    
    if (unansweredItems.length > 0) {
      toast.warning(`Existem ${unansweredItems.length} perguntas não respondidas!`);
      return;
    }

    if (!signature) {
      toast.warning('Por favor, assine o formulário antes de salvar');
      return;
    }
    
    try {
      const checklistData: Checklist = {
        equipmentNumber,
        operatorName,
        operatorId,
        equipment,
        kpNumber: equipmentNumber,
        sector,
        capacity,
        items: checklistItems,
        signature
      };
      
      const result = await saveChecklist(checklistData);
      
      toast.success("Checklist salvo com sucesso!");
      console.log('Checklist salvo:', result);
    } catch (error) {
      toast.error("Erro ao salvar o checklist!");
      console.error('Erro ao salvar checklist:', error);
    }
  };

  return (
    <Card className="w-full p-0 overflow-hidden shadow-lg">
      <div className="bg-[#8B0000] text-white p-3 flex justify-center items-center">
        <h1 className="text-3xl font-bold">Check List</h1>
      </div>

      <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-2">
          <div className="text-blue-800 font-bold text-lg">Equip</div>
          <div className="flex-1">
            <Input 
              value={equipment} 
              readOnly
              className="bg-blue-50 border-blue-300 text-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-blue-800 font-bold text-lg">Setor</div>
          <div className="flex-1">
            <Input 
              value={sector} 
              readOnly
              className="bg-white text-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 font-semibold text-right text-lg text-blue-800">Capacidade</div>
          <div className="flex-1">
            <Input 
              value={capacity} 
              readOnly
              className="bg-white text-gray-700"
            />
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <div className="text-center text-xl font-bold text-[#8B0000] mb-4">Itens de Verificação</div>
          {checklistItems.map((item) => (
            <div key={item.id} className="flex gap-2 items-center">
              <div className="flex-1 text-gray-800">{item.question}</div>
              <div className="w-28">
                <Select onValueChange={(value) => handleAnswerChange(item.id, value)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-blue-800 font-bold text-lg mb-2">Assinatura do Operador</div>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <SignatureCanvas onSave={handleSignatureSave} />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            onClick={saveChecklistData}
            className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-lg py-6"
          >
            Salvar Checklist
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChecklistForm;
