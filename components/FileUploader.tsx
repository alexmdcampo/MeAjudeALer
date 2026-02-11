import { validatePDF } from "@/lib/utils/validate-pdf";
import { toast } from "sonner";
import { ClearText } from "./ClearText";
import { FileText, Save, FolderOpen } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { SavedTextsModal } from "./SavedTextsModal";

interface FileUploaderProps {
  inputText: string;
  setInputText: Dispatch<SetStateAction<string>>;
  inputTextDisable: boolean;
  setInputTextDisable: Dispatch<SetStateAction<boolean>>;
  setPdfFile: Dispatch<SetStateAction<File | null>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

export function FileUploader({
  inputText,
  setInputText,
  inputTextDisable,
  setInputTextDisable,
  setPdfFile,
  loading,
  setLoading,
  setIsExpanded,
}: FileUploaderProps) {
  const [showSavedTexts, setShowSavedTexts] = useState(false);

  const clearText = () => {
    setInputTextDisable(false);
    setPdfFile(null);
    setInputText("<p></p>");
  };

  const handleSaveText = async () => {
    const name = prompt("Digite um nome para salvar o texto:");
    if (name === null) return; // Cancelado

    try {
      setLoading(true);
      const res = await fetch("/api/texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: inputText }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Erro ao salvar");
      }
      
      toast.success("Texto salvo com sucesso!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível salvar o texto.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedText = (content: string) => {
    setInputText(content);
    setInputTextDisable(true); // Bloqueia edição direta se quiser, ou deixa false
    setIsExpanded(true);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setLoading(true);

      const error = validatePDF(file);
      if (error) return toast.error(error);

      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/v1/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao extrair o texto do PDF");
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error("O PDF não tem texto");
      }

      // Converte o texto plano do PDF para HTML básico para o editor
      const htmlText = data.text.split('\n\n').map((p: string) => `<p>${p}</p>`).join('');
      setInputText(htmlText);
      setInputTextDisable(true);
      setPdfFile(file);
      setIsExpanded(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-wrap md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-700" />
          <h2 className="text-xl font-semibold text-gray-800">
            Texto Original
            <span className="block text-[10px] font-normal text-amber-600">
              (Edite o texto com formatação real: negrito, listas e tabelas)
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap flex-row-reverse gap-4">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedTexts(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              title="Meus Textos Salvos"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Meus Textos</span>
            </button>
            <button
              onClick={handleSaveText}
              disabled={!inputText || inputText === "<p></p>"}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Salvar Texto"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar</span>
            </button>
            
            <label
              className="flex-1 min-w-[140px] flex text-sm font-medium text-amber-900 whitespace-nowrap items-center justify-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
              htmlFor="pdf-upload"
            >
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {loading ? (
                "Processando..."
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  Anexar PDF
                </>
              )}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <ClearText onClear={clearText} />
          </div>
        </div>
      </div>
      
      <RichTextEditor 
        content={inputText} 
        onChange={setInputText} 
        disabled={inputTextDisable} 
      />
      
      <SavedTextsModal 
        isOpen={showSavedTexts} 
        onClose={() => setShowSavedTexts(false)} 
        onLoadText={loadSavedText} 
      />
    </div>
  );
}
