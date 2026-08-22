'use client';

import { use } from 'react';
import { PropertyDetailContent } from '@/components/property/property-detail-content';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PropertyDetailContent id={id} />;
}
