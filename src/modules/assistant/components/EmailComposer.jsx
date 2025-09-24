import React, { useState } from 'react';
import { Mail, Send, Copy, CheckCircle, Edit3 } from 'lucide-react';

const EmailComposer = ({ drafts }) => {
  const [selectedDraft, setSelectedDraft] = useState(0);
  const [editedDraft, setEditedDraft] = useState(null);
  const [copied, setCopied] = useState(false);
  
  if (!drafts || drafts.length === 0) return null;
  
  const currentDraft = editedDraft || drafts[selectedDraft];
  
  const handleCopy = () => {
    const text = `Subject: ${currentDraft.subject}\n\n${currentDraft.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleEdit = () => {
    setEditedDraft({ ...currentDraft });
  };
  
  const handleSave = () => {
    // In a real app, this would save the edited draft
    setEditedDraft(null);
  };
  
  const getToneIcon = (tone) => {
    const icons = {
      professional: '👔',
      casual: '👋',
      urgent: '🚨',
      friendly: '😊'
    };
    return icons[tone] || '✉️';
  };
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5 text-gray-400" />
        Email Drafts
      </h3>
      
      {/* Draft Selector */}
      {drafts.length > 1 && (
        <div className="mb-4 flex gap-2">
          {drafts.map((draft, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedDraft(index);
                setEditedDraft(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDraft === index
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{getToneIcon(draft.tone)}</span>
              {draft.tone} ({draft.purpose})
            </button>
          ))}
        </div>
      )}
      
      {/* Email Draft */}
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          {editedDraft ? (
            <input
              type="text"
              value={editedDraft.subject}
              onChange={(e) => setEditedDraft({ ...editedDraft, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
            />
          ) : (
            <p className="text-sm text-gray-900 font-medium">{currentDraft.subject}</p>
          )}
        </div>
        
        {/* Body */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          {editedDraft ? (
            <textarea
              value={editedDraft.body}
              onChange={(e) => setEditedDraft({ ...editedDraft, body: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-none"
            />
          ) : (
            <div className="bg-white p-3 rounded border border-gray-200">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                {currentDraft.body}
              </pre>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {editedDraft ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditedDraft(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </>
            )}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Send className="w-4 h-4" />
            Send Email
          </button>
        </div>
      </div>
      
      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <span className="font-medium">Pro tip:</span> You can customize the email before sending. 
          The AI has included placeholders like [Your Name] that you should replace with actual information.
        </p>
      </div>
    </div>
  );
};

export default EmailComposer;