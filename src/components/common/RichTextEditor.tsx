import React from 'react';
// The legacy classic build is declared as `any` in src/ckeditor.d.ts
// to avoid the type incompatibility with @ckeditor/ckeditor5-react v11.
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write the answer here…',
  disabled = false,
}) => (
  <div className={`ck-wrapper${disabled ? ' ck-wrapper--disabled' : ''}`}>
    <CKEditor
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      editor={ClassicEditor}
      data={value}
      disabled={disabled}
      config={{ placeholder }}
      onChange={(_event, editor) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        onChange((editor as any).getData() as string);
      }}
    />
  </div>
);

export default RichTextEditor;
