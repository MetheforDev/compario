'use client';

import { useEffect } from 'react';
import { saveCompareHistory } from '@/lib/compare-history';

interface Props {
  ids: string[];
  names: string[];
}

export function CompareHistorySaver({ ids, names }: Props) {
  useEffect(() => {
    if (ids.length >= 2) saveCompareHistory(ids, names);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
