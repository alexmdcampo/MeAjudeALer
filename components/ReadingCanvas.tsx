import { ReactNode, RefObject, MouseEvent, TouchEvent, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Maximize, Minimize } from "lucide-react";
import { formatText } from "@/lib/utils/format-text";
import { cn } from "./cn";
import TurndownService from "turndown";
// @ts-ignore
import { gfm } from "turndown-plugin-gfm";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ReadingCanvasProps {
  rulerPosition: number;
  showRuler: boolean;
  outputRef: RefObject<HTMLDivElement | null>;
  onMouseMove: (e: MouseEvent) => void;
  onMouseLeave: () => void;
  onTouchMove: (e: TouchEvent) => void;
  fontValue: string;
  children: string | ReactNode;
  formattingOptions?: {
    keepBold?: boolean;
    keepTables?: boolean;
    keepTopics?: boolean;
  };
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

turndownService.use(gfm);

export const ReadingCanvas = ({
  rulerPosition,
  showRuler,
  outputRef,
  onMouseMove,
  onMouseLeave,
  onTouchMove,
  fontValue,
  children,
  formattingOptions = { keepBold: true, keepTables: true, keepTopics: true },
}: ReadingCanvasProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!outputRef.current) return;

    if (!document.fullscreenElement) {
      outputRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes (e.g., Esc key)
  const onFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("fullscreenchange", onFullscreenChange);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      }
    };
  }, []);

  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  const getMarkdown = (input: string | ReactNode) => {
    if (typeof input !== "string") return "";
    if (input.includes("<p>") || input.includes("<table>") || input.includes("<strong>")) {
      try {
        const cleanHtml = input.replace(/>\s+</g, '><');
        return turndownService.turndown(cleanHtml);
      } catch (e) {
        console.error("Turndown error:", e);
        return input;
      }
    }
    return formatText(input, formattingOptions);
  };

  const textContent = getMarkdown(children);

  // Componente de Linha simplificado que agora confia no CSS para numeração
  const NumberedLine = ({ children, index, isListItem }: { children: ReactNode, index?: number, isListItem?: boolean }) => {
    const isActive = activeLineIndex === index;
    
    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if (index !== undefined) setActiveLineIndex(index);
        }}
        className={cn(
          "line-item group relative flex items-start transition-colors rounded-r-lg min-h-[1.5em]",
          isActive ? "bg-blue-50/40" : "hover:bg-amber-100/40"
          // isListItem && "ml-6" // Removido para manter número colado à esquerda
        )}
      >
        {/* Marcador Bolinha Azul */}
        <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-4 flex justify-center z-20 pointer-events-none">
          {isActive && (
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
          )}
        </div>

        {/* Bullet Manual para Listas (já que o wrapper quebra o li nativo) */}
        {isListItem && (
          <div className="absolute left-[-4px] top-[14px] w-2 h-2 rounded-full bg-amber-400/60" />
        )}

        {/* Conteúdo da Linha */}
        <div className={cn("pl-4 py-1 flex-1", isListItem && "ml-6")}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={outputRef}
      className={cn(
        "relative overflow-hidden rounded-xl cursor-crosshair shadow-inner transition-all duration-300",
        isFullscreen ? "fixed inset-0 h-screen w-screen rounded-none z-[100]" : "h-96"
      )}
      style={{ backgroundColor: "#f5f5dc", border: "2px solid #e5e5ca" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseLeave}
      onClick={() => setActiveLineIndex(null)}
    >
      {/* Fullscreen Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className={cn(
          "p-2 bg-amber-100/80 backdrop-blur-sm hover:bg-amber-200 rounded-full transition-colors z-[110] shadow-sm border border-amber-200",
          isFullscreen ? "fixed top-4 right-4" : "absolute top-4 right-4"
        )}
        title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5 text-amber-700" />
        ) : (
          <Maximize className="w-5 h-5 text-amber-700" />
        )}
      </button>

      {/* Reading Ruler */}
      {showRuler && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-[105] transition-all duration-75"
          style={{
            top: `${rulerPosition}px`,
            height: "40px",
            backgroundColor: "rgba(255, 215, 0, 0.25)",
            boxShadow: "0 0 8px rgba(255, 215, 0, 0.4)",
            transform: "translateY(-20px)",
            width: "100%"
          }}
        />
      )}

      {/* Main Container with Gutter Layout */}
      <div className="h-full overflow-y-auto w-full custom-scrollbar">
        <div className={cn(
          "relative flex min-h-full",
          isFullscreen ? "px-[1vw] py-[8vh]" : "p-0"
        )}>
          {/* Notepad++ Style Gutter */}
          <div className="w-12 border-r border-amber-200/50 flex flex-col items-end pr-3 pt-0 text-amber-600/40 select-none font-mono text-[11px] sticky left-0 h-full bg-[#f5f5dc]/80 backdrop-blur-sm z-10"
               style={{ counterReset: 'line' }}>
          </div>

          {/* Text Content */}
          <div
            className="flex-1 pl-4"
            style={{
              fontFamily: fontValue,
              fontSize: isFullscreen ? "clamp(18px, 1.8vw, 24px)" : "18px",
              lineHeight: "2",
              letterSpacing: "0.1em",
              color: "#333",
              maxWidth: isFullscreen ? "92%" : "80ch",
              wordWrap: "break-word",
              counterReset: 'line'
            }}
          >
            {typeof children === "string" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children, ...props }) => {
                    const idx = (props as any).node.position?.start.line;
                    return <NumberedLine index={idx}><p className="mb-2 text-justify">{children}</p></NumberedLine>;
                  },
                  li: ({ children, ...props }) => {
                    const idx = (props as any).node.position?.start.line;
                    return <NumberedLine index={idx} isListItem={true}><div>{children}</div></NumberedLine>;
                  },
                  ul: ({ children }) => <div className="mb-4">{children}</div>,
                  ol: ({ children }) => <div className="mb-4 list-decimal">{children}</div>,
                  h1: ({ children, ...props }) => {
                    const idx = (props as any).node.position?.start.line;
                    return <NumberedLine index={idx}><h1 className="text-4xl font-bold mb-4 mt-8 text-amber-900">{children}</h1></NumberedLine>;
                  },
                  h2: ({ children, ...props }) => {
                    const idx = (props as any).node.position?.start.line;
                    return <NumberedLine index={idx}><h2 className="text-3xl font-bold mb-3 mt-6 text-amber-800">{children}</h2></NumberedLine>;
                  },
                  h3: ({ children, ...props }) => {
                    const idx = (props as any).node.position?.start.line;
                    return <NumberedLine index={idx}><h3 className="text-2xl font-bold mb-2 mt-4 text-amber-800">{children}</h3></NumberedLine>;
                  },
                  strong: ({ children }) => <strong className="font-bold text-amber-950 bg-amber-100/50 px-1 rounded">{children}</strong>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border-2 border-amber-200 rounded-xl">
                      <table className="min-w-full divide-y divide-amber-200">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-amber-100/50">{children}</thead>,
                  th: ({ children }) => <th className="px-6 py-4 text-left font-bold text-amber-900 border-b border-amber-200">{children}</th>,
                  td: ({ children }) => <td className="px-6 py-4 border-b border-amber-100">{children}</td>,
                  tr: ({ children }) => <tr className="hover:bg-amber-50/50 transition-colors normal-case">{children}</tr>
                }}
              >
                {textContent}
              </ReactMarkdown>
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .line-item {
          counter-increment: line;
        }
        /* Prevents double numbering when elements are nested (like p inside li) */
        .line-item .line-item {
          counter-increment: none !important;
        }
        .line-item::before {
          content: counter(line);
          position: absolute;
          left: -44px;
          width: 30px;
          text-align: right;
          font-family: monospace;
          font-size: 11px;
          color: rgba(180, 83, 9, 0.4);
          padding-top: 6px;
          pointer-events: none;
        }
        .line-item .line-item::before {
          display: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5dc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5ca;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d5d5ba;
        }
      `}</style>
    </div>
  );
};
