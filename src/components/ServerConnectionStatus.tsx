
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, WifiOff, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '@/services/sqlServerService';

const ServerConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      await axios.get(`${API_URL}/health`);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {isConnected === null ? (
        <Button variant="ghost" size="sm" disabled className="text-xs">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Verificando conexão...
        </Button>
      ) : isConnected ? (
        <Button variant="ghost" size="sm" className="text-xs text-green-600" onClick={checkConnection} disabled={checking}>
          <Database className="h-3 w-3 mr-1" />
          Conectado ao SQL Server
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="text-xs text-red-600" onClick={checkConnection} disabled={checking}>
          <WifiOff className="h-3 w-3 mr-1" />
          Desconectado do SQL Server
        </Button>
      )}
    </div>
  );
};

export default ServerConnectionStatus;
