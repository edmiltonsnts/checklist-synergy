
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChecklistForm from '@/components/ChecklistForm';
import { Equipment, Operator } from '@/types/checklist';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getEquipmentsFromServer, getOperatorsFromServer, getApiUrl, isUsingIndexedDB } from '@/services/sqlServerService';

const Checklist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isLocalDb, setIsLocalDb] = useState<boolean>(false);
  const [usingIndexedDB, setUsingIndexedDB] = useState<boolean>(false);
  
  const clearBrowserCache = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  };
  
  useEffect(() => {
    setIsLocalDb(localStorage.getItem('useLocalDb') === 'true');
    setUsingIndexedDB(isUsingIndexedDB());
    
    const fetchData = async () => {
      setLoading(true);
      
      clearBrowserCache();
      
      try {
        const searchParams = new URLSearchParams(location.search);
        const equipmentId = searchParams.get('equipmentId');
        const operatorId = searchParams.get('operatorId');
        
        if (!equipmentId || !operatorId) {
          toast.error('Parâmetros inválidos');
          navigate('/');
          return;
        }
        
        console.log('Buscando dados para checklist - equipmentId:', equipmentId, 'operatorId:', operatorId);
        
        if (usingIndexedDB) {
          toast.info(`Carregando dados do IndexedDB...`);
        } else {
          toast.info(`Carregando dados atualizados do servidor (${isLocalDb ? 'local' : 'remoto'})...`);
        }
        
        const timestamp = Date.now();
        const randomParam = Math.random().toString(36).substring(7);
        console.log(`Requisição com timestamp: ${timestamp} e random: ${randomParam}`);
        
        if (!usingIndexedDB) {
          console.log(`API URL atual: ${getApiUrl()}`);
        }
        
        // Sempre forçar refresh para garantir dados atualizados
        const equipments = await getEquipmentsFromServer(true);
        const operators = await getOperatorsFromServer(true);
        
        console.log('Equipamentos carregados no checklist:', equipments.length);
        console.log('Operadores carregados no checklist:', operators.length);
        
        const selectedEquipment = equipments.find(e => e.id === equipmentId);
        const selectedOperator = operators.find(o => o.id === operatorId);
        
        console.log('Equipamento encontrado:', selectedEquipment);
        console.log('Operador encontrado:', selectedOperator);
        
        if (!selectedEquipment || !selectedOperator) {
          toast.error('Equipamento ou operador não encontrado');
          navigate('/select-checklist');
          return;
        }
        
        setEquipment(selectedEquipment);
        setOperator(selectedOperator);
        toast.success('Dados carregados com sucesso!');
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do checklist');
        navigate('/select-checklist');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [location.search, navigate]);
  
  const handleRefresh = async () => {
    setLoading(true);
    toast.info('Atualizando dados...');
    
    const searchParams = new URLSearchParams(location.search);
    const equipmentId = searchParams.get('equipmentId');
    const operatorId = searchParams.get('operatorId');
    
    if (!equipmentId || !operatorId) {
      navigate('/select-checklist');
      return;
    }
    
    navigate(`/checklist?equipmentId=${equipmentId}&operatorId=${operatorId}&t=${Date.now()}`);
  };
  
  const handleBack = () => {
    navigate('/select-checklist');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <Card className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#8B0000]" />
          <div className="text-xl">Carregando checklist...</div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-100 pt-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={handleBack} 
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <Button 
            onClick={handleRefresh} 
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar dados
          </Button>
        </div>
        
        <div className="bg-white p-4 mb-6 rounded-lg shadow">
          <div className="mb-2">
            <div className="text-sm text-gray-500">Equipamento:</div>
            <div className="font-medium">{equipment?.name}</div>
          </div>
          <div className="mb-2">
            <div className="text-sm text-gray-500">Operador:</div>
            <div className="font-medium">{operator?.name} ({operator?.id})</div>
          </div>
          <div className="mb-2">
            <div className="text-sm text-gray-500">Setor:</div>
            <div className="font-medium">{equipment?.sector}</div>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {usingIndexedDB ? "Usando IndexedDB" : isLocalDb ? "Usando banco de dados local" : "Usando banco de dados remoto"}
          </div>
        </div>
        
        <ChecklistForm 
          initialEquipment={equipment!} 
          initialOperator={operator!} 
        />
      </div>
    </div>
  );
};

export default Checklist;
