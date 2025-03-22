import React from 'react';
import { UserIcon, Check, Pencil, Trash, Plus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  selected: boolean;
  style_analysis: string;
  linkedin_examples: string[];
}

interface CustomerProfileListProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddCustomer: () => void;
}

const CustomerProfileList: React.FC<CustomerProfileListProps> = ({
  customers,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddCustomer
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">1. Kundenprofil auswählen</h2>
          <button
            onClick={onAddCustomer}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <Plus className="h-5 w-5 text-blue-600" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {customers.map(customer => (
          <div
            key={customer.id}
            className={`p-4 hover:bg-gray-50 ${
              customer.selected ? 'bg-blue-50 border-2 border-blue-500 shadow-sm' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={() => onSelectCustomer(customer.id)}
              >
                <UserIcon className={`h-10 w-10 ${customer.selected ? 'text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'} rounded-full p-2`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    {customer.name}
                    {customer.selected && (
                      <Check className="h-4 w-4 text-blue-600 ml-2" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEditCustomer(customer)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={() => onDeleteCustomer(customer.id)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Noch keine Kundenprofile angelegt. Klicken Sie auf das Plus-Symbol, um ein neues Profil zu erstellen.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfileList; 