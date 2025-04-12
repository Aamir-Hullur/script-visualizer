import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  language: 'python' | 'r';
  code: string;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ language, code, onChange }: CodeEditorProps) {
  return (
    <div className="h-[678px] border rounded-xs">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}

