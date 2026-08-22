'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface FloorPlanReimagineProps {
  floorPlanUrl: string;
  bedrooms: number;
  area: number;
  propertyType: string;
  title: string;
}

interface RoomImage {
  name: string;
  url: string;
}

type Stage = {
  label: string;
  status: 'pending' | 'active' | 'complete';
};

type ViewState = 'idle' | 'loading' | 'complete' | 'error';

export function FloorPlanReimagine({
  floorPlanUrl,
  bedrooms,
  area,
  propertyType,
  title,
}: FloorPlanReimagineProps) {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [stages, setStages] = useState<Stage[]>([]);
  const [rooms, setRooms] = useState<RoomImage[]>([]);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomImage | null>(null);

  const generate = useCallback(async () => {
    setViewState('loading');
    setRooms([]);
    setError('');

    const initialStages: Stage[] = [
      { label: 'Analyzing floor plan rooms...', status: 'active' },
      { label: 'Generating room renderings...', status: 'pending' },
    ];
    setStages([...initialStages]);

    try {
      const res = await fetch('/api/ai/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floorPlanUrl, bedrooms, area, propertyType, title }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();

      // Mark analysis complete, generation complete
      initialStages[0].status = 'complete';
      initialStages[1].status = 'active';
      setStages([...initialStages]);

      // Progressively reveal room images
      const resultRooms: RoomImage[] = data.rooms || [];
      for (let i = 0; i < resultRooms.length; i++) {
        await new Promise((r) => setTimeout(r, 300));
        setRooms((prev) => [...prev, resultRooms[i]]);
      }

      initialStages[1].status = 'complete';
      setStages([...initialStages]);
      setViewState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setViewState('error');
    }
  }, [floorPlanUrl, bedrooms, area, propertyType, title]);

  if (viewState === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
          <Image
            src={floorPlanUrl}
            alt={`Floor plan for ${title}`}
            fill
            unoptimized
            className="object-cover"
            sizes="64px"
          />
        </div>
        <Button
          onClick={generate}
          className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Reimagine This Space
        </Button>
      </motion.div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="p-6 rounded-xl border border-loss/30 bg-loss/5">
        <div className="flex items-center gap-2 text-loss mb-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Generation Failed</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={generate} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Determine grid slots — show skeletons for rooms not yet loaded
  const totalSlots = Math.max(rooms.length, 4);

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Progress stages */}
      <AnimatePresence>
        {viewState === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {stage.status === 'complete' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-gain flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-background" />
                    </motion.div>
                  ) : stage.status === 'active' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    stage.status === 'active'
                      ? 'text-foreground font-medium'
                      : stage.status === 'complete'
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {stage.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2x2 room grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: totalSlots }, (_, i) => {
          const room = rooms[i];
          return (
            <div
              key={room?.name || `skeleton-${i}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-border"
            >
              {room ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => setSelectedRoom(room)}
                  role="button"
                  aria-label={`View ${room.name} rendering fullscreen`}
                >
                  <Image
                    src={room.url}
                    alt={`AI-generated rendering of the ${room.name}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <Badge variant="secondary" className="text-xs">
                      {room.name}
                    </Badge>
                  </div>
                </motion.div>
              ) : (
                <Skeleton className="w-full h-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Regenerate button */}
      {viewState === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <Button variant="outline" onClick={generate} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
          <p className="text-xs text-muted-foreground flex-1">
            Room-by-room renderings based on the floor plan analysis
          </p>
        </motion.div>
      )}

      {/* Fullscreen dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-3xl p-2 sm:max-w-3xl">
          <DialogTitle className="sr-only">
            {selectedRoom?.name} rendering
          </DialogTitle>
          {selectedRoom && (
            <div className="relative">
              <Image
                src={selectedRoom.url}
                alt={`AI-generated rendering of the ${selectedRoom.name}`}
                width={1024}
                height={1024}
                unoptimized
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/60 text-white border-0">
                  {selectedRoom.name}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
