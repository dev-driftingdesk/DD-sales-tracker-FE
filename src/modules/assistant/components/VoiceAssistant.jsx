import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Loader2, Volume2, Search } from 'lucide-react';
import useAssistantStore from '../stores/assistantStore';
import { generateCommandSuggestions } from '../utils/voiceCommands';
import { initializeLeadsIfNeeded } from '../utils/dataInitializer';
import SearchResults from './SearchResults';
import LeadSummary from './LeadSummary';
import EmailComposer from './EmailComposer';

const VoiceAssistant = ({ onClose, onNavigate }) => {
  const {
    isListening,
    isProcessing,
    transcript,
    searchResults,
    summary,
    emailDrafts,
    error,
    voiceEnabled,
    startListening,
    stopListening,
    setTranscript,
    processCommand,
    performSearch,
    clearResults,
    toggleVoice
  } = useAssistantStore();
  
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const recognitionRef = useRef(null);
  
  // Initialize data on mount
  useEffect(() => {
    // Ensure leads are initialized
    initializeLeadsIfNeeded();
    
    // Perform a test search to see if data is available
    setTimeout(() => {
      performSearch('').then(results => {
        console.log('Test search results:', results);
      });
    }, 200);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        setInputValue(fullTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
      };
      
      recognitionRef.current.onend = () => {
        stopListening();
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Handle listening state changes
  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
      }
    }
  }, [isListening]);
  
  // Generate suggestions based on input
  useEffect(() => {
    if (inputValue.length > 0) {
      const newSuggestions = generateCommandSuggestions(inputValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue]);
  
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setInputValue('');
      clearResults();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    
    if (!isProcessing) {
      if (trimmedInput) {
        const result = await processCommand(trimmedInput);
        
        // Handle navigation
        if (result?.action === 'navigate') {
          onNavigate(result.data.destination);
        }
      } else {
        // If no input, show all leads
        await performSearch('');
      }
      
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
    setShowSuggestions(false);
  };
  
  const handleSearch = async (query) => {
    await performSearch(query);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Volume2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Voice Assistant</h2>
              <p className="text-sm text-gray-600">Ask me anything about your leads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Voice Input Area */}
        <div className="px-6 py-6 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-4 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-100 hover:bg-red-200' 
                    : 'bg-teal-100 hover:bg-teal-200'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 text-red-600" />
                ) : (
                  <Mic className="w-6 h-6 text-teal-600" />
                )}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Type or speak your command..."}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  disabled={isListening}
                />
                {isProcessing ? (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <Search className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{suggestion.text}</p>
                      <p className="text-xs text-gray-500">{suggestion.completion}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
          
          {/* Voice indicator */}
          {isListening && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1 h-4 bg-teal-600 rounded-full animate-pulse" />
              <div className="w-1 h-6 bg-teal-600 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-4 bg-teal-600 rounded-full animate-pulse delay-150" />
              <div className="w-1 h-6 bg-teal-600 rounded-full animate-pulse delay-200" />
              <div className="w-1 h-4 bg-teal-600 rounded-full animate-pulse delay-300" />
            </div>
          )}
        </div>
        
        {/* Results Area */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {searchResults && (
            <SearchResults 
              results={searchResults} 
              onLeadClick={(lead) => {
                useAssistantStore.getState().generateSummary(lead.companyName);
              }}
            />
          )}
          
          {summary && (
            <LeadSummary summary={summary} />
          )}
          
          {emailDrafts.length > 0 && (
            <EmailComposer drafts={emailDrafts} />
          )}
          
          {!searchResults && !summary && !emailDrafts.length && !error && (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Try these voice commands:
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"Show me leads from Dubai"</p>
                  <p>"Pull up lead John from UK Tea Imports"</p>
                  <p>"Send email to Ahmad"</p>
                  <p>"Summary of GulfMart Supermarkets"</p>
                  <p>"Show today's new leads"</p>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => performSearch('dubai')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Test Search: "dubai"
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={toggleVoice}
              className="flex items-center gap-1 hover:text-gray-900"
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  Voice enabled
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 opacity-50" />
                  Voice disabled
                </>
              )}
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;