"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode; 
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-gray-200 transition ${
      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isHTMLMode, setIsHTMLMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: content,
    // --- PEMBETULAN DISINI ---
    immediatelyRender: false, 
    // -------------------------
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4 max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content bila mode bertukar
  useEffect(() => {
    if (editor && content && !isHTMLMode) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor, isHTMLMode]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Masukkan URL Gambar:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL Pautan:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      
      {/* --- TOOLBAR --- */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center">
        
        {/* Toggle HTML Mode */}
        <button
          type="button"
          onClick={() => setIsHTMLMode(!isHTMLMode)}
          className={`px-3 py-1.5 text-xs font-bold rounded border transition mr-2 ${
            isHTMLMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {isHTMLMode ? '</> Visual Editor' : '</> HTML Source'}
        </button>

        {!isHTMLMode && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
              <span className="font-bold">B</span>
            </MenuButton>
            
            <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
              <span className="italic">I</span>
            </MenuButton>

            <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
              <span className="underline">U</span>
            </MenuButton>

            <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
              <span className="line-through">S</span>
            </MenuButton>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">
              <span className="font-bold text-sm">H2</span>
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3">
              <span className="font-bold text-xs">H3</span>
            </MenuButton>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
              List
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
              1.2.
            </MenuButton>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Link">
              🔗
            </MenuButton>
            <MenuButton onClick={addImage} title="Insert Image">
              🖼️
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line">
              ➖
            </MenuButton>
          </>
        )}
      </div>

      {/* --- EDITOR CONTENT AREA --- */}
      {isHTMLMode ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[300px] p-4 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none"
          placeholder="Taip HTML di sini..."
        />
      ) : (
        <div className="bg-white min-h-[300px] cursor-text" onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} />
        </div>
      )}
      
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
        <span>{editor.storage.characterCount?.words?.() || 0} words</span>
        <span>{isHTMLMode ? 'Mode: HTML Code' : 'Mode: Visual Editor'}</span>
      </div>
    </div>
  );
}