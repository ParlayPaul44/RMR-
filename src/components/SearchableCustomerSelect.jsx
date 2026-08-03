import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export default function SearchableCustomerSelect({
  customers,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Search or select a customer...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCustomer = customers.find((c) => c.id === value);

  const filteredCustomers = customers.filter((customer) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.company?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customerId) => {
    onChange(customerId);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        className={`flex items-center gap-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg cursor-pointer ${
          error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Search size={16} className="text-gray-400 shrink-0" />

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 text-sm truncate ${selectedCustomer ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            {selectedCustomer
              ? `${selectedCustomer.name}${selectedCustomer.company ? ` (${selectedCustomer.company})` : ''}`
              : placeholder}
          </span>
        )}

        {selectedCustomer && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}

        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              {search ? 'No customers found' : 'No customers available'}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleSelect(customer.id)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  customer.id === value ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.name}
                </div>
                {customer.company && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {customer.company}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
