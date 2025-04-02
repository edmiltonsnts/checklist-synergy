import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Save, Trash, ClipboardList, User, Settings, Calendar, Mail, Search } from 'lucide-react';
import { Equipment, Operator, Sector } from '@/types/checklist';
import { getEquipments } from '@/services/checklistService';
import { getOperators, searchOperators } from '@/services/operatorsService';
import { exportToJson, importFromJson } from '@/services/historyService';

interface ChecklistTemplate {
  id: string;
  name: string;
  items: { id: number; question: string }[];
}

const Admin = () => {
  const navigate = useNavigate();

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    id: '',
    name: '',
    type: '',
    capacity: '',
    sector: ''
  });

  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [operatorSearchQuery, setOperatorSearchQuery] = useState('');
  const [newOperator, setNewOperator] = useState<Partial<Operator>>({
    id: '',
    name: '',
    role: '',
    sector: ''
  });

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [newSector, setNewSector] = useState<Partial<Sector>>({
    id: '',
    name: '',
    email: ''
  });

  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [newChecklist, setNewChecklist] = useState<Partial<ChecklistTemplate>>({
    id: '',
    name: '',
    items: []
  });
  const [newItem, setNewItem] = useState('');
  const [currentItems, setCurrentItems] = useState<{id: number; question: string}[]>([]);

  const [importType, setImportType] = useState<'equipments' | 'operators' | 'sectors' | 'checklists'>('equipments');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const equipmentsData = await getEquipments();
        setEquipments(equipmentsData);

        const operatorsData = await getOperators();
        setOperators(operatorsData);
        setFilteredOperators(operatorsData);

        const storedSectors = localStorage.getItem('sectors');
        if (storedSectors) {
          setSectors(JSON.parse(storedSectors));
        } else {
          const sectorsData = [
            { id: '1', name: 'Produção', email: 'producao@empresa.com' },
            { id: '2', name: 'Manutenção', email: 'manutencao@empresa.com' },
            { id: '3', name: 'Logística', email: 'logistica@empresa.com' }
          ];
          setSectors(sectorsData);
          localStorage.setItem('sectors', JSON.stringify(sectorsData));
        }

        const storedChecklists = localStorage.getItem('checklist_templates');
        if (storedChecklists) {
          setChecklists(JSON.parse(storedChecklists));
        } else {
          const checklistsData = [
            { 
              id: '1', 
              name: 'Checklist Padrão', 
              items: [
                { id: 1, question: 'Verificar lubrificação' },
                { id: 2, question: 'Verificar nível de óleo' }
              ]
            }
          ];
          setChecklists(checklistsData);
          localStorage.setItem('checklist_templates', JSON.stringify(checklistsData));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    fetchData();
  }, []);

  const handleAddEquipment = () => {
    if (!newEquipment.id || !newEquipment.name || !newEquipment.sector) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const isIdDuplicate = equipments.some(e => e.id === newEquipment.id);
    if (isIdDuplicate) {
      toast.error('ID do equipamento já existe');
      return;
    }

    const equipmentToAdd = { ...newEquipment } as Equipment;
    const updatedEquipments = [...equipments, equipmentToAdd];
    setEquipments(updatedEquipments);
    localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
    
    setNewEquipment({ id: '', name: '', type: '', capacity: '', sector: '' });
    toast.success('Equipamento adicionado com sucesso');
  };

  const handleDeleteEquipment = (id: string) => {
    const updatedEquipments = equipments.filter(e => e.id !== id);
    setEquipments(updatedEquipments);
    localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
    toast.success('Equipamento removido com sucesso');
  };

  const handleAddOperator = () => {
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
    const updatedOperators = [...operators, operatorToAdd];
    const sortedOperators = updatedOperators.sort((a, b) => a.name.localeCompare(b.name));
    
    setOperators(sortedOperators);
    setFilteredOperators(sortedOperators);
    localStorage.setItem('operators', JSON.stringify(sortedOperators));
    
    setNewOperator({ id: '', name: '', role: '', sector: '' });
    toast.success('Operador adicionado com sucesso');
  };

  const handleDeleteOperator = (id: string) => {
    const updatedOperators = operators.filter(o => o.id !== id);
    setOperators(updatedOperators);
    setFilteredOperators(updatedOperators.filter(o => 
      o.name.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
      o.sector.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
      o.role.toLowerCase().includes(operatorSearchQuery.toLowerCase())
    ));
    localStorage.setItem('operators', JSON.stringify(updatedOperators));
    toast.success('Operador removido com sucesso');
  };

  const handleSearchOperator = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setOperatorSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredOperators(operators);
    } else {
      const results = searchOperators(query);
      setFilteredOperators(results);
    }
  };

  const handleAddSector = () => {
    if (!newSector.id || !newSector.name) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const isIdDuplicate = sectors.some(s => s.id === newSector.id);
    if (isIdDuplicate) {
      toast.error('ID do setor já existe');
      return;
    }

    const sectorToAdd = { ...newSector } as Sector;
    const updatedSectors = [...sectors, sectorToAdd];
    setSectors(updatedSectors);
    localStorage.setItem('sectors', JSON.stringify(updatedSectors));
    
    setNewSector({ id: '', name: '', email: '' });
    toast.success('Setor adicionado com sucesso');
  };

  const handleDeleteSector = (id: string) => {
    const updatedSectors = sectors.filter(s => s.id !== id);
    setSectors(updatedSectors);
    localStorage.setItem('sectors', JSON.stringify(updatedSectors));
    toast.success('Setor removido com sucesso');
  };

  const handleAddItem = () => {
    if (!newItem) {
      toast.error('Digite um item para adicionar');
      return;
    }

    const newId = currentItems.length > 0 ? Math.max(...currentItems.map(item => item.id)) + 1 : 1;
    setCurrentItems([...currentItems, { id: newId, question: newItem }]);
    setNewItem('');
  };

  const handleDeleteItem = (id: number) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const handleAddChecklist = () => {
    if (!newChecklist.id || !newChecklist.name || currentItems.length === 0) {
      toast.error('Preencha todos os campos e adicione pelo menos um item');
      return;
    }

    const isIdDuplicate = checklists.some(c => c.id === newChecklist.id);
    if (isIdDuplicate) {
      toast.error('ID do checklist já existe');
      return;
    }

    const checklistToAdd = { 
      ...newChecklist, 
      items: [...currentItems] 
    } as ChecklistTemplate;
    
    const updatedChecklists = [...checklists, checklistToAdd];
    setChecklists(updatedChecklists);
    localStorage.setItem('checklist_templates', JSON.stringify(updatedChecklists));
    
    setNewChecklist({ id: '', name: '' });
    setCurrentItems([]);
    toast.success('Checklist adicionado com sucesso');
  };

  const handleDeleteChecklist = (id: string) => {
    const updatedChecklists = checklists.filter(c => c.id !== id);
    setChecklists(updatedChecklists);
    localStorage.setItem('checklist_templates', JSON.stringify(updatedChecklists));
    toast.success('Checklist removido com sucesso');
  };

  const handleExportData = (type: 'equipments' | 'operators' | 'sectors' | 'checklists') => {
    let data: any;
    switch (type) {
      case 'equipments':
        data = equipments;
        break;
      case 'operators':
        data = operators;
        break;
      case 'sectors':
        data = sectors;
        break;
      case 'checklists':
        data = checklists;
        break;
    }
    
    if (data && data.length > 0) {
      exportToJson(data);
    } else {
      toast.error('Não há dados para exportar');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importFromJson(file)
      .then((data) => {
        if (Array.isArray(data)) {
          switch (importType) {
            case 'equipments':
              setEquipments(data);
              localStorage.setItem('equipments', JSON.stringify(data));
              break;
            case 'operators':
              setOperators(data);
              localStorage.setItem('operators', JSON.stringify(data));
              break;
            case 'sectors':
              setSectors(data);
              localStorage.setItem('sectors', JSON.stringify(data));
              break;
            case 'checklists':
              setChecklists(data);
              localStorage.setItem('checklist_templates', JSON.stringify(data));
              break;
          }
        } else {
          toast.error('Formato inválido. O arquivo deve conter um array');
        }
      })
      .catch(error => {
        console.error('Erro na importação:', error);
      });
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveAll = () => {
    localStorage.setItem('equipments', JSON.stringify(equipments));
    localStorage.setItem('operators', JSON.stringify(operators));
    localStorage.setItem('sectors', JSON.stringify(sectors));
    localStorage.setItem('checklist_templates', JSON.stringify(checklists));
    
    toast.success('Todas as alterações foram salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="flex gap-2">
            <Link to="/admin/history">
              <Button 
                className="bg-[#3B82F6] hover:bg-[#2563EB] gap-2"
              >
                <ClipboardList className="h-4 w-4" /> Histórico de Checklists
              </Button>
            </Link>
            <Button 
              onClick={handleSaveAll}
              className="bg-[#8B0000] hover:bg-[#6B0000] gap-2"
            >
              <Save className="h-4 w-4" /> Salvar Alterações
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-[#8B0000] text-white rounded-t-lg">
            <CardTitle>Painel Administrativo</CardTitle>
            <CardDescription className="text-gray-200">
              Gerencie equipamentos, operadores, setores e checklists
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Button
                variant="outline"
                onClick={() => {
                  setImportType('equipments');
                  document.getElementById('importFile')?.click();
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Importar Equipamentos
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportData('equipments')}
                className="gap-2"
              >
                <Save className="h-4 w-4" /> Exportar Equipamentos
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImportType('operators');
                  document.getElementById('importFile')?.click();
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Importar Operadores
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportData('operators')}
                className="gap-2"
              >
                <Save className="h-4 w-4" /> Exportar Operadores
              </Button>
              <Input
                type="file"
                id="importFile"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="equipments" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="equipments" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="operators" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Operadores
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Setores
            </TabsTrigger>
            <TabsTrigger value="checklists" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Checklists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipments">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Equipamentos</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova equipamentos para o sistema de checklist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="equipment-id">ID/Código</Label>
                      <Input 
                        id="equipment-id" 
                        value={newEquipment.id}
                        onChange={(e) => setNewEquipment({...newEquipment, id: e.target.value})}
                        placeholder="Ex: EQ001"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="equipment-name">Nome do Equipamento</Label>
                      <Input 
                        id="equipment-name" 
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                        placeholder="Ex: Empilhadeira Elétrica"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-type">Tipo</Label>
                      <Input 
                        id="equipment-type" 
                        value={newEquipment.type}
                        onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                        placeholder="Ex: Elétrica"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-capacity">Capacidade</Label>
                      <Input 
                        id="equipment-capacity" 
                        value={newEquipment.capacity}
                        onChange={(e) => setNewEquipment({...newEquipment, capacity: e.target.value})}
                        placeholder="Ex: 2000 kg"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label htmlFor="equipment-sector">Setor</Label>
                      <Input 
                        id="equipment-sector" 
                        value={newEquipment.sector}
                        onChange={(e) => setNewEquipment({...newEquipment, sector: e.target.value})}
                        placeholder="Ex: Produção"
                      />
                    </div>
                    <div>
                      <Button 
                        onClick={handleAddEquipment}
                        className="w-full bg-[#8B0000] hover:bg-[#6B0000] mt-6"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID/Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Capacidade</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipments.map((equipment) => (
                          <TableRow key={equipment.id}>
                            <TableCell>{equipment.id}</TableCell>
                            <TableCell>{equipment.name}</TableCell>
                            <TableCell>{equipment.type}</TableCell>
                            <TableCell>{equipment.capacity}</TableCell>
                            <TableCell>{equipment.sector}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteEquipment(equipment.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {equipments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                              Nenhum equipamento cadastrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operators">
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
                      >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center border rounded-md px-3 py-2 mb-4">
                      <Search className="h-4 w-4 mr-2 text-gray-500" />
                      <Input 
                        placeholder="Pesquisar operadores por nome, matrícula ou setor..." 
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
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Setores</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova setores da empresa e configure emails para relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="sector-id">ID/Código</Label>
                      <Input 
                        id="sector-id" 
                        value={newSector.id}
                        onChange={(e) => setNewSector({...newSector, id: e.target.value})}
                        placeholder="Ex: S001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sector-name">Nome do Setor</Label>
                      <Input 
                        id="sector-name" 
                        value={newSector.name}
                        onChange={(e) => setNewSector({...newSector, name: e.target.value})}
                        placeholder="Ex: Produção"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sector-email">Email do Setor</Label>
                      <Input 
                        id="sector-email" 
                        type="email"
                        value={newSector.email || ''}
                        onChange={(e) => setNewSector({...newSector, email: e.target.value})}
                        placeholder="Ex: setor@empresa.com.br"
                      />
                    </div>
                    <div>
                      <Button 
                        onClick={handleAddSector}
                        className="w-full bg-[#8B0000] hover:bg-[#6B0000] mt-8"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID/Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sectors.map((sector) => (
                          <TableRow key={sector.id}>
                            <TableCell>{sector.id}</TableCell>
                            <TableCell>{sector.name}</TableCell>
                            <TableCell>{sector.email || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteSector(sector.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {sectors.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                              Nenhum setor cadastrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Modelos de Checklist</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova modelos de checklist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="checklist-id">ID/Código</Label>
                      <Input 
                        id="checklist-id" 
                        value={newChecklist.id}
                        onChange={(e) => setNewChecklist({...newChecklist, id: e.target.value})}
                        placeholder="Ex: CL001"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="checklist-name">Nome do Modelo</Label>
                      <Input 
                        id="checklist-name" 
                        value={newChecklist.name}
                        onChange={(e) => setNewChecklist({...newChecklist, name: e.target.value})}
                        placeholder="Ex: Checklist Empilhadeira"
                      />
                    </div>
                  </div>

                  <div className="border p-4 rounded-md">
                    <div className="text-lg font-medium mb-2">Itens do Checklist</div>
                    
                    <div className="flex space-x-2 mb-4">
                      <Input 
                        placeholder="Adicione uma pergunta ao checklist" 
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                      />
                      <Button 
                        onClick={handleAddItem}
                        className="bg-[#8B0000] hover:bg-[#6B0000]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nº</TableHead>
                            <TableHead>Pergunta</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell>{item.question}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {currentItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                Nenhum item adicionado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddChecklist}
                    className="w-full bg-[#8B0000] hover:bg-[#6B0000]"
                  >
                    <Save className="mr-2 h-4 w-4" /> Salvar Modelo de Checklist
                  </Button>

                  <div className="border rounded-md mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID/Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Nº de Itens</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checklists.map((checklist) => (
                          <TableRow key={checklist.id}>
                            <TableCell>{checklist.id}</TableCell>
                            <TableCell>{checklist.name}</TableCell>
                            <TableCell>{checklist.items.length}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteChecklist(checklist.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {checklists.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                              Nenhum modelo de checklist cadastrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
