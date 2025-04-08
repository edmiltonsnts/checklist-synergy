
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, AlertTriangle, Database, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Equipment, Operator } from '@/types/checklist';
import { getEquipmentsFromServer, getOperatorsFromServer, isUsingIndexedDB } from '@/services/sqlServerService';
import OperatorSearchCommand from '@/components/OperatorSearchCommand';

const SelectChecklist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [usingIndexedDB, setUsingIndexedDB] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if using IndexedDB
      const isUsingIndexedDb = isUsingIndexedDB();
      setUsingIndexedDB(isUsingIndexedDb);
      
      console.log('Buscando dados atualizados às', new Date().toLocaleTimeString());
      toast.info(`Atualizando dados ${isUsingIndexedDb ? 'do IndexedDB' : 'do servidor'}...`);
      
      // Sempre forçar refresh para garantir dados atualizados
      const [equipmentsData, operatorsData] = await Promise.all([
        getEquipmentsFromServer(true),
        getOperatorsFromServer(true)
      ]);
      
      console.log('Equipamentos carregados:', equipmentsData.length);
      console.log('Operadores carregados:', operatorsData.length);
      
      if (equipmentsData.length === 0) {
        toast.warning('Nenhum equipamento encontrado');
      }
      
      if (operatorsData.length === 0) {
        toast.warning('Nenhum operador encontrado');
      }
      
      // Ordenar operadores por nome
      const sortedOperators = [...operatorsData].sort((a, b) => a.name.localeCompare(b.name));
      
      setEquipments(equipmentsData);
      setOperators(sortedOperators);
      setLastRefresh(new Date());
      toast.success(`Dados atualizados com sucesso! (${new Date().toLocaleTimeString()})`);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Falha ao carregar dados. Verifique a conexão com o banco de dados.');
      toast.error('Erro ao carregar dados. Verifique as configurações de armazenamento.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Função para limpar o cache do navegador para esta página
  const clearBrowserCache = useCallback(() => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  }, []);

  useEffect(() => {
    // Limpar cache ao montar o componente
    clearBrowserCache();
    
    // Iniciar busca ao montar o componente - sempre forçando refresh
    fetchData();
    
    // Configurar um intervalo para atualizar os dados periodicamente
    const intervalId = setInterval(() => {
      console.log('Atualizando dados automaticamente...');
      fetchData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchData, clearBrowserCache]);

  const handleRefresh = () => {
    setRefreshing(true);
    setSelectedEquipmentId('');
    setSelectedOperatorId('');
    clearBrowserCache();
    toast.info('Atualizando dados...');
    fetchData();
  };

  const handleStartChecklist = () => {
    if (!selectedEquipmentId || !selectedOperatorId) {
      toast.error('Selecione um equipamento e um operador para continuar');
      return;
    }
    
    // Navigate to checklist page with the selected equipment and operator
    navigate(`/checklist?equipmentId=${selectedEquipmentId}&operatorId=${selectedOperatorId}&t=${Date.now()}`);
  };

  const handleSelectOperator = (operator: Operator) => {
    setSelectedOperatorId(operator.id);
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
                  {usingIndexedDB ? 'IndexedDB' : 'Banco de dados'} atualizado às {lastRefresh.toLocaleTimeString()}
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
                    Nenhum equipamento encontrado. Verifique a configuração de armazenamento de dados.
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
                    Nenhum operador encontrado. Verifique a configuração de armazenamento de dados.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="operator">Operador ({operators.length} disponíveis)</Label>
                    
                    <div className="mb-4">
                      <OperatorSearchCommand 
                        operators={operators}
                        onSelect={handleSelectOperator}
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
