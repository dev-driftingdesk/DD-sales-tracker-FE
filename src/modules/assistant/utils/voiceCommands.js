// Voice command types
export const COMMAND_TYPES = {
  SEARCH: 'search',
  SHOW: 'show',
  CREATE: 'create',
  UPDATE: 'update',
  SEND: 'send',
  CALL: 'call',
  NAVIGATE: 'navigate',
  SUMMARY: 'summary'
};

// Command patterns with regex
const COMMAND_PATTERNS = [
  // Search commands
  {
    pattern: /(?:search for|find|look for|show me|pull up)\s+(?:lead|leads|contact|contacts)?\s*(.+)/i,
    type: COMMAND_TYPES.SEARCH,
    extract: (match) => ({ query: match[1].trim() })
  },
  {
    pattern: /show\s+(?:me\s+)?(?:the\s+)?last\s+(?:call|email|message|activity|conversation)\s+(?:with|from)\s+(.+)/i,
    type: COMMAND_TYPES.SHOW,
    subtype: 'last_activity',
    extract: (match) => ({ contact: match[1].trim() })
  },
  {
    pattern: /show\s+(?:me\s+)?(?:all\s+)?(?:my\s+)?(?:leads|contacts)\s+(?:from|in)\s+(.+)/i,
    type: COMMAND_TYPES.SHOW,
    subtype: 'location_filter',
    extract: (match) => ({ location: match[1].trim() })
  },
  {
    pattern: /show\s+(?:me\s+)?(?:my\s+)?(?:new|recent|today's?|this week's?)\s+leads?/i,
    type: COMMAND_TYPES.SHOW,
    subtype: 'time_filter',
    extract: (match) => ({ timeframe: match[0].includes('today') ? 'today' : match[0].includes('week') ? 'week' : 'recent' })
  },
  
  // Create commands
  {
    pattern: /(?:create|add|make)\s+(?:a\s+)?(?:new\s+)?(?:lead|contact|reminder|note)\s+(?:for\s+)?(.+)/i,
    type: COMMAND_TYPES.CREATE,
    extract: (match) => ({ details: match[1].trim() })
  },
  
  // Update commands
  {
    pattern: /(?:update|change|set|mark)\s+(.+?)\s+(?:status|as)\s+(.+)/i,
    type: COMMAND_TYPES.UPDATE,
    extract: (match) => ({ target: match[1].trim(), value: match[2].trim() })
  },
  
  // Communication commands
  {
    pattern: /(?:send|draft|compose|write)\s+(?:an?\s+)?(?:email|message)\s+(?:to\s+)?(.+)/i,
    type: COMMAND_TYPES.SEND,
    extract: (match) => ({ recipient: match[1].trim() })
  },
  {
    pattern: /call\s+(.+)/i,
    type: COMMAND_TYPES.CALL,
    extract: (match) => ({ contact: match[1].trim() })
  },
  
  // Navigation commands
  {
    pattern: /(?:go to|open|navigate to|show)\s+(?:the\s+)?(\w+)\s*(?:module|page|dashboard)?/i,
    type: COMMAND_TYPES.NAVIGATE,
    extract: (match) => ({ destination: match[1].trim() })
  },
  
  // Summary commands
  {
    pattern: /(?:summarize|summary of|brief me on|what's the status of)\s+(.+)/i,
    type: COMMAND_TYPES.SUMMARY,
    extract: (match) => ({ target: match[1].trim() })
  }
];

// Process voice command
export const processVoiceCommand = (command) => {
  const normalizedCommand = command.toLowerCase().trim();
  
  for (const pattern of COMMAND_PATTERNS) {
    const match = normalizedCommand.match(pattern.pattern);
    if (match) {
      return {
        type: pattern.type,
        subtype: pattern.subtype,
        raw: command,
        normalized: normalizedCommand,
        data: pattern.extract(match),
        confidence: calculateConfidence(match, normalizedCommand)
      };
    }
  }
  
  // If no pattern matches, treat as a general search
  return {
    type: COMMAND_TYPES.SEARCH,
    raw: command,
    normalized: normalizedCommand,
    data: { query: normalizedCommand },
    confidence: 0.5
  };
};

// Calculate confidence score for command matching
const calculateConfidence = (match, fullCommand) => {
  const matchLength = match[0].length;
  const commandLength = fullCommand.length;
  const coverage = matchLength / commandLength;
  
  // High confidence if the match covers most of the command
  if (coverage > 0.8) return 0.95;
  if (coverage > 0.6) return 0.8;
  return 0.6;
};

// Generate command suggestions based on partial input
export const generateCommandSuggestions = (partialCommand) => {
  const suggestions = [];
  const normalized = partialCommand.toLowerCase().trim();
  
  // Common command starters
  const starters = [
    { text: 'Show me leads from', icon: '🔍', completion: 'Show me leads from [location]' },
    { text: 'Pull up lead', icon: '📋', completion: 'Pull up lead [name]' },
    { text: 'Send email to', icon: '✉️', completion: 'Send email to [contact]' },
    { text: 'Create new lead', icon: '➕', completion: 'Create new lead for [company]' },
    { text: 'Show last call with', icon: '📞', completion: 'Show last call with [contact]' },
    { text: 'Summary of', icon: '📊', completion: 'Summary of [lead/contact]' }
  ];
  
  // Filter suggestions based on partial input
  starters.forEach(starter => {
    if (starter.text.toLowerCase().startsWith(normalized) || normalized === '') {
      suggestions.push(starter);
    }
  });
  
  // Add contextual suggestions
  if (normalized.includes('show') || normalized.includes('find')) {
    suggestions.push(
      { text: 'Show today\'s leads', icon: '📅', completion: 'Show today\'s leads' },
      { text: 'Show high-priority leads', icon: '🔥', completion: 'Show high-priority leads' }
    );
  }
  
  if (normalized.includes('create') || normalized.includes('add')) {
    suggestions.push(
      { text: 'Create a reminder', icon: '⏰', completion: 'Create a reminder for [task]' },
      { text: 'Add a note', icon: '📝', completion: 'Add a note to [lead]' }
    );
  }
  
  return suggestions.slice(0, 5);
};

// Execute voice command
export const executeVoiceCommand = async (parsedCommand) => {
  const { type, subtype, data } = parsedCommand;
  
  switch (type) {
    case COMMAND_TYPES.SEARCH:
      return {
        action: 'search',
        data: { query: data.query }
      };
      
    case COMMAND_TYPES.SHOW:
      if (subtype === 'last_activity') {
        return {
          action: 'show_activity',
          data: { contact: data.contact }
        };
      } else if (subtype === 'location_filter') {
        return {
          action: 'search',
          data: { 
            query: data.location,
            filters: { location: data.location }
          }
        };
      } else if (subtype === 'time_filter') {
        return {
          action: 'search',
          data: {
            query: '',
            filters: { dateRange: data.timeframe }
          }
        };
      }
      break;
      
    case COMMAND_TYPES.CREATE:
      return {
        action: 'create',
        data: { type: 'lead', details: data.details }
      };
      
    case COMMAND_TYPES.SEND:
      return {
        action: 'compose_email',
        data: { recipient: data.recipient }
      };
      
    case COMMAND_TYPES.NAVIGATE:
      return {
        action: 'navigate',
        data: { destination: data.destination }
      };
      
    case COMMAND_TYPES.SUMMARY:
      return {
        action: 'summarize',
        data: { target: data.target }
      };
      
    default:
      return {
        action: 'unknown',
        data: parsedCommand
      };
  }
};

// Voice feedback messages
export const getVoiceFeedback = (action, result) => {
  switch (action) {
    case 'search':
      if (result.count > 0) {
        return `Found ${result.count} ${result.count === 1 ? 'result' : 'results'} for your search.`;
      }
      return 'No results found. Try a different search term.';
      
    case 'show_activity':
      if (result.activity) {
        return `Last ${result.activity.type} with ${result.contact}: ${result.activity.description}`;
      }
      return `No recent activity found with ${result.contact}.`;
      
    case 'create':
      return `New ${result.type} created successfully.`;
      
    case 'compose_email':
      return `Email draft ready for ${result.recipient}. What would you like to say?`;
      
    case 'navigate':
      return `Navigating to ${result.destination}.`;
      
    case 'summarize':
      return result.summary || 'Summary generated.';
      
    default:
      return 'Command processed.';
  }
};