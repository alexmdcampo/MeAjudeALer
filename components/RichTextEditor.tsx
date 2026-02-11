"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { useEffect } from "react";
import { 
  Bold, Italic, List, ListOrdered, Underline as UnderlineIcon, 
  Table as TableIcon, Link as LinkIcon, Undo, Redo 
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({ content, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded hover:bg-amber-100 transition-colors ${
        isActive ? "bg-amber-200 text-amber-900" : "text-amber-700"
      }`}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );

  return (
    <div className={`border-2 border-amber-200 rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors ${disabled ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      {!disabled && (
        <div className="bg-amber-50 border-b border-amber-100 p-2 flex flex-wrap gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Sublinhado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>
          <div className="w-px h-6 bg-amber-200 mx-1" />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Lista"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
          <div className="w-px h-6 bg-amber-200 mx-1" />
          <MenuButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Inserir Tabela"
          >
            <TableIcon className="w-4 h-4" />
          </MenuButton>
          <div className="w-px h-6 bg-amber-200 mx-1" />
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Desfazer"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Refazer"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>
      )}
      <div className="p-4 h-[400px] overflow-y-auto w-full">
        <EditorContent 
          editor={editor} 
          className="prose prose-amber max-w-none focus:outline-none"
        />
      </div>
      
      <style jsx global>{`
        .tiptap table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .tiptap table td,
        .tiptap table th {
          min-width: 1em;
          border: 1px solid #fed7aa;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .tiptap table th {
          font-weight: bold;
          text-align: left;
          background-color: #fff7ed;
        }
        .tiptap .selectedCell:after {
          z-index: 2;
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        .tiptap .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
        .tiptap p {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        .tiptap ul, .tiptap ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
