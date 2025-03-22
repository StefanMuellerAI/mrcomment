import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  itemToDelete: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  title,
  message,
  itemToDelete,
  isDeleting,
  onCancel,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4 text-yellow-600">
            <AlertTriangle size={48} />
          </div>
          <p className="text-gray-700 mb-2">
            {message}
          </p>
          <p className="font-medium text-gray-900 mb-4">
            {itemToDelete}
          </p>
          <p className="text-red-600 text-sm">
            ACHTUNG: Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Löschen...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 