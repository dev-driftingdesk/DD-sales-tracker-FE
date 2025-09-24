import { create } from 'zustand';
import { performSmartSearch, parseNaturalLanguageQuery } from '../utils/searchEngine';
import { processVoiceCommand, executeVoiceCommand } from '../utils/voiceCommands';
import { generateLeadSummary, generateEmailDrafts } from '../utils/aiSummary';

const useAssistantStore = create((set, get) => ({
  // State
  isListening: false,
  isProcessing: false,
  transcript: '',
  searchResults: null,
  currentCommand: null,
  commandHistory: [],
  suggestions: [],
  emailDrafts: [],
  summary: null,
  error: null,
  
  // Voice state
  voiceEnabled: true,
  selectedVoice: 'default',
  speechRate: 1.0,
  
  // Search state
  searchQuery: '',
  searchFilters: {},
  recentSearches: [],
  
  // Voice controls
  startListening: () => {
    set({ isListening: true, error: null });
  },
  
  stopListening: () => {
    set({ isListening: false });
  },
  
  setTranscript: (transcript) => {
    set({ transcript });
  },
  
  // Process voice command
  processCommand: async (command) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Parse the command
      const parsedCommand = processVoiceCommand(command);
      
      // Add to history
      const history = [...get().commandHistory, {
        id: Date.now(),
        command,
        parsed: parsedCommand,
        timestamp: new Date().toISOString()
      }].slice(-10); // Keep last 10 commands
      
      set({ currentCommand: parsedCommand, commandHistory: history });
      
      // Execute the command
      const result = await executeVoiceCommand(parsedCommand);
      
      // Handle different command results
      switch (result.action) {
        case 'search':
          await get().performSearch(result.data.query, result.data.filters);
          break;
          
        case 'show_activity':
          await get().showActivity(result.data.contact);
          break;
          
        case 'compose_email':
          await get().composeEmail(result.data.recipient);
          break;
          
        case 'summarize':
          await get().generateSummary(result.data.target);
          break;
          
        case 'navigate':
          // Navigation will be handled by the component
          break;
      }
      
      set({ isProcessing: false });
      return result;
      
    } catch (error) {
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },
  
  // Perform search
  performSearch: async (query, filters = {}) => {
    set({ isProcessing: true, searchQuery: query, searchFilters: filters });
    
    try {
      console.log('Assistant store performing search:', query);
      
      // Parse natural language if needed
      const parsed = parseNaturalLanguageQuery(query);
      const combinedFilters = { ...parsed.filters, ...filters };
      
      // Perform the search
      const results = performSmartSearch(parsed.text || query, {
        filters: combinedFilters
      });
      
      console.log('Assistant store search results:', results);
      
      // Update recent searches only if there's a query
      let recentSearches = get().recentSearches || [];
      if (query) {
        recentSearches = [
          { query, filters: combinedFilters, timestamp: new Date().toISOString() },
          ...recentSearches
        ].slice(0, 5);
      }
      
      set({ 
        searchResults: results, 
        recentSearches,
        isProcessing: false,
        error: null
      });
      
      return results;
      
    } catch (error) {
      console.error('Search error:', error);
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },
  
  // Show activity for a contact
  showActivity: async (contactName) => {
    set({ isProcessing: true });
    
    try {
      // Search for the contact
      const results = performSmartSearch(contactName, { type: 'leads' });
      
      if (results.leads.length > 0) {
        const lead = results.leads[0];
        const summary = generateLeadSummary(lead);
        
        set({ 
          summary,
          searchResults: results,
          isProcessing: false 
        });
        
        return { activity: lead.activities?.[0], contact: contactName };
      }
      
      set({ isProcessing: false });
      return { activity: null, contact: contactName };
      
    } catch (error) {
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },
  
  // Compose email
  composeEmail: async (recipient) => {
    set({ isProcessing: true });
    
    try {
      // Search for the recipient
      const results = performSmartSearch(recipient, { type: 'leads' });
      
      if (results.leads.length > 0) {
        const lead = results.leads[0];
        const drafts = generateEmailDrafts(lead);
        
        set({ 
          emailDrafts: drafts,
          searchResults: results,
          isProcessing: false 
        });
        
        return { recipient: lead.contactName || recipient, drafts };
      }
      
      set({ isProcessing: false });
      return { recipient, drafts: [] };
      
    } catch (error) {
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },
  
  // Generate summary
  generateSummary: async (target) => {
    set({ isProcessing: true });
    
    try {
      // Search for the target
      const results = performSmartSearch(target, { type: 'leads' });
      
      if (results.leads.length > 0) {
        const lead = results.leads[0];
        const summary = generateLeadSummary(lead);
        
        set({ 
          summary,
          searchResults: results,
          isProcessing: false 
        });
        
        return summary;
      }
      
      set({ isProcessing: false });
      return null;
      
    } catch (error) {
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },
  
  // Clear results
  clearResults: () => {
    set({ 
      searchResults: null, 
      summary: null, 
      emailDrafts: [],
      error: null 
    });
  },
  
  // Set suggestions
  setSuggestions: (suggestions) => {
    set({ suggestions });
  },
  
  // Toggle voice
  toggleVoice: () => {
    set(state => ({ voiceEnabled: !state.voiceEnabled }));
  },
  
  // Update voice settings
  updateVoiceSettings: (settings) => {
    set(state => ({ 
      selectedVoice: settings.voice || state.selectedVoice,
      speechRate: settings.rate || state.speechRate
    }));
  }
}));

export default useAssistantStore;