import React from 'react';
import { Search, Book, Globe, Link } from 'lucide-react';

interface RechercheToolPageProps {
  userEmail: string;
  isAdmin: boolean;
}

const RechercheToolPage: React.FC<RechercheToolPageProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Search className="mr-2 text-blue-500" />
          Recherche-Tool
        </h1>
        
        <p className="text-gray-700 mb-4">
          Das Recherche-Tool unterstützt Sie dabei, fundierte Informationen zu sammeln und zu analysieren. 
          Vertiefen Sie Ihr Wissen zu branchenspezifischen Themen und finden Sie relevante Quellen.
        </p>
        
        <div className="mt-6 border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex items-center">
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md" 
                placeholder="Geben Sie ein Thema zur Recherche ein..." 
                disabled
              />
              <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50" disabled>
                Suchen
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center disabled:opacity-50" disabled>
                <Globe className="mr-2 h-4 w-4" />
                Web
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center disabled:opacity-50" disabled>
                <Book className="mr-2 h-4 w-4" />
                Akademisch
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center disabled:opacity-50" disabled>
                <Link className="mr-2 h-4 w-4" />
                Quellen
              </button>
            </div>
            
            <div className="text-center py-10">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">
                Geben Sie ein Thema ein, um Ihre Recherche zu starten.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Die Ergebnisse werden hier angezeigt.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">KI-unterstützte Recherche</h3>
            <p className="text-gray-600">
              Nutzen Sie unsere KI, um tiefgehende Analysen zu Ihren Themen zu erhalten und 
              relevante Informationen automatisch zu extrahieren.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">Quellenmanagement</h3>
            <p className="text-gray-600">
              Speichern und organisieren Sie Ihre Quellen. Exportieren Sie Zitate und 
              Referenzen im gewünschten Format.
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-700 text-center">
            Dieses Tool wird in Kürze verfügbar sein! Wir arbeiten mit Hochdruck daran, Ihnen dieses Feature zur Verfügung zu stellen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RechercheToolPage; 