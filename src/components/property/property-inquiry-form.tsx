'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface PropertyInquiryFormProps {
  propertyTitle: string;
  propertyId: string;
}

export function PropertyInquiryForm({ propertyTitle, propertyId }: PropertyInquiryFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const isValid = name.trim().length > 0 && email.includes('@') && phone.trim().length > 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setStatus('submitting');

    // Simulate API call — replace with real endpoint when ready
    await new Promise((r) => setTimeout(r, 1200));

    console.log('Lead captured:', { name, email, phone, propertyId, propertyTitle });
    setStatus('success');
  };

  return (
    <AnimatePresence mode="wait">
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-12 h-12 rounded-full bg-gain/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-gain" />
          </div>
          <p className="font-serif text-base font-semibold tracking-tight text-gain mb-1">
            We&apos;ve got your details
          </p>
          <p className="text-xs text-muted-foreground">
            Our team will reach out shortly about this property.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          <div>
            <label htmlFor="inquiry-name" className="text-xs text-muted-foreground mb-1 block">
              Full Name
            </label>
            <Input
              id="inquiry-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="inquiry-email" className="text-xs text-muted-foreground mb-1 block">
              Email
            </label>
            <Input
              id="inquiry-email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="inquiry-phone" className="text-xs text-muted-foreground mb-1 block">
              Phone
            </label>
            <Input
              id="inquiry-phone"
              type="tel"
              placeholder="+971 50 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <Button
            type="submit"
            disabled={!isValid || status === 'submitting'}
            className="w-full gap-2 mt-1"
          >
            {status === 'submitting' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {status === 'submitting' ? 'Sending...' : 'Help Me Get This'}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
