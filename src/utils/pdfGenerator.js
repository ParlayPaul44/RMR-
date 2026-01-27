import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatDuration } from './dateUtils';
import { PIPELINE_STAGES, INTERACTION_TYPES, INTERACTION_OUTCOMES } from '../context/CRMContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const getPipelineLabel = (stageId) => {
  return PIPELINE_STAGES.find((s) => s.id === stageId)?.label || stageId;
};

const getInteractionTypeLabel = (typeId) => {
  return INTERACTION_TYPES.find((t) => t.id === typeId)?.label || typeId;
};

const getOutcomeLabel = (outcomeId) => {
  return INTERACTION_OUTCOMES.find((o) => o.id === outcomeId)?.label || outcomeId;
};

export const generateMonthlyReport = ({
  dateRange,
  salesRepName,
  stats,
  topEngagedCustomers,
  customersContacted,
  interactions,
  customers,
  upcomingFollowUps,
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper to add page break if needed
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > 270) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Colors
  const primaryColor = [37, 99, 235]; // blue-600
  const textColor = [31, 41, 55]; // gray-800
  const mutedColor = [107, 114, 128]; // gray-500

  // ==================== HEADER ====================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales CRM Monthly Report', 14, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateRange.label}`, 14, 35);
  doc.text(`Sales Rep: ${salesRepName}`, pageWidth - 14, 35, { align: 'right' });

  yPosition = 55;

  // ==================== MONTHLY METRICS ====================
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Metrics', 14, yPosition);
  yPosition += 10;

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Metrics grid
  const metrics = [
    ['Total Interactions', stats.totalInteractions.toString()],
    ['Unique Customers Contacted', stats.uniqueCustomersContacted.toString()],
    ['New Customers Added', stats.newCustomers.toString()],
    ['Deals Closed (Won)', stats.dealsWon.toString()],
    ['Deals Closed (Lost)', stats.dealsLost.toString()],
    ['Total Pipeline Value', formatCurrency(stats.totalPipelineValue)],
    ['Closed Won Value', formatCurrency(stats.closedWonValue)],
    ['Closed Lost Value', formatCurrency(stats.closedLostValue)],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metrics,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' },
    },
    margin: { left: 14, right: pageWidth / 2 + 5 },
  });

  // Interactions by Type
  const interactionsByTypeData = Object.entries(stats.interactionsByType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => [getInteractionTypeLabel(type), count.toString()]);

  if (interactionsByTypeData.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Interaction Type', 'Count']],
      body: interactionsByTypeData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: pageWidth / 2 + 5, right: 14 },
    });
  }

  yPosition = Math.max(doc.lastAutoTable.finalY || yPosition, yPosition) + 15;
  checkPageBreak(50);

  // ==================== CUSTOMER HIGHLIGHTS ====================
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Highlights - Top 5 Most Engaged', 14, yPosition);
  yPosition += 10;

  if (topEngagedCustomers.length > 0) {
    const topCustomerData = topEngagedCustomers.map((item) => [
      item.customer.name,
      item.customer.company || '-',
      getPipelineLabel(item.customer.pipelineStage),
      formatCurrency(item.customer.dealValue),
      item.interactionCount.toString(),
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Name', 'Company', 'Pipeline Stage', 'Deal Value', 'Interactions']],
      body: topCustomerData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No customer interactions recorded this period.', 14, yPosition);
    yPosition += 15;
  }

  checkPageBreak(60);

  // ==================== INDIVIDUAL CUSTOMER SECTIONS ====================
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 14, yPosition);
  yPosition += 10;

  if (customersContacted.length > 0) {
    customersContacted.forEach((customer, index) => {
      checkPageBreak(60);

      const customerInteractions = interactions.filter((i) => i.customerId === customer.id);
      const customerFollowUps = upcomingFollowUps.filter((f) => f.customerId === customer.id);

      // Customer header
      doc.setFillColor(243, 244, 246); // gray-100
      doc.rect(14, yPosition - 5, pageWidth - 28, 20, 'F');

      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${customer.name}`, 16, yPosition + 3);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedColor);
      const customerInfo = [customer.company, customer.industry, customer.email].filter(Boolean).join(' | ');
      doc.text(customerInfo, 16, yPosition + 10);

      yPosition += 20;

      // Customer details
      doc.setTextColor(...textColor);
      doc.setFontSize(9);
      doc.text(`Pipeline: ${getPipelineLabel(customer.pipelineStage)}`, 16, yPosition);
      doc.text(`Deal Value: ${formatCurrency(customer.dealValue)}`, 80, yPosition);
      yPosition += 8;

      // Customer interactions
      if (customerInteractions.length > 0) {
        const interactionData = customerInteractions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((i) => [
            formatDate(i.date),
            getInteractionTypeLabel(i.type),
            getOutcomeLabel(i.outcome),
            i.notes?.substring(0, 60) + (i.notes?.length > 60 ? '...' : '') || '-',
          ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Date', 'Type', 'Outcome', 'Notes']],
          body: interactionData,
          theme: 'plain',
          headStyles: { fillColor: [229, 231, 235], textColor: textColor, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 25 },
            2: { cellWidth: 30 },
            3: { cellWidth: 'auto' },
          },
          margin: { left: 16, right: 16 },
        });

        yPosition = doc.lastAutoTable.finalY + 5;
      }

      // Follow-ups
      if (customerFollowUps.length > 0) {
        doc.setTextColor(...mutedColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Scheduled follow-ups: ${customerFollowUps.map((f) => formatDate(f.followUpDate)).join(', ')}`, 16, yPosition);
        yPosition += 5;
      }

      yPosition += 10;
    });
  } else {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No customers contacted this period.', 14, yPosition);
    yPosition += 15;
  }

  checkPageBreak(60);

  // ==================== ACTIVITY TIMELINE ====================
  doc.addPage();
  yPosition = 20;

  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Activity Timeline', 14, yPosition);
  yPosition += 10;

  if (interactions.length > 0) {
    const sortedInteractions = [...interactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const timelineData = sortedInteractions.map((i) => {
      const customer = customers.find((c) => c.id === i.customerId);
      return [
        formatDate(i.date, 'MMM d'),
        getInteractionTypeLabel(i.type),
        customer?.name || 'Unknown',
        getOutcomeLabel(i.outcome),
        i.duration ? formatDuration(i.duration) : '-',
        i.notes?.substring(0, 40) + (i.notes?.length > 40 ? '...' : '') || '-',
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['Date', 'Type', 'Customer', 'Outcome', 'Duration', 'Notes']],
      body: timelineData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 22 },
        2: { cellWidth: 35 },
        3: { cellWidth: 28 },
        4: { cellWidth: 18 },
        5: { cellWidth: 'auto' },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No interactions recorded this period.', 14, yPosition);
    yPosition += 15;
  }

  checkPageBreak(60);

  // ==================== INSIGHTS ====================
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Insights & Recommendations', 14, yPosition);
  yPosition += 10;

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Generate insights based on data
  const insights = generateInsights(stats, interactions, customers, topEngagedCustomers);

  insights.forEach((insight) => {
    checkPageBreak(20);
    const splitText = doc.splitTextToSize(`• ${insight}`, pageWidth - 30);
    doc.text(splitText, 16, yPosition);
    yPosition += splitText.length * 5 + 3;
  });

  // ==================== FOOTER ====================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    doc.text(`Generated on ${formatDate(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, 285);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, 285, { align: 'right' });
  }

  return doc;
};

