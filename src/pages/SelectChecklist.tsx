
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEquipments } from '@/services/checklistService';
import { getOperators } from '@/services/operatorsService';
import { toast } from 'sonner';
import { Equipment, Operator } from '@/types/checklist';

const SelectChecklist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const equipmentsData = await getEquipments();
        const operatorsData = await getOperators();
        
        setEquipments(equipmentsData);
        setOperators(operatorsData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleStartChecklist = () => {
    if (!selectedEquipmentId || !selectedOperatorId) {
      toast.error('Selecione um equipamento e um operador para continuar');
      return;
    }
    
    // Navigate to checklist page with the selected equipment and operator
    navigate(`/checklist?equipmentId=${selectedEquipmentId}&operatorId=${selectedOperatorId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4">
      <div className="container mx-auto px-4">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#8B0000]">Iniciar Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="text-lg">Carregando dados...</div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipamento</Label>
                  <Select 
                    value={selectedEquipmentId} 
                    onValueChange={setSelectedEquipmentId}
                  >
                    <SelectTrigger id="equipment">
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipments.map((equipment) => (
                        <SelectItem key={equipment.id} value={equipment.id}>
                          {equipment.id} - {equipment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="operator">Operador</Label>
                  <Select 
                    value={selectedOperatorId} 
                    onValueChange={setSelectedOperatorId}
                  >
                    <SelectTrigger id="operator">
                      <SelectValue placeholder="Selecione o operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id}>
                          {operator.name} ({operator.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleStartChecklist} 
                  className="w-full bg-[#8B0000] hover:bg-[#6B0000]"
                >
                  Iniciar Checklist
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectChecklist;
