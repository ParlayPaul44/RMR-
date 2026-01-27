import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useCRM, PROJECT_STAGES } from '../context/CRMContext';

export default function ProjectForm({ project, customerId, onClose }) {
  const { addProject, updateProject, customers } = useCRM();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerId: customerId || '',
    stage: 'lead',
    value: '',
    expectedCloseDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        customerId: project.customerId || '',
        stage: project.stage || 'lead',
        value: project.value || '',
        expectedCloseDate: project.expectedCloseDate || '',
        notes: project.notes || '',
      });
    }
  }, [project]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : 0,
    };

    if (project) {
      updateProject({ ...data, id: project.id });
    } else {
      addProject(data);
    }

    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {project ? 'Edit Product Project' : 'Add Product Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Product Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="New Building Installation"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[80px] resize-y"
              placeholder="Brief description of the product project..."
            />
          </div>

          <div>
            <label className="label">Customer *</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className={`select ${errors.customerId ? 'border-red-500' : ''}`}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.company ? ` - ${customer.company}` : ''}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="select"
              >
                {PROJECT_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Product Value ($)</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className="input"
                placeholder="25000"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div>
            <label className="label">Expected Close Date</label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input min-h-[100px] resize-y"
              placeholder="Additional notes about this product project..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {project ? 'Update' : 'Add'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
