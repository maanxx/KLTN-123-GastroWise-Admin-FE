'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/itineraries');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500 text-sm">
      Đang chuyển tiếp đến Quản lý Lộ trình AI...
    </div>
  );
}
