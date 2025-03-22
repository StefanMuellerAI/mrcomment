import React from 'react';
import { Plus, Trash } from 'lucide-react';

interface CustomerFormData {
  name: string;
  style_analysis: string;
  linkedin_examples: string[];
}

interface CustomerFormProps {
  data: CustomerFormData;
  errors: string[];
  isLoading: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (data: CustomerFormData) => void;
  onAddExample: () => void;
  onRemoveExample: (index: number) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  data,
  errors,
  isLoading,
  isEditing,
  onClose,
  onSave,
  onChange,
  onAddExample,
  onRemoveExample
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isEditing ? 'Kundenprofil bearbeiten' : 'Neues Kundenprofil'}
          </h2>
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-sm text-red-600">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                placeholder="Name des Kunden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Beispiele
              </label>
              <div className="space-y-2">
                {data.linkedin_examples.map((example, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={example}
                      onChange={(e) => {
                        const newExamples = [...data.linkedin_examples];
                        newExamples[index] = e.target.value;
                        onChange({ ...data, linkedin_examples: newExamples });
                      }}
                      className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 px-3 py-2"
                      placeholder={`LinkedIn Beispiel ${index + 1}`}
                      required
                    />
                    {index >= 3 && (
                      <button
                        onClick={() => onRemoveExample(index)}
                        className="self-start p-2 text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={onAddExample}
                  type="button"
                  className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Weiteres Beispiel hinzufügen
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Abbrechen
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm; 