import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Download, Import, MoreVertical, Search, Trash, RefreshCw } from 'lucide-react';
import { ChecklistHistory } from '@/types/checklist';
import { 
  clearChecklistHistory, 
  exportToJson, 
  importFromJson 
} from '@/services/historyService';
import { getChecklistHistoryFromServer, syncLocalHistoryWithServer } from '@/services/sqlServerService';
import { toast } from 'sonner';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ChecklistHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Tentar buscar do SQL Server primeiro
      const serverHistory = await getChecklistHistoryFromServer();
      setHistory(serverHistory);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }
    
    importFromJson(file)
      .then(data => {
        if (Array.isArray(data)) {
          localStorage.setItem('checklist_history', JSON.stringify(data));
          setHistory(data);
          toast.success('Histórico importado com sucesso!');
        } else {
          toast.error('Formato de arquivo inválido. Esperado um array de checklists.');
        }
      })
      .catch(error => {
        console.error('Erro ao importar dados:', error);
        toast.error('Erro ao importar dados.');
      });
  };

  const handleSyncWithServer = async () => {
    setSyncing(true);
    try {
      await syncLocalHistoryWithServer();
      await loadHistory(); // Recarregar dados após sincronização
      toast.success('Dados sincronizados com o SQL Server com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar com servidor:', error);
      toast.error('Falha na sincronização com o servidor');
    } finally {
      setSyncing(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Admin
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncWithServer}
              variant="outline"
              className="gap-2"
              disabled={syncing}
            >
              <RefreshCw className="h-4 w-4" /> 
              {syncing ? 'Sincronizando...' : 'Sincronizar com Servidor'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToJson(history)}>
                  Exportar para JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearChecklistHistory}>
                  Limpar Histórico
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <label htmlFor="import-json">
              <Button variant="outline" asChild className="gap-2">
                <Import className="h-4 w-4" /> Importar
              </Button>
            </label>
            <Input 
              type="file" 
              id="import-json" 
              className="hidden" 
              onChange={handleImport}
              accept=".json"
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="search">Pesquisar:</Label>
              <Input
                type="text"
                id="search"
                placeholder="Pesquisar por equipamento, operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="text-center">Carregando histórico...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>{item.equipmentName} ({item.equipmentId})</TableCell>
                        <TableCell>{item.operatorName}</TableCell>
                        <TableCell>{item.sector}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Trash className="h-4 w-4 mr-2" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Nenhum histórico encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
