
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings, ClipboardList, FileDown } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#8B0000]">Sistema de Checklist</h1>
          <p className="mt-2 text-gray-600">Escolha uma opção para continuar</p>
        </div>
        
        <div className="space-y-4">
          <Link to="/checklist" className="w-full">
            <Button 
              className="w-full h-14 bg-[#8B0000] hover:bg-[#6B0000] text-lg flex justify-between items-center"
            >
              <span>Iniciar Checklist</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/history" className="w-full">
            <Button 
              className="w-full h-14 bg-[#3B82F6] hover:bg-[#2563EB] text-lg flex justify-between items-center"
            >
              <span className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Histórico de Checklists
              </span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
          
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
        </div>
      </div>
    </div>
  );
};

export default Index;
