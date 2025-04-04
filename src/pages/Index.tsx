
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const handleStartChecklist = () => {
    // Redirect to the equipment and operator selection page
    navigate('/select-checklist');
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#8B0000]">Sistema de Checklist</h1>
          <p className="mt-2 text-gray-600">Escolha uma opção para continuar</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleStartChecklist}
            className="w-full h-14 bg-[#8B0000] hover:bg-[#6B0000] text-lg flex justify-between items-center"
          >
            <span>Iniciar Checklist</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          <Link to="/admin-login" className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg border-gray-300 flex justify-between items-center"
            >
              <span className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Área Administrativa
              </span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/settings" className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg border-gray-300 flex justify-between items-center"
            >
              <span className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurações do Servidor
              </span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
