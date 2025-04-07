import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Server, Info, AlertTriangle, Network, Download, Database } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl, isUsingIndexedDB, getIndexedDBStatus } from '@/services/sqlServerService';

const ServerConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [serverInfo, setServerInfo] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [showLocalDbInstructions, setShowLocalDbInstructions] = useState(false);
  const [usingIndexedDB, setUsingIndexedDB] = useState<boolean>(false);
  const [indexedDBStatus, setIndexedDBStatus] = useState<'ok' | 'error' | null>(null);
  const [indexedDBDetails, setIndexedDBDetails] = useState<{
    databaseName: string;
    version: number;
    objectStores: string[];
  } | null>(null);

  const checkConnection = async () => {
    setChecking(true);
    setErrorDetails(null);
    
    const useIndexedDb = isUsingIndexedDB();
    setUsingIndexedDB(useIndexedDb);
    
    if (useIndexedDb) {
      try {
        const result = await getIndexedDBStatus();
        setIndexedDBStatus(result.status as 'ok' | 'error');
        setIsConnected(result.status === 'ok');
        setLastChecked(new Date().toLocaleTimeString());
        
        if (result.status === 'ok') {
          toast.success('IndexedDB está funcionando corretamente');
        } else {
          toast.error('Erro com IndexedDB: ' + result.message);
          setErrorDetails(result.message || 'Erro desconhecido com IndexedDB');
        }
      } catch (error: any) {
        setIsConnected(false);
        setIndexedDBStatus('error');
        setLastChecked(new Date().toLocaleTimeString());
        setErrorDetails('Erro ao acessar IndexedDB: ' + (error.message || 'Erro desconhecido'));
      } finally {
        setChecking(false);
      }
      return;
    }
    
    try {
      const apiUrl = getApiUrl();
      setIsLocal(localStorage.getItem('useLocalDb') === 'true');
      
      const dbHost = localStorage.getItem('dbHost') || 'localhost';
      setIpAddress(dbHost);
      
      console.log('Verificando conexão com:', `${apiUrl}/health`);
      const response = await axios.get(`${apiUrl}/health`, { timeout: 10000 });
      console.log('Resposta da API:', response.data);
      setIsConnected(true);
      setLastChecked(new Date().toLocaleTimeString());
      
      if (response.data && response.data.server) {
        setServerInfo(response.data.server);
      }
      
      toast.success(`Conectado ao banco de dados ${isLocal ? 'local' : 'remoto'}`);
    } catch (error: any) {
      console.error("Erro de conexão com o banco de dados:", error);
      setIsConnected(false);
      setLastChecked(new Date().toLocaleTimeString());
      
      let errorMsg = "Erro desconhecido";
      if (error.code === 'ERR_NETWORK') {
        errorMsg = "Erro de rede - O servidor não está acessível. Verifique se o endereço IP e porta estão corretos e se há conexão de rede.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = "Conexão recusada - O servidor está ativo, mas recusou a conexão. Verifique se o PostgreSQL está rodando e a porta está correta.";
      } else if (error.response) {
        errorMsg = `Erro de resposta: ${error.response.status} - ${error.response.data?.message || error.message}`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorDetails(errorMsg);
      toast.error(`Falha na conexão com o banco de dados ${isLocal ? 'local' : 'remoto'}`);
    } finally {
      setChecking(false);
    }
  };

  const checkIndexedDBDetails = async () => {
    if (!usingIndexedDB) return;

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('checklistDB', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const objectStoreNames = Array.from(db.objectStoreNames);
      
      setIndexedDBDetails({
        databaseName: db.name,
        version: db.version,
        objectStores: objectStoreNames
      });
    } catch (error) {
      console.error('Error accessing IndexedDB details:', error);
    }
  };

  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 180000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (usingIndexedDB) {
      checkIndexedDBDetails();
    }
  }, [usingIndexedDB]);

  const handleRetry = () => {
    if (usingIndexedDB) {
      toast.info('Verificando IndexedDB...');
    } else {
      toast.info(`Tentando reconectar ao banco de dados ${isLocal ? 'local' : 'remoto'}...`);
    }
    checkConnection();
  };

  const toggleLocalDbInstructions = () => {
    setShowLocalDbInstructions(!showLocalDbInstructions);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
        {isConnected === null ? (
          <Button variant="ghost" size="sm" disabled className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Verificando conexão...
          </Button>
        ) : usingIndexedDB ? (
          <Button variant="ghost" size="sm" className={`text-xs ${isConnected ? 'text-purple-600' : 'text-red-600'}`} onClick={handleRetry} disabled={checking}>
            <Database className="h-3 w-3 mr-1" />
            {isConnected ? 'IndexedDB ativo' : 'Erro no IndexedDB'} {lastChecked && `(Verificado: ${lastChecked})`}
          </Button>
        ) : isConnected ? (
          <Button variant="ghost" size="sm" className="text-xs text-green-600" onClick={handleRetry} disabled={checking}>
            <Database className="h-3 w-3 mr-1" />
            Conectado ao banco {isLocal ? 'local' : 'remoto'} {lastChecked && `(Verificado: ${lastChecked})`}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="text-xs text-red-600" onClick={handleRetry} disabled={checking}>
            <WifiOff className="h-3 w-3 mr-1" />
            Desconectado do banco {isLocal ? 'local' : 'remoto'}
            {checking ? <RefreshCw className="h-3 w-3 ml-1 animate-spin" /> : null}
            {lastChecked && ` (Última tentativa: ${lastChecked})`}
          </Button>
        )}
        
        {(!isConnected && !usingIndexedDB) && (
          <Button variant="ghost" size="sm" className="text-xs text-blue-600" onClick={toggleLocalDbInstructions}>
            <Download className="h-3 w-3 mr-1" />
            {showLocalDbInstructions ? 'Ocultar instruções' : 'Instruções para banco local'}
          </Button>
        )}
      </div>
      
      {usingIndexedDB && indexedDBStatus === 'ok' && indexedDBDetails && (
        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <Database className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-700">IndexedDB Details</h4>
              <p className="text-xs text-green-600">
                Database: {indexedDBDetails.databaseName}
                <br />
                Version: {indexedDBDetails.version}
                <br />
                Object Stores: {indexedDBDetails.objectStores.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {errorDetails && !isConnected && !usingIndexedDB && (
        <div className="bg-red-50 p-2 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-700">Diagnóstico de Erro</h4>
              <p className="text-xs text-red-600">{errorDetails}</p>
              
              <div className="mt-1 text-xs text-red-600">
                <p>Configurações atuais:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>API: {getApiUrl()}</li>
                  <li>Modo: {isLocal ? 'Local' : 'Remoto'}</li>
                  <li>Host PostgreSQL: {ipAddress || 'Não definido'}</li>
                </ul>
              </div>
              
              <div className="mt-2 text-xs">
                <p className="font-medium">Solução para Proxmox:</p>
                <ol className="list-decimal pl-5 mt-1">
                  <li>Verifique se o IP {ipAddress || 'configurado'} está correto (use o IP do seu contêiner Proxmox - 172.16.5.165)</li>
                  <li>Confirme se a porta 5432 está aberta no contêiner</li>
                  <li>Verifique se o PostgreSQL está rodando com <code>systemctl status postgresql</code></li>
                </ol>
              </div>
              
              <div className="mt-2 text-xs text-blue-600">
                <p className="font-medium">Alternativa:</p>
                <p>Considere usar o modo IndexedDB que não requer instalação de servidor para testes</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {serverInfo && !usingIndexedDB && (
        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-700">Informação do Servidor</h4>
              <p className="text-xs text-blue-600">{serverInfo}</p>
            </div>
          </div>
        </div>
      )}
      
      {showLocalDbInstructions && !usingIndexedDB && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Como Configurar PostgreSQL Localmente</h4>
          
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-blue-700">1. Instale o PostgreSQL</h5>
              <p className="text-xs text-blue-600">
                Windows: Baixe e instale do <a href="https://www.postgresql.org/download/windows/" target="_blank" rel="noopener noreferrer" className="underline">site oficial</a> 
                <br />
                Mac: Use Homebrew <code>brew install postgresql</code>
                <br />
                Linux: <code>sudo apt install postgresql postgresql-contrib</code>
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-blue-700">2. Crie um banco de dados</h5>
              <p className="text-xs text-blue-600">
                <code>sudo -u postgres psql</code>
                <br />
                <code>CREATE DATABASE checklist_db;</code>
                <br />
                <code>ALTER USER postgres WITH PASSWORD 'suasenha';</code>
                <br />
                <code>\q</code>
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-blue-700">3. Configure o arquivo pg_hba.conf</h5>
              <p className="text-xs text-blue-600">
                Edite <code>/etc/postgresql/[versão]/main/pg_hba.conf</code>
                <br />
                Adicione: <code>host all all 0.0.0.0/0 md5</code>
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-blue-700">4. Configure o arquivo postgresql.conf</h5>
              <p className="text-xs text-blue-600">
                Edite <code>/etc/postgresql/[versão]/main/postgresql.conf</code>
                <br />
                Altere para: <code>listen_addresses = '*'</code>
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-blue-700">5. Reinicie o PostgreSQL</h5>
              <p className="text-xs text-blue-600">
                <code>sudo systemctl restart postgresql</code>
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-blue-700">6. Configure a aplicação</h5>
              <p className="text-xs text-blue-600">
                - Nas configurações da aplicação, selecione "Usar Banco de Dados Local"
                <br />
                - Nas configurações avançadas, preencha:
                <br />
                Host: localhost | Porta: 5432 | Nome do BD: checklist_db
                <br />
                Usuário: postgres | Senha: (a senha que você definiu)
              </p>
            </div>
            
            <div className="mt-2 pt-2 border-t border-blue-200">
              <h5 className="text-xs font-semibold text-purple-700">Alternativa mais simples: Usar IndexedDB</h5>
              <p className="text-xs text-purple-600">
                Se preferir uma solução que não requer instalação de servidor, selecione a opção "IndexedDB" nas configurações de armazenamento.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!usingIndexedDB && (
        <div className="bg-gray-100 p-2 rounded-lg">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              <span>Dicas para Proxmox:</span>
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Verifique se o contêiner LXC ou VM está rodando no Proxmox</li>
              <li>Use o IP do contêiner <strong>172.16.5.165</strong> como Host nas configurações avançadas</li>
              <li>Certifique-se que o PostgreSQL está instalado e rodando</li>
              <li>Configure <code>postgresql.conf</code> para permitir conexões remotas com <code>listen_addresses = '*'</code></li>
              <li>Configure <code>pg_hba.conf</code> com <code>host all all 0.0.0.0/0 md5</code></li>
              <li>Verifique se a porta 5432 está aberta com <code>netstat -tulpn | grep 5432</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerConnectionStatus;
