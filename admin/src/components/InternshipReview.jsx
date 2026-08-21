import { useCallback, useEffect, useState } from 'react';
import {
  winterAdminDashboard, winterAdminReviewSubmission, winterAdminReviewProof,
  winterAdminApproveApplication, winterAdminRejectApplication,
} from '../lib/winterAdminApi';
import { supabase } from '../lib/supabase';

const KEY_STORAGE = 'ih_admin_winter_key';

const STATUS_STYLES = {
  submitted: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  changes_requested: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
};

const APP_STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

// Course proofs accept PDFs and PNG/JPG images — render image uploads inline so
// the reviewer can verify the certificate without opening a new tab.
const IMAGE_RE = /\.(png|jpe?g|gif|webp)$/i;
function isImageFile(name) {
  return IMAGE_RE.test(name || '');
}

function StatusBadge({ status, map }) {
  const styles = map || STATUS_STYLES;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || styles.submitted}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'approved' ? 'bg-emerald-400' : status === 'changes_requested' || status === 'rejected' ? 'bg-rose-400' : 'animate-pulse bg-amber-400'}`} />
      {(map ? { submitted: 'Submitted', approved: 'Approved', changes_requested: 'Changes Requested', rejected: 'Rejected', pending: 'Pending', draft: 'Draft' } : STATUS_LABELS)[status] || status}
    </span>
  );
}

const linkChip =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:text-white';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-medium text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-400/60';

function ReviewModal({ kind, row, onClose, onReviewed, onFeedback }) {
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const decide = async (status) => {
    if (status !== 'approved' && !feedback.trim()) {
      setError('Please add feedback so the intern knows what to change.');
      return;
    }
    setBusy(true);
    const result = kind === 'proof'
      ? await onFeedback(row.id, status, feedback)
      : await onFeedback(row.id, status, feedback);
    setBusy(false);
    if (!result.success) {
      setError(result.message || 'Review failed.');
      return;
    }
    onReviewed();
    onClose();
  };

  const title = kind === 'proof' ? row.course_title : row.assignment_title;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d1424] p-6 shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Review {kind === 'proof' ? 'Course Proof' : 'Submission'}
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {row.intern_name} · {row.track_name} · Week {row.week_number} · Submitted {formatDate(row.submitted_at)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/10">✕</button>
        </div>

        {row.notes && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-slate-400">
            <span className="mb-1 block font-semibold text-slate-300">Intern notes</span>
            {row.notes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {row.github_url && <a href={row.github_url} target="_blank" rel="noreferrer" className={linkChip}>GitHub</a>}
          {row.live_url && <a href={row.live_url} target="_blank" rel="noreferrer" className={linkChip}>Live</a>}
          {row.attachment_url && <a href={row.attachment_url} target="_blank" rel="noreferrer" className={linkChip}>PDF Report</a>}
          {row.file_url && (isImageFile(row.file_name) ? (
            <a href={row.file_url} target="_blank" rel="noreferrer" className="block max-w-full" title={row.file_name}>
              <img src={row.file_url} alt={row.file_name} className="max-h-40 w-auto max-w-full rounded-xl border border-white/10 object-contain" />
            </a>
          ) : (
            <a href={row.file_url} target="_blank" rel="noreferrer" className={linkChip}>Certificate File</a>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">Reviewer Feedback</label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); setError(''); }}
            placeholder="What did the intern do well? What needs to change?"
            className={`${inputClass} resize-none py-2.5`}
          />
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-400">{error}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10">Cancel</button>
          <button
            onClick={() => decide('changes_requested')}
            disabled={busy}
            className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            Request Changes
          </button>
          <button
            onClick={() => decide('approved')}
            disabled={busy}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmissionsTable({ rows, onReview }) {
  if (!rows.length) return <EmptyState text="No assignment submissions yet. When interns submit solutions they appear here." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-widest text-slate-500">
            <th className="px-4 py-4 font-semibold">Intern</th>
            <th className="px-4 py-4 font-semibold">Assignment</th>
            <th className="px-4 py-4 font-semibold">Track & Week</th>
            <th className="px-4 py-4 font-semibold">Status</th>
            <th className="px-4 py-4 font-semibold">Submitted</th>
            <th className="px-4 py-4 font-semibold">Links</th>
            <th className="px-4 py-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-white/[0.03]">
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-100">{row.intern_name}</p>
                <p className="font-mono text-[11px] text-slate-500">{row.email}</p>
              </td>
              <td className="max-w-[260px] px-4 py-4">
                <p className="truncate font-medium text-slate-200" title={row.assignment_title}>{row.assignment_title}</p>
              </td>
              <td className="px-4 py-4">
                <span className="inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  {row.track_name} <span className="mx-1 text-indigo-500/70">•</span> Week {row.week_number}
                </span>
              </td>
              <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
              <td className="px-4 py-4 text-xs text-slate-500">{formatDate(row.submitted_at)}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {row.github_url && <a href={row.github_url} target="_blank" rel="noreferrer" className={linkChip}>Repo</a>}
                  {row.live_url && <a href={row.live_url} target="_blank" rel="noreferrer" className={linkChip}>Live</a>}
                  {row.attachment_name && <span className="text-[11px] text-slate-500">{row.attachment_name}</span>}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => onReview(row)}
                    className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                  >
                    Review
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProofsTable({ rows, onReview }) {
  if (!rows.length) return <EmptyState text="No course proofs yet. Certificate uploads from interns appear here." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-widest text-slate-500">
            <th className="px-4 py-4 font-semibold">Intern</th>
            <th className="px-4 py-4 font-semibold">Course</th>
            <th className="px-4 py-4 font-semibold">Track & Week</th>
            <th className="px-4 py-4 font-semibold">File</th>
            <th className="px-4 py-4 font-semibold">Status</th>
            <th className="px-4 py-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-white/[0.03]">
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-100">{row.intern_name}</p>
                <p className="font-mono text-[11px] text-slate-500">{row.email}</p>
              </td>
              <td className="max-w-[260px] px-4 py-4">
                <p className="truncate font-medium text-slate-200" title={row.course_title}>{row.course_title}</p>
              </td>
              <td className="px-4 py-4">
                <span className="inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  {row.track_name} <span className="mx-1 text-indigo-500/70">•</span> Week {row.week_number}
                </span>
              </td>
              <td className="max-w-[220px] px-4 py-4 text-xs text-slate-400">
                {isImageFile(row.file_name) ? (
                  <a href={row.file_url} target="_blank" rel="noreferrer" className="block" title={row.file_name}>
                    <img src={row.file_url} alt={row.file_name} className="h-14 w-20 rounded-md border border-white/10 object-cover" />
                  </a>
                ) : (
                  <span className="truncate block">{row.file_name}</span>
                )}
              </td>
              <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => onReview(row)}
                    className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                  >
                    Review
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-300">Nothing here yet</p>
      <p className="max-w-sm text-sm text-slate-500">{text}</p>
    </div>
  );
}

function ApplicationsTab({ adminKey }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [approveTrack, setApproveTrack] = useState({});
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('intern_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setApps(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (app) => {
    const trackId = approveTrack[app.id];
    if (!trackId) return;
    setBusyId(app.id);
    const result = await winterAdminApproveApplication(adminKey, app.id, trackId);
    setBusyId(null);
    if (!result.success) {
      setNotice(`Approve failed: ${result.message}`);
      return;
    }
    setNotice(`Approved ${app.full_name || app.email} — enrollment created.`);
    load();
  };

  const reject = async (app) => {
    setBusyId(app.id);
    const result = await winterAdminRejectApplication(adminKey, app.id);
    setBusyId(null);
    if (!result.success) {
      setNotice(`Reject failed: ${result.message}`);
      return;
    }
    setNotice(`Rejected ${app.full_name || app.email}.`);
    load();
  };

  const trackOptions = [
    { id: 'frontend-engineering', label: 'Frontend' },
    { id: 'backend-engineering', label: 'Backend' },
    { id: 'full-stack-engineering', label: 'Full Stack' },
    { id: 'machine-learning', label: 'Machine Learning' },
    { id: 'agentic-ai-engineering', label: 'Agentic AI' },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">Applications — Approve & Enroll</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {apps.filter((a) => a.status === 'pending').length} pending · approving creates a Winter 2026-27 enrollment
          </p>
        </div>
        <button onClick={load} className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:text-white">Refresh</button>
      </div>

      {notice && (
        <p className="border-b border-white/10 bg-indigo-500/10 px-5 py-3 text-xs font-medium text-indigo-300">{notice}</p>
      )}
      {error && (
        <p className="border-b border-white/10 bg-rose-500/10 px-5 py-3 text-xs font-medium text-rose-400">{error}</p>
      )}

      {loading ? (
        <div className="px-6 py-16 text-center text-sm text-slate-500">Loading applications…</div>
      ) : apps.length === 0 ? (
        <EmptyState text="No applications submitted yet. New applications from the Careers page appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-widest text-slate-500">
                <th className="px-4 py-4 font-semibold">Applicant</th>
                <th className="px-4 py-4 font-semibold">Track</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Applied</th>
                <th className="px-4 py-4 font-semibold">Assign Track</th>
                <th className="px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {apps.map((app) => (
                <tr key={app.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-100">{app.full_name || app.email}</p>
                    <p className="font-mono text-[11px] text-slate-500">{app.email}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-400">{app.track || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${APP_STATUS_STYLES[app.status] || APP_STATUS_STYLES.pending}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${app.status === 'approved' ? 'bg-emerald-400' : app.status === 'rejected' ? 'bg-rose-400' : 'animate-pulse bg-amber-400'}`} />
                      {app.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">{formatDate(app.created_at)}</td>
                  <td className="px-4 py-4">
                    <select
                      value={approveTrack[app.id] || ''}
                      onChange={(e) => setApproveTrack((prev) => ({ ...prev, [app.id]: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs font-semibold text-slate-300 outline-none focus:border-indigo-400/60"
                    >
                      <option value="" className="bg-slate-900">Select track…</option>
                      {trackOptions.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900">{t.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => reject(app)}
                        disabled={busyId === app.id || app.status === 'rejected'}
                        className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approve(app)}
                        disabled={busyId === app.id || app.status === 'approved' || !approveTrack[app.id]}
                        className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyId === app.id ? 'Saving…' : 'Approve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function InternshipReview() {
  const [adminKey, setAdminKey] = useState(() => {
    try {
      return localStorage.getItem(KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });
  const [keyError, setKeyError] = useState('');
  const [tab, setTab] = useState('submissions');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const [reviewKind, setReviewKind] = useState('submission');

  const load = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    const res = await winterAdminDashboard(adminKey);
    setLoading(false);
    if (res.error) {
      setKeyError(res.code === 'unauthorized' ? 'Invalid admin key.' : res.error);
      if (res.code === 'unauthorized') setData(null);
      return;
    }
    setKeyError('');
    setData(res);
  }, [adminKey]);

  useEffect(() => {
    if (!adminKey) return;
    load();
    const t = window.setInterval(load, 20000);
    return () => window.clearInterval(t);
  }, [adminKey, load]);

  const submitReview = useCallback(
    async (id, status, feedback) => (reviewKind === 'proof'
      ? winterAdminReviewProof(adminKey, id, status, feedback)
      : winterAdminReviewSubmission(adminKey, id, status, feedback)),
    [adminKey, reviewKind]
  );

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#060a13] px-4 py-8 sm:px-6 lg:px-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/30">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">IH Academy Admin</p>
          <h1 className="text-2xl font-bold text-white">Winter Internship Review</h1>
          <p className="mt-2 text-sm text-slate-400">Enter the admin key stored in the <code className="text-indigo-300">winter_settings</code> table.</p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => { setAdminKey(e.target.value); localStorage.setItem(KEY_STORAGE, e.target.value); }}
            placeholder="ih-winter-admin-2027"
            className={`mt-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/60 ${keyError ? 'border-rose-500/50' : ''}`}
          />
          {keyError && <p className="mt-2 text-xs font-medium text-rose-400">{keyError}</p>}
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const submissions = data?.submissions || [];
  const proofs = data?.proofs || [];
  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const pendingProofs = proofs.filter((p) => p.status === 'submitted').length;

  const tabs = [
    { id: 'submissions', label: 'Assignments', count: pendingCount, hint: 'Live solutions' },
    { id: 'proofs', label: 'Course Proofs', count: pendingProofs, hint: 'Certificate files' },
    { id: 'applications', label: 'Applications', hint: 'Approve & enroll' },
  ];

  const openReview = (row, kind) => {
    setReviewKind(kind);
    setReviewRow(row);
  };

  return (
    <div className="min-h-screen bg-[#060a13] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">
              IH Academy Admin
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Winter Internship Review
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Live review console for Winter 2026-27: approve assignments, course proofs and applications
              directly against Supabase.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-300">{users.length} interns enrolled</span>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <svg className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`group flex flex-col items-start gap-0.5 rounded-xl border px-4 py-2.5 text-left transition ${
                tab === t.id
                  ? 'border-indigo-400/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <span className={`flex items-center gap-2 text-sm font-semibold ${tab === t.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                {t.label}
                {t.count > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {t.count} pending
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500">{t.hint}</span>
            </button>
          ))}
        </div>

        {keyError && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {keyError}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/30">
          {loading && !data ? (
            <div className="px-6 py-20 text-center text-sm text-slate-500">Loading dashboard…</div>
          ) : tab === 'submissions' ? (
            <SubmissionsTable rows={submissions} onReview={(row) => openReview(row, 'submission')} />
          ) : tab === 'proofs' ? (
            <ProofsTable rows={proofs} onReview={(row) => openReview(row, 'proof')} />
          ) : (
            <ApplicationsTab adminKey={adminKey} />
          )}
        </div>
      </div>

      {reviewRow && (
        <ReviewModal
          kind={reviewKind}
          row={reviewRow}
          onClose={() => setReviewRow(null)}
          onReviewed={load}
          onFeedback={submitReview}
        />
      )}
    </div>
  );
}
