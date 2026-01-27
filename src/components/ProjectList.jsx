import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Building,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronRight,
  User,
  Layers,
  List,
} from 'lucide-react';
import { useCRM, PROJECT_STAGES } from '../context/CRMContext';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import ProjectForm from './ProjectForm';

const StageBadge = ({ stage }) => {
  const stageInfo = PROJECT_STAGES.find((s) => s.id === stage);
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <span className={`badge ${colorClasses[stageInfo?.color] || colorClasses.gray}`}>
      {stageInfo?.label || stage}
    </span>
  );
};

const ProjectCard = ({ project, customer, onEdit, onDelete, onDragStart }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project)}
      className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
          {project.name}
        </h4>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MoreVertical size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-red-600"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {customer && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <User size={10} />
          {customer.name}
        </p>
      )}

      {project.value > 0 && (
        <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
          {formatCurrency(project.value)}
        </p>
      )}

      {project.expectedCloseDate && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
          <Calendar size={10} />
          {formatDate(project.expectedCloseDate)}
        </p>
      )}
    </div>
  );
};

export default function ProjectList() {
  const { projects, customers, deleteProject, updateProject } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' or 'list'
  const [draggedProject, setDraggedProject] = useState(null);

  const filteredProjects = useMemo(() => {
    let result = [...(projects || [])];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (filterStage !== 'all') {
      result = result.filter((p) => p.stage === filterStage);
    }

    if (filterCustomer !== 'all') {
      result = result.filter((p) => p.customerId === filterCustomer);
    }

    return result;
  }, [projects, searchQuery, filterStage, filterCustomer]);

  const projectsByStage = useMemo(() => {
    const grouped = {};
    PROJECT_STAGES.forEach((stage) => {
      grouped[stage.id] = filteredProjects.filter((p) => p.stage === stage.id);
    });
    return grouped;
  }, [filteredProjects]);

  const getCustomer = (customerId) => {
    return customers.find((c) => c.id === customerId);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const handleDragStart = (e, project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedProject && draggedProject.stage !== stageId) {
      updateProject({ ...draggedProject, stage: stageId });
    }
    setDraggedProject(null);
  };

  const totalPipelineValue = (projects || [])
    .filter((p) => !['completed', 'lost'].includes(p.stage))
    .reduce((sum, p) => sum + (p.value || 0), 0);

  const getStageValue = (stageId) => {
    return (projectsByStage[stageId] || []).reduce((sum, p) => sum + (p.value || 0), 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(projects || []).length} total • {formatCurrency(totalPipelineValue)} in pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`p-1.5 rounded ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Pipeline View"
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Project
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
              placeholder="Search projects..."
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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="select"
              >
                <option value="all">All Stages</option>
                {PROJECT_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
        )}
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {PROJECT_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="w-72 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="card">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StageBadge stage={stage.id} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({(projectsByStage[stage.id] || []).length})
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatCurrency(getStageValue(stage.id))}
                    </p>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto scrollbar-thin">
                    {(projectsByStage[stage.id] || []).length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                        No projects
                      </p>
                    ) : (
                      (projectsByStage[stage.id] || []).map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          customer={getCustomer(project.customerId)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onDragStart={handleDragStart}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {(projects || []).length === 0
                  ? 'No projects yet. Add your first project to get started.'
                  : 'No projects match your search criteria.'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stage
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Value
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expected Close
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map((project) => {
                  const customer = getCustomer(project.customerId);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </p>
                        {project.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {project.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {customer?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <StageBadge stage={project.stage} />
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-green-600 dark:text-green-400">
                        {project.value ? formatCurrency(project.value) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {project.expectedCloseDate
                          ? formatDate(project.expectedCloseDate)
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
