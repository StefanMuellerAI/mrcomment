import React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LegalModalProps {
  title: string;
  content: React.ReactNode | string;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, content, onClose }) => {
  // Prüfen, ob der Inhalt ein String oder ReactNode ist
  const isMarkdownContent = typeof content === 'string';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            {isMarkdownContent ? (
              // Wenn es sich um Markdown-Text handelt, rendern wir ihn mit ReactMarkdown
              <ReactMarkdown>{content as string}</ReactMarkdown>
            ) : (
              // Andernfalls geben wir den ReactNode direkt aus
              content
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalModal; 