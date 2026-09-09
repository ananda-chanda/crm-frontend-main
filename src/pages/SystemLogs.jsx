import { useState, useMemo } from 'react';
import { useGetGlobalLogsQuery } from '../features/api/timelineApiSlice';
import { useGetAssignableUsersQuery } from '../features/api/usersApiSlice';
import {
  Clock,
  Filter,
  ChevronDown,
  PlusCircle,
  Pencil,
  Trash2,
  LogIn,
  Inbox,
} from 'lucide-react';

// ---- visual language for log entries -------------------------------------
// Every action gets an icon + accent pulled from the same small palette so
// the timeline reads at a glance, without turning into a rainbow of tags.
const ACTION_STYLES = [
  { test: /delete|remove|revoke/i, icon: Trash2, dot: '#B54A3F', tint: '#FBEEEC' },
  { test: /create|add|invite/i, icon: PlusCircle, dot: '#2F6F5E', tint: '#EAF3F0' },
  { test: /update|edit|change/i, icon: Pencil, dot: '#B7791F', tint: '#FBF1E1' },
  { test: /login|sign/i, icon: LogIn, dot: '#3F5B7A', tint: '#EBF0F6' },
];
const DEFAULT_STYLE = { icon: Clock, dot: '#8A8478', tint: '#F1EFEA' };

const getActionStyle = (action = '') =>
  ACTION_STYLES.find((s) => s.test.test(action)) || DEFAULT_STYLE;

const MODEL_TINTS = ['#2F6F5E', '#B7791F', '#3F5B7A', '#B54A3F', '#6E5A9C'];
const modelColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return MODEL_TINTS[Math.abs(hash) % MODEL_TINTS.length];
};

const formatWhen = (iso) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
};

const SystemLogs = () => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const { data: logs, isLoading: logsLoading } = useGetGlobalLogsQuery(
    selectedUserId ? { userId: selectedUserId } : {}
  );
  const { data: teamUsers } = useGetAssignableUsersQuery();

  const selectedUser = useMemo(
    () => teamUsers?.find((u) => u._id === selectedUserId),
    [teamUsers, selectedUserId]
  );

  return (
    <div className="space-y-8 max-w-5xl" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header ------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-[26px] font-semibold text-stone-900 tracking-tight">System logs</h1>
          <p className="text-stone-500 mt-1 text-[15px]">
            {selectedUser
              ? `Showing activity for ${selectedUser.name}`
              : 'A running record of activity across your team.'}
          </p>
        </div>

        {teamUsers && teamUsers.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <select
              className="appearance-none text-sm text-stone-700 border border-stone-200 rounded-full bg-white py-2.5 pl-9 pr-9 shadow-sm hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Everyone</option>
              {teamUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Body ----------------------------------------------------------- */}
      {logsLoading ? (
        <ul className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="flex gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-stone-200 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-stone-200 rounded w-1/3" />
                <div className="h-3 bg-stone-100 rounded w-2/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : logs && logs.length > 0 ? (
        <ol className="relative">
          {/* connecting spine */}
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-stone-200" aria-hidden="true" />

          {logs.map((log) => {
            const style = getActionStyle(log.action);
            const Icon = style.icon;
            const { date, time } = formatWhen(log.createdAt);

            return (
              <li key={log._id} className="relative flex gap-4 pb-7 last:pb-0">
                <div
                  className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white"
                  style={{ backgroundColor: style.tint }}
                >
                  <Icon className="w-4 h-4" style={{ color: style.dot }} strokeWidth={2.25} />
                </div>

                <div className="flex-1 min-w-0 -mt-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-medium text-stone-900 leading-snug">
                      {log.action}
                    </p>
                    <span
                      className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ color: modelColor(log.onModel), backgroundColor: '#F5F3EF' }}
                    >
                      {log.onModel}
                    </span>
                  </div>

                  {log.description && (
                    <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">
                      {log.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                    <span>{date} · {time}</span>
                    <span className="text-stone-300">•</span>
                    <span>{log.createdBy?.name || 'Unknown'}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-stone-200 rounded-2xl">
          <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <Inbox className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-stone-700 font-medium">No activity yet</p>
          <p className="text-stone-500 text-sm mt-1 max-w-xs">
            {selectedUser
              ? `${selectedUser.name} hasn't done anything logged yet.`
              : 'Actions your team takes will show up here as they happen.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;