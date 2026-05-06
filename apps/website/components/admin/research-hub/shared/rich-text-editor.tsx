"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  height?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  className,
  editable = true,
  height = "300px",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none",
          "prose-headings:font-bold prose-headings:text-gray-900",
          "prose-p:text-gray-700 prose-p:leading-relaxed",
          "prose-ul:marker:text-gray-500 prose-li:marker:text-gray-500",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
          "min-h-[200px] p-4 focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 rounded-lg border border-gray-200"
      ),
    },
    },
  });

  const addLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const addImage = (url: string) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      addImage(url);
    }
  };

  if (!editor) {
    return (
      <div className={cn("border rounded-lg p-4 animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "p-2",
                editor.isActive("bold") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "p-2",
                editor.isActive("italic") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                "p-2",
                editor.isActive("strike") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                "p-2",
                editor.isActive("code") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                "p-2",
                editor.isActive("heading", { level: 1 }) && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                "p-2",
                editor.isActive("heading", { level: 2 }) && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                "p-2",
                editor.isActive("heading", { level: 3 }) && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                "p-2",
                editor.isActive("bulletList") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                "p-2",
                editor.isActive("orderedList") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                "p-2",
                editor.isActive("blockquote") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>

          {/* Links & Images */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(!showLinkDialog)}
              className={cn(
                "p-2",
                editor.isActive("link") && "bg-gray-200"
              )}
              disabled={!editable}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertImage}
              className="p-2"
              disabled={!editable}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* History */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2"
              disabled={!editor.can().undo() || !editable}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2"
              disabled={!editor.can().redo() || !editable}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Clear Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().clearNodes().run()}
            className="p-2"
            disabled={!editable}
          >
            Clear
          </Button>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addLink();
                  }
                }}
              />
              <Button size="sm" onClick={addLink}>
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="min-h-[200px] bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {editor.storage.characterCount?.characters() || 0} characters
          </span>
          <span>
            {editor.storage.characterCount?.words() || 0} words
          </span>
        </div>
      </div>
    </div>
  );
}

// Character count extension for Tiptap
import { Extension } from "@tiptap/core";

const CharacterCount = Extension.create({
  name: "characterCount",

  addStorage() {
    return {
      characters: () => 0,
      words: () => 0,
    };
  },

  onUpdate() {
    this.storage.characters = () => {
      return this.editor.getText().length;
    };
    this.storage.words = () => {
      return this.editor.getText().split(/\s+/).filter(word => word.length > 0).length;
    };
  },
});

// Updated RichTextEditor with character count
export function RichTextEditorWithCount(props: RichTextEditorProps) {
  return (
    <RichTextEditor
      {...props}
    />
  );
}
