import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Trash2, FileText, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface SavedFile {
  filename: string;
  name: string;
  createdAt: string;
}

interface SavedTextsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadText: (content: string) => void;
}

export function SavedTextsModal({ isOpen, onClose, onLoadText }: SavedTextsModalProps) {
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/texts');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFiles(data);
    } catch (e) {
      toast.error("Erro ao carregar textos salvos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const handleDelete = async (filename: string) => {
    if (!confirm("Tem certeza que deseja excluir este texto permanentemente?")) return;
    try {
      const res = await fetch(`/api/texts/${filename}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success("Texto excluído");
      fetchFiles();
    } catch {
      toast.error("Erro ao excluir texto");
    }
  };

  const handleLoad = async (filename: string) => {
    try {
      const res = await fetch(`/api/texts/${filename}`);
      if (!res.ok) throw new Error();
      const { content } = await res.json();
      onLoadText(content);
      onClose();
      toast.success("Texto carregado com sucesso!");
    } catch {
      toast.error("Erro ao carregar texto");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-amber-600" />
          Meus Textos Salvos
        </h2>
        <span className="text-sm text-gray-500">{files.length} textos encontrados</span>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
        </div>
      ) : (
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>Nenhum texto salvo ainda.</p>
              <p className="text-xs mt-2">Salve seus textos para acessá-los aqui depois.</p>
            </div>
          ) : (
            files.map((file) => (
              <div 
                key={file.filename} 
                className="group flex items-center justify-between p-4 bg-white hover:bg-amber-50 rounded-xl border border-gray-100 hover:border-amber-200 shadow-sm transition-all duration-200"
              >
                <button 
                  onClick={() => handleLoad(file.filename)} 
                  className="flex flex-col items-start gap-1 flex-1 text-left mr-4"
                >
                  <span className="font-semibold text-gray-800 group-hover:text-amber-800 transition-colors line-clamp-1 text-lg">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(file.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] uppercase tracking-wider">TXT</span>
                  </div>
                </button>
                
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleLoad(file.filename)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    Abrir
                  </button>
                  <button 
                    onClick={() => handleDelete(file.filename)} 
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors transform hover:scale-105" 
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
