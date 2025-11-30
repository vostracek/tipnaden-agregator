'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCategories, Category } from '@/lib/api';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface EventFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
  isFree?: boolean;
  sort?: 'date' | 'title' | 'created';
  order?: 'asc' | 'desc';
}

export default function EventFilters({ onFilterChange, currentFilters }: EventFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const cities = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'Hradec Králové', 'České Budějovice', 'Pardubice'];

  return (
    <div className="mb-8">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-6 bg-slate-800/70 hover:bg-slate-700 text-white border border-slate-700 px-6 py-6 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg"
      >
        <SlidersHorizontal size={20} className="mr-3" />
        {isOpen ? 'Skrýt filtry' : 'Zobrazit filtry'}
        <ChevronDown 
          size={20} 
          className={`ml-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
        {hasActiveFilters && (
          <span className="ml-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-bold">
            {Object.keys(filters).length}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="pt-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Kategorie */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Kategorie
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Všechny kategorie</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Město */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Město
                </label>
                <select
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Všechna města</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datum od */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Datum od
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Datum do */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Datum do
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Cena od */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Cena od (Kč)
                </label>
                <input
                  type="number"
                  value={filters.priceFrom || ''}
                  onChange={(e) => handleFilterChange('priceFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Cena do */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Cena do (Kč)
                </label>
                <input
                  type="number"
                  value={filters.priceTo || ''}
                  onChange={(e) => handleFilterChange('priceTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="5000"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Pouze zdarma */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Typ vstupného
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 hover:bg-slate-900/70 transition-all">
                  <input
                    type="checkbox"
                    checked={filters.isFree || false}
                    onChange={(e) => handleFilterChange('isFree', e.target.checked || undefined)}
                    className="w-5 h-5 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-white font-medium">Pouze zdarma</span>
                </label>
              </div>

              {/* Seřadit podle */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Seřadit podle
                </label>
                <select
                  value={filters.sort || 'date'}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="date">Datum</option>
                  <option value="title">Názvu</option>
                  <option value="created">Přidáno</option>
                </select>
              </div>

              {/* Pořadí */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Pořadí
                </label>
                <select
                  value={filters.order || 'asc'}
                  onChange={(e) => handleFilterChange('order', e.target.value as 'asc' | 'desc')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="asc">Vzestupně</option>
                  <option value="desc">Sestupně</option>
                </select>
              </div>

            </div>

            {hasActiveFilters && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={clearFilters}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <X size={18} />
                  Vymazat filtry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}