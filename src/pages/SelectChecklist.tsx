
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, AlertTriangle, Database, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Equipment, Operator } from '@/types/checklist';
import { getEquipmentsFromServer, getOperatorsFromServer } from '@/services/sqlServerService';
import { searchOperators } from '@/services/operatorsService';

const SelectChecklist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [operatorSearchQuery, setOperatorSearchQuery] = useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Adiciona um timestamp para evitar cache
      const timestamp = new Date().getTime();
      
      // Fetch equipamentos e operadores em paralelo
      const [equipmentsData, operatorsData] = await Promise.all([
        getEquipmentsFromServer(),
        getOperatorsFromServer()
      ]);
      
      console.log('Equipamentos carregados:', equipmentsData);
      console.log('Operadores carregados:', operatorsData);
      
      if (equipmentsData.length === 0) {
        toast.warning('Nenhum equipamento encontrado no servidor');
      }
      
      if (operatorsData.length === 0) {
        toast.warning('Nenhum operador encontrado no servidor');
      }
      
      // Ordenar operadores por nome
      const sortedOperators = [...operatorsData].sort((a, b) => a.name.localeCompare(b.name));
      
      setEquipments(equipmentsData);
      setOperators(sortedOperators);
      setFilteredOperators(sortedOperators);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Falha ao conectar com o servidor de banco de dados. Verifique a conexão.');
      toast.error('Erro ao carregar dados. Verifique a conexão com o banco de dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    toast.info('Atualizando dados do servidor...');
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

  const handleSearchOperator = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setOperatorSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredOperators(operators);
    } else {
      const results = operators.filter(operator => 
        operator.name.toLowerCase().includes(query.toLowerCase()) ||
        operator.id.toLowerCase().includes(query.toLowerCase()) ||
        operator.sector.toLowerCase().includes(query.toLowerCase()) ||
        operator.role?.toLowerCase().includes(query.toLowerCase() || '')
      );
      setFilteredOperators(results);
    }
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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto" 
              onClick={handleRefresh}
            >
              Tentar novamente
            </Button>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#8B0000] flex items-center">
              Iniciar Checklist
              {!loading && !error && (equipments.length > 0 || operators.length > 0) && (
                <span className="ml-2 text-sm font-normal text-green-600 flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  Dados carregados do servidor
                </span>
              )}
            </CardTitle>
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
                    
                    <div className="flex items-center border rounded-md px-3 py-2 mb-4">
                      <Search className="h-4 w-4 mr-2 text-gray-500" />
                      <Input 
                        placeholder="Pesquisar operadores por nome ou matrícula..." 
                        value={operatorSearchQuery}
                        onChange={handleSearchOperator}
                        className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    
                    <Select 
                      value={selectedOperatorId} 
                      onValueChange={setSelectedOperatorId}
                    >
                      <SelectTrigger id="operator">
                        <SelectValue placeholder="Selecione o operador" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {filteredOperators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.name} ({operator.id})
                          </SelectItem>
                        ))}
                        {filteredOperators.length === 0 && (
                          <div className="px-2 py-4 text-center text-sm text-gray-500">
                            Nenhum operador encontrado para "{operatorSearchQuery}"
                          </div>
                        )}
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
