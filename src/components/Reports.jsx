import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Eye,
  BarChart3,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Monitor,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useCRM, INTERACTION_TYPES, PIPELINE_STAGES, INTERACTION_OUTCOMES } from '../context/CRMContext';
import { formatCurrency } from '../utils/formatters';
import {
  formatDate,
  getMonthName,
  navigateMonth,
  getMonthRange,
  formatDateTime,
  formatDuration,
} from '../utils/dateUtils';
import { generateMonthlyReport, downloadPDF } from '../utils/pdfGenerator';

const TypeIcon = ({ type, size = 16 }) => {
  const icons = {
    call: Phone,
    email: Mail,
    meeting: Users,
    demo: Monitor,
    follow_up: RefreshCw,
  };
  const Icon = icons[type] || MessageSquare;
  return <Icon size={size} />;
};

export default function Reports() {
  const {
    interactions,
    customers,
    settings,
    getStats,
    getTopEngagedCustomers,
    getUpcomingFollowUps,
  } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthRange = useMemo(() => getMonthRange(currentDate), [currentDate]);
  const dateRangeLabel = getMonthName(currentDate);

  const stats = useMemo(
    () => getStats(monthRange.start, monthRange.end),
    [getStats, monthRange]
  );

  const topEngagedCustomers = useMemo(
    () => getTopEngagedCustomers(5, monthRange.start, monthRange.end),
    [getTopEngagedCustomers, monthRange]
  );

  const monthInteractions = useMemo(() => {
    return interactions
      .filter((i) => {
        const date = new Date(i.date);
        return date >= monthRange.start && date <= monthRange.end;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [interactions, monthRange]);

  const customersContacted = useMemo(() => {
    const customerIds = new Set(monthInteractions.map((i) => i.customerId));
    return customers.filter((c) => customerIds.has(c.id));
  }, [monthInteractions, customers]);

  const upcomingFollowUps = useMemo(() => {
    return interactions
      .filter((i) => i.followUpDate && new Date(i.followUpDate) >= new Date())
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  }, [interactions]);

  const getCustomer = (customerId) => {
    return customers.find((c) => c.id === customerId);
  };

  const getTypeLabel = (typeId) => {
    return INTERACTION_TYPES.find((t) => t.id === typeId)?.label || typeId;
  };

  const getOutcomeLabel = (outcomeId) => {
    return INTERACTION_OUTCOMES.find((o) => o.id === outcomeId)?.label || outcomeId;
  };

  const getPipelineLabel = (stageId) => {
    return PIPELINE_STAGES.find((s) => s.id === stageId)?.label || stageId;
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = generateMonthlyReport({
        dateRange: { label: dateRangeLabel, start: monthRange.start, end: monthRange.end },
        salesRepName: settings.salesRepName,
        stats,
        topEngagedCustomers,
        customersContacted,
        interactions: monthInteractions,
        customers,
        upcomingFollowUps,
      });

      const filename = `sales-report-${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, '0')}.pdf`;
      downloadPDF(doc, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dateRangeLabel}</p>
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
            This Month
          </button>
          <button
            onClick={() => setCurrentDate(navigateMonth(currentDate, 'next'))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Eye size={18} />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download size={18} />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
        <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
          <Printer size={18} />
          Print
        </button>
      </div>

      {/* Report Preview */}
      {showPreview && (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="card p-6 bg-primary-600 text-white dark:bg-primary-700">
            <h2 className="text-2xl font-bold">Sales CRM Monthly Report</h2>
            <div className="flex flex-wrap items-center justify-between mt-2 text-primary-100">
              <span>{dateRangeLabel}</span>
              <span>Sales Rep: {settings.salesRepName}</span>
            </div>
          </div>

          {/* Monthly Metrics */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Monthly Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Interactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalInteractions}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Customers Contacted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.uniqueCustomersContacted}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">New Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.newCustomers}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalPipelineValue)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Deals Won</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-1">
                  <TrendingUp size={20} />
                  {stats.dealsWon}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(stats.closedWonValue)}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">Deals Lost</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
                  <TrendingDown size={20} />
                  {stats.dealsLost}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {formatCurrency(stats.closedLostValue)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Interactions by Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERACTION_TYPES.map((type) => {
                    const count = stats.interactionsByType[type.id] || 0;
                    if (count === 0) return null;
                    return (
                      <span
                        key={type.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded text-sm"
                      >
                        <TypeIcon type={type.id} size={14} />
                        {type.label}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Top Engaged Customers */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              Top 5 Most Engaged Customers
            </h3>
            {topEngagedCustomers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No customer interactions this month.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Company
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Pipeline
                      </th>
                      <th className="text-right py-2 font-medium text-gray-700 dark:text-gray-300">
                        Deal Value
                      </th>
                      <th className="text-right py-2 font-medium text-gray-700 dark:text-gray-300">
                        Interactions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEngagedCustomers.map((item) => (
                      <tr
                        key={item.customer.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-2 font-medium text-gray-900 dark:text-white">
                          {item.customer.name}
                        </td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">
                          {item.customer.company || '-'}
                        </td>
                        <td className="py-2">
                          <span
                            className={`badge ${
                              item.customer.pipelineStage === 'closed_won'
                                ? 'badge-won'
                                : item.customer.pipelineStage === 'closed_lost'
                                ? 'badge-lost'
                                : 'badge-prospect'
                            }`}
                          >
                            {getPipelineLabel(item.customer.pipelineStage)}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white">
                          {formatCurrency(item.customer.dealValue)}
                        </td>
                        <td className="py-2 text-right font-medium text-primary-600 dark:text-primary-400">
                          {item.interactionCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="card p-6 print-break">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer Details
            </h3>
            {customersContacted.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No customers contacted this month.
              </p>
            ) : (
              <div className="space-y-6">
                {customersContacted.map((customer) => {
                  const customerInteractions = monthInteractions.filter(
                    (i) => i.customerId === customer.id
                  );
                  const customerFollowUps = upcomingFollowUps.filter(
                    (f) => f.customerId === customer.id
                  );

                  return (
                    <div
                      key={customer.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {customer.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {[customer.company, customer.industry, customer.email]
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`badge ${
                                customer.pipelineStage === 'closed_won'
                                  ? 'badge-won'
                                  : customer.pipelineStage === 'closed_lost'
                                  ? 'badge-lost'
                                  : customer.pipelineStage === 'negotiation'
                                  ? 'badge-negotiation'
                                  : customer.pipelineStage === 'proposal'
                                  ? 'badge-proposal'
                                  : customer.pipelineStage === 'qualified'
                                  ? 'badge-qualified'
                                  : 'badge-prospect'
                              }`}
                            >
                              {getPipelineLabel(customer.pipelineStage)}
                            </span>
                            {customer.dealValue > 0 && (
                              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                {formatCurrency(customer.dealValue)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Interactions ({customerInteractions.length})
                        </p>
                        <div className="space-y-2">
                          {customerInteractions.map((interaction) => (
                            <div
                              key={interaction.id}
                              className="flex items-start gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <TypeIcon type={interaction.type} size={14} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">
                                    {getTypeLabel(interaction.type)}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {formatDate(interaction.date)}
                                  </span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded ${
                                      interaction.outcome === 'positive'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : interaction.outcome === 'objection_raised'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : interaction.outcome === 'needs_follow_up'
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {getOutcomeLabel(interaction.outcome)}
                                  </span>
                                </div>
                                {interaction.notes && (
                                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {interaction.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {customerFollowUps.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                              Follow-ups scheduled:{' '}
                              {customerFollowUps.map((f) => formatDate(f.followUpDate)).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card p-6 print-break">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity Timeline
            </h3>
            {monthInteractions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No interactions recorded this month.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Customer
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Outcome
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Duration
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthInteractions.slice(0, 50).map((interaction) => {
                      const customer = getCustomer(interaction.customerId);
                      return (
                        <tr
                          key={interaction.id}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(interaction.date)}
                          </td>
                          <td className="py-2">
                            <span className="flex items-center gap-1">
                              <TypeIcon type={interaction.type} size={14} />
                              {getTypeLabel(interaction.type)}
                            </span>
                          </td>
                          <td className="py-2 font-medium text-gray-900 dark:text-white">
                            {customer?.name || 'Unknown'}
                          </td>
                          <td className="py-2">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                interaction.outcome === 'positive'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : interaction.outcome === 'objection_raised'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  : interaction.outcome === 'needs_follow_up'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {getOutcomeLabel(interaction.outcome)}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-400">
                            {interaction.duration ? formatDuration(interaction.duration) : '-'}
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {interaction.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {monthInteractions.length > 50 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Showing 50 of {monthInteractions.length} interactions. Download PDF for full
                    report.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insights & Recommendations
            </h3>
            <div className="space-y-3">
              {stats.totalInteractions === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  • No interactions were recorded this period. Consider increasing outreach
                  activities.
                </p>
              ) : stats.totalInteractions < 10 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  • Activity level is low with only {stats.totalInteractions} interactions. Consider
                  increasing customer touchpoints.
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  • Strong activity level with {stats.totalInteractions} total interactions this
                  period.
                </p>
              )}

              {customers.filter((c) => !['closed_won', 'closed_lost'].includes(c.pipelineStage))
                .length > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  • You have{' '}
                  {
                    customers.filter(
                      (c) => !['closed_won', 'closed_lost'].includes(c.pipelineStage)
                    ).length
                  }{' '}
                  active deals in the pipeline worth {formatCurrency(stats.totalPipelineValue)}.
                </p>
              )}

              {stats.dealsWon + stats.dealsLost > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  • Win rate:{' '}
                  {Math.round((stats.dealsWon / (stats.dealsWon + stats.dealsLost)) * 100)}% (
                  {stats.dealsWon} won, {stats.dealsLost} lost).
                </p>
              )}

              {topEngagedCustomers.length > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  • Most engaged customer: {topEngagedCustomers[0].customer.name} with{' '}
                  {topEngagedCustomers[0].interactionCount} interactions.
                </p>
              )}

              {monthInteractions.filter((i) => i.outcome === 'needs_follow_up' && !i.followUpDate)
                .length > 0 && (
                <p className="text-yellow-600 dark:text-yellow-400">
                  •{' '}
                  {
                    monthInteractions.filter(
                      (i) => i.outcome === 'needs_follow_up' && !i.followUpDate
                    ).length
                  }{' '}
                  interaction(s) marked as "Needs Follow-up" without a scheduled date. Consider
                  scheduling follow-ups.
                </p>
              )}

              {monthInteractions.filter((i) => i.outcome === 'objection_raised').length > 0 && (
                <p className="text-red-600 dark:text-red-400">
                  • {monthInteractions.filter((i) => i.outcome === 'objection_raised').length}{' '}
                  objection(s) were raised this period. Review notes to identify common concerns.
                </p>
              )}

              {customers.filter((c) => c.pipelineStage === 'prospect').length > 5 && (
                <p className="text-gray-600 dark:text-gray-400">
                  • You have {customers.filter((c) => c.pipelineStage === 'prospect').length}{' '}
                  prospects. Focus on qualifying leads to move them through the pipeline.
                </p>
              )}
            </div>
          </div>

          {/* Report Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            Generated on {formatDateTime(new Date())}
          </div>
        </div>
      )}
    </div>
  );
}
