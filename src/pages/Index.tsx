
import ChecklistForm from "@/components/ChecklistForm";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <Toaster />
      <ChecklistForm />
    </div>
  );
};

export default Index;
