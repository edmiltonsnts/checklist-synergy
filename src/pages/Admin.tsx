
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Equipment, Operator } from '@/types/checklist';
import { getEquipmentsFromServer, getOperatorsFromServer, syncLocalHistoryWithServer, testPostgresConnection } from '@/services/sqlServerService';
import EquipmentManagement from '@/components/admin/EquipmentManagement';
import OperatorManagement from '@/components/admin/OperatorManagement';
import ServerConnectionStatus from '@/components/ServerConnectionStatus';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [dataChanged, setDataChanged] = useState(false);

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [equipmentsData, operatorsData] = await Promise.all([
        getEquipmentsFromServer(true),
        getOperatorsFromServer(true)
      ]);
      
      setEquipments(equipmentsData);
      setOperators(operatorsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Nova função para lidar com alterações de dados
  const handleDataChanged = () => {
    setDataChanged(true);
  };

  const handleRefresh = async () => {
    try {
      await fetchData();
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Falha ao atualizar dados');
    }
  };

  const handleSyncWithServer = async () => {
    try {
      await syncLocalHistoryWithServer();
    } catch (error) {
      console.error('Erro ao sincronizar com servidor:', error);
      toast.error('Falha ao sincronizar com o servidor');
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testPostgresConnection();
      if (result.success) {
        toast.success(`Conexão bem sucedida: ${result.message}`);
      } else {
        toast.error(`Falha na conexão: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Falha ao testar conexão');
    }
  };

  const handleBack = () => {
    // Se houver alterações de dados, envie o parâmetro forceRefresh
    if (dataChanged) {
      navigate('/select-checklist', { state: { forceRefresh: true } });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4">
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
        
        <Card className="mb-4 p-4">
          <ServerConnectionStatus onTestConnection={handleTestConnection} onSyncWithServer={handleSyncWithServer} />
        </Card>
        
        <Tabs defaultValue="equipments">
          <TabsList className="mb-4">
            <TabsTrigger value="equipments" className="flex items-center">
              <Database className="mr-2 h-4 w-4" /> Equipamentos
            </TabsTrigger>
            <TabsTrigger value="operators" className="flex items-center">
              <Database className="mr-2 h-4 w-4" /> Operadores
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="equipments" className="space-y-4">
            <EquipmentManagement 
              equipments={equipments} 
              setEquipments={setEquipments}
              onDataChanged={handleDataChanged}
            />
          </TabsContent>
          
          <TabsContent value="operators" className="space-y-4">
            <OperatorManagement 
              operators={operators} 
              setOperators={setOperators} 
              onDataChanged={handleDataChanged}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
