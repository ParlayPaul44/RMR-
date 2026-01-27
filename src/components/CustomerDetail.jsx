import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  Globe,
  DollarSign,
  Calendar,
  Tag,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { useCRM, PIPELINE_STAGES } from '../context/CRMContext';
import { formatCurrency } from '../utils/formatters';
import { formatDate, formatRelative } from '../utils/dateUtils';
import CustomerForm from './CustomerForm';
import InteractionList from './InteractionList';
import InteractionForm from './InteractionForm';

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
    <span className={`badge text-sm ${colorClasses[stageInfo?.color] || 'badge-prospect'}`}>
      {stageInfo?.label || stage}
    </span>
  );
};

export default function CustomerDetail({ customer, onBack }) {
  const { deleteCustomer, getInteractionsByCustomer } = useCRM();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  const customerInteractions = useMemo(
    () => getInteractionsByCustomer(customer.id),
    [getInteractionsByCustomer, customer.id]
  );

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this customer? This will also delete all associated interactions.'
      )
    ) {
      deleteCustomer(customer.id);
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
          {customer.company && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{customer.company}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditForm(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <PipelineBadge stage={customer.pipelineStage} />
              {customer.dealValue > 0 && (
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <DollarSign size={24} />
                  {formatCurrency(customer.dealValue)}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowInteractionForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Log Interaction
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customer.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Phone size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>
            )}
            {customer.company && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Building size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.company}
                  </p>
                </div>
              </div>
            )}
            {customer.customerType && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Globe size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customer Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.customerType}
                    {customer.endCustomerType && ` - ${customer.endCustomerType}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {customer.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {customer.notes}
              </p>
            </div>
          )}

          {customer.tags?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full text-sm"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Interactions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {customerInteractions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Contact</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {customerInteractions.length > 0
                    ? formatRelative(
                        customerInteractions.sort(
                          (a, b) => new Date(b.date) - new Date(a.date)
                        )[0].date
                      )
                    : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Customer Since</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Interaction Types</h3>
            <div className="space-y-2">
              {['call', 'email', 'meeting', 'demo', 'follow_up'].map((type) => {
                const count = customerInteractions.filter((i) => i.type === type).length;
                const labels = {
                  call: 'Calls',
                  email: 'Emails',
                  meeting: 'Meetings',
                  demo: 'Demos',
                  follow_up: 'Follow-ups',
                };
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{labels[type]}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Outcomes</h3>
            <div className="space-y-2">
              {['positive', 'neutral', 'needs_follow_up', 'objection_raised'].map((outcome) => {
                const count = customerInteractions.filter((i) => i.outcome === outcome).length;
                const labels = {
                  positive: 'Positive',
                  neutral: 'Neutral',
                  needs_follow_up: 'Needs Follow-up',
                  objection_raised: 'Objection Raised',
                };
                const colors = {
                  positive: 'text-green-600 dark:text-green-400',
                  neutral: 'text-gray-600 dark:text-gray-400',
                  needs_follow_up: 'text-yellow-600 dark:text-yellow-400',
                  objection_raised: 'text-red-600 dark:text-red-400',
                };
                return (
                  <div key={outcome} className="flex items-center justify-between text-sm">
                    <span className={colors[outcome]}>{labels[outcome]}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={20} />
            Interactions
          </h2>
        </div>
        <InteractionList customerId={customer.id} />
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <CustomerForm
          customer={customer}
          onClose={() => setShowEditForm(false)}
        />
      )}

      {/* Interaction Form Modal */}
      {showInteractionForm && (
        <InteractionForm
          customerId={customer.id}
          onClose={() => setShowInteractionForm(false)}
        />
      )}
    </div>
  );
}
