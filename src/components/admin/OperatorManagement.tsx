import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash, Search } from 'lucide-react';
import { Operator } from '@/types/checklist';
import { toast } from 'sonner';
import { searchOperators } from '@/services/operatorsService';
import { saveOperatorToServer, deleteOperatorFromServer } from '@/services/sqlServerService';

interface OperatorManagementProps {
  operators: Operator[];
  setOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
  onDataChanged?: () => void;
}

const OperatorManagement: React.FC<OperatorManagementProps> = ({ 
  operators, 
  setOperators, 
  onDataChanged 
}) => {
  const [newOperator, setNewOperator] = useState<Partial<Operator>>({
    id: '',
    name: '',
    role: '',
    sector: ''
  });
  const [operatorSearchQuery, setOperatorSearchQuery] = useState('');
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>(operators);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (!operatorSearchQuery.trim()) {
      setFilteredOperators(operators);
    } else {
      const results = searchOperators(operatorSearchQuery);
      setFilteredOperators(results);
    }
  }, [operators, operatorSearchQuery]);

  const handleAddOperator = async () => {
    if (!newOperator.id || !newOperator.name) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const isIdDuplicate = operators.some(o => o.id === newOperator.id);
    if (isIdDuplicate) {
      toast.error('ID do operador já existe');
      return;
    }

    const operatorToAdd = { ...newOperator } as Operator;
    
    // Indicar que está salvando
    setSaving(true);
    
    try {
      // Salvar no servidor ou IndexedDB
      await saveOperatorToServer(operatorToAdd);
      
      // Atualizar a lista local
      const updatedOperators = [...operators, operatorToAdd];
      const sortedOperators = updatedOperators.sort((a, b) => a.name.localeCompare(b.name));
      
      setOperators(sortedOperators);
      setFilteredOperators(sortedOperators);
      
      // Limpar o formulário
      setNewOperator({ id: '', name: '', role: '', sector: '' });
      
      // Notificar que dados foram alterados
      if (onDataChanged) {
        onDataChanged();
      }
      
      toast.success(`Operador ${operatorToAdd.name} adicionado com sucesso!`);
    } catch (error) {
      console.error('Erro ao adicionar operador:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOperator = async (id: string) => {
    // Indicar que está processando
    setSaving(true);
    
    try {
      // Remover do servidor ou IndexedDB
      await deleteOperatorFromServer(id);
      
      // Atualizar a lista local
      const updatedOperators = operators.filter(o => o.id !== id);
      setOperators(updatedOperators);
      
      // Atualizar a lista filtrada
      if (!operatorSearchQuery.trim()) {
        setFilteredOperators(updatedOperators);
      } else {
        setFilteredOperators(updatedOperators.filter(o => 
          o.name.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
          o.id.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
          o.sector.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
          o.role?.toLowerCase().includes(operatorSearchQuery.toLowerCase() || '')
        ));
      }
      
      // Notificar que dados foram alterados
      if (onDataChanged) {
        onDataChanged();
      }
      
      toast.success('Operador removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover operador:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSearchOperator = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setOperatorSearchQuery(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Operadores</CardTitle>
        <CardDescription>
          Adicione, edite ou remova operadores do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="operator-id">Matrícula</Label>
              <Input 
                id="operator-id" 
                value={newOperator.id}
                onChange={(e) => setNewOperator({...newOperator, id: e.target.value})}
                placeholder="Ex: 12345"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="operator-name">Nome do Operador</Label>
              <Input 
                id="operator-name" 
                value={newOperator.name}
                onChange={(e) => setNewOperator({...newOperator, name: e.target.value})}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <Label htmlFor="operator-role">Função</Label>
              <Input 
                id="operator-role" 
                value={newOperator.role}
                onChange={(e) => setNewOperator({...newOperator, role: e.target.value})}
                placeholder="Ex: Operador de Empilhadeira"
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="operator-sector">Setor</Label>
              <Input 
                id="operator-sector" 
                value={newOperator.sector}
                onChange={(e) => setNewOperator({...newOperator, sector: e.target.value})}
                placeholder="Ex: Produção"
              />
            </div>
            <div>
              <Button 
                onClick={handleAddOperator}
                className="w-full bg-[#8B0000] hover:bg-[#6B0000] mt-6"
                disabled={saving}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center border rounded-md px-3 py-2 mb-4">
              <Search className="h-4 w-4 mr-2 text-gray-500" />
              <Input 
                placeholder="Pesquisar operadores por nome, matrícula, setor ou função..." 
                value={operatorSearchQuery}
                onChange={handleSearchOperator}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell>{operator.id}</TableCell>
                      <TableCell>{operator.name}</TableCell>
                      <TableCell>{operator.role}</TableCell>
                      <TableCell>{operator.sector}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteOperator(operator.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={saving}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOperators.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        {operatorSearchQuery ? 'Nenhum operador encontrado para esta pesquisa' : 'Nenhum operador cadastrado'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperatorManagement;