const generateInsights = (stats, interactions, customers, topEngagedCustomers) => {
  const insights = [];

  // Activity level insight
  if (stats.totalInteractions === 0) {
    insights.push('No interactions were recorded this period. Consider increasing outreach activities.');
  } else if (stats.totalInteractions < 10) {
    insights.push(`Activity level is low with only ${stats.totalInteractions} interactions. Consider increasing customer touchpoints.`);
  } else {
    insights.push(`Strong activity level with ${stats.totalInteractions} total interactions this period.`);
  }

  // Pipeline insight
  const activeDeals = customers.filter((c) => !['closed_won', 'closed_lost'].includes(c.pipelineStage)).length;
  if (activeDeals > 0) {
    insights.push(`You have ${activeDeals} active deals in the pipeline worth ${formatCurrency(stats.totalPipelineValue)}.`);
  }

  // Win rate insight
  const totalClosed = stats.dealsWon + stats.dealsLost;
  if (totalClosed > 0) {
    const winRate = Math.round((stats.dealsWon / totalClosed) * 100);
    insights.push(`Win rate: ${winRate}% (${stats.dealsWon} won, ${stats.dealsLost} lost).`);
  }

  // Top customer insight
  if (topEngagedCustomers.length > 0) {
    const top = topEngagedCustomers[0];
    insights.push(`Most engaged customer: ${top.customer.name} with ${top.interactionCount} interactions.`);
  }

  // Follow-up insights
  const needsFollowUp = interactions.filter((i) => i.outcome === 'needs_follow_up' && !i.followUpDate).length;
  if (needsFollowUp > 0) {
    insights.push(`${needsFollowUp} interaction(s) marked as "Needs Follow-up" without a scheduled date. Consider scheduling follow-ups.`);
  }

  // Objection handling
  const objections = interactions.filter((i) => i.outcome === 'objection_raised').length;
  if (objections > 0) {
    insights.push(`${objections} objection(s) were raised this period. Review notes to identify common concerns and prepare responses.`);
  }

  // Interaction type distribution
  const mostCommonType = Object.entries(stats.interactionsByType).sort(([, a], [, b]) => b - a)[0];
  if (mostCommonType && mostCommonType[1] > 0) {
    insights.push(`Most common interaction type: ${getInteractionTypeLabel(mostCommonType[0])} (${mostCommonType[1]} occurrences).`);
  }

  // Prospect stage customers
  const prospects = customers.filter((c) => c.pipelineStage === 'prospect').length;
  if (prospects > 5) {
    insights.push(`You have ${prospects} prospects. Focus on qualifying leads to move them through the pipeline.`);
  }

  return insights;
};

export const downloadPDF = (doc, filename = 'sales-report.pdf') => {
  doc.save(filename);
};

const formatCurrencySimple = formatCurrency;

export { formatCurrency as formatCurrencyValue, formatCurrencySimple };
