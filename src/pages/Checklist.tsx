
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChecklistForm from '@/components/ChecklistForm';
import { getEquipments } from '@/services/checklistService';
import { getOperators } from '@/services/operatorsService';
import { Equipment, Operator } from '@/types/checklist';
import { Toaster } from '@/components/ui/sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
          navigate('/');
          return;
        }
        
        // Buscar detalhes do equipamento
        const equipments = await getEquipments();
        const selectedEquipment = equipments.find(e => e.id === equipmentId);
        
        // Buscar detalhes do operador
        const operators = await getOperators();
        const selectedOperator = operators.find(o => o.id === operatorId);
        
        if (!selectedEquipment || !selectedOperator) {
          navigate('/');
          return;
        }
        
        setEquipment(selectedEquipment);
        setOperator(selectedOperator);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
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
          <div className="text-xl">Carregando checklist...</div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-100 pt-4">
      <Toaster />
      <div className="container mx-auto px-4">
        <Button 
          onClick={handleBack} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
        <div className="bg-white p-4 mb-4 rounded-lg shadow">
          <div className="flex flex-wrap justify-between">
            <div className="mb-2">
              <div className="text-sm text-gray-500">Equipamento:</div>
              <div className="text-lg font-bold text-[#8B0000]">
                {equipment?.id} - {equipment?.name}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-500">Operador:</div>
              <div className="text-lg font-bold text-[#8B0000]">
                {operator?.name} ({operator?.id})
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-500">Setor:</div>
              <div className="font-medium">{equipment?.sector}</div>
            </div>
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
