
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [useLocalDb, setUseLocalDb] = useState(false);
  const [localDbUrl, setLocalDbUrl] = useState('http://localhost:3000');
  const [remoteDbUrl, setRemoteDbUrl] = useState('http://172.16.2.94:3000');

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedUseLocalDb = localStorage.getItem('useLocalDb') === 'true';
    const savedLocalDbUrl = localStorage.getItem('localDbUrl') || 'http://localhost:3000';
    const savedRemoteDbUrl = localStorage.getItem('remoteDbUrl') || 'http://172.16.2.94:3000';
    
    setUseLocalDb(savedUseLocalDb);
    setLocalDbUrl(savedLocalDbUrl);
    setRemoteDbUrl(savedRemoteDbUrl);
  }, []);

  const handleToggleChange = (checked: boolean) => {
    setUseLocalDb(checked);
  };

  const handleSave = () => {
    // Salvar as configurações no localStorage
    localStorage.setItem('useLocalDb', useLocalDb.toString());
    localStorage.setItem('localDbUrl', localDbUrl);
    localStorage.setItem('remoteDbUrl', remoteDbUrl);
    
    toast.success('Configurações salvas com sucesso!');
    toast.info('Recarregue o aplicativo para aplicar as alterações.');
    
    // Recarregar a página para aplicar as alterações
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="container mx-auto max-w-3xl">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        
        <Card>
          <CardHeader className="bg-[#8B0000] text-white rounded-t-lg">
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription className="text-gray-200">
              Configure as opções de conexão com o banco de dados
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="localdb-toggle" className="text-lg font-medium">
                    Usar Banco de Dados Local
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Quando ativado, o sistema se conectará ao banco de dados local em vez do remoto
                  </p>
                </div>
                <Switch
                  id="localdb-toggle"
                  checked={useLocalDb}
                  onCheckedChange={handleToggleChange}
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Configurações de Conexão</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="local-db-url">URL do Banco de Dados Local</Label>
                    <Input
                      id="local-db-url"
                      value={localDbUrl}
                      onChange={(e) => setLocalDbUrl(e.target.value)}
                      placeholder="http://localhost:3000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL para conexão com o banco de dados local (sem "/api" no final)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="remote-db-url">URL do Banco de Dados Remoto</Label>
                    <Input
                      id="remote-db-url"
                      value={remoteDbUrl}
                      onChange={(e) => setRemoteDbUrl(e.target.value)}
                      placeholder="http://172.16.2.94:3000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL para conexão com o banco de dados remoto (sem "/api" no final)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Modo Atual:</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p>
                    <span className="font-medium">Conexão: </span>
                    <span className={useLocalDb ? "text-green-600" : "text-blue-600"}>
                      {useLocalDb ? "Banco de Dados Local" : "Banco de Dados Remoto"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    API Endpoint: {useLocalDb ? `${localDbUrl}/api` : `${remoteDbUrl}/api`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button onClick={handleSave} className="w-full bg-[#8B0000] hover:bg-[#6B0000]">
              <Save className="h-4 w-4 mr-2" /> Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configurar Banco de Dados Local</CardTitle>
            <CardDescription>
              Instruções para configurar um servidor local para testar o aplicativo
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Passo 1: Instalar Node.js e PostgreSQL</h3>
              <p className="text-sm text-gray-600">
                Certifique-se de ter Node.js e PostgreSQL instalados na sua máquina.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Passo 2: Criar um servidor de API local</h3>
              <p className="text-sm text-gray-600">
                Crie um servidor Node.js com Express que exponha as mesmas rotas que o servidor remoto:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                <li>GET /api/equipments - Lista de equipamentos</li>
                <li>GET /api/operators - Lista de operadores</li>
                <li>GET /api/sectors - Lista de setores</li>
                <li>POST /api/checklists - Salvar um novo checklist</li>
                <li>GET /api/checklists/history - Obter histórico de checklists</li>
                <li>POST /api/checklists/sync - Sincronizar checklists locais</li>
                <li>GET /api/health - Status de saúde da API</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Passo 3: Configurar o aplicativo</h3>
              <p className="text-sm text-gray-600">
                Ative a opção "Usar Banco de Dados Local" acima e salve as configurações.
                Certifique-se de que seu servidor local está rodando na porta configurada (padrão: 3000).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
