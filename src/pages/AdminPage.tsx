import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Event, Contact, Report, EventType, EventStatus } from '../types';
import {
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  X,
  Calendar,
  Users,
  Inbox,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { showToast } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Tab: 'events' | 'contacts' | 'reports'
  const [adminTab, setAdminTab] = useState<'events' | 'contacts' | 'reports'>('events');

  const [events, setEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Create/Edit Event Form modal state
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const loadAllData = async () => {
    const evts = await dataService.getEvents();
    const conts = await dataService.getContacts();
    const reps = await dataService.getReports();
    setEvents(evts);
    setContacts(conts);
    setReports(reps);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'offshore2026' || passwordInput.trim() === 'admin') {
      setIsAuthenticated(true);
      setPasswordError(false);
      showToast('CampusTrace Admin access granted (Mock Session)');
    } else {
      setPasswordError(true);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;

    if (editingEvent.id) {
      await dataService.updateEvent(editingEvent.id, editingEvent);
      showToast('Event updated successfully');
    } else {
      await dataService.createEvent(editingEvent as any);
      showToast('New event created and verified in CampusTrace');
    }

    setIsEventModalOpen(false);
    setEditingEvent(null);
    loadAllData();
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete or archive this event?')) {
      await dataService.deleteOrArchiveEvent(id);
      showToast('Event archived');
      loadAllData();
    }
  };

  const handleToggleEventVerified = async (evt: Event) => {
    await dataService.updateEvent(evt.id, { verified: !evt.verified });
    showToast(`Event marked ${!evt.verified ? 'Verified' : 'Unverified'}`);
    loadAllData();
  };

  const handleToggleWhatsAppPermission = async (c: Contact) => {
    await dataService.updateContact(c.id, { permissionGiven: !c.permissionGiven });
    showToast(`WhatsApp display ${!c.permissionGiven ? 'Enabled' : 'Disabled'}`);
    loadAllData();
  };

  const handleUpdateReportStatus = async (reportId: string, status: Report['status']) => {
    await dataService.updateReportStatus(reportId, status);
    showToast(`Report marked as ${status}`);
    loadAllData();
  };

  const handleResetSampleData = () => {
    if (confirm('Reset all events and contacts back to default initial sample state?')) {
      dataService.resetToSampleData();
      loadAllData();
      showToast('Data reset to default sample dataset');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] shadow-xl space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0] flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
            CampusTrace Admin Portal
          </h2>
          <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
            Manage verified event postings, contact consent flags, and community corrections.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F3D3C9]/70 dark:bg-[#382618] border border-[#F3D3C9] dark:border-[#523A25] text-xs text-[#7A3A00] dark:text-[#F3D3C9] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Unlock className="w-3.5 h-3.5 text-[#C45E12]" />
            Hard-coded Demo Access
          </div>
          <div>
            Demo Password: <code className="font-mono font-bold bg-[#F3D3C9] dark:bg-[#4A3322] px-1.5 py-0.5 rounded">offshore2026</code>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C454F] dark:text-[#E8D1DB] mb-1">
              Enter Administrator Password
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="offshore2026"
              className="w-full px-4 py-2.5 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-[#FFF5D6] dark:bg-[#1A1217] text-sm text-[#2D1F25] dark:text-[#FBEEBF] focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
            />
            {passwordError && (
              <p className="text-xs text-[#D94A6E] mt-1 font-semibold">
                Invalid password. Please use `offshore2026`.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] transition shadow-md shadow-[#D94A6E]/20"
          >
            Access Admin Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
              CampusTrace Admin Portal
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0] border border-[#F2B4C0]">
              Mock Dashboard
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
            Add/edit events, toggle verified badges, manage WhatsApp publishing consent, and resolve user-submitted issue reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#5C454F] dark:text-[#FBEEBF] bg-[#FBEEBF] dark:bg-[#2A1F26] hover:bg-[#F3D3C9] transition border border-[#F3D3C9]"
            title="Reset data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D94A6E]" />
            <span>Reset Sample Data</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#D94A6E] hover:bg-[#ECC0C2]/50 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#FBEEBF] dark:bg-[#2A1F26] rounded-2xl max-w-md border border-[#F3D3C9]">
        <button
          onClick={() => setAdminTab('events')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            adminTab === 'events'
              ? 'bg-[#D94A6E] text-white shadow-sm'
              : 'text-[#7A616B] dark:text-[#BFA5AF]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events ({events.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('contacts')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            adminTab === 'contacts'
              ? 'bg-[#D94A6E] text-white shadow-sm'
              : 'text-[#7A616B] dark:text-[#BFA5AF]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Contacts ({contacts.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            adminTab === 'reports'
              ? 'bg-[#D94A6E] text-white shadow-sm'
              : 'text-[#7A616B] dark:text-[#BFA5AF]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Reports ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: EVENTS MANAGEMENT */}
      {adminTab === 'events' && (
        <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/50 dark:border-[#38202A]">
            <h3 className="font-extrabold text-[#2D1F25] dark:text-[#FBEEBF] text-base">
              Campus Events & Opportunities List
            </h3>
            <button
              onClick={() => {
                setEditingEvent({
                  title: '',
                  type: 'workshop',
                  organiser: 'Student Council',
                  description: '',
                  startDateTime: '2026-11-01T10:00:00Z',
                  endDateTime: '2026-11-01T12:00:00Z',
                  venue: 'Block A - Room A-001',
                  eligibility: 'All students',
                  deadline: '2026-10-31T23:59:00Z',
                  registrationUrl: 'https://campus.offshore-univ.edu',
                  status: 'registration_open',
                  tags: ['CampusTrace', 'Workshop'],
                  verified: true,
                  sourceLabel: 'Student Affairs Notice',
                  sourceUrl: 'https://campus.offshore-univ.edu',
                });
                setIsEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-[#8C203B] dark:text-[#F2B4C0] border-b border-[#F2B4C0]/60 dark:border-[#38202A]">
                <tr>
                  <th className="py-2.5 px-2">Title</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2">Deadline</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Verified</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2B4C0]/30 dark:divide-[#38202A]">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#FBEEBF]/40 dark:hover:bg-[#2A1F26]">
                    <td className="py-3 px-2 font-bold text-[#2D1F25] dark:text-[#FBEEBF] max-w-xs truncate">
                      {evt.title}
                    </td>
                    <td className="py-3 px-2 uppercase text-[10px] font-semibold text-[#7A616B]">
                      {evt.type}
                    </td>
                    <td className="py-3 px-2 text-[#5C454F] dark:text-[#C7B0BA]">
                      {new Date(evt.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0]">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleToggleEventVerified(evt)}
                        className={`text-xs font-semibold ${
                          evt.verified ? 'text-[#2A9D8F]' : 'text-slate-400'
                        }`}
                      >
                        {evt.verified ? '✓ Verified' : '✗ Unverified'}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingEvent(evt);
                          setIsEventModalOpen(true);
                        }}
                        className="p-1 text-[#8F7580] hover:text-[#D94A6E]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1 text-[#8F7580] hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACTS PERMISSION FLAGS */}
      {adminTab === 'contacts' && (
        <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/50 dark:border-[#38202A]">
            <div>
              <h3 className="font-extrabold text-[#2D1F25] dark:text-[#FBEEBF] text-base">
                Directory Contacts & Consent Management
              </h3>
              <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
                Direct WhatsApp contact is only displayed on the student-facing portal when permission is enabled.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-[#8C203B] dark:text-[#F2B4C0] border-b border-[#F2B4C0]/60 dark:border-[#38202A]">
                <tr>
                  <th className="py-2.5 px-2">Name</th>
                  <th className="py-2.5 px-2">Role & Dept</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2">WhatsApp Permission</th>
                  <th className="py-2.5 px-2">Last Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2B4C0]/30 dark:divide-[#38202A]">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FBEEBF]/40 dark:hover:bg-[#2A1F26]">
                    <td className="py-3 px-2 font-bold text-[#2D1F25] dark:text-[#FBEEBF]">
                      {c.name}
                    </td>
                    <td className="py-3 px-2 text-[#5C454F] dark:text-[#C7B0BA]">
                      <div>{c.role}</div>
                      <div className="text-[10px] text-[#7A616B]">{c.department}</div>
                    </td>
                    <td className="py-3 px-2 uppercase text-[10px] font-semibold text-[#8C203B] dark:text-[#F2B4C0]">
                      {c.type === 'faculty' ? 'Faculty' : 'Student Lead'}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleToggleWhatsAppPermission(c)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                          c.permissionGiven
                            ? 'bg-[#ECC0C2] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#F2B4C0]'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {c.permissionGiven ? 'Granted (Showing WhatsApp)' : 'Restricted (Hidden)'}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-[#7A616B]">{c.lastVerified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER REPORTED ISSUES INBOX */}
      {adminTab === 'reports' && (
        <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/50 dark:border-[#38202A]">
            <div>
              <h3 className="font-extrabold text-[#2D1F25] dark:text-[#FBEEBF] text-base">
                Community Feedback & Correction Reports
              </h3>
              <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
                Submitted by students via the "Report Incorrect Detail" button on rooms, events, and contacts.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-[#8F7580] text-xs">
              No user reports pending. Campus records are in sync!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl border border-[#F2B4C0] dark:border-[#422C36] space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D1F25] dark:text-[#FBEEBF]">
                          {rep.targetName || 'General Feedback'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#ECC0C2] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#F2B4C0]">
                          {rep.targetType}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7A616B]">
                        Submitted {new Date(rep.createdAt).toLocaleString()}
                        {rep.email && ` by ${rep.email}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateReportStatus(rep.id, 'resolved')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          rep.status === 'resolved'
                            ? 'bg-[#2A9D8F] text-white'
                            : 'bg-[#FBEEBF] dark:bg-[#2A1F26] text-[#6B350A] dark:text-[#F3D3C9]'
                        }`}
                      >
                        Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(rep.id, 'pending')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          rep.status === 'pending'
                            ? 'bg-[#E08A38] text-white'
                            : 'bg-[#FBEEBF] dark:bg-[#2A1F26] text-[#6B350A] dark:text-[#F3D3C9]'
                        }`}
                      >
                        Pending
                      </button>
                    </div>
                  </div>

                  <p className="text-[#5C454F] dark:text-[#D9C4CC] bg-[#FFF5D6] dark:bg-[#1E171C] p-2.5 rounded-xl border border-[#F2B4C0]/60 dark:border-[#422C36]">
                    "{rep.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENT EDIT/CREATE MODAL with Palette */}
      {isEventModalOpen && editingEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F25]/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-[#FFF5D6] dark:bg-[#20181D] rounded-3xl max-w-lg w-full border border-[#F2B4C0] dark:border-[#422C36] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/60 dark:border-[#38202A]">
              <h3 className="font-bold text-base text-[#2D1F25] dark:text-[#FBEEBF]">
                {editingEvent.id ? 'Edit Event' : 'Create New Verified Event'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 text-[#8F7580] hover:text-[#2D1F25]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Event Title *</label>
                <input
                  required
                  type="text"
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={editingEvent.type || 'workshop'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="guest_talk">Guest Talk</option>
                    <option value="competition">Competition</option>
                    <option value="fest">Fest</option>
                    <option value="club_recruitment">Club Recruitment</option>
                    <option value="audition">Audition</option>
                    <option value="internship_placement">Internship / Placement</option>
                    <option value="volunteering">Volunteering</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={editingEvent.status || 'registration_open'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                  >
                    <option value="registration_open">Registration Open</option>
                    <option value="closing_soon">Closing Soon</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="updated">Updated</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Organiser</label>
                <input
                  type="text"
                  value={editingEvent.organiser || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, organiser: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Venue (Building & Room)</label>
                <input
                  type="text"
                  value={editingEvent.venue || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Start Date/Time</label>
                  <input
                    type="text"
                    placeholder="2026-10-25T10:00:00Z"
                    value={editingEvent.startDateTime || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startDateTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217] font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deadline Date/Time</label>
                  <input
                    type="text"
                    placeholder="2026-10-24T23:59:00Z"
                    value={editingEvent.deadline || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Registration Link</label>
                <input
                  type="url"
                  value={editingEvent.registrationUrl || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, registrationUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] bg-white dark:bg-[#1A1217]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#F2B4C0]/60 dark:border-[#38202A]">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7A616B] hover:bg-[#FBEEBF] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] rounded-xl shadow-md shadow-[#D94A6E]/20"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
