import React, { useEffect, useState } from 'react';
import { getUserGenerationLimits } from '../../lib/userService';

interface GenerationLimitInfoProps {
  userId: string;
}

const GenerationLimitInfo: React.FC<GenerationLimitInfoProps> = ({ userId }) => {
  const [limits, setLimits] = useState<{
    used: number;
    available: number;
    total: number;
  }>({
    used: 0,
    available: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true);
        const userLimits = await getUserGenerationLimits(userId);
        setLimits(userLimits);
      } catch (err: any) {
        setError(err.message || 'Fehler beim Abrufen der Generierungslimits');
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [userId]);

  // Berechne den Prozentsatz der genutzten Generierungen
  const usagePercentage = limits.available > 0 ? 
    Math.min(Math.round((limits.used / limits.available) * 100), 100) : 100;

  if (loading) {
    return <div className="text-sm text-gray-500">Lade Generierungslimits...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Fehler: {error}</div>;
  }

  return (
    <div className="text-sm">
      <div className="mb-1 flex justify-between">
        <span className="text-gray-600">Wöchentliche Generierungen:</span>
        <span className={limits.used >= limits.available ? 'text-red-600 font-semibold' : 'text-gray-800'}>
          {limits.used} / {limits.available}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${
            usagePercentage >= 90 ? 'bg-red-600' : usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-600'
          }`}
          style={{ width: `${usagePercentage}%` }}
        ></div>
      </div>
      
      {limits.available < limits.total && (
        <div className="mt-1 text-xs text-blue-600">
          <span className="inline-flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full">
            Limit basierend auf {Math.round(limits.available / (limits.total / limits.used))} aktiven Kunden
          </span>
        </div>
      )}
    </div>
  );
};

export default GenerationLimitInfo; 