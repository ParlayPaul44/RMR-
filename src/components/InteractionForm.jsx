import { useState, useEffect } from 'react';
import { X, Plus, Tag, Zap } from 'lucide-react';
import { useCRM, INTERACTION_TYPES, INTERACTION_OUTCOMES } from '../context/CRMContext';
import { toISODateTimeString, toISODateString } from '../utils/dateUtils';

export default function InteractionForm({
  interaction,
  customerId,
  onClose,
  onSave,
  quickMode = false,
}) {
  const { addInteraction, updateInteraction, customers, tags, addTag } = useCRM();
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    date: toISODateTimeString(new Date()),
    type: 'call',
    duration: '',
    notes: '',
    outcome: 'neutral',
    followUpDate: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isQuickMode, setIsQuickMode] = useState(quickMode);

  useEffect(() => {
    if (interaction) {
      setFormData({
        customerId: interaction.customerId || '',
        date: interaction.date ? toISODateTimeString(new Date(interaction.date)) : toISODateTimeString(new Date()),
        type: interaction.type || 'call',
        duration: interaction.duration || '',
        notes: interaction.notes || '',
        outcome: interaction.outcome || 'neutral',
        followUpDate: interaction.followUpDate ? toISODateString(new Date(interaction.followUpDate)) : '',
        tags: interaction.tags || [],
      });
    }
  }, [interaction]);

  const validate = () => {
    const newErrors = {};
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.type) newErrors.type = 'Type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      duration: formData.duration ? parseInt(formData.duration) : null,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
    };

    if (interaction) {
      updateInteraction({ ...data, id: interaction.id });
    } else {
      addInteraction(data);
    }

    onSave?.();
    onClose();
  };

  const handleQuickSubmit = () => {
    if (!formData.customerId || !formData.type) {
      validate();
      return;
    }

    const data = {
      customerId: formData.customerId,
      date: new Date().toISOString(),
      type: formData.type,
      outcome: formData.outcome,
      notes: formData.notes,
      duration: null,
      followUpDate: null,
      tags: [],
    };

    addInteraction(data);

    // Reset for next quick entry
    setFormData((prev) => ({
      ...prev,
      notes: '',
      customerId: customerId || '',
    }));

    onSave?.();
    if (!customerId) {
      // Only close if not in customer-specific mode
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {interaction ? 'Edit Interaction' : 'Log Interaction'}
            </h2>
            {!interaction && (
              <button
                onClick={() => setIsQuickMode(!isQuickMode)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  isQuickMode
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <Zap size={12} />
                Quick Mode
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="label">Customer *</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className={`select ${errors.customerId ? 'border-red-500' : ''}`}
              disabled={!!customerId}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.company ? `(${customer.company})` : ''}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>
            )}
          </div>

          {/* Quick mode: simplified form */}
          {isQuickMode ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select"
                  >
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
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleChange}
                    className="select"
                  >
                    {INTERACTION_OUTCOMES.map((outcome) => (
                      <option key={outcome.id} value={outcome.id}>
                        {outcome.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Quick Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input"
                  placeholder="Brief note about the interaction..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickSubmit}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Zap size={16} />
                  Quick Log
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Full form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`input ${errors.date ? 'border-red-500' : ''}`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label className="label">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`select ${errors.type ? 'border-red-500' : ''}`}
                  >
                    {INTERACTION_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input"
                    placeholder="30"
                    min="1"
                  />
                </div>
                <div>
                  <label className="label">Outcome</label>
                  <select
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleChange}
                    className="select"
                  >
                    {INTERACTION_OUTCOMES.map((outcome) => (
                      <option key={outcome.id} value={outcome.id}>
                        {outcome.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Follow-up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input min-h-[120px] resize-y"
                  placeholder="Detailed notes about the interaction..."
                />
              </div>

              <div>
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full text-sm"
                    >
                      <Tag size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-primary-900 dark:hover:text-primary-100"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="input flex-1"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn btn-secondary"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags
                      .filter((tag) => !formData.tags.includes(tag))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              tags: [...prev.tags, tag],
                            }))
                          }
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {interaction ? 'Update' : 'Log'} Interaction
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
