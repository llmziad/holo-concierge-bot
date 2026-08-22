'use client';

import { motion } from 'framer-motion';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { useLocationSearch } from '@/hooks/use-location-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { POPULAR_AREAS } from '@/lib/constants/dubai-areas';
import { useState } from 'react';

export function StepLocation() {
  const { locationName, setLocation, nextStep } = useQuestionnaireStore();
  const { suggestions, search } = useLocationSearch();
  const [inputValue, setInputValue] = useState(locationName || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInput = (val: string) => {
    setInputValue(val);
    search(val);
    setShowSuggestions(true);
  };

  const handleSelect = (id: string, name: string) => {
    setLocation(id, name);
    setInputValue(name);
    setShowSuggestions(false);
  };

  const handleSkip = () => {
    if (!locationName) {
      setLocation('', 'Dubai');
    }
    nextStep();
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
          Where do you work or study?
        </h2>
        <p className="text-muted-foreground">
          We&apos;ll factor in your commute when scoring properties
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for a location in Dubai..."
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 h-12 text-base bg-card"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && (suggestions.length > 0 || inputValue.length === 0) && (
            <div className="absolute z-20 top-full mt-2 w-full rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-y-auto">
              {(suggestions.length > 0 ? suggestions : POPULAR_AREAS.map(a => ({
                id: a.externalID,
                name: a.name,
                externalID: a.externalID,
                hierarchy: `Dubai > ${a.name}`,
              }))).map((s) => (
                <button
                  key={`${s.id}-${s.name}`}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                  onClick={() => handleSelect(s.externalID || s.id, s.name)}
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.hierarchy}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {locationName && (
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm text-primary">Selected: {locationName}</span>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={nextStep} disabled={!locationName} className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
