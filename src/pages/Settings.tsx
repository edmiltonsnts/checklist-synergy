import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Save, RefreshCw, Server, Info, Database, AlertTriangle } from 'lucide-react';
import ServerConnectionStatus from '@/components/ServerConnectionStatus';
import axios from 'axios';
import { testPostgresConnection, getPostgresStatus, getIndexedDBStatus } from '@/services/sqlServerService';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Settings = () => {
  const navigate = useNavigate();
  const [useLocalDb, setUseLocalDb] = useState(false);
  const [localDbUrl, setLocalDbUrl] = useState('http://localhost:3000');
  const [remoteDbUrl, setRemoteDbUrl] = useState('http://172.16.2.94:3000');
  
  const [storageOption, setStorageOption] = useState<'postgres' | 'indexeddb'>('postgres');
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('checklist_db');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');
  
  const [pgTestResult, setPgTestResult] = useState<{success?: boolean, message?: string, info?: any} | null>(null);
  const [testingPg, setTestingPg] = useState(false);
  
  const [indexedDBTestResult, setIndexedDBTestResult] = useState<{status?: string, message?: string} | null>(null);
  const [testingIndexedDB, setTestingIndexedDB] = useState(false);

  useEffect(() => {
    const savedUseLocalDb = localStorage.getItem('useLocalDb') === 'true';
    const savedLocalDbUrl = localStorage.getItem('localDbUrl') || 'http://localhost:3000';
    const savedRemoteDbUrl = localStorage.getItem('remoteDbUrl') || 'http://172.16.2.94:3000';
    
    const savedDbHost = localStorage.getItem('dbHost') || 'localhost';
    const savedDbPort = localStorage.getItem('dbPort') || '5432';
    const savedDbName = localStorage.getItem('dbName') || 'checklist_db';
    const savedDbUser = localStorage.getItem('dbUser') || 'postgres';
    const savedDbPassword = localStorage.getItem('dbPassword') || '';
    
    const savedStorageOption = localStorage.getItem('storageOption') || 'postgres';
    
    setUseLocalDb(savedUseLocalDb);
    setLocalDbUrl(savedLocalDbUrl);
    setRemoteDbUrl(savedRemoteDbUrl);
    setDbHost(savedDbHost);
    setDbPort(savedDbPort);
    setDbName(savedDbName);
    setDbUser(savedDbUser);
    setDbPassword(savedDbPassword);
    setStorageOption(savedStorageOption as 'postgres' | 'indexeddb');
  }, []);

  const handleToggleChange = (checked: boolean) => {
    setUseLocalDb(checked);
  };

  const handleStorageOptionChange = (value: 'postgres' | 'indexeddb') => {
    setStorageOption(value);
    
    localStorage.setItem('useIndexedDb', value === 'indexeddb' ? 'true' : 'false');
    
    if (value === 'indexeddb') {
      toast.info('Usando IndexedDB para armazenamento local no navegador');
    } else {
      toast.info('Usando PostgreSQL para armazenamento de dados');
    }
  };

  const handleSave = () => {
    localStorage.setItem('useLocalDb', useLocalDb.toString());
    localStorage.setItem('localDbUrl', localDbUrl);
    localStorage.setItem('remoteDbUrl', remoteDbUrl);
    
    localStorage.setItem('storageOption', storageOption);
    localStorage.setItem('useIndexedDb', storageOption === 'indexeddb' ? 'true' : 'false');
    
    localStorage.setItem('dbHost', dbHost);
    localStorage.setItem('dbPort', dbPort);
    localStorage.setItem('dbName', dbName);
    localStorage.setItem('dbUser', dbUser);
    localStorage.setItem('dbPassword', dbPassword);
    
    toast.success('Configurações salvas com sucesso!');
    toast.info('Recarregue o aplicativo para aplicar as alterações.');
    
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
  
  const testPostgresDirectConnection = async () => {
    setTestingPg(true);
    setPgTestResult(null);
    
    toast.loading('Testando conexão direta com PostgreSQL...');
    
    try {
      const result = await testPostgresConnection();
      setPgTestResult(result);
      toast.dismiss();
      
      if (result.success) {
        toast.success('Conexão direta com PostgreSQL bem sucedida!');
      } else {
        toast.error('Falha ao conectar diretamente com PostgreSQL');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao testar conexão PostgreSQL');
      setPgTestResult({
        success: false,
        message: 'Erro inesperado ao testar conexão'
      });
    } finally {
      setTestingPg(false);
    }
  };
  
  const testIndexedDBConnection = async () => {
    setTestingIndexedDB(true);
    setIndexedDBTestResult(null);
    
    toast.loading('Testando conexão com IndexedDB...');
    
    try {
      const result = await getIndexedDBStatus();
      setIndexedDBTestResult(result);
      toast.dismiss();
      
      if (result.status === 'ok') {
        toast.success('IndexedDB está funcionando corretamente!');
      } else {
        toast.error('Falha ao verificar IndexedDB');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao testar IndexedDB');
      setIndexedDBTestResult({
        status: 'error',
        message: 'Erro inesperado ao testar IndexedDB'
      });
    } finally {
      setTestingIndexedDB(false);
    }
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
              Configure as opções de armazenamento de dados
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <ServerConnectionStatus />
            
            <div className="space-y-4">
              <div className="border p-4 rounded-md bg-white">
                <h3 className="text-lg font-medium mb-4">Opções de Armazenamento</h3>
                
                <RadioGroup 
                  value={storageOption} 
                  onValueChange={(value) => handleStorageOptionChange(value as 'postgres' | 'indexeddb')}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="postgres" id="postgres" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="postgres" className="font-medium">
                        PostgreSQL (Recomendado para produção)
                      </Label>
                      <p className="text-sm text-gray-500">
                        Banco de dados SQL completo, requer configuração de servidor
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="indexeddb" id="indexeddb" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="indexeddb" className="font-medium">
                        IndexedDB (Mais fácil para testes)
                      </Label>
                      <p className="text-sm text-gray-500">
                        Armazenamento local no navegador, não requer configuração, mas tem limitações
                      </p>
                      
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={testIndexedDBConnection}
                          disabled={testingIndexedDB}
                        >
                          {testingIndexedDB ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                              Testando...
                            </>
                          ) : (
                            <>
                              <Database className="h-3.5 w-3.5 mr-2" />
                              Testar IndexedDB
                            </>
                          )}
                        </Button>
                        
                        {indexedDBTestResult && (
                          <div className={`mt-2 p-2 rounded border text-sm ${indexedDBTestResult.status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {indexedDBTestResult.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {storageOption === 'postgres' && (
                <>
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
                            <p className="text-xs text-gray-500 mt-1">
                              Para Proxmox, use o IP do contêiner ou VM
                            </p>
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
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            onClick={testPostgresDirectConnection}
                            disabled={testingPg}
                          >
                            {testingPg ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Testando...
                              </>
                            ) : (
                              <>
                                <Database className="h-4 w-4 mr-2" />
                                Testar Conexão PostgreSQL
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {pgTestResult && (
                          <div className={`p-3 rounded border ${pgTestResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-start gap-2">
                              {pgTestResult.success ? (
                                <Info className="h-4 w-4 text-green-500 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                              )}
                              <div>
                                <p className={`text-sm font-medium ${pgTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                  {pgTestResult.success ? 'Conexão bem sucedida' : 'Falha na conexão'}
                                </p>
                                {pgTestResult.message && (
                                  <p className="text-xs mt-1">{pgTestResult.message}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-amber-50 p-3 rounded border border-amber-200">
                          <p className="text-sm text-amber-800">
                            <strong>Configuração para Proxmox:</strong> 
                          </p>
                          <ul className="list-disc pl-5 mt-1 text-sm text-amber-800">
                            <li>Instale PostgreSQL no contêiner com: <code>apt install postgresql</code></li>
                            <li>Configure o arquivo <code>pg_hba.conf</code> para permitir conexões</li>
                            <li>Verifique se a porta 5432 está aberta no contêiner</li>
                            <li>Use o comando: <code>sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'suasenha'"</code></li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Modo Atual:</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p>
                    <span className="font-medium">Tipo de Armazenamento: </span>
                    <span className={storageOption === 'indexeddb' ? "text-purple-600" : "text-blue-600"}>
                      {storageOption === 'indexeddb' ? "IndexedDB (navegador local)" : "PostgreSQL"}
                    </span>
                  </p>
                  
                  {storageOption === 'postgres' && (
                    <p className="mt-1">
                      <span className="font-medium">Conexão: </span>
                      <span className={useLocalDb ? "text-green-600" : "text-blue-600"}>
                        {useLocalDb ? "Banco de Dados Local" : "Banco de Dados Remoto"}
                      </span>
                    </p>
                  )}
                  
                  {storageOption === 'postgres' && (
                    <p className="text-sm text-gray-500 mt-1">
                      API Endpoint: {useLocalDb ? `${localDbUrl}/api` : `${remoteDbUrl}/api`}
                    </p>
                  )}
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
        
        {storageOption === 'postgres' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Configurar PostgreSQL no Proxmox</CardTitle>
              <CardDescription>
                Instruções para configurar PostgreSQL em um contêiner LXC do Proxmox
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium mb-2">Passo 1: Instalar PostgreSQL no contêiner</h3>
                <p className="text-sm text-gray-600">
                  Execute os seguintes comandos no contêiner LXC:
                </p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto text-xs">
                  <code>
                    # Atualizar os repositórios<br/>
                    apt update<br/><br/>
                    
                    # Instalar o PostgreSQL<br/>
                    apt install postgresql postgresql-contrib<br/><br/>
                    
                    # Verificar status do PostgreSQL<br/>
                    systemctl status postgresql<br/>
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium mb-2">Passo 2: Configurar o PostgreSQL</h3>
                <p className="text-sm text-gray-600">
                  Configure o PostgreSQL para aceitar conexões remotas:
                </p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto text-xs">
                  <code>
                    # Acessar o PostgreSQL<br/>
                    sudo -u postgres psql<br/><br/>
                    
                    # Alterar senha do usuário postgres<br/>
                    ALTER USER postgres WITH PASSWORD 'senha_segura';<br/><br/>
                    
                    # Criar o banco de dados<br/>
                    CREATE DATABASE checklist_db;<br/><br/>
                    
                    # Sair do psql<br/>
                    \q<br/>
                  </code>
                </div>
                
                <p className="text-sm text-gray-600 mt-3">
                  Edite o arquivo <code>postgresql.conf</code> para aceitar conexões remotas:
                </p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto text-xs">
                  <code>
                    # Editar o arquivo de configuração<br/>
                    nano /etc/postgresql/*/main/postgresql.conf<br/><br/>
                    
                    # Alterar a linha<br/>
                    listen_addresses = '*'<br/><br/>
                    
                    # Salvar e fechar o arquivo (Ctrl+X, Y, Enter)<br/><br/>
                    
                    # Editar o arquivo pg_hba.conf<br/>
                    nano /etc/postgresql/*/main/pg_hba.conf<br/><br/>
                    
                    # Adicionar no final do arquivo<br/>
                    host    all             all             0.0.0.0/0            md5<br/><br/>
                    
                    # Reiniciar o PostgreSQL<br/>
                    systemctl restart postgresql<br/>
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium mb-2">Passo 3: Verificar configuração de rede</h3>
                <p className="text-sm text-gray-600">
                  Verifique o IP do contêiner e teste a conexão:
                </p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto text-xs">
                  <code>
                    # Instalar pacotes de rede<br/>
                    apt install net-tools iproute2<br/><br/>
                    
                    # Verificar IP do contêiner<br/>
                    ip addr show<br/><br/>
                    
                    # Verificar se a porta está aberta<br/>
                    netstat -tulpn | grep 5432<br/><br/>
                    
                    # Testar conexão ao PostgreSQL<br/>
                    psql -h localhost -U postgres -d checklist_db<br/>
                  </code>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="font-medium mb-2 text-amber-800">Observações importantes</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800">
                  <li>Confirme que o IP do contêiner é visível pela sua rede</li>
                  <li>Verifique se há um firewall bloqueando a porta 5432</li>
                  <li>Se estiver usando um contêiner privilegiado, alguns comandos podem requerer sudo</li>
                  <li>Certifique-se de usar senhas seguras em ambiente de produção</li>
                  <li>Uma vez que o PostgreSQL esteja rodando, ajuste as configurações acima para corresponder ao seu ambiente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        
        {storageOption === 'indexeddb' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações sobre IndexedDB</CardTitle>
              <CardDescription>
                Detalhes sobre o uso do armazenamento local no navegador
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium mb-2 text-blue-700">Vantagens do IndexedDB</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                  <li>Não requer instalação ou configuração de servidor</li>
                  <li>Funciona sem internet depois de carregado</li>
                  <li>Dados persistentes entre sessões do navegador</li>
                  <li>Ideal para desenvolvimento e testes</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="font-medium mb-2 text-amber-700">Limitações do IndexedDB</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                  <li>Os dados ficam armazenados apenas no navegador atual</li>
                  <li>Não há compartilhamento entre dispositivos diferentes</li>
                  <li>Espaço de armazenamento limitado (geralmente 50-250MB dependendo do navegador)</li>
                  <li>Os dados podem ser perdidos se o usuário limpar o cache do navegador</li>
                  <li>Não recomendado para ambientes de produção com múltiplos usuários</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h3 className="font-medium mb-2 text-green-700">Quando Usar IndexedDB</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-green-700">
                  <li>Para desenvolvimento e testes rápidos</li>
                  <li>Para demonstrações sem necessidade de configurar um servidor</li>
                  <li>Para aplicativos usados por apenas um usuário por vez</li>
                  <li>Como solução temporária enquanto configura o PostgreSQL</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium mb-2">Migração para PostgreSQL</h3>
                <p className="text-sm text-gray-600">
                  Quando estiver pronto para usar um banco de dados completo, você pode migrar seus dados do IndexedDB para o PostgreSQL:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm text-gray-600">
                  <li>Configure o PostgreSQL conforme as instruções</li>
                  <li>Mude para a opção PostgreSQL nas configurações</li>
                  <li>O sistema tentará migrar automaticamente os dados armazenados localmente</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
