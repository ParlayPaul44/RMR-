import {
  Search,
  X,
  User,
  MessageSquare,
  Building,
  Tag,
} from 'lucide-react';
import { useCRM, PIPELINE_STAGES, INTERACTION_TYPES } from '../context/CRMContext';
import { formatDate } from '../utils/dateUtils';

const PipelineBadge = ({ stage }) => {
  const stageInfo = PIPELINE_STAGES.find((s) => s.id === stage);
  const colorClasses = {
    gray: 'badge-prospect',
    blue: 'badge-qualified',
    purple: 'badge-proposal',
    yellow: 'badge-negotiation',
    green: 'badge-won',
    red: 'badge-lost',
  };

  return (
    <span className={`badge ${colorClasses[stageInfo?.color] || 'badge-prospect'}`}>
      {stageInfo?.label || stage}
    </span>
  );
};

export default function SearchResults({ query, onClose, onSelectCustomer, onSelectInteraction }) {
  const { search, customers } = useCRM();
  const results = search(query);

  const getCustomer = (customerId) => {
    return customers.find((c) => c.id === customerId);
  };

  const getTypeLabel = (typeId) => {
    return INTERACTION_TYPES.find((t) => t.id === typeId)?.label || typeId;
  };

  const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const totalResults = results.customers.length + results.interactions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
      <div className="w-full max-w-2xl max-h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Search results for "{query}"
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({totalResults} found)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-4">
          {totalResults === 0 ? (
            <div className="text-center py-8">
              <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try searching for customer names, companies, or notes
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Results */}
              {results.customers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Customers ({results.customers.length})
                  </h3>
                  <div className="space-y-2">
                    {results.customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          onSelectCustomer(customer);
                          onClose();
                        }}
                        className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {highlightText(customer.name, query)}
                            </p>
                            {customer.company && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Building size={12} />
                                {highlightText(customer.company, query)}
                              </p>
                            )}
                            {customer.email && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {highlightText(customer.email, query)}
                              </p>
                            )}
                          </div>
                          <PipelineBadge stage={customer.pipelineStage} />
                        </div>
                        {customer.notes && customer.notes.toLowerCase().includes(query.toLowerCase()) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                            Notes: {highlightText(customer.notes.substring(0, 100), query)}...
                          </p>
                        )}
                        {customer.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {customer.tags
                              .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                                >
                                  <Tag size={10} />
                                  {highlightText(tag, query)}
                                </span>
                              ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction Results */}
              {results.interactions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Interactions ({results.interactions.length})
                  </h3>
                  <div className="space-y-2">
                    {results.interactions.map((interaction) => {
                      const customer = getCustomer(interaction.customerId);
                      return (
                        <button
                          key={interaction.id}
                          onClick={() => {
                            if (customer) {
                              onSelectCustomer(customer);
                            }
                            onClose();
                          }}
                          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getTypeLabel(interaction.type)} with{' '}
                                {customer?.name || 'Unknown Customer'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(interaction.date)}
                              </p>
                            </div>
                          </div>
                          {interaction.notes && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              {highlightText(interaction.notes.substring(0, 150), query)}
                              {interaction.notes.length > 150 ? '...' : ''}
                            </p>
                          )}
                          {interaction.tags?.some((t) =>
                            t.toLowerCase().includes(query.toLowerCase())
                          ) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {interaction.tags
                                .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
                                .map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                                  >
                                    <Tag size={10} />
                                    {highlightText(tag, query)}
                                  </span>
                                ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
