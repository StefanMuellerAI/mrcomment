import React from 'react';
import { useModalStore } from '../../services/modalService';
import LoadingModal from './LoadingModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import LegalModal from '../LegalModal';

const ModalContainer: React.FC = () => {
  const { 
    isOpen, 
    modalType,
    loadingMessage,
    legalTitle,
    legalContent,
    deleteTitle,
    deleteMessage,
    itemToDelete,
    isDeleting,
    onConfirmDelete,
    closeModal
  } = useModalStore();

  if (!isOpen) return null;

  switch (modalType) {
    case 'loading':
      return <LoadingModal message={loadingMessage} />;
    
    case 'legal':
      return (
        <LegalModal
          title={legalTitle}
          content={legalContent}
          onClose={closeModal}
        />
      );
    
    case 'delete':
      return (
        <DeleteConfirmationModal
          title={deleteTitle}
          message={deleteMessage}
          itemToDelete={itemToDelete}
          isDeleting={isDeleting}
          onCancel={closeModal}
          onConfirm={onConfirmDelete}
        />
      );
    
    default:
      return null;
  }
};

export default ModalContainer; 