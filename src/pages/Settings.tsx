
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Save, RefreshCw, Server } from 'lucide-react';
import ServerConnectionStatus from '@/components/ServerConnectionStatus';
import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();
  const [useLocalDb, setUseLocalDb] = useState(false);
  const [localDbUrl, setLocalDbUrl] = useState('http://localhost:3000');
  const [remoteDbUrl, setRemoteDbUrl] = useState('http://172.16.2.94:3000');
  
  // Configurações avançadas do banco de dados
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('checklist_db');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedUseLocalDb = localStorage.getItem('useLocalDb') === 'true';
    const savedLocalDbUrl = localStorage.getItem('localDbUrl') || 'http://localhost:3000';
    const savedRemoteDbUrl = localStorage.getItem('remoteDbUrl') || 'http://172.16.2.94:3000';
    
    // Carregar configurações avançadas
    const savedDbHost = localStorage.getItem('dbHost') || 'localhost';
    const savedDbPort = localStorage.getItem('dbPort') || '5432';
    const savedDbName = localStorage.getItem('dbName') || 'checklist_db';
    const savedDbUser = localStorage.getItem('dbUser') || 'postgres';
    const savedDbPassword = localStorage.getItem('dbPassword') || '';
    
    setUseLocalDb(savedUseLocalDb);
    setLocalDbUrl(savedLocalDbUrl);
    setRemoteDbUrl(savedRemoteDbUrl);
    setDbHost(savedDbHost);
    setDbPort(savedDbPort);
    setDbName(savedDbName);
    setDbUser(savedDbUser);
    setDbPassword(savedDbPassword);
  }, []);

  const handleToggleChange = (checked: boolean) => {
    setUseLocalDb(checked);
  };

  const handleSave = () => {
    // Salvar as configurações no localStorage
    localStorage.setItem('useLocalDb', useLocalDb.toString());
    localStorage.setItem('localDbUrl', localDbUrl);
    localStorage.setItem('remoteDbUrl', remoteDbUrl);
    
    // Salvar configurações avançadas
    localStorage.setItem('dbHost', dbHost);
    localStorage.setItem('dbPort', dbPort);
    localStorage.setItem('dbName', dbName);
    localStorage.setItem('dbUser', dbUser);
    localStorage.setItem('dbPassword', dbPassword);
    
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

  const testServerConnection = () => {
    toast.loading('Testando conexão com o banco de dados...');
    
    const apiUrl = useLocalDb ? localDbUrl : remoteDbUrl;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
  
    fetch(`${apiUrl}/api/health`, { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        clearTimeout(timeoutId);
        toast.dismiss();
        toast.success('Conexão com o servidor estabelecida com sucesso!');
      })
      .catch(error => {
        clearTimeout(timeoutId);
        toast.dismiss();
        toast.error('Falha ao conectar com o servidor. Verifique as configurações.');
        console.error('Erro ao testar conexão:', error);
      });
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
            <ServerConnectionStatus />
            
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
                    <div className="flex gap-2">
                      <Input
                        id="local-db-url"
                        value={localDbUrl}
                        onChange={(e) => setLocalDbUrl(e.target.value)}
                        placeholder="http://localhost:3000"
                        className="flex-1"
                      />
                      {useLocalDb && (
                        <Button variant="outline" onClick={testServerConnection}>
                          Testar
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      URL para conexão com o banco de dados local (sem "/api" no final)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="remote-db-url">URL do Banco de Dados Remoto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="remote-db-url"
                        value={remoteDbUrl}
                        onChange={(e) => setRemoteDbUrl(e.target.value)}
                        placeholder="http://172.16.2.94:3000"
                        className="flex-1"
                      />
                      {!useLocalDb && (
                        <Button variant="outline" onClick={testServerConnection}>
                          Testar
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      URL para conexão com o banco de dados remoto (sem "/api" no final)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Configurações Avançadas do PostgreSQL</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  >
                    {showAdvancedSettings ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                
                {showAdvancedSettings && (
                  <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="db-host">Host do PostgreSQL</Label>
                        <Input
                          id="db-host"
                          value={dbHost}
                          onChange={(e) => setDbHost(e.target.value)}
                          placeholder="localhost"
                        />
                      </div>
                      <div>
                        <Label htmlFor="db-port">Porta</Label>
                        <Input
                          id="db-port"
                          value={dbPort}
                          onChange={(e) => setDbPort(e.target.value)}
                          placeholder="5432"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="db-name">Nome do Banco de Dados</Label>
                      <Input
                        id="db-name"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        placeholder="checklist_db"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="db-user">Usuário do PostgreSQL</Label>
                        <Input
                          id="db-user"
                          value={dbUser}
                          onChange={(e) => setDbUser(e.target.value)}
                          placeholder="postgres"
                        />
                      </div>
                      <div>
                        <Label htmlFor="db-password">Senha</Label>
                        <Input
                          id="db-password"
                          type="password"
                          value={dbPassword}
                          onChange={(e) => setDbPassword(e.target.value)}
                          placeholder="******"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Nota:</strong> Estas configurações são necessárias apenas se você estiver 
                        executando o servidor da API localmente e precisar conectar ao PostgreSQL.
                      </p>
                    </div>
                  </div>
                )}
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
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                <li>PostgreSQL deve estar rodando na porta padrão 5432</li>
                <li>Crie um banco de dados chamado 'checklist_db'</li>
                <li>Use as credenciais configuradas acima para acessar o banco</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Passo 2: Configurar o PostgreSQL</h3>
              <p className="text-sm text-gray-600">
                Execute os comandos para criar o banco de dados e as tabelas necessárias:
              </p>
              <div className="bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto text-xs">
                <code>
                  # Criar banco de dados<br/>
                  sudo -u postgres createdb checklist_db<br/><br/>
                  
                  # Acessar o PostgreSQL<br/>
                  sudo -u postgres psql<br/><br/>
                  
                  # Dentro do PostgreSQL, conceda permissões<br/>
                  GRANT ALL PRIVILEGES ON DATABASE checklist_db TO postgres;<br/>
                  \c checklist_db<br/>
                  CREATE TABLE IF NOT EXISTS equipments (...);<br/>
                  CREATE TABLE IF NOT EXISTS operators (...);<br/>
                  CREATE TABLE IF NOT EXISTS checklists (...);<br/>
                </code>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Passo 3: Configurar o servidor da API</h3>
              <p className="text-sm text-gray-600">
                Crie um servidor Node.js com Express que exponha as rotas necessárias:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                <li>GET /api/equipments - Lista de equipamentos</li>
                <li>GET /api/operators - Lista de operadores</li>
                <li>GET /api/sectors - Lista de setores</li>
                <li>POST /api/checklists - Salvar um novo checklist</li>
                <li>GET /api/health - Status de saúde da API</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Passo 4: Iniciar o servidor</h3>
              <p className="text-sm text-gray-600">
                Execute seu servidor API local e certifique-se de que está rodando na porta correta (padrão: 3000).
              </p>
              <div className="bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto text-xs">
                <code>
                  # Inicie seu servidor<br/>
                  node server.js<br/><br/>
                  
                  # Verifique se está funcionando<br/>
                  curl http://localhost:3000/api/health
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
