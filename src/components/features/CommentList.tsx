import React from 'react';
import { Copy, Check } from 'lucide-react';

interface GeneratedComment {
  id: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface CommentListProps {
  comments: GeneratedComment[];
  copiedId: number | null;
  onCopy: (text: string, id: number) => void;
  isLoading: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  copiedId,
  onCopy,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">3. Generierten Kommentar auswählen</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {comments.map(comment => (
          <div key={comment.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <p className={`text-sm p-2 rounded ${
                  comment.sentiment === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : comment.sentiment === 'neutral'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {comment.text}
                </p>
              </div>
              <button
                onClick={() => onCopy(comment.text, comment.id)}
                className="ml-2 p-1.5 rounded-full hover:bg-gray-100"
              >
                {copiedId === comment.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && !isLoading && (
          <div className="p-4 text-center text-gray-500">
            Wählen Sie ein Kundenprofil aus und fügen Sie einen LinkedIn Beitrag ein, um Kommentare zu generieren.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList; 