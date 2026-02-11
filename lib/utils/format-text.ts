interface FormatOptions {
  keepBold?: boolean;
  keepTables?: boolean;
  keepTopics?: boolean;
}

/**
 * Formata o texto para melhor legibilidade, adicionando espaços entre parágrafos,
 * detectando tópicos (listas) e tabelas.
 */
export function formatText(text: string, options: FormatOptions = {}): string {
  if (!text) return "";

  const { keepBold = true, keepTables = true, keepTopics = true } = options;

  // 1. Limpeza básica: remove espaços duplos e garante quebras de linha consistentes
  let processed = text.replace(/[ \t]+/g, " ");

  // 2. Remove hifenização em quebras de linha (comum em PDFs)
  processed = processed.replace(/-[ ]*\n[ ]*/g, "");

  // 3. Detecção de Negrito (se habilitado)
  // Alguns PDFs extraem negrito como termos cercados por espaços extras ou em linhas separadas.
  // Aqui apenas garantimos que se o texto já tiver markdown, ele seja respeitado.

  // 4. Detecção de Tabelas (Simples - se habilitado)
  if (keepTables) {
    // Tenta identificar linhas que parecem colunas separadas por múltiplos espaços
    // e as converte para o formato de tabela Markdown
    processed = processed.replace(/^(.+ {3,}.+)$/gm, (match) => {
      const columns = match.split(/ {2,}/).filter(Boolean);
      if (columns.length > 1) {
        return "| " + columns.join(" | ") + " |";
      }
      return match;
    });
  }

  // 5. Tenta detectar tópicos que começam com caracteres comuns
  if (keepTopics) {
    processed = processed.replace(/^(\s*)[•●○*]\s*/gm, "- ");
    processed = processed.replace(/^(\s*)(\d+)[.)]\s+/gm, "$1$2. ");
  }

  // 6. Organização de parágrafos
  const lines = processed.split(/\r?\n/);
  const result: string[] = [];
  let currentParagraph = "";
  let isInTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (currentParagraph) {
        result.push(currentParagraph);
        currentParagraph = "";
      }
      isInTable = false;
      continue;
    }

    // Lógica para Tabelas
    if (line.startsWith("|") && line.endsWith("|")) {
      if (currentParagraph) {
        result.push(currentParagraph);
        currentParagraph = "";
      }
      if (!isInTable) {
        // Adiciona o separador de header do markdown se for o início da tabela
        const colCount = line.split("|").length - 2;
        result.push(line);
        result.push("| " + Array(colCount).fill("---").join(" | ") + " |");
        isInTable = true;
      } else {
        result.push(line);
      }
      continue;
    }

    // Se a linha começa com um marcador de lista
    if (line.match(/^[-*\d+.]/) && keepTopics) {
      if (currentParagraph) {
        result.push(currentParagraph);
        currentParagraph = "";
      }
      result.push(line);
      isInTable = false;
      continue;
    }

    // Concatenação de parágrafos
    if (currentParagraph) {
      const lastChar = currentParagraph.trim().slice(-1);
      const isSentenceEnd = /[.!?:]/.test(lastChar);
      
      if (isSentenceEnd && line.length > 0 && line[0] === line[0].toUpperCase()) {
        result.push(currentParagraph);
        currentParagraph = line;
      } else {
        currentParagraph += " " + line;
      }
    } else {
      currentParagraph = line;
    }
    isInTable = false;
  }

  if (currentParagraph) {
    result.push(currentParagraph);
  }

  return result.join("\n\n");
}
