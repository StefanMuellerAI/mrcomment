import React, { useState } from 'react';
import LinkedInPostEditor from './LinkedInPostEditor';
import CommentList from './CommentList';
import commentService, { GeneratedComment } from '../../services/commentService';
import modalService from '../../services/modalService';
import { Customer, UserUsage } from '../../services/customerService';

interface CommentSectionProps {
  customers: Customer[];
  userUsage: UserUsage | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserUsage: () => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  customers,
  userUsage,
  isLoading,
  setIsLoading,
  setError,
  fetchUserUsage
}) => {
  const [linkedInPost, setLinkedInPost] = useState("");
  const [generatedComments, setGeneratedComments] = useState<GeneratedComment[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleGenerateComments = async () => {
    try {
      const comments = await commentService.generateComments(
        customers,
        linkedInPost,
        userUsage,
        setError,
        setIsLoading,
        (message) => modalService.showLoading(message)
      );
      
      setGeneratedComments(comments);
      
      // Aktualisiere die Nutzungsdaten nach erfolgreicher Generierung
      await fetchUserUsage();
    } catch (error) {
      console.error('Error handling comment generation:', error);
      setError('Fehler bei der Generierung der Kommentare');
      setTimeout(() => setError(null), 5000);
    } finally {
      modalService.hideLoading();
    }
  };

  const handleCopyToClipboard = async (text: string, id: number) => {
    await commentService.copyToClipboard(text, id, setCopiedId);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - LinkedIn Post */}
      <LinkedInPostEditor
        value={linkedInPost}
        onChange={setLinkedInPost}
        onClear={() => setLinkedInPost("")}
        onGenerate={handleGenerateComments}
        userUsage={userUsage}
        isCustomerSelected={customers.some(c => c.selected)}
        isLoading={isLoading}
      />

      {/* Right Column - Generated Comments */}
      <CommentList
        comments={generatedComments}
        copiedId={copiedId}
        onCopy={handleCopyToClipboard}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CommentSection; 