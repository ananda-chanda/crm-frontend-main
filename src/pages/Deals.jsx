import { useGetDealsQuery, useUpdateDealMutation } from '../features/api/dealsApiSlice';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useRBAC } from '../hooks/useRBAC';

const STAGES = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];

// Visual language per stage: intensity of indigo tracks progress through the
// pipeline, Won/Lost break the pattern because they're terminal states.
const STAGE_META = {
  Qualification: { dot: 'bg-indigo-300', track: 'bg-indigo-300' },
  Discovery: { dot: 'bg-indigo-400', track: 'bg-indigo-400' },
  Proposal: { dot: 'bg-indigo-500', track: 'bg-indigo-500' },
  Negotiation: { dot: 'bg-indigo-600', track: 'bg-indigo-600' },
  Won: { dot: 'bg-emerald-500', track: 'bg-emerald-500' },
  Lost: { dot: 'bg-rose-400', track: 'bg-rose-400' },
};

const LOST_REASON_MAX = 280;

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

const formatCurrency = (n) => `₹${(n ?? 0).toLocaleString('en-IN')}`;

const Deals = () => {
  const { hasPermission } = useRBAC();
  const { data, isLoading, error } = useGetDealsQuery({ limit: 100 });
  const [updateDeal] = useUpdateDealMutation();

  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [dealToLost, setDealToLost] = useState(null);
  const [lostReason, setLostReason] = useState('');

  const validTransitions = {
    Qualification: ['Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    Discovery: ['Proposal', 'Negotiation', 'Won', 'Lost'],
    Proposal: ['Negotiation', 'Won', 'Lost'],
    Negotiation: ['Won', 'Lost'],
    Won: [],
    Lost: [],
  };

  const handleStageChange = async (deal, newStage) => {
    if (newStage === deal.stage) return;

    if (!validTransitions[deal.stage].includes(newStage)) {
      return toast.error(`Can't move a deal from ${deal.stage} to ${newStage}`);
    }

    if (newStage === 'Lost') {
      setDealToLost(deal);
      setLostReason('');
      setLostModalOpen(true);
      return;
    }

    try {
      await updateDeal({ id: deal._id, stage: newStage }).unwrap();
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update deal stage');
    }
  };

  const closeLostModal = () => {
    setLostModalOpen(false);
    setDealToLost(null);
  };

  const submitLostReason = async () => {
    if (!lostReason.trim()) return toast.error('Lost reason is required');
    try {
      await updateDeal({ id: dealToLost._id, stage: 'Lost', lostReason: lostReason.trim() }).unwrap();
      toast.success('Deal marked as Lost');
      closeLostModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark deal as Lost');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading pipeline…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-5 w-5 text-rose-500" />
        <p className="text-sm font-medium text-slate-700">Couldn't load the pipeline</p>
        <p className="text-xs text-slate-500">{error.message}</p>
      </div>
    );
  }

  const deals = data?.deals || [];
  const activeValue = deals
    .filter((d) => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter((d) => d.stage === 'Won').reduce((sum, d) => sum + d.value, 0);
  const maxStageValue = Math.max(
    1,
    ...STAGES.map((stage) => deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.value, 0))
  );

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Deal Pipeline</h1>
        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-xs text-slate-500">Active pipeline</div>
            <div className="tabular-nums font-semibold text-slate-900">{formatCurrency(activeValue)}</div>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <div className="text-xs text-slate-500">Won</div>
            <div className="tabular-nums font-semibold text-emerald-600">{formatCurrency(wonValue)}</div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);
          const stageTotal = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
          const meta = STAGE_META[stage];

          return (
            <div
              key={stage}
              className="flex w-[85vw] flex-shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50 sm:w-80"
            >
              <div className="border-b border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    <h3 className="font-medium text-slate-800">{stage}</h3>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="tabular-nums text-sm font-medium text-slate-500">{formatCurrency(stageTotal)}</div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${meta.track}`}
                    style={{ width: `${Math.min(100, (stageTotal / maxStageValue) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="min-h-[300px] flex-1 space-y-2.5 overflow-y-auto p-3">
                {stageDeals.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                    No deals here yet
                  </div>
                )}

                {stageDeals.map((deal) => {
                  const company = deal.customerId?.company || deal.customerId?.name || 'Unknown';
                  const probColor =
                    deal.probability >= 66
                      ? 'bg-emerald-500'
                      : deal.probability >= 33
                      ? 'bg-amber-500'
                      : 'bg-slate-400';

                  return (
                    <div
                      key={deal._id}
                      className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                          {getInitials(company)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate font-medium text-slate-900">{deal.title}</h4>
                          <p className="truncate text-sm text-slate-500">{company}</p>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="tabular-nums font-semibold text-slate-900">
                            {formatCurrency(deal.value)}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${probColor}`} />
                            <span className="tabular-nums text-xs text-slate-500">{deal.probability}% win prob</span>
                          </div>
                        </div>

                        {hasPermission('Deals', 'Edit') ? (
                          <select
                            aria-label={`Change stage for ${deal.title}`}
                            className="rounded-md border border-slate-300 bg-white p-1 text-xs text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            value={deal.stage}
                            onChange={(e) => handleStageChange(deal, e.target.value)}
                          >
                            {STAGES.map((s) => (
                              <option
                                key={s}
                                value={s}
                                disabled={s !== deal.stage && !validTransitions[deal.stage].includes(s)}
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {deal.stage}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {lostModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onKeyDown={(e) => e.key === 'Escape' && closeLostModal()}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Mark deal as lost</h2>
              <button
                onClick={closeLostModal}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Why was the deal with{' '}
              <span className="font-medium text-slate-800">
                {dealToLost?.customerId?.company || dealToLost?.customerId?.name}
              </span>{' '}
              lost?
            </p>

            <textarea
              className="mb-1 h-24 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              placeholder="e.g. Lost to competitor X, budget issues…"
              value={lostReason}
              maxLength={LOST_REASON_MAX}
              onChange={(e) => setLostReason(e.target.value)}
              autoFocus
            />
            <div className="mb-4 text-right text-xs text-slate-400">
              {lostReason.length}/{LOST_REASON_MAX}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeLostModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={submitLostReason}
                disabled={!lostReason.trim()}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Mark lost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;