"use client";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { type InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type * as React from "react";
import { cn } from "@/lib/utils";

const theme = {
  paragraph: "mb-2",
  heading: { h1: "text-2xl font-semibold", h2: "text-xl font-semibold", h3: "text-lg font-semibold" },
  list: { ul: "ml-4 list-disc", ol: "ml-4 list-decimal" },
  quote: "border-l-2 border-border pl-3 text-muted-foreground",
  link: "text-primary underline",
  text: { bold: "font-semibold", italic: "italic" },
};

const nodes = [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode];

export type RichTextEditorProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** The stored editor state JSON the editor starts from. @default an empty document */
  defaultValue?: string;
  /** Called with the editor state JSON on every change. */
  onValueChange?: (value: string) => void;
};

/** The app's one rich text editor. A surface composes its toolbar, content and plugins as children. */
function RichTextEditor({ defaultValue, onValueChange, className, children, ...props }: RichTextEditorProps) {
  const initialConfig: InitialConfigType = {
    namespace: "RichTextEditor",
    theme,
    nodes,
    editorState: defaultValue || undefined,
    onError: (error) => {
      throw error;
    },
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div data-slot="rich-text-editor" className={cn("flex min-h-0 flex-col rounded-md border", className)} {...props}>
        {children}
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      {onValueChange ? (
        <OnChangePlugin ignoreSelectionChange onChange={(editorState) => onValueChange(JSON.stringify(editorState.toJSON()))} />
      ) : null}
    </LexicalComposer>
  );
}

export type RichTextEditorToolbarProps = React.ComponentProps<"div">;

/** The editor's static header: the surface's toolbar controls. */
function RichTextEditorToolbar({ className, ...props }: RichTextEditorToolbarProps) {
  return <div data-slot="rich-text-editor-toolbar" className={cn("flex gap-1 border-b p-1", className)} {...props} />;
}

export type RichTextEditorContentProps = React.ComponentProps<"div"> & {
  /** The accessible name of the editable region. */
  label: string;
};

/** The editable region: the only part of the editor that scrolls. */
function RichTextEditorContent({ label, className, ...props }: RichTextEditorContentProps) {
  return (
    <div data-slot="rich-text-editor-content" className={cn("relative min-h-0 flex-1 overflow-y-auto", className)} {...props}>
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label={label} className="min-h-full p-3 text-sm outline-none" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  );
}

export { RichTextEditor, RichTextEditorContent, RichTextEditorToolbar };
