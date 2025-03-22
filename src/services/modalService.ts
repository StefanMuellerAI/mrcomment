import { ReactNode } from 'react';
import { create } from 'zustand';

// Modal-Typen
type ModalType = 'loading' | 'legal' | 'delete' | null;

// Interface für den Modal-State
interface ModalState {
  // Allgemeine Modal-Eigenschaften
  isOpen: boolean;
  modalType: ModalType;

  // Loading Modal
  loadingMessage: string;

  // Legal Modal
  legalTitle: string;
  legalContent: ReactNode;

  // Delete Modal
  deleteTitle: string;
  deleteMessage: string;
  itemToDelete: string;
  isDeleting: boolean;
  onConfirmDelete: () => void;

  // Actions
  openLoadingModal: (message: string) => void;
  openLegalModal: (title: string, content: ReactNode) => void;
  openDeleteModal: (title: string, message: string, itemToDelete: string, onConfirm: () => void) => void;
  setIsDeleting: (isDeleting: boolean) => void;
  closeModal: () => void;
}

// Erstellen des Zustand-Stores mit Zustand
export const useModalStore = create<ModalState>((set) => ({
  // Initial State
  isOpen: false,
  modalType: null,
  loadingMessage: '',
  legalTitle: '',
  legalContent: null,
  deleteTitle: '',
  deleteMessage: '',
  itemToDelete: '',
  isDeleting: false,
  onConfirmDelete: () => {},

  // Modal-Aktionen
  openLoadingModal: (message: string) => set({
    isOpen: true,
    modalType: 'loading',
    loadingMessage: message
  }),

  openLegalModal: (title: string, content: ReactNode) => set({
    isOpen: true,
    modalType: 'legal',
    legalTitle: title,
    legalContent: content
  }),

  openDeleteModal: (title: string, message: string, itemToDelete: string, onConfirm: () => void) => set({
    isOpen: true,
    modalType: 'delete',
    deleteTitle: title,
    deleteMessage: message,
    itemToDelete,
    isDeleting: false,
    onConfirmDelete: onConfirm
  }),

  setIsDeleting: (isDeleting: boolean) => set({
    isDeleting
  }),

  closeModal: () => set({
    isOpen: false,
    modalType: null
  })
}));

// Vereinfachte API für den Service
const modalService = {
  // Loading Modal
  showLoading: (message: string) => {
    useModalStore.getState().openLoadingModal(message);
  },
  hideLoading: () => {
    useModalStore.getState().closeModal();
  },

  // Legal Modals
  showImpressum: (content: ReactNode) => {
    useModalStore.getState().openLegalModal('Impressum', content);
  },
  showDatenschutz: (content: ReactNode) => {
    useModalStore.getState().openLegalModal('Datenschutzerklärung', content);
  },
  hideLegal: () => {
    useModalStore.getState().closeModal();
  },

  // Delete Confirmation
  showDeleteConfirmation: (title: string, message: string, itemToDelete: string, onConfirm: () => void) => {
    useModalStore.getState().openDeleteModal(title, message, itemToDelete, onConfirm);
  },
  setDeleting: (isDeleting: boolean) => {
    useModalStore.getState().setIsDeleting(isDeleting);
  },
  hideDeleteConfirmation: () => {
    useModalStore.getState().closeModal();
  },

  // Generic close for all modals
  closeAllModals: () => {
    useModalStore.getState().closeModal();
  }
};

export default modalService; 