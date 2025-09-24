import React from 'react';
import VoiceAssistant from './components/VoiceAssistant';

const AssistantModule = ({ onClose, onNavigate }) => {
  return <VoiceAssistant onClose={onClose} onNavigate={onNavigate} />;
};

export default AssistantModule;