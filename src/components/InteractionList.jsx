import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  Users,
  Monitor,
  RefreshCw,
  Calendar,
  Clock,
  Tag,
  ChevronDown,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { useCRM, INTERACTION_TYPES, INTERACTION_OUTCOMES } from '../context/CRMContext';
import { formatDate, formatDateTime, formatDuration, formatRelative } from '../utils/dateUtils';
import InteractionForm from './InteractionForm';

const TypeIcon = ({ type }) => {
  const icons = {
    call: Phone,
    email: Mail,
    meeting: Users,
    demo: Monitor,
    follow_up: RefreshCw,
  };
  const Icon = icons[type] || Phone;
  return <Icon size={16} />;
};

const OutcomeBadge = ({ outcome }) => {
  const outcomeInfo = INTERACTION_OUTCOMES.find((o) => o.id === outcome);
  const colorClasses = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <span className={`badge ${colorClasses[outcomeInfo?.color] || colorClasses.gray}`}>
      {outcomeInfo?.label || outcome}
    </span>
  );
};

export default function InteractionList({ customerId }) {
  const { interactions, customers, deleteInteraction } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [quickMode, setQuickMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState(customerId || 'all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredInteractions = useMemo(() => {
    let result = [...interactions];

    // Filter by customer if provided
    if (customerId) {
      result = result.filter((i) => i.customerId === customerId);
    } else if (filterCustomer !== 'all') {
      result = result.filter((i) => i.customerId === filterCustomer);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const customer = customers.find((c) => c.id === i.customerId);
        return (
          i.notes?.toLowerCase().includes(query) ||
          customer?.name?.toLowerCase().includes(query) ||
          customer?.company?.toLowerCase().includes(query)
        );
      });
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((i) => i.type === filterType);
    }

    // Outcome filter
    if (filterOutcome !== 'all') {
      result = result.filter((i) => i.outcome === filterOutcome);
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'customer':
          const aCustomer = customers.find((c) => c.id === a.customerId);
          const bCustomer = customers.find((c) => c.id === b.customerId);
          aVal = aCustomer?.name?.toLowerCase() || '';
          bVal = bCustomer?.name?.toLowerCase() || '';
          break;
        default:
          aVal = new Date(a.date);
          bVal = new Date(b.date);
      }
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [interactions, customers, searchQuery, filterType, filterOutcome, filterCustomer, customerId, sortBy, sortDir]);

  const handleEdit = (interaction) => {
    setEditingInteraction(interaction);
    setQuickMode(false);
    setShowForm(true);
    setActiveMenu(null);
  };

  const handleDelete = (interactionId) => {
    if (confirm('Are you sure you want to delete this interaction?')) {
      deleteInteraction(interactionId);
    }
    setActiveMenu(null);
  };

  const getCustomer = (interactionCustomerId) => {
    return customers.find((c) => c.id === interactionCustomerId);
  };

  const getTypeLabel = (typeId) => {
    return INTERACTION_TYPES.find((t) => t.id === typeId)?.label || typeId;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {customerId ? 'Customer Interactions' : 'Interactions'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredInteractions.length} interaction{filteredInteractions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingInteraction(null);
              setQuickMode(true);
              setShowForm(true);
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Zap size={18} />
            Quick Log
          </button>
          <button
            onClick={() => {
              setEditingInteraction(null);
              setQuickMode(false);
              setShowForm(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Log Interaction
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search interactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          >
            <Filter size={18} />
            Filters
            <ChevronDown
              size={16}
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-5 gap-3">
            {!customerId && (
              <div>
                <label className="label">Customer</label>
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="select"
                >
                  <option value="all">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="label">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select"
              >
                <option value="all">All Types</option>
                {INTERACTION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Outcome</label>
              <select
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
                className="select"
              >
                <option value="all">All Outcomes</option>
                {INTERACTION_OUTCOMES.map((outcome) => (
                  <option key={outcome.id} value={outcome.id}>
                    {outcome.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select"
              >
                <option value="date">Date</option>
                <option value="type">Type</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label className="label">Order</label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                className="select"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Interaction List */}
      {filteredInteractions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {interactions.length === 0
              ? 'No interactions logged yet. Start by logging your first interaction.'
              : 'No interactions match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInteractions.map((interaction) => {
            const customer = getCustomer(interaction.customerId);
            const hasFollowUp = interaction.followUpDate && new Date(interaction.followUpDate) > new Date();
            const isOverdue =
              interaction.followUpDate && new Date(interaction.followUpDate) < new Date();

            return (
              <div
                key={interaction.id}
                className="card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      interaction.type === 'call'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                        : interaction.type === 'email'
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                        : interaction.type === 'meeting'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : interaction.type === 'demo'
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <TypeIcon type={interaction.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getTypeLabel(interaction.type)}
                          </span>
                          {!customerId && customer && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              with{' '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {customer.name}
                              </span>
                              {customer.company && ` (${customer.company})`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDateTime(interaction.date)}
                          </span>
                          {interaction.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDuration(interaction.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <OutcomeBadge outcome={interaction.outcome} />
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === interaction.id ? null : interaction.id
                              )
                            }
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {activeMenu === interaction.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <button
                                onClick={() => handleEdit(interaction)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(interaction.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-red-600"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {interaction.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {interaction.notes}
                      </p>
                    )}

                    {(hasFollowUp || isOverdue) && (
                      <div
                        className={`mt-2 flex items-center gap-1 text-sm ${
                          isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        <AlertCircle size={14} />
                        {isOverdue ? 'Overdue: ' : 'Follow-up: '}
                        {formatDate(interaction.followUpDate)}
                      </div>
                    )}

                    {interaction.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {interaction.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interaction Form Modal */}
      {showForm && (
        <InteractionForm
          interaction={editingInteraction}
          customerId={customerId}
          quickMode={quickMode}
          onClose={() => {
            setShowForm(false);
            setEditingInteraction(null);
          }}
        />
      )}
    </div>
  );
}
