
import React, { useState, useEffect } from 'react';
import { 
  Command, 
  CommandDialog,
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Operator } from '@/types/checklist';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface OperatorSearchCommandProps {
  onSelect: (operator: Operator) => void;
  operators: Operator[];
}

const OperatorSearchCommand: React.FC<OperatorSearchCommandProps> = ({ 
  onSelect,
  operators 
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Operator[]>([]);

  // Update results when operators prop changes or query changes
  useEffect(() => {
    if (query) {
      // Filter operators based on query
      const filteredResults = operators.filter(operator => 
        operator.name.toLowerCase().includes(query.toLowerCase()) || 
        operator.id.toLowerCase().includes(query.toLowerCase()) || 
        operator.sector.toLowerCase().includes(query.toLowerCase()) ||
        (operator.role && operator.role.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filteredResults.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      // Ensure operators are always sorted alphabetically
      setResults([...operators].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [query, operators]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (operator: Operator) => {
    onSelect(operator);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-between text-left font-normal border border-input px-3 py-2 h-10"
        onClick={() => setOpen(true)}
      >
        <span className="text-muted-foreground">
          Pesquisar operadores...
        </span>
        <Search className="h-4 w-4 text-muted-foreground" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Pesquisar operadores por nome, matrícula, setor ou função..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Nenhum operador encontrado.</CommandEmpty>
            <CommandGroup heading="Operadores">
              {results.map((operator) => (
                <CommandItem
                  key={operator.id}
                  value={`${operator.name}-${operator.id}`}
                  onSelect={() => handleSelect(operator)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{operator.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Matrícula: {operator.id} | Setor: {operator.sector}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default OperatorSearchCommand;
