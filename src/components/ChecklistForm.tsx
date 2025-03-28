import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Check, Search, User } from 'lucide-react';
import { Checklist, ChecklistItem, Equipment, Operator } from '@/types/checklist';
import { saveChecklist, getEquipments } from '@/services/checklistService';
import { getOperators } from '@/services/operatorsService';
import { toast } from "sonner";
import SignatureCanvas from './SignatureCanvas';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const ChecklistForm = () => {
  const [equipmentNumber, setEquipmentNumber] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [equipment, setEquipment] = useState('');
  const [kpNumber, setKpNumber] = useState('');
  const [sector, setSector] = useState('');
  const [capacity, setCapacity] = useState('');
  const [signature, setSignature] = useState('');
  const [equipmentsList, setEquipmentsList] = useState<Equipment[]>([]);
  const [operatorsList, setOperatorsList] = useState<Operator[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorSearchTerm, setOperatorSearchTerm] = useState('');
  const [showEquipmentsList, setShowEquipmentsList] = useState(false);
  const [showOperatorsList, setShowOperatorsList] = useState(false);
  
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

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const equipments = await getEquipments();
        setEquipmentsList(equipments);
        setFilteredEquipments(equipments);
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
        toast.error('Erro ao carregar a lista de equipamentos');
      }
    };

    const fetchOperators = async () => {
      try {
        const operators = await getOperators();
        setOperatorsList(operators);
        setFilteredOperators(operators);
      } catch (error) {
        console.error('Erro ao carregar operadores:', error);
        toast.error('Erro ao carregar a lista de operadores');
      }
    };

    fetchEquipments();
    fetchOperators();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = equipmentsList.filter(
        equip => 
          equip.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          equip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equip.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipments(filtered);
    } else {
      setFilteredEquipments(equipmentsList);
    }
  }, [searchTerm, equipmentsList]);

  useEffect(() => {
    if (operatorSearchTerm.trim()) {
      const filtered = operatorsList.filter(
        op => 
          op.id.toLowerCase().includes(operatorSearchTerm.toLowerCase()) || 
          op.name.toLowerCase().includes(operatorSearchTerm.toLowerCase()) ||
          op.sector.toLowerCase().includes(operatorSearchTerm.toLowerCase())
      );
      setFilteredOperators(filtered);
    } else {
      setFilteredOperators(operatorsList);
    }
  }, [operatorSearchTerm, operatorsList]);

  const handleEquipmentSelect = (selectedEquipment: Equipment) => {
    setEquipmentNumber(selectedEquipment.id);
    setEquipment(selectedEquipment.name);
    setSector(selectedEquipment.sector);
    setCapacity(selectedEquipment.capacity);
    setShowEquipmentsList(false);
  };

  const handleOperatorSelect = (selectedOperator: Operator) => {
    setOperatorId(selectedOperator.id);
    setOperatorName(selectedOperator.name);
    setShowOperatorsList(false);
  };

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
    if (!kpNumber.trim()) {
      toast.warning('Por favor, insira o número do KP');
      return;
    }

    const unansweredItems = checklistItems.filter(item => item.answer === null);
    
    if (unansweredItems.length > 0) {
      toast.warning(`Existem ${unansweredItems.length} perguntas não respondidas!`);
      return;
    }

    if (!signature) {
      toast.warning('Por favor, assine o formulário antes de salvar');
      return;
    }
    
    if (!operatorName) {
      toast.warning('Por favor, selecione um operador antes de salvar');
      return;
    }
    
    try {
      const checklistData: Checklist = {
        equipmentNumber,
        operatorName,
        operatorId,
        equipment,
        kpNumber,
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
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md p-0 overflow-hidden shadow-lg">
        <div className="bg-primary text-white p-3 flex justify-between items-center">
          <X className="w-6 h-6 cursor-pointer" />
          <h1 className="text-xl font-semibold">Check List Online</h1>
          <Check className="w-6 h-6 cursor-pointer" onClick={saveChecklistData} />
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-800 font-bold">Equipamento</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowEquipmentsList(true)}
                    placeholder="Pesquisar equipamento..." 
                    className="bg-blue-50 border-blue-300"
                  />
                  <div 
                    className="bg-primary text-white p-2 rounded cursor-pointer flex-shrink-0"
                    onClick={() => setShowEquipmentsList(!showEquipmentsList)}
                  >
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {showEquipmentsList && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200">
                {filteredEquipments.length > 0 ? (
                  filteredEquipments.map((equip) => (
                    <div 
                      key={equip.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                      onClick={() => handleEquipmentSelect(equip)}
                    >
                      <div className="font-semibold">{equip.id}</div>
                      <div>{equip.name}</div>
                      <div className="text-sm text-gray-600">{equip.sector}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">Nenhum equipamento encontrado</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input 
                value={equipmentNumber} 
                onChange={(e) => setEquipmentNumber(e.target.value)}
                className="bg-blue-50 border-blue-300"
                placeholder="Número do equipamento"
              />
            </div>
            <div className="flex-1 relative">
              <div className="flex items-center gap-2">
                <Input 
                  value={operatorName} 
                  onChange={(e) => {
                    setOperatorName(e.target.value);
                    setOperatorSearchTerm(e.target.value);
                  }}
                  onFocus={() => setShowOperatorsList(true)}
                  placeholder="Selecione o operador" 
                  className="bg-white pr-8"
                />
                <div 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowOperatorsList(!showOperatorsList)}
                >
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              
              {showOperatorsList && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="sticky top-0 bg-white p-2 border-b">
                    <Input 
                      value={operatorSearchTerm}
                      onChange={(e) => setOperatorSearchTerm(e.target.value)}
                      placeholder="Buscar operador..." 
                      className="bg-gray-50"
                    />
                  </div>
                  
                  {filteredOperators.length > 0 ? (
                    filteredOperators.map((op) => (
                      <div 
                        key={op.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleOperatorSelect(op)}
                      >
                        <div className="font-semibold">{op.name}</div>
                        <div className="text-sm text-gray-600">{op.id} - {op.sector}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">Nenhum operador encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>

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
                className="bg-blue-50 border-blue-300"
              />
            </div>
          </div>

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

          <div className="mt-6 space-y-2">
            <div className="text-blue-800 font-bold mb-2">Assinatura do Operador</div>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <SignatureCanvas onSave={handleSignatureSave} />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button 
              onClick={saveChecklistData}
              className="w-full"
            >
              Salvar Checklist
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChecklistForm;
