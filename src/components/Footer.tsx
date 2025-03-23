import React from 'react';

interface FooterProps {
  onShowImpressum: () => void;
  onShowDatenschutz: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowImpressum, onShowDatenschutz }) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto w-full z-10 relative">
      <div className="w-full px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Mr. Comment
          </div>
          <div className="flex gap-4">
            <button
              onClick={onShowImpressum}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Impressum
            </button>
            <button
              onClick={onShowDatenschutz}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Datenschutz
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 