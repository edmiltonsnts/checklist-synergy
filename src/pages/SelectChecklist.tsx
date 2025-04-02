
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Equipment, Operator } from '@/types/checklist';
import { getEquipmentsFromServer, getOperatorsFromServer } from '@/services/sqlServerService';

const SelectChecklist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Primeiro tenta buscar do servidor PostgreSQL
      const equipmentsData = await getEquipmentsFromServer();
      const operatorsData = await getOperatorsFromServer();
      
      console.log('Equipamentos carregados:', equipmentsData);
      console.log('Operadores carregados:', operatorsData);
      
      setEquipments(equipmentsData);
      setOperators(operatorsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados. Verifique a conexão com o banco de dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            Atualizar dados
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#8B0000]">Iniciar Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#8B0000]" />
                  <div className="text-lg">Carregando dados...</div>
                </div>
              </div>
            ) : (
              <>
                {equipments.length === 0 ? (
                  <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-md">
                    Nenhum equipamento encontrado. Verifique a conexão com o banco de dados.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipamento ({equipments.length} disponíveis)</Label>
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
                )}
                
                {operators.length === 0 ? (
                  <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-md">
                    Nenhum operador encontrado. Verifique a conexão com o banco de dados.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="operator">Operador ({operators.length} disponíveis)</Label>
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
                )}
                
                <Button 
                  onClick={handleStartChecklist} 
                  className="w-full bg-[#8B0000] hover:bg-[#6B0000]"
                  disabled={equipments.length === 0 || operators.length === 0}
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
