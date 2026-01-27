import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Pipeline stages
export const PIPELINE_STAGES = [
  { id: 'prospect', label: 'Prospect', color: 'gray' },
  { id: 'qualified', label: 'Qualified Lead', color: 'blue' },
  { id: 'proposal', label: 'Proposal Sent', color: 'purple' },
  { id: 'negotiation', label: 'Negotiation', color: 'yellow' },
  { id: 'closed_won', label: 'Closed Won', color: 'green' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red' },
];

// Interaction types
export const INTERACTION_TYPES = [
  { id: 'call', label: 'Call', icon: 'Phone' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'meeting', label: 'Meeting', icon: 'Users' },
  { id: 'demo', label: 'Demo', icon: 'Monitor' },
  { id: 'follow_up', label: 'Follow-up', icon: 'RefreshCw' },
];

// Interaction outcomes
export const INTERACTION_OUTCOMES = [
  { id: 'positive', label: 'Positive', color: 'green' },
  { id: 'neutral', label: 'Neutral', color: 'gray' },
  { id: 'needs_follow_up', label: 'Needs Follow-up', color: 'yellow' },
  { id: 'objection_raised', label: 'Objection Raised', color: 'red' },
];

// Customer Types
export const CUSTOMER_TYPES = [
  'Elevator Contractor',
  'Consultant',
  'Fixture Manufacturer',
  'End Customer',
];

// End Customer Sub-Types
export const END_CUSTOMER_TYPES = [
  'Hospital',
  'University',
  'Government',
];

// Project Pipeline Stages
export const PROJECT_STAGES = [
  { id: 'lead', label: 'Lead', color: 'gray' },
  { id: 'quoting', label: 'Quoting', color: 'blue' },
  { id: 'submitted', label: 'Submitted', color: 'purple' },
  { id: 'awarded', label: 'Awarded', color: 'green' },
  { id: 'in_production', label: 'In Production', color: 'orange' },
  { id: 'shipped', label: 'Shipped', color: 'teal' },
  { id: 'completed', label: 'Completed', color: 'green' },
  { id: 'lost', label: 'Lost', color: 'red' },
];

const STORAGE_KEY = 'sales-crm-data';

// Initial state
const initialState = {
  customers: [],
  interactions: [],
  projects: [],
  settings: {
    salesRepName: 'Sales Rep',
    darkMode: false,
  },
  tags: [],
};

// Load state from localStorage
const loadState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return initialState;
};

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

// Action types
const ActionTypes = {
  // Customers
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  // Interactions
  ADD_INTERACTION: 'ADD_INTERACTION',
  UPDATE_INTERACTION: 'UPDATE_INTERACTION',
  DELETE_INTERACTION: 'DELETE_INTERACTION',
  // Projects
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  // Tags
  ADD_TAG: 'ADD_TAG',
  DELETE_TAG: 'DELETE_TAG',
  // Data management
  IMPORT_DATA: 'IMPORT_DATA',
  CLEAR_DATA: 'CLEAR_DATA',
};

// Reducer
const crmReducer = (state, action) => {
  switch (action.type) {
    // Customers
    case ActionTypes.ADD_CUSTOMER:
      return {
        ...state,
        customers: [...state.customers, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }],
      };
    case ActionTypes.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? { ...customer, ...action.payload, updatedAt: new Date().toISOString() } : customer
        ),
      };
    case ActionTypes.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter((customer) => customer.id !== action.payload),
        interactions: state.interactions.filter((interaction) => interaction.customerId !== action.payload),
      };

    // Interactions
    case ActionTypes.ADD_INTERACTION:
      return {
        ...state,
        interactions: [...state.interactions, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }],
      };
    case ActionTypes.UPDATE_INTERACTION:
      return {
        ...state,
        interactions: state.interactions.map((interaction) =>
          interaction.id === action.payload.id ? { ...interaction, ...action.payload, updatedAt: new Date().toISOString() } : interaction
        ),
      };
    case ActionTypes.DELETE_INTERACTION:
      return {
        ...state,
        interactions: state.interactions.filter((interaction) => interaction.id !== action.payload),
      };

    // Projects
    case ActionTypes.ADD_PROJECT:
      return {
        ...state,
        projects: [...(state.projects || []), { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }],
      };
    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: (state.projects || []).map((project) =>
          project.id === action.payload.id ? { ...project, ...action.payload, updatedAt: new Date().toISOString() } : project
        ),
      };
    case ActionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: (state.projects || []).filter((project) => project.id !== action.payload),
      };

    // Settings
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    // Tags
    case ActionTypes.ADD_TAG:
      if (state.tags.includes(action.payload)) return state;
      return {
        ...state,
        tags: [...state.tags, action.payload],
      };
    case ActionTypes.DELETE_TAG:
      return {
        ...state,
        tags: state.tags.filter((tag) => tag !== action.payload),
      };

    // Data management
    case ActionTypes.IMPORT_DATA:
      return {
        ...state,
        ...action.payload,
      };
    case ActionTypes.CLEAR_DATA:
      return initialState;

    default:
      return state;
  }
};

