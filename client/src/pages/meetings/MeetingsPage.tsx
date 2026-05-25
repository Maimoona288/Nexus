import React, { useState, useEffect } from 'react';
import nexusApi from '../../api/nexusApi';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Users, Video, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  host: { _id: string; name: string; email: string; avatarUrl?: string };
  attendee: { _id: string; name: string; email: string; avatarUrl?: string };
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  roomId: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', attendeeId: '', startTime: '', endTime: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data } = await nexusApi.get('/meetings');
      setMeetings(data);
    } catch {
      setError('Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await nexusApi.get('/users');
      setUsers(data.filter((u: User) => u._id !== user?.id));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await nexusApi.post('/meetings', {
        title: form.title,
        description: form.description,
        attendee: form.attendeeId,
        startTime: form.startTime,
        endTime: form.endTime
      });
      setSuccess('Meeting scheduled successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', attendeeId: '', startTime: '', endTime: '' });
      fetchMeetings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule meeting.');
    }
  };

  const handleStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      await nexusApi.patch(`/meetings/${id}/status`, { status });
      fetchMeetings();
      setSuccess(`Meeting ${status}.`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this meeting?')) return;
    try {
      await nexusApi.delete(`/meetings/${id}`);
      fetchMeetings();
      setSuccess('Meeting cancelled.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel meeting.');
    }
  };

  const joinCall = (roomId: string) => {
    window.open(`/video-call?room=${roomId}`, '_blank', 'width=1200,height=700');
  };

  const formatDate = (dt: string) => new Date(dt).toLocaleString();

  const statusColor = (s: string) =>
    s === 'accepted' ? 'text-green-600 bg-green-50' :
    s === 'rejected' ? 'text-red-600 bg-red-50' :
    'text-yellow-600 bg-yellow-50';

  const upcoming = meetings.filter(m => new Date(m.startTime) > new Date());
  const past = meetings.filter(m => new Date(m.startTime) <= new Date());

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Meeting Scheduler
          </h1>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage investor-entrepreneur meetings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}

      {/* Schedule Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">New Meeting</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Q2 Investment Review"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Agenda..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite *</label>
              <select
                value={form.attendeeId}
                onChange={e => setForm({ ...form, attendeeId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select participant...</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role}) — {u.email}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                Schedule
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Meetings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Upcoming ({upcoming.length})
        </h2>
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
            No upcoming meetings. Schedule one above!
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(m => (
              <MeetingCard key={m._id} meeting={m} userId={user?.id || ''}
                onStatus={handleStatus} onDelete={handleDelete} onJoin={joinCall} />
            ))}
          </div>
        )}
      </section>

      {/* Past Meetings */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Past ({past.length})
          </h2>
          <div className="space-y-3 opacity-70">
            {past.map(m => (
              <MeetingCard key={m._id} meeting={m} userId={user?.id || ''}
                onStatus={handleStatus} onDelete={handleDelete} onJoin={joinCall} isPast />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const MeetingCard: React.FC<{
  meeting: Meeting;
  userId: string;
  onStatus: (id: string, status: 'accepted' | 'rejected') => void;
  onDelete: (id: string) => void;
  onJoin: (roomId: string) => void;
  isPast?: boolean;
}> = ({ meeting, userId, onStatus, onDelete, onJoin, isPast }) => {
  const isHost = meeting.host._id === userId;
  const isAttendee = meeting.attendee._id === userId;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              meeting.status === 'accepted' ? 'text-green-700 bg-green-100' :
              meeting.status === 'rejected' ? 'text-red-700 bg-red-100' :
              'text-yellow-700 bg-yellow-100'
            }`}>
              {meeting.status}
            </span>
          </div>
          {meeting.description && <p className="text-sm text-gray-500 mb-2">{meeting.description}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(meeting.startTime).toLocaleString()} – {new Date(meeting.endTime).toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {isHost ? `With ${meeting.attendee.name}` : `From ${meeting.host.name}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {!isPast && meeting.status === 'accepted' && (
            <button
              onClick={() => onJoin(meeting.roomId)}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              <Video className="w-3.5 h-3.5" />
              Join
            </button>
          )}
          {isAttendee && meeting.status === 'pending' && !isPast && (
            <>
              <button onClick={() => onStatus(meeting._id, 'accepted')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                <CheckCircle className="w-5 h-5" />
              </button>
              <button onClick={() => onStatus(meeting._id, 'rejected')}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
          {isHost && !isPast && (
            <button onClick={() => onDelete(meeting._id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
