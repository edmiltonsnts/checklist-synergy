
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, WifiOff, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '@/services/sqlServerService';

const ServerConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkConnection = async () => {
    setChecking(true);
    try {
      console.log('Verificando conexão com:', `${API_URL}/health`);
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      console.log('Resposta da API:', response.data);
      setIsConnected(true);
      setLastChecked(new Date().toLocaleTimeString());
      toast.success("Conectado ao banco de dados PostgreSQL");
    } catch (error) {
      console.error("Erro de conexão com o banco de dados:", error);
      setIsConnected(false);
      setLastChecked(new Date().toLocaleTimeString());
      toast.error("Falha na conexão com o PostgreSQL");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 2 minutes instead of 5
    const interval = setInterval(checkConnection, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    toast.info("Tentando reconectar ao PostgreSQL...");
    checkConnection();
  };

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
      {isConnected === null ? (
        <Button variant="ghost" size="sm" disabled className="text-xs">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Verificando conexão...
        </Button>
      ) : isConnected ? (
        <Button variant="ghost" size="sm" className="text-xs text-green-600" onClick={handleRetry} disabled={checking}>
          <Database className="h-3 w-3 mr-1" />
          Conectado ao PostgreSQL {lastChecked && `(Verificado: ${lastChecked})`}
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="text-xs text-red-600" onClick={handleRetry} disabled={checking}>
          <WifiOff className="h-3 w-3 mr-1" />
          Desconectado do PostgreSQL
          {checking ? <RefreshCw className="h-3 w-3 ml-1 animate-spin" /> : null}
          {lastChecked && ` (Última tentativa: ${lastChecked})`}
        </Button>
      )}
    </div>
  );
};

export default ServerConnectionStatus;