// Context
const CRMContext = createContext(null);

// Provider
export const CRMProvider = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, null, loadState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Customer actions
  const addCustomer = (customer) => {
    dispatch({ type: ActionTypes.ADD_CUSTOMER, payload: customer });
  };

  const updateCustomer = (customer) => {
    dispatch({ type: ActionTypes.UPDATE_CUSTOMER, payload: customer });
  };

  const deleteCustomer = (customerId) => {
    dispatch({ type: ActionTypes.DELETE_CUSTOMER, payload: customerId });
  };

  const getCustomerById = (customerId) => {
    return state.customers.find((c) => c.id === customerId);
  };

  // Interaction actions
  const addInteraction = (interaction) => {
    dispatch({ type: ActionTypes.ADD_INTERACTION, payload: interaction });
  };

  const updateInteraction = (interaction) => {
    dispatch({ type: ActionTypes.UPDATE_INTERACTION, payload: interaction });
  };

  const deleteInteraction = (interactionId) => {
    dispatch({ type: ActionTypes.DELETE_INTERACTION, payload: interactionId });
  };

  const getInteractionsByCustomer = (customerId) => {
    return state.interactions.filter((i) => i.customerId === customerId);
  };

  // Project actions
  const addProject = (project) => {
    dispatch({ type: ActionTypes.ADD_PROJECT, payload: project });
  };

  const updateProject = (project) => {
    dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: project });
  };

  const deleteProject = (projectId) => {
    dispatch({ type: ActionTypes.DELETE_PROJECT, payload: projectId });
  };

  const getProjectById = (projectId) => {
    return (state.projects || []).find((p) => p.id === projectId);
  };

  const getProjectsByCustomer = (customerId) => {
    return (state.projects || []).filter((p) => p.customerId === customerId);
  };

  // Settings actions
  const updateSettings = (settings) => {
    dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
  };

  // Tag actions
  const addTag = (tag) => {
    dispatch({ type: ActionTypes.ADD_TAG, payload: tag });
  };

  const deleteTag = (tag) => {
    dispatch({ type: ActionTypes.DELETE_TAG, payload: tag });
  };

  // Data management
  const importData = (data) => {
    dispatch({ type: ActionTypes.IMPORT_DATA, payload: data });
  };

  const clearData = () => {
    dispatch({ type: ActionTypes.CLEAR_DATA });
  };

  const exportToCSV = () => {
    // Export customers
    const customerHeaders = ['id', 'name', 'company', 'email', 'phone', 'customerType', 'endCustomerType', 'pipelineStage', 'dealValue', 'notes', 'tags', 'createdAt'];
    const customerRows = state.customers.map((c) =>
      customerHeaders.map((h) => {
        const val = c[h];
        if (Array.isArray(val)) return val.join(';');
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val || '';
      }).join(',')
    );
    const customersCSV = [customerHeaders.join(','), ...customerRows].join('\n');

    // Export interactions
    const interactionHeaders = ['id', 'customerId', 'date', 'type', 'duration', 'notes', 'outcome', 'followUpDate', 'tags', 'createdAt'];
    const interactionRows = state.interactions.map((i) =>
      interactionHeaders.map((h) => {
        const val = i[h];
        if (Array.isArray(val)) return val.join(';');
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val || '';
      }).join(',')
    );
    const interactionsCSV = [interactionHeaders.join(','), ...interactionRows].join('\n');

    return { customersCSV, interactionsCSV };
  };

  const importFromCSV = (customersCSV, interactionsCSV) => {
    const parseCSV = (csv) => {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) return [];
      const headers = lines[0].split(',');
      return lines.slice(1).map((line) => {
        const values = line.match(/(".*?"|[^,]+)/g) || [];
        const obj = {};
        headers.forEach((header, index) => {
          let value = values[index] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          if (header === 'tags' && value) {
            value = value.split(';');
          }
          if (header === 'dealValue' && value) {
            value = parseFloat(value);
          }
          if (header === 'duration' && value) {
            value = parseInt(value);
          }
          obj[header] = value;
        });
        return obj;
      });
    };

    const customers = customersCSV ? parseCSV(customersCSV) : state.customers;
    const interactions = interactionsCSV ? parseCSV(interactionsCSV) : state.interactions;

    importData({ customers, interactions, settings: state.settings, tags: state.tags });
  };

  // Search function
  const search = (query) => {
    const q = query.toLowerCase();
    const matchingCustomers = state.customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
    );
    const matchingInteractions = state.interactions.filter(
      (i) => i.notes?.toLowerCase().includes(q) || i.tags?.some((t) => t.toLowerCase().includes(q))
    );
    return { customers: matchingCustomers, interactions: matchingInteractions };
  };

  // Get statistics
  const getStats = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const filteredInteractions = state.interactions.filter((i) => {
      const date = new Date(i.date);
      return date >= start && date <= end;
    });

    const filteredCustomers = state.customers.filter((c) => {
      const date = new Date(c.createdAt);
      return date >= start && date <= end;
    });

    const interactionsByType = INTERACTION_TYPES.reduce((acc, type) => {
      acc[type.id] = filteredInteractions.filter((i) => i.type === type.id).length;
      return acc;
    }, {});

    const interactionsByOutcome = INTERACTION_OUTCOMES.reduce((acc, outcome) => {
      acc[outcome.id] = filteredInteractions.filter((i) => i.outcome === outcome.id).length;
      return acc;
    }, {});

    const customersByStage = PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage.id] = state.customers.filter((c) => c.pipelineStage === stage.id).length;
      return acc;
    }, {});

    const uniqueCustomersContacted = new Set(filteredInteractions.map((i) => i.customerId)).size;

    const totalPipelineValue = state.customers
      .filter((c) => !['closed_won', 'closed_lost'].includes(c.pipelineStage))
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const closedWonValue = state.customers
      .filter((c) => c.pipelineStage === 'closed_won')
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const closedLostValue = state.customers
      .filter((c) => c.pipelineStage === 'closed_lost')
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    return {
      totalInteractions: filteredInteractions.length,
      interactionsByType,
      interactionsByOutcome,
      customersByStage,
      uniqueCustomersContacted,
      newCustomers: filteredCustomers.length,
      totalCustomers: state.customers.length,
      totalPipelineValue,
      closedWonValue,
      closedLostValue,
      dealsWon: state.customers.filter((c) => c.pipelineStage === 'closed_won').length,
      dealsLost: state.customers.filter((c) => c.pipelineStage === 'closed_lost').length,
    };
  };

  // Get upcoming follow-ups
  const getUpcomingFollowUps = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return state.interactions
      .filter((i) => i.followUpDate && new Date(i.followUpDate) >= today)
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
      .map((i) => ({
        ...i,
        customer: state.customers.find((c) => c.id === i.customerId),
      }));
  };

  // Get top engaged customers
  const getTopEngagedCustomers = (limit = 5, startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const customerInteractionCounts = {};
    state.interactions
      .filter((i) => {
        const date = new Date(i.date);
        return date >= start && date <= end;
      })
      .forEach((i) => {
        customerInteractionCounts[i.customerId] = (customerInteractionCounts[i.customerId] || 0) + 1;
      });

    return Object.entries(customerInteractionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([customerId, count]) => ({
        customer: state.customers.find((c) => c.id === customerId),
        interactionCount: count,
      }))
      .filter((item) => item.customer);
  };

  const value = {
    ...state,
    projects: state.projects || [],
    // Customer actions
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    // Interaction actions
    addInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionsByCustomer,
    // Project actions
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByCustomer,
    // Settings actions
    updateSettings,
    // Tag actions
    addTag,
    deleteTag,
    // Data management
    importData,
    clearData,
    exportToCSV,
    importFromCSV,
    // Utilities
    search,
    getStats,
    getUpcomingFollowUps,
    getTopEngagedCustomers,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

// Hook
export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
