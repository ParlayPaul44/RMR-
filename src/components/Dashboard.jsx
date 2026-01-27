import { useState, useMemo } from 'react';
import {
  Phone,
  Mail,
  Users,
  Monitor,
  RefreshCw,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  List,
  Grid,
} from 'lucide-react';
import { useCRM, INTERACTION_TYPES, PIPELINE_STAGES } from '../context/CRMContext';
import { formatCurrency } from '../utils/formatters';
import {
  formatDate,
  getCalendarDays,
  getMonthName,
  navigateMonth,
  isDateSameDay,
  isDateSameMonth,
  isDateToday,
  getMonthRange,
} from '../utils/dateUtils';

const TypeIcon = ({ type, size = 16 }) => {
  const icons = {
    call: Phone,
    email: Mail,
    meeting: Users,
    demo: Monitor,
    follow_up: RefreshCw,
  };
  const Icon = icons[type] || Phone;
  return <Icon size={size} />;
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export default function Dashboard({ onNavigate }) {
  const { interactions, customers, getStats, getUpcomingFollowUps, getTopEngagedCustomers } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [filterType, setFilterType] = useState('all');

  const monthRange = useMemo(() => getMonthRange(currentDate), [currentDate]);
  const calendarDays = useMemo(() => getCalendarDays(currentDate), [currentDate]);

  const stats = useMemo(
    () => getStats(monthRange.start, monthRange.end),
    [getStats, monthRange]
  );

  const upcomingFollowUps = useMemo(() => getUpcomingFollowUps().slice(0, 5), [getUpcomingFollowUps]);
  const topCustomers = useMemo(
    () => getTopEngagedCustomers(5, monthRange.start, monthRange.end),
    [getTopEngagedCustomers, monthRange]
  );

  const monthInteractions = useMemo(() => {
    return interactions.filter((i) => {
      const date = new Date(i.date);
      return date >= monthRange.start && date <= monthRange.end;
    });
  }, [interactions, monthRange]);

  const filteredInteractions = useMemo(() => {
    if (filterType === 'all') return monthInteractions;
    return monthInteractions.filter((i) => i.type === filterType);
  }, [monthInteractions, filterType]);

  const getInteractionsForDay = (day) => {
    return filteredInteractions.filter((i) => isDateSameDay(new Date(i.date), day));
  };

  const getCustomer = (customerId) => {
    return customers.find((c) => c.id === customerId);
  };

  const getTypeLabel = (typeId) => {
    return INTERACTION_TYPES.find((t) => t.id === typeId)?.label || typeId;
  };

  const getPipelineLabel = (stageId) => {
    return PIPELINE_STAGES.find((s) => s.id === stageId)?.label || stageId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getMonthName(currentDate)} Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(navigateMonth(currentDate, 'prev'))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(navigateMonth(currentDate, 'next'))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Interactions"
          value={stats.totalInteractions}
          icon={BarChart3}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
          subtitle="this month"
        />
        <StatCard
          title="Customers Contacted"
          value={stats.uniqueCustomersContacted}
          icon={Users}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
          subtitle={`of ${stats.totalCustomers} total`}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.totalPipelineValue)}
          icon={DollarSign}
          color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
          subtitle="active deals"
        />
        <StatCard
          title="Deals Closed"
          value={`${stats.dealsWon}W / ${stats.dealsLost}L`}
          icon={TrendingUp}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
          subtitle={formatCurrency(stats.closedWonValue) + ' won'}
        />
      </div>

      {/* Interactions by Type */}
      <div className="card p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Interactions by Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {INTERACTION_TYPES.map((type) => {
            const count = stats.interactionsByType[type.id] || 0;
            const isActive = filterType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setFilterType(isActive ? 'all' : type.id)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  isActive
                    ? 'bg-primary-100 border-2 border-primary-500 dark:bg-primary-900'
                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <TypeIcon type={type.id} size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{type.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar / List View */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {getMonthName(currentDate)} Interactions
              </h2>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-1.5 rounded ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <div className="p-4">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const dayInteractions = getInteractionsForDay(day);
                    const isCurrentMonth = isDateSameMonth(day, currentDate);
                    const isCurrentDay = isDateToday(day);

                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] p-1 rounded-lg border ${
                          isCurrentDay
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : isCurrentMonth
                            ? 'border-gray-100 dark:border-gray-700'
                            : 'border-transparent bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            isCurrentMonth
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayInteractions.slice(0, 3).map((interaction) => (
                            <div
                              key={interaction.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                interaction.type === 'call'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : interaction.type === 'email'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                  : interaction.type === 'meeting'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : interaction.type === 'demo'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                              title={`${getTypeLabel(interaction.type)} - ${
                                getCustomer(interaction.customerId)?.name || 'Unknown'
                              }`}
                            >
                              {getCustomer(interaction.customerId)?.name?.split(' ')[0] || 'N/A'}
                            </div>
                          ))}
                          {dayInteractions.length > 3 && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 px-1">
                              +{dayInteractions.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                {filteredInteractions.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No interactions this month.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredInteractions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((interaction) => {
                        const customer = getCustomer(interaction.customerId);
                        return (
                          <div
                            key={interaction.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
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
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {getTypeLabel(interaction.type)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(interaction.date)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {customer?.name || 'Unknown Customer'}
                              </p>
                              {interaction.notes && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                                  {interaction.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Follow-ups */}
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={18} />
                Upcoming Follow-ups
              </h2>
            </div>
            <div className="p-4">
              {upcomingFollowUps.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming follow-ups
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => onNavigate?.('interactions')}
                    >
                      <AlertCircle
                        size={16}
                        className="text-yellow-500 dark:text-yellow-400 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {followUp.customer?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(followUp.followUpDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Engaged Customers */}
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} />
                Top Engaged Customers
              </h2>
            </div>
            <div className="p-4">
              {topCustomers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No customer interactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((item, index) => (
                    <div
                      key={item.customer.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => onNavigate?.('customers', item.customer)}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.customer.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.interactionCount} interactions
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.customer.pipelineStage === 'closed_won'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : item.customer.pipelineStage === 'closed_lost'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getPipelineLabel(item.customer.pipelineStage).split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Summary */}
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} />
                Pipeline Summary
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {PIPELINE_STAGES.map((stage) => {
                const count = stats.customersByStage[stage.id] || 0;
                const percentage =
                  stats.totalCustomers > 0
                    ? Math.round((count / stats.totalCustomers) * 100)
                    : 0;
                return (
                  <div key={stage.id} className="flex items-center gap-2">
                    <div className="w-24 text-xs text-gray-600 dark:text-gray-400 truncate">
                      {stage.label}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stage.color === 'gray'
                            ? 'bg-gray-400'
                            : stage.color === 'blue'
                            ? 'bg-blue-500'
                            : stage.color === 'purple'
                            ? 'bg-purple-500'
                            : stage.color === 'yellow'
                            ? 'bg-yellow-500'
                            : stage.color === 'green'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs text-gray-500 dark:text-gray-400 text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
