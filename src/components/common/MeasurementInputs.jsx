/**
 * MeasurementInputs Component
 * Comprehensive measurement input fields for all garment types
 * Used in customer management forms with accordion/dropdown functionality
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MeasurementInputs = ({ measurements, onChange }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const handleChange = (category, field, value) => {
    onChange(category, field, value);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">Measurements (Optional)</h3>
      
      {/* Pant Measurements */}
      <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('pant')}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-xl">👖</span> Pant Measurements
          </h4>
          {expandedSection === 'pant' ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        {expandedSection === 'pant' && (
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                <input
                  type="number"
                  value={measurements.pant.length}
                  onChange={(e) => handleChange('pant', 'length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                <input
                  type="number"
                  value={measurements.pant.waist}
                  onChange={(e) => handleChange('pant', 'waist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Seat / Hips</label>
                <input
                  type="number"
                  value={measurements.pant.seatHips}
                  onChange={(e) => handleChange('pant', 'seatHips', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Knee</label>
                <input
                  type="number"
                  value={measurements.pant.knee}
                  onChange={(e) => handleChange('pant', 'knee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bottom Opening / Ankle</label>
                <input
                  type="number"
                  value={measurements.pant.bottomOpening}
                  onChange={(e) => handleChange('pant', 'bottomOpening', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Thigh Circumference / Flare</label>
                <input
                  type="number"
                  value={measurements.pant.thighCircumference}
                  onChange={(e) => handleChange('pant', 'thighCircumference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Thigh</label>
                <input
                  type="number"
                  value={measurements.pant.thigh}
                  onChange={(e) => handleChange('pant', 'thigh', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shirt Measurements */}
      <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('shirt')}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-xl">👔</span> Shirt Measurements
          </h4>
          {expandedSection === 'shirt' ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        {expandedSection === 'shirt' && (
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                <input
                  type="number"
                  value={measurements.shirt.length}
                  onChange={(e) => handleChange('shirt', 'length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Chest</label>
                <input
                  type="number"
                  value={measurements.shirt.chest}
                  onChange={(e) => handleChange('shirt', 'chest', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                <input
                  type="number"
                  value={measurements.shirt.waist}
                  onChange={(e) => handleChange('shirt', 'waist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shoulder</label>
                <input
                  type="number"
                  value={measurements.shirt.shoulder}
                  onChange={(e) => handleChange('shirt', 'shoulder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Sleeve Length</label>
                <input
                  type="number"
                  value={measurements.shirt.sleeveLength}
                  onChange={(e) => handleChange('shirt', 'sleeveLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Armhole</label>
                <input
                  type="number"
                  value={measurements.shirt.armhole}
                  onChange={(e) => handleChange('shirt', 'armhole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Collar (Neck)</label>
                <input
                  type="number"
                  value={measurements.shirt.collar}
                  onChange={(e) => handleChange('shirt', 'collar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coat Measurements */}
      <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('coat')}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-xl">🧥</span> Coat Measurements
          </h4>
          {expandedSection === 'coat' ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        {expandedSection === 'coat' && (
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                <input
                  type="number"
                  value={measurements.coat.length}
                  onChange={(e) => handleChange('coat', 'length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Chest</label>
                <input
                  type="number"
                  value={measurements.coat.chest}
                  onChange={(e) => handleChange('coat', 'chest', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                <input
                  type="number"
                  value={measurements.coat.waist}
                  onChange={(e) => handleChange('coat', 'waist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shoulder</label>
                <input
                  type="number"
                  value={measurements.coat.shoulder}
                  onChange={(e) => handleChange('coat', 'shoulder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Sleeve Length</label>
                <input
                  type="number"
                  value={measurements.coat.sleeveLength}
                  onChange={(e) => handleChange('coat', 'sleeveLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Armhole</label>
                <input
                  type="number"
                  value={measurements.coat.armhole}
                  onChange={(e) => handleChange('coat', 'armhole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kurta Measurements */}
      <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('kurta')}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-xl">🥻</span> Kurta Measurements
          </h4>
          {expandedSection === 'kurta' ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        {expandedSection === 'kurta' && (
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                <input
                  type="number"
                  value={measurements.kurta.length}
                  onChange={(e) => handleChange('kurta', 'length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                <input
                  type="number"
                  value={measurements.kurta.waist}
                  onChange={(e) => handleChange('kurta', 'waist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Seat / Hips</label>
                <input
                  type="number"
                  value={measurements.kurta.seatHips}
                  onChange={(e) => handleChange('kurta', 'seatHips', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Sleeve</label>
                <input
                  type="number"
                  value={measurements.kurta.sleeve}
                  onChange={(e) => handleChange('kurta', 'sleeve', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shoulder</label>
                <input
                  type="number"
                  value={measurements.kurta.shoulder}
                  onChange={(e) => handleChange('kurta', 'shoulder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Armhole</label>
                <input
                  type="number"
                  value={measurements.kurta.armhole}
                  onChange={(e) => handleChange('kurta', 'armhole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bottom Opening / Cuff</label>
                <input
                  type="number"
                  value={measurements.kurta.bottomOpening}
                  onChange={(e) => handleChange('kurta', 'bottomOpening', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Flare / Circumference</label>
                <input
                  type="number"
                  value={measurements.kurta.flare}
                  onChange={(e) => handleChange('kurta', 'flare', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Front Neck</label>
                <input
                  type="number"
                  value={measurements.kurta.frontNeck}
                  onChange={(e) => handleChange('kurta', 'frontNeck', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Back Neck</label>
                <input
                  type="number"
                  value={measurements.kurta.backNeck}
                  onChange={(e) => handleChange('kurta', 'backNeck', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dhoti Measurements */}
      <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('dhoti')}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-xl">🎽</span> Dhoti Measurements
          </h4>
          {expandedSection === 'dhoti' ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        {expandedSection === 'dhoti' && (
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                <input
                  type="number"
                  value={measurements.dhoti.length}
                  onChange={(e) => handleChange('dhoti', 'length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                <input
                  type="number"
                  value={measurements.dhoti.waist}
                  onChange={(e) => handleChange('dhoti', 'waist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Hip</label>
                <input
                  type="number"
                  value={measurements.dhoti.hip}
                  onChange={(e) => handleChange('dhoti', 'hip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Side Length</label>
                <input
                  type="number"
                  value={measurements.dhoti.sideLength}
                  onChange={(e) => handleChange('dhoti', 'sideLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fold Length</label>
                <input
                  type="number"
                  value={measurements.dhoti.foldLength}
                  onChange={(e) => handleChange('dhoti', 'foldLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Measurements */}
      <div className="mb-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-xl">📏</span> Custom Measurements
        </h4>
        <textarea
          value={measurements.custom}
          onChange={(e) => handleChange('custom', null, e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          placeholder="Enter any custom measurements or notes..."
          rows="3"
        />
      </div>
    </div>
  );
};

export default MeasurementInputs;
