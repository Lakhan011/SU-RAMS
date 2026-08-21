'use client';

import { Search, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SupervisorsPage() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.rawRole && !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN'].includes(data.rawRole)) {
          toast.error("You don't have permission to view Supervisors");
          router.replace('/dashboard');
        } else {
          fetch('/api/supervisors')
            .then(res => res.json())
            .then(data => {
              if (data.supervisors) setSupervisors(data.supervisors);
              setLoading(false);
            });
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filtered = supervisors.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supervisors Directory</h1>
          <p className="text-sm text-muted mt-1">View all university supervisors. Manage them from the Users page.</p>
        </div>
        <button 
          onClick={() => router.push('/users')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
        >
          <UserCheck className="w-4 h-4" />
          Manage in Users
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search supervisors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-left">
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Name & Email</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted">Loading supervisors...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted">No supervisors found.</td>
                </tr>
              ) : (
                filtered.map((sup) => (
                  <tr key={sup.id} className="hover:bg-background/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-foreground">{sup.name}</p>
                      <p className="text-xs text-muted">{sup.email}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-light text-success">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-muted">
                      {new Date(sup.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}