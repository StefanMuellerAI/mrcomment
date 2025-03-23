import React from 'react';
import { PenTool, FileText, RefreshCw, Download } from 'lucide-react';

interface SchreibToolPageProps {
  userEmail: string;
  isAdmin: boolean;
}

const SchreibToolPage: React.FC<SchreibToolPageProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <PenTool className="mr-2 text-green-500" />
          Schreib-Tool
        </h1>
        
        <p className="text-gray-700 mb-4">
          Das Schreib-Tool unterstützt Sie bei der Erstellung von professionellen Texten. 
          Von Blogartikeln über Pressemitteilungen bis hin zu Social Media Content – erstellen Sie überzeugende Inhalte mit KI-Unterstützung.
        </p>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="border rounded-lg mb-4">
              <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                <span className="font-medium">Texteditor</span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                    <RefreshCw size={16} />
                  </button>
                  <button className="p-2 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea 
                  className="w-full h-64 p-3 border border-gray-300 rounded-md" 
                  placeholder="Beginnen Sie hier mit dem Schreiben Ihres Textes..."
                  disabled
                ></textarea>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="p-3 bg-green-600 text-white rounded-md flex justify-center items-center disabled:opacity-50" disabled>
                <FileText size={16} className="mr-2" />
                Entwurf generieren
              </button>
              <button className="p-3 border border-green-600 text-green-600 rounded-md flex justify-center items-center disabled:opacity-50" disabled>
                Text optimieren
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="border rounded-lg h-full">
              <div className="bg-gray-50 p-3 border-b">
                <span className="font-medium">Werkzeuge</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-2">Texttyp</h3>
                  <select className="w-full p-2 border border-gray-300 rounded-md" disabled>
                    <option>Blogartikel</option>
                    <option>Social Media Post</option>
                    <option>E-Mail</option>
                    <option>Pressemitteilung</option>
                  </select>
                </div>
                
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-2">Tonalität</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="formal" name="tone" className="mr-2" disabled checked />
                      <label htmlFor="formal">Formell</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="casual" name="tone" className="mr-2" disabled />
                      <label htmlFor="casual">Casual</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="enthusiastic" name="tone" className="mr-2" disabled />
                      <label htmlFor="enthusiastic">Enthusiastisch</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Wortanzahl</h3>
                  <input 
                    type="range" 
                    min="100" 
                    max="1000" 
                    className="w-full" 
                    disabled 
                    value={400}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Kurz</span>
                    <span>400 Wörter</span>
                    <span>Lang</span>
                  </div>
                </div>
              </div>
            </div>
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

export default SchreibToolPage; 