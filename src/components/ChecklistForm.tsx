
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Check } from 'lucide-react';
import { Checklist, ChecklistItem } from '@/types/checklist';
import { saveChecklist } from '@/services/checklistService';
import { toast } from "sonner";

const ChecklistForm = () => {
  const [equipmentNumber, setEquipmentNumber] = useState('1200');
  const [operatorName, setOperatorName] = useState('MABEL KRISTINE BRAMORSKI LON');
  const [equipment, setEquipment] = useState('Ponte 01');
  const [kpNumber, setKpNumber] = useState('207');
  const [sector, setSector] = useState('MOLDAGEM');
  const [capacity, setCapacity] = useState('10 tons');
  
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

  const saveChecklistData = async () => {
    // Verificar se todos os itens foram respondidos
    const unansweredItems = checklistItems.filter(item => item.answer === null);
    
    if (unansweredItems.length > 0) {
      toast.warning(`Existem ${unansweredItems.length} perguntas não respondidas!`);
      return;
    }
    
    try {
      // Preparar os dados do checklist
      const checklistData: Checklist = {
        equipmentNumber,
        operatorName,
        equipment,
        kpNumber,
        sector,
        capacity,
        items: checklistItems
      };
      
      // Enviar para o serviço
      const result = await saveChecklist(checklistData);
      
      toast.success("Checklist salvo com sucesso!");
      console.log('Checklist salvo:', result);
    } catch (error) {
      toast.error("Erro ao salvar o checklist!");
      console.error('Erro ao salvar checklist:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md p-0 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-primary text-white p-3 flex justify-between items-center">
          <X className="w-6 h-6 cursor-pointer" />
          <h1 className="text-xl font-semibold">Check List Online</h1>
          <Check className="w-6 h-6 cursor-pointer" onClick={saveChecklistData} />
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Equipment Number and Operator */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input 
                value={equipmentNumber} 
                onChange={(e) => setEquipmentNumber(e.target.value)}
                className="bg-blue-50 border-blue-300"
              />
            </div>
            <div className="flex-1">
              <Select>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={operatorName} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="op1">{operatorName}</SelectItem>
                  <SelectItem value="op2">Outro Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment and KP */}
          <div className="flex items-center gap-2">
            <div className="text-blue-800 font-bold">* Equip</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Input 
                  value={equipment} 
                  onChange={(e) => setEquipment(e.target.value)}
                  className="bg-blue-50 border-blue-300"
                />
                <div className="bg-primary text-white p-2 rounded cursor-pointer flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="text-blue-800 font-bold">KP</div>
            <div className="w-20">
              <Input 
                value={kpNumber} 
                onChange={(e) => setKpNumber(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Sector */}
          <div className="flex items-center gap-2">
            <div className="text-blue-800 font-bold">Setor</div>
            <div className="flex-1">
              <Input 
                value={sector} 
                onChange={(e) => setSector(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <div className="flex-1 font-semibold text-right">Capacidade</div>
            <div className="flex-1">
              <Input 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex gap-2 items-center">
                <div className="flex-1 text-sm">{item.question}</div>
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
        </div>
      </Card>
    </div>
  );
};

export default ChecklistForm;
