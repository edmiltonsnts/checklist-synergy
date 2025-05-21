
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Server, Info, Network, Download, Database } from 'lucide-react';
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
          // Removed error toast
          setErrorDetails(null);
        }
      } catch (error: any) {
        setIsConnected(false);
        setIndexedDBStatus('error');
        setLastChecked(new Date().toLocaleTimeString());
        setErrorDetails(null); // Not showing error details anymore
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
      setErrorDetails(null); // Not showing error details anymore
      
      // Removed error toast message
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
          <Button variant="ghost" size="sm" className={`text-xs ${isConnected ? 'text-purple-600' : 'text-gray-600'}`} onClick={handleRetry} disabled={checking}>
            <Database className="h-3 w-3 mr-1" />
            {isConnected ? 'IndexedDB ativo' : 'Usando armazenamento local'} {lastChecked && `(Verificado: ${lastChecked})`}
          </Button>
        ) : isConnected ? (
          <Button variant="ghost" size="sm" className="text-xs text-green-600" onClick={handleRetry} disabled={checking}>
            <Database className="h-3 w-3 mr-1" />
            Conectado ao banco {isLocal ? 'local' : 'remoto'} {lastChecked && `(Verificado: ${lastChecked})`}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="text-xs text-gray-600" onClick={handleRetry} disabled={checking}>
            <Database className="h-3 w-3 mr-1" />
            Usando armazenamento local
            {checking ? <RefreshCw className="h-3 w-3 ml-1 animate-spin" /> : null}
            {lastChecked && ` (Última verificação: ${lastChecked})`}
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
      
      {/* Removed the error details block entirely */}
      
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
      
      {/* Removed local db instructions */}
      
      {/* Removed the database troubleshooting tips section */}
    </div>
  );
};

export default ServerConnectionStatus;
