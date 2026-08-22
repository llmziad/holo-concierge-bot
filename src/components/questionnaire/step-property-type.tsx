'use client';

import { motion } from 'framer-motion';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { PropertyTypePreference } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { Building, Home, Warehouse, Layers } from 'lucide-react';
import { BEDROOM_OPTIONS } from '@/lib/constants/property-types';

const propertyTypes = [
  { value: 'apartment' as PropertyTypePreference, icon: Building, label: 'Apartment' },
  { value: 'villa' as PropertyTypePreference, icon: Home, label: 'Villa' },
  { value: 'townhouse' as PropertyTypePreference, icon: Warehouse, label: 'Townhouse' },
  { value: 'any' as PropertyTypePreference, icon: Layers, label: 'Any Type' },
];

export function StepPropertyType() {
  const { propertyType, bedrooms, setPropertyType, setBedrooms, complete } = useQuestionnaireStore();

  const handleComplete = () => {
    if (!propertyType) setPropertyType('any');
    complete();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Property preferences
        </h2>
        <p className="text-muted-foreground">
          What type of property and how many bedrooms?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-8"
      >
        {/* Property type */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">Property Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {propertyTypes.map((pt) => (
              <motion.button
                key={pt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPropertyType(pt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  propertyType === pt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <pt.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{pt.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">Bedrooms</label>
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBedrooms(opt.value)}
                className={`px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                  bedrooms === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:border-primary/40'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Button
            onClick={handleComplete}
            size="lg"
            className="gap-2 px-8 glow-primary"
          >
            Find My Properties
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
