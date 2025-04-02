
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChecklistForm from '@/components/ChecklistForm';
import { Equipment, Operator } from '@/types/checklist';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getEquipmentsFromServer, getOperatorsFromServer } from '@/services/sqlServerService';

const Checklist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(location.search);
        const equipmentId = searchParams.get('equipmentId');
        const operatorId = searchParams.get('operatorId');
        
        if (!equipmentId || !operatorId) {
          toast.error('Parâmetros inválidos');
          navigate('/');
          return;
        }
        
        // Buscar equipamentos e operadores diretamente do servidor
        const equipments = await getEquipmentsFromServer();
        const operators = await getOperatorsFromServer();
        
        console.log('Equipamentos carregados no checklist:', equipments);
        console.log('Operadores carregados no checklist:', operators);
        
        const selectedEquipment = equipments.find(e => e.id === equipmentId);
        const selectedOperator = operators.find(o => o.id === operatorId);
        
        if (!selectedEquipment || !selectedOperator) {
          toast.error('Equipamento ou operador não encontrado');
          navigate('/');
          return;
        }
        
        setEquipment(selectedEquipment);
        setOperator(selectedOperator);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do checklist');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [location.search, navigate]);
  
  const handleBack = () => {
    navigate('/');
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
        <Button 
          onClick={handleBack} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
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
