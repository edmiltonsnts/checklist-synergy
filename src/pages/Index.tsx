
import ChecklistForm from "@/components/ChecklistForm";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-700">
      <Toaster />
      <ChecklistForm />
    </div>
  );
};

export default Index;
