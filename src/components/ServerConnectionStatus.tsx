
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, WifiOff, RefreshCw, Server, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/services/sqlServerService';

const ServerConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [serverInfo, setServerInfo] = useState<string | null>(null);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const apiUrl = getApiUrl();
      setIsLocal(localStorage.getItem('useLocalDb') === 'true');
      
      console.log('Verificando conexão com:', `${apiUrl}/health`);
      const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
      console.log('Resposta da API:', response.data);
      setIsConnected(true);
      setLastChecked(new Date().toLocaleTimeString());
      
      // Tentar obter informações do servidor, se disponíveis
      if (response.data && response.data.server) {
        setServerInfo(response.data.server);
      }
      
      toast.success(`Conectado ao banco de dados ${isLocal ? 'local' : 'remoto'}`);
    } catch (error) {
      console.error("Erro de conexão com o banco de dados:", error);
      setIsConnected(false);
      setLastChecked(new Date().toLocaleTimeString());
      toast.error(`Falha na conexão com o banco de dados ${isLocal ? 'local' : 'remoto'}`);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 2 minutes
    const interval = setInterval(checkConnection, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    toast.info(`Tentando reconectar ao banco de dados ${isLocal ? 'local' : 'remoto'}...`);
    checkConnection();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
        {isConnected === null ? (
          <Button variant="ghost" size="sm" disabled className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Verificando conexão...
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
      </div>
      
      {serverInfo && (
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
      
      <div className="bg-gray-100 p-2 rounded-lg">
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Server className="h-3 w-3" />
            <span>Dicas de conexão:</span>
          </div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Verifique se o servidor PostgreSQL está rodando</li>
            <li>Use o comando <code>netstat -tulpn | grep 5432</code> para verificar se a porta está aberta</li>
            <li>Verifique o arquivo <code>pg_hba.conf</code> para permissões de conexão</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServerConnectionStatus;
