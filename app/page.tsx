"use client";

import { useState } from "react";
import { BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/components/cn";
import { ToggleExpand } from "@/components/ToggleExpand";
import { FileUploader } from "@/components/FileUploader";
import { FontSelector } from "@/components/FontSelector";
import { Header } from "@/components/Header";
import { FeaturesInfo } from "@/components/FeaturesInfo";
import { ReadingCanvas } from "@/components/ReadingCanvas";
import { useReadingRuler } from "@/hooks/useReadingRuler";

export default function DyslexiaReader() {
  const [inputText, setInputText] = useState("<p></p>");
  const [inputTextDisable, setInputTextDisable] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedFont, setSelectedFont] = useState("OpenDyslexic");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattingOptions, setFormattingOptions] = useState({
    keepBold: true,
    keepTables: true,
    keepTopics: true,
  });

  const {
    rulerPosition,
    showRuler,
    outputRef,
    handleMouseMove,
    handleMouseLeave,
    handleTouchMove,
  } = useReadingRuler();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header pdfFile={pdfFile} />
        {/* Main Content */}
        <div
          className={cn(
            "flex flex-col md:grid md:grid-cols-2 gap-6",
            isExpanded && "md:grid-cols-1",
          )}
        >
          {/* Input Section */}

          {!isExpanded && (
            <FileUploader
              inputText={inputText}
              setInputText={setInputText}
              inputTextDisable={inputTextDisable}
              setInputTextDisable={setInputTextDisable}
              setPdfFile={setPdfFile}
              loading={loading}
              setLoading={setLoading}
              setIsExpanded={setIsExpanded}
            />
          )}

          {/* Output Section with Ruler */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between mb-4 ">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Leitura Facilitada
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-4 border-r pr-4 border-amber-100 italic text-xs text-amber-800">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formattingOptions.keepBold}
                      onChange={(e) => setFormattingOptions({...formattingOptions, keepBold: e.target.checked})}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    Negrito
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formattingOptions.keepTables}
                      onChange={(e) => setFormattingOptions({...formattingOptions, keepTables: e.target.checked})}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    Tabelas
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formattingOptions.keepTopics}
                      onChange={(e) => setFormattingOptions({...formattingOptions, keepTopics: e.target.checked})}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    Tópicos
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <FontSelector
                    selectedFont={selectedFont}
                    setSelectedFont={setSelectedFont}
                  />
                  <ToggleExpand
                    toggleExpand={toggleExpand}
                    isExpanded={isExpanded}
                  />
                </div>
              </div>
            </div>
            <ReadingCanvas
              rulerPosition={rulerPosition}
              showRuler={showRuler}
              fontValue={selectedFont || '"OpenDyslexic", sans-serif'}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              outputRef={outputRef}
              formattingOptions={formattingOptions}
            >
              {inputText || (
                <span className="text-gray-500 italic">
                  Seu texto aparecerá aqui...
                </span>
              )}
            </ReadingCanvas>
            <p className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>
                Mova o mouse ou toque na tela para ativar a régua de leitura
              </span>
            </p>
          </div>
        </div>

        {/* Features Info */}
        <FeaturesInfo />
      </div>
    </div>
  );
}
