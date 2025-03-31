
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEquipments } from '@/services/checklistService';
import { getOperators } from '@/services/operatorsService';
import { Search, User, Clipboard, ClipboardCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Equipment, Operator } from '@/types/checklist';

const Index = () => {
  const navigate = useNavigate();
  const [sector, setSector] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  
  const [equipmentsList, setEquipmentsList] = useState<Equipment[]>([]);
  const [operatorsList, setOperatorsList] = useState<Operator[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorSearchTerm, setOperatorSearchTerm] = useState('');
  const [showEquipmentsList, setShowEquipmentsList] = useState(false);
  const [showOperatorsList, setShowOperatorsList] = useState(false);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const equipments = await getEquipments();
        setEquipmentsList(equipments);
        setFilteredEquipments(equipments);
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      }
    };

    const fetchOperators = async () => {
      try {
        const operators = await getOperators();
        setOperatorsList(operators);
        setFilteredOperators(operators);
      } catch (error) {
        console.error('Erro ao carregar operadores:', error);
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
    setEquipmentId(selectedEquipment.id);
    setEquipmentName(selectedEquipment.name);
    setSector(selectedEquipment.sector);
    setShowEquipmentsList(false);
  };

  const handleOperatorSelect = (selectedOperator: Operator) => {
    setOperatorId(selectedOperator.id);
    setOperatorName(selectedOperator.name);
    setShowOperatorsList(false);
  };

  const handleStartChecklist = () => {
    if (!equipmentId) {
      alert('Por favor, selecione um equipamento');
      return;
    }
    
    if (!operatorId) {
      alert('Por favor, selecione um operador');
      return;
    }
    
    // Navegar para a página do checklist com os parâmetros selecionados
    navigate(`/checklist?equipmentId=${equipmentId}&operatorId=${operatorId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 flex justify-center items-center">
      <Toaster />
      <Card className="w-full max-w-4xl p-6 shadow-lg">
        <div className="bg-[#8B0000] text-white p-4 -mx-6 -mt-6 mb-6 flex justify-center items-center">
          <h1 className="text-3xl font-bold">Check List Online</h1>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#8B0000]">Iniciar Verificação</h2>
          <p className="text-gray-600">Selecione o equipamento e o operador para iniciar a verificação</p>
        </div>
        
        <div className="space-y-6">
          {/* Seleção de Equipamento */}
          <div className="space-y-2">
            <label className="text-lg font-bold text-blue-800 block">Equipamento</label>
            <div className="relative">
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
                  <Search className="w-5 h-5" />
                </div>
              </div>
              
              {showEquipmentsList && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200">
                  {filteredEquipments.length > 0 ? (
                    filteredEquipments.map((equip) => (
                      <div 
                        key={equip.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
                        onClick={() => handleEquipmentSelect(equip)}
                      >
                        <div className="font-semibold text-[#8B0000]">{equip.id}</div>
                        <div className="text-gray-700">{equip.name}</div>
                        <div className="text-sm text-gray-600">{equip.sector}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">Nenhum equipamento encontrado</div>
                  )}
                </div>
              )}
            </div>
            
            {equipmentId && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="font-semibold">Equipamento selecionado:</div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-[#8B0000]">{equipmentId}</span>
                  <span>{equipmentName}</span>
                </div>
                <div className="text-sm text-gray-600">Setor: {sector}</div>
              </div>
            )}
          </div>
          
          {/* Seleção de Operador */}
          <div className="space-y-2">
            <label className="text-lg font-bold text-blue-800 block">Operador</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Input 
                  value={operatorSearchTerm}
                  onChange={(e) => setOperatorSearchTerm(e.target.value)}
                  onFocus={() => setShowOperatorsList(true)}
                  placeholder="Pesquisar operador..." 
                  className="bg-white"
                />
                <div 
                  className="bg-primary text-white p-2 rounded cursor-pointer flex-shrink-0"
                  onClick={() => setShowOperatorsList(!showOperatorsList)}
                >
                  <User className="w-5 h-5" />
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
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleOperatorSelect(op)}
                      >
                        <div className="font-semibold text-[#8B0000]">{op.name} ({op.id})</div>
                        <div className="text-sm text-gray-600">{op.sector}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">Nenhum operador encontrado</div>
                  )}
                </div>
              )}
            </div>
            
            {operatorId && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="font-semibold">Operador selecionado:</div>
                <div className="text-lg">
                  <span className="font-bold text-[#8B0000]">{operatorName} ({operatorId})</span>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleStartChecklist}
            className="w-full mt-8 bg-[#8B0000] hover:bg-[#6B0000] text-xl py-6"
          >
            <ClipboardCheck className="w-6 h-6 mr-2" />
            Iniciar Checklist
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
