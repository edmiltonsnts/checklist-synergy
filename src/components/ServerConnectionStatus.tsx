
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, WifiOff, RefreshCw, Server, Info, AlertTriangle, Network } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/services/sqlServerService';

const ServerConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [serverInfo, setServerInfo] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const checkConnection = async () => {
    setChecking(true);
    setErrorDetails(null);
    try {
      const apiUrl = getApiUrl();
      setIsLocal(localStorage.getItem('useLocalDb') === 'true');
      
      console.log('Verificando conexão com:', `${apiUrl}/health`);
      const response = await axios.get(`${apiUrl}/health`, { timeout: 10000 });
      console.log('Resposta da API:', response.data);
      setIsConnected(true);
      setLastChecked(new Date().toLocaleTimeString());
      
      // Tentar obter informações do servidor, se disponíveis
      if (response.data && response.data.server) {
        setServerInfo(response.data.server);
      }
      
      toast.success(`Conectado ao banco de dados ${isLocal ? 'local' : 'remoto'}`);
    } catch (error: any) {
      console.error("Erro de conexão com o banco de dados:", error);
      setIsConnected(false);
      setLastChecked(new Date().toLocaleTimeString());
      
      // Extrair detalhes do erro para diagnóstico
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

  useEffect(() => {
    checkConnection();
    
    // Check connection every 3 minutes (aumentado de 2 para 3 minutos)
    const interval = setInterval(checkConnection, 180000);
    
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
      
      {errorDetails && !isConnected && (
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            <span>Dicas para Proxmox:</span>
          </div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Verifique se o contêiner LXC ou VM está rodando no Proxmox</li>
            <li>Use o IP do contêiner como Host nas configurações avançadas</li>
            <li>Certifique-se que o PostgreSQL está instalado com <code>apt install postgresql</code></li>
            <li>Configure <code>postgresql.conf</code> para permitir conexões remotas com <code>listen_addresses = '*'</code></li>
            <li>Configure <code>pg_hba.conf</code> com <code>host all all 0.0.0.0/0 md5</code></li>
            <li>Verifique se a porta 5432 está aberta com <code>netstat -tulpn | grep 5432</code></li>
          </ul>
        </div>
        
        <div className="mt-2 text-xs bg-amber-50 p-2 rounded border border-amber-200">
          <div className="flex items-center gap-1 text-amber-700">
            <Network className="h-3 w-3" />
            <span className="font-medium">Importante:</span>
          </div>
          <p className="text-amber-700 mt-1">
            Para usar PostgreSQL no Proxmox, certifique-se de configurar as Configurações Avançadas na página de Configurações com o IP do contêiner Proxmox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerConnectionStatus;
