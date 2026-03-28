'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useState, useCallback } from 'react';

interface TiptapEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-xs font-mono transition-colors select-none
        ${active
          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
          : 'text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-5 bg-[rgba(255,255,255,0.08)] mx-1" />;
}

// ─── Link Dialog ──────────────────────────────────────────────────────────────
function LinkDialog({
  onConfirm,
  onClose,
  initial,
}: {
  onConfirm: (url: string) => void;
  onClose: () => void;
  initial?: string;
}) {
  const [url, setUrl] = useState(initial ?? '');
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-[#0c0c1e] border border-neon-cyan/30 rounded shadow-lg p-3 min-w-[280px]">
      <p className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-2">Bağlantı URL</p>
      <div className="flex gap-2">
        <input
          type="url"
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onConfirm(url); }
            if (e.key === 'Escape') onClose();
          }}
          placeholder="https://..."
          className="flex-1 bg-[#0a0a14] border border-[rgba(0,255,247,0.15)] rounded px-2 py-1.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/40"
        />
        <button
          type="button"
          onClick={() => onConfirm(url)}
          className="px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded font-mono text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
        >
          Ekle
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-2 py-1.5 border border-[rgba(255,255,255,0.08)] rounded font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Image Dialog ─────────────────────────────────────────────────────────────
function ImageDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: (url: string, alt: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-[#0c0c1e] border border-neon-cyan/30 rounded shadow-lg p-3 min-w-[300px]">
      <p className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-2">Görsel Ekle</p>
      <div className="space-y-2">
        <input
          type="url"
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-[#0a0a14] border border-[rgba(0,255,247,0.15)] rounded px-2 py-1.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/40"
        />
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt metin (isteğe bağlı)"
          className="w-full bg-[#0a0a14] border border-[rgba(0,255,247,0.15)] rounded px-2 py-1.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/40"
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); if (url) onConfirm(url, alt); }
            if (e.key === 'Escape') onClose();
          }}
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-[rgba(255,255,255,0.08)] rounded font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={() => { if (url) onConfirm(url, alt); }}
            disabled={!url}
            className="px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded font-mono text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors disabled:opacity-40"
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export function TiptapEditor({ value, onChange, placeholder = 'İçeriği buraya yazın...' }: TiptapEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: 'language-' },
      }),
      TiptapImage.configure({ allowBase64: false, inline: false }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Markdown.configure({ html: false, tightLists: true, breaks: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown() as string;
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none',
        spellcheck: 'false',
      },
    },
  });

  // Sync external value changes (e.g. insert comparison template)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.storage.markdown.getMarkdown() as string;
    if (current !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetLink = useCallback((url: string) => {
    setShowLinkDialog(false);
    if (!editor) return;
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleInsertImage = useCallback((url: string, alt: string) => {
    setShowImageDialog(false);
    if (!editor) return;
    editor.chain().focus().setImage({ src: url, alt }).run();
  }, [editor]);

  if (!editor) return null;

  const chars = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className="rounded-lg border border-[rgba(0,255,247,0.15)] bg-[#0a0a14] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-[rgba(0,255,247,0.1)] bg-[#0c0c1a]">
        {/* Text formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Kalın (Ctrl+B)">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="İtalik (Ctrl+I)">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Üstü çizili">
          <s>S</s>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Satır içi kod">
          {'`'}
        </ToolbarBtn>

        <ToolbarSep />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Başlık 1">
          H1
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Başlık 2">
          H2
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Başlık 3">
          H3
        </ToolbarBtn>

        <ToolbarSep />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Madde listesi">
          •—
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numaralı liste">
          1.
        </ToolbarBtn>

        <ToolbarSep />

        {/* Blocks */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Alıntı">
          "
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Kod bloğu">
          {'</>'}
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Yatay çizgi">
          —
        </ToolbarBtn>

        <ToolbarSep />

        {/* Insert */}
        <div className="relative">
          <ToolbarBtn onClick={() => { setShowImageDialog((s) => !s); setShowLinkDialog(false); }} active={showImageDialog} title="Görsel ekle">
            🖼
          </ToolbarBtn>
          {showImageDialog && (
            <ImageDialog
              onConfirm={handleInsertImage}
              onClose={() => setShowImageDialog(false)}
            />
          )}
        </div>

        <div className="relative">
          <ToolbarBtn
            onClick={() => { setShowLinkDialog((s) => !s); setShowImageDialog(false); }}
            active={editor.isActive('link') || showLinkDialog}
            title="Bağlantı ekle"
          >
            🔗
          </ToolbarBtn>
          {showLinkDialog && (
            <LinkDialog
              initial={editor.getAttributes('link').href ?? ''}
              onConfirm={handleSetLink}
              onClose={() => setShowLinkDialog(false)}
            />
          )}
        </div>

        <ToolbarSep />

        {/* Undo / Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Geri al">
          ↩
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Yinele">
          ↪
        </ToolbarBtn>
      </div>

      {/* Bubble menu (selected text toolbar) */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
        className="flex items-center gap-0.5 px-2 py-1.5 bg-[#0c0c1e] border border-[rgba(0,255,247,0.25)] rounded shadow-lg"
      >
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <s>S</s>
        </ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          H2
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          H3
        </ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn
          onClick={() => {
            const href = editor.getAttributes('link').href;
            if (href) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkDialog(true);
            }
          }}
          active={editor.isActive('link')}
        >
          🔗
        </ToolbarBtn>
      </BubbleMenu>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="px-4 py-4 min-h-[380px] cursor-text"
        onClick={() => editor.commands.focus()}
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[rgba(0,255,247,0.06)] bg-[#0c0c1a] flex justify-between items-center">
        <p className="font-mono text-[10px] text-gray-700">
          Markdown destekli · Görsel ve bağlantı eklemek için araç çubuğunu kullanın
        </p>
        <p className="font-mono text-[10px] text-gray-700">
          {chars.toLocaleString()} karakter
        </p>
      </div>
    </div>
  );
}
