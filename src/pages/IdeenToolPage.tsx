import React from 'react';
import { Lightbulb } from 'lucide-react';

interface IdeenToolPageProps {
  userEmail: string;
  isAdmin: boolean;
}

const IdeenToolPage: React.FC<IdeenToolPageProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Lightbulb className="mr-2 text-yellow-500" />
          Ideen-Tool
        </h1>
        
        <p className="text-gray-700 mb-4">
          Mit dem Ideen-Tool können Sie kreative Konzepte entwickeln und Inspirationen sammeln. 
          Egal, ob für Social Media Posts, Werbekampagnen oder Content-Strategien.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">Brainstorming-Bereich</h3>
            <p className="text-gray-600">
              Hier können Sie Ihre Ideen sammeln und organisieren. 
              Nutzen Sie die KI-gestützte Ideengenerierung, um neue Ansätze zu entdecken.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">Themen-Explorer</h3>
            <p className="text-gray-600">
              Entdecken Sie relevante Themen und Trends in Ihrer Branche.
              Finden Sie die besten Anknüpfungspunkte für Ihre Kommunikation.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">Ideen-Bewertung</h3>
            <p className="text-gray-600">
              Bewerten Sie Ihre Ideen nach verschiedenen Kriterien und identifizieren Sie die vielversprechendsten Konzepte.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">Ideensammlung exportieren</h3>
            <p className="text-gray-600">
              Exportieren Sie Ihre besten Ideen für die Weiterverarbeitung oder teilen Sie sie mit Ihrem Team.
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

export default IdeenToolPage; 