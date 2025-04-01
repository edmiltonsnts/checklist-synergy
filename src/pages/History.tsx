
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Download, FilePlus, FileText, Send, Trash2 } from 'lucide-react';
import { ChecklistHistory } from '@/types/checklist';
import { 
  getChecklistHistory, clearChecklistHistory, exportToJson, importFromJson 
} from '@/services/historyService';
import { savePDF, sendEmailWithPDF } from '@/services/pdfService';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ChecklistHistory[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistHistory | null>(null);
  const [filterSector, setFilterSector] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getChecklistHistory();
    setHistory(data);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importFromJson(file)
      .then((data) => {
        // Se os dados importados forem um array, assumimos que são checklists
        if (Array.isArray(data)) {
          localStorage.setItem('checklist_history', JSON.stringify(data));
          loadHistory();
        } else {
          toast.error('Formato inválido. O arquivo deve conter um array de checklists');
        }
      })
      .catch(error => {
        console.error('Erro na importação:', error);
      });
  };

  const handleViewDetails = (checklist: ChecklistHistory) => {
    setSelectedChecklist(checklist);
  };

  const handleExportPDF = (checklist: ChecklistHistory) => {
    savePDF(checklist);
  };

  const handleSendEmail = () => {
    if (!selectedChecklist) return;
    
    if (!email) {
      toast.error('Digite um email válido');
      return;
    }
    
    sendEmailWithPDF(selectedChecklist, email);
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
      clearChecklistHistory();
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => {
    return (
      (filterSector === '' || item.sector.toLowerCase().includes(filterSector.toLowerCase())) &&
      (filterEquipment === '' || 
        item.equipmentName.toLowerCase().includes(filterEquipment.toLowerCase()) ||
        item.equipmentId.toLowerCase().includes(filterEquipment.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportToJson(history)}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> Exportar
            </Button>
            
            <div className="relative">
              <Input
                type="file"
                id="importFile"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('importFile')?.click()}
                className="gap-2"
              >
                <FilePlus className="h-4 w-4" /> Importar
              </Button>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" /> Limpar
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-[#8B0000] text-white rounded-t-lg">
            <CardTitle>Histórico de Checklists</CardTitle>
            <CardDescription className="text-gray-200">
              Visualize, exporte ou envie por email os checklists realizados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="filterSector">Filtrar por Setor</Label>
                <Input 
                  id="filterSector" 
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  placeholder="Digite o nome do setor"
                />
              </div>
              <div>
                <Label htmlFor="filterEquipment">Filtrar por Equipamento</Label>
                <Input 
                  id="filterEquipment" 
                  value={filterEquipment}
                  onChange={(e) => setFilterEquipment(e.target.value)}
                  placeholder="Digite o nome ou código do equipamento"
                />
              </div>
            </div>

            <div className="border rounded-md">
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
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.date).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{item.equipmentId} - {item.equipmentName}</TableCell>
                        <TableCell>{item.operatorName} ({item.operatorId})</TableCell>
                        <TableCell>{item.sector}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDetails(item)}
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Checklist</DialogTitle>
                                  <DialogDescription>
                                    Checklist realizado em {new Date(item.date).toLocaleString('pt-BR')}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div>
                                    <p className="text-sm font-medium">Equipamento:</p>
                                    <p>{item.equipmentId} - {item.equipmentName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Operador:</p>
                                    <p>{item.operatorName} ({item.operatorId})</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Setor:</p>
                                    <p>{item.sector}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Data:</p>
                                    <p>{new Date(item.date).toLocaleString('pt-BR')}</p>
                                  </div>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Pergunta</TableHead>
                                      <TableHead>Resposta</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {item.items.map((question, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{question.question}</TableCell>
                                        <TableCell>{question.answer || "Não respondido"}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                {item.signature && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Assinatura:</p>
                                    <img 
                                      src={item.signature} 
                                      alt="Assinatura do operador" 
                                      className="border border-gray-300 max-h-32" 
                                    />
                                  </div>
                                )}
                                <div className="mt-4">
                                  <Label htmlFor="emailInput">Enviar para e-mail:</Label>
                                  <div className="flex mt-2 gap-2">
                                    <Input 
                                      id="emailInput"
                                      type="email"
                                      placeholder="email@exemplo.com.br"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Button 
                                      onClick={handleSendEmail}
                                      className="bg-[#8B0000] hover:bg-[#6B0000] gap-2"
                                    >
                                      <Send className="h-4 w-4" /> Enviar
                                    </Button>
                                  </div>
                                </div>
                                <DialogFooter className="mt-4">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleExportPDF(item)}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" /> Salvar como PDF
                                  </Button>
                                  <DialogClose asChild>
                                    <Button>Fechar</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleExportPDF(item)}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {history.length === 0 
                          ? "Nenhum checklist no histórico" 
                          : "Nenhum checklist encontrado com os filtros aplicados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
