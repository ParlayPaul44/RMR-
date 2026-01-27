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
  Building,
  DollarSign,
  Tag,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { useCRM, PIPELINE_STAGES, INDUSTRIES } from '../context/CRMContext';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import CustomerForm from './CustomerForm';

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

export default function CustomerList({ onSelectCustomer }) {
  const { customers, deleteCustomer, interactions } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
      );
    }

    // Stage filter
    if (filterStage !== 'all') {
      result = result.filter((c) => c.pipelineStage === filterStage);
    }

    // Industry filter
    if (filterIndustry !== 'all') {
      result = result.filter((c) => c.industry === filterIndustry);
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'company':
          aVal = a.company?.toLowerCase() || '';
          bVal = b.company?.toLowerCase() || '';
          break;
        case 'dealValue':
          aVal = a.dealValue || 0;
          bVal = b.dealValue || 0;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
      }
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [customers, searchQuery, filterStage, filterIndustry, sortBy, sortDir]);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
    setActiveMenu(null);
  };

  const handleDelete = (customerId) => {
    if (confirm('Are you sure you want to delete this customer? This will also delete all associated interactions.')) {
      deleteCustomer(customerId);
    }
    setActiveMenu(null);
  };

  const getInteractionCount = (customerId) => {
    return interactions.filter((i) => i.customerId === customerId).length;
  };

  const totalPipelineValue = customers
    .filter((c) => !['closed_won', 'closed_lost'].includes(c.pipelineStage))
    .reduce((sum, c) => sum + (c.dealValue || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {customers.length} total • {formatCurrency(totalPipelineValue)} in pipeline
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Customer
        </button>
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
              placeholder="Search customers..."
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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Pipeline Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="select"
              >
                <option value="all">All Stages</option>
                {PIPELINE_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Industry</label>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="select"
              >
                <option value="all">All Industries</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
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
                <option value="name">Name</option>
                <option value="company">Company</option>
                <option value="dealValue">Deal Value</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>
            <div>
              <label className="label">Order</label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                className="select"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {customers.length === 0
              ? 'No customers yet. Add your first customer to get started.'
              : 'No customers match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectCustomer?.(customer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {customer.name}
                  </h3>
                  {customer.company && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building size={14} />
                      {customer.company}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === customer.id ? null : customer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {activeMenu === customer.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(customer);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(customer.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <PipelineBadge stage={customer.pipelineStage} />

                {customer.dealValue > 0 && (
                  <p className="text-sm flex items-center gap-1 text-green-600 dark:text-green-400">
                    <DollarSign size={14} />
                    {formatCurrency(customer.dealValue)}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {customer.email}
                    </span>
                  )}
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {customer.phone}
                    </span>
                  )}
                </div>

                {customer.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                    {customer.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{customer.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {getInteractionCount(customer.id)} interactions
                  </span>
                  <span>{formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}
