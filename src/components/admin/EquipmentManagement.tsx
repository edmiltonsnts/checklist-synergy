
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash, Save, Edit } from 'lucide-react';
import { Equipment } from '@/types/checklist';
import { toast } from 'sonner';
import { addEquipmentToServer, updateEquipmentInServer, deleteEquipmentFromServer } from '@/services/sqlServerService';

interface EquipmentManagementProps {
  equipments: Equipment[];
  setEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
  onDataChanged: () => void;
}

const EquipmentManagement: React.FC<EquipmentManagementProps> = ({ 
  equipments, 
  setEquipments,
  onDataChanged
}) => {
  const [newEquipment, setNewEquipment] = useState<Equipment>({
    id: '',
    name: '',
    type: '',
    capacity: '',
    sector: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Equipment>({
    id: '',
    name: '',
    type: '',
    capacity: '',
    sector: ''
  });

  // Handler para adicionar novo equipamento
  const handleAddEquipment = async () => {
    if (!newEquipment.id || !newEquipment.name) {
      toast.error('ID e nome são obrigatórios');
      return;
    }

    try {
      // Verificar se já existe um equipamento com este ID
      if (equipments.some(eq => eq.id === newEquipment.id)) {
        toast.error('Já existe um equipamento com este ID');
        return;
      }

      // Adicionar ao servidor/banco de dados
      await addEquipmentToServer(newEquipment);
      
      // Atualizar estado local
      setEquipments([...equipments, newEquipment]);
      
      // Limpar formulário
      setNewEquipment({
        id: '',
        name: '',
        type: '',
        capacity: '',
        sector: ''
      });

      toast.success('Equipamento adicionado com sucesso!');
      onDataChanged(); // Notificar mudança de dados
    } catch (error) {
      console.error('Erro ao adicionar equipamento:', error);
      toast.error('Erro ao adicionar equipamento');
    }
  };

  // Handler para iniciar edição
  const handleStartEdit = (equipment: Equipment) => {
    setEditingId(equipment.id);
    setEditFormData({...equipment});
  };

  // Handler para salvar edição
  const handleSaveEdit = async (id: string) => {
    try {
      await updateEquipmentInServer(editFormData);
      
      setEquipments(equipments.map(eq => 
        eq.id === id ? editFormData : eq
      ));
      
      setEditingId(null);
      toast.success('Equipamento atualizado com sucesso!');
      onDataChanged(); // Notificar mudança de dados
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error('Erro ao atualizar equipamento');
    }
  };

  // Handler para excluir equipamento
  const handleDeleteEquipment = async (id: string) => {
    try {
      await deleteEquipmentFromServer(id);
      
      setEquipments(equipments.filter(eq => eq.id !== id));
      toast.success('Equipamento excluído com sucesso!');
      onDataChanged(); // Notificar mudança de dados
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      toast.error('Erro ao excluir equipamento');
    }
  };

  // Handler para alterações no formulário de edição
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Equipment) => {
    setEditFormData({
      ...editFormData,
      [field]: e.target.value
    });
  };

  // Handler para alterações no formulário de novo equipamento
  const handleNewEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Equipment) => {
    setNewEquipment({
      ...newEquipment,
      [field]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">ID</label>
              <Input 
                value={newEquipment.id} 
                onChange={(e) => handleNewEquipmentChange(e, 'id')} 
                placeholder="ID do equipamento" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nome</label>
              <Input 
                value={newEquipment.name} 
                onChange={(e) => handleNewEquipmentChange(e, 'name')} 
                placeholder="Nome do equipamento" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Input 
                value={newEquipment.type} 
                onChange={(e) => handleNewEquipmentChange(e, 'type')} 
                placeholder="Tipo" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Capacidade</label>
              <Input 
                value={newEquipment.capacity} 
                onChange={(e) => handleNewEquipmentChange(e, 'capacity')} 
                placeholder="Capacidade" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Setor</label>
              <Input 
                value={newEquipment.sector} 
                onChange={(e) => handleNewEquipmentChange(e, 'sector')} 
                placeholder="Setor" 
              />
            </div>
          </div>
          <Button onClick={handleAddEquipment} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Equipamento
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Equipamentos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {equipments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum equipamento cadastrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipments.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input 
                            value={editFormData.id} 
                            onChange={(e) => handleEditChange(e, 'id')} 
                          />
                        ) : (
                          equipment.id
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input 
                            value={editFormData.name} 
                            onChange={(e) => handleEditChange(e, 'name')} 
                          />
                        ) : (
                          equipment.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input 
                            value={editFormData.type} 
                            onChange={(e) => handleEditChange(e, 'type')} 
                          />
                        ) : (
                          equipment.type
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input 
                            value={editFormData.capacity} 
                            onChange={(e) => handleEditChange(e, 'capacity')} 
                          />
                        ) : (
                          equipment.capacity
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input 
                            value={editFormData.sector} 
                            onChange={(e) => handleEditChange(e, 'sector')} 
                          />
                        ) : (
                          equipment.sector
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {editingId === equipment.id ? (
                            <Button 
                              onClick={() => handleSaveEdit(equipment.id)} 
                              size="sm" 
                              variant="outline"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleStartEdit(equipment)} 
                              size="sm" 
                              variant="outline"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleDeleteEquipment(equipment.id)} 
                            size="sm" 
                            variant="outline"
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentManagement;
