import React from 'react';
import { MessageCircle, Trash, Loader2 } from 'lucide-react';

interface UserUsage {
  customer_count: number;
  max_customers: number;
  weekly_generations: number;
  weekly_generations_limit: number;
  can_create_customer: boolean;
  can_generate_comments: boolean;
}

interface LinkedInPostEditorProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onGenerate: () => void;
  userUsage: UserUsage | null;
  isCustomerSelected: boolean;
  isLoading: boolean;
}

const LinkedInPostEditor: React.FC<LinkedInPostEditorProps> = ({
  value,
  onChange,
  onClear,
  onGenerate,
  userUsage,
  isCustomerSelected,
  isLoading
}) => {
  const isPostValid = value.trim().length >= 300;
  const canGenerateComments = isCustomerSelected && isPostValid && !isLoading;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">2. LinkedIn Beitrag einfügen</h2>
        {userUsage && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Generierungen diese Woche:</span>
              <span className={userUsage.weekly_generations >= userUsage.weekly_generations_limit ? 'text-red-600 font-bold' : ''}>
                {userUsage.weekly_generations} / {userUsage.weekly_generations_limit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Angelegte Kunden:</span>
              <span className={userUsage.customer_count >= userUsage.max_customers ? 'text-red-600 font-bold' : ''}>
                {userUsage.customer_count} / {userUsage.max_customers}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col h-[calc(100vh-16rem)]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 w-full resize-none rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 mb-2 px-3 py-2"
          placeholder="Fügen Sie hier den LinkedIn Beitrag ein..."
        />
        <div className="mb-4 text-sm">
          {!isCustomerSelected ? (
            <p className="text-amber-600">Bitte wählen Sie zuerst ein Kundenprofil aus.</p>
          ) : !value.trim() ? (
            <p className="text-amber-600">Bitte fügen Sie einen LinkedIn Beitrag hinzu.</p>
          ) : !isPostValid ? (
            <p className="text-amber-600">Der LinkedIn Beitrag muss mindestens 300 Zeichen lang sein (aktuell: {value.length} Zeichen).</p>
          ) : (
            <p className="text-green-600">Alles bereit! Sie können jetzt Kommentare generieren.</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onGenerate}
            disabled={!canGenerateComments}
            className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Generiere Kommentare...' : 'Kommentare generieren'}
          </button>
          <button
            onClick={onClear}
            className="flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPostEditor; 