import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Contact } from '../types';
import {
  Users,
  Search,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  X,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const { selectedContactId, openReportModal } = useApp();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeSection, setActiveSection] = useState<'all' | 'faculty' | 'student_lead'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    dataService.getContacts().then(setContacts);
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => set.add(c.department));
    return Array.from(set);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (activeSection !== 'all' && c.type !== activeSection) {
        return false;
      }

      if (selectedDepartment !== 'all' && c.department !== selectedDepartment) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesRole = c.role.toLowerCase().includes(q);
        const matchesDept = c.department.toLowerCase().includes(q);
        const matchesHelpsWith = c.helpsWith.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesDept && !matchesHelpsWith) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, activeSection, selectedDepartment, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FFF4DE]">
              CampusTrace Contacts Directory
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] border border-[#FFCED8]">
              <ShieldCheck className="w-3 h-3 text-[#D94A6E]" />
              Verified Consent
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
            Faculty offices and student society leads. Strict privacy enforcement: direct messaging is only published with verified permission.
          </p>
        </div>
      </div>

      {/* Trust & Privacy Notice Card with Palette */}
      <div className="p-4 rounded-2xl bg-[#FFF4DE] dark:bg-[#2A201A] border border-[#FFE8C4] dark:border-[#4A3926] flex items-start gap-3 text-xs text-[#6B350A] dark:text-[#FFE8C4]">
        <Lock className="w-4 h-4 text-[#C45E12] dark:text-[#FFE8C4] mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Privacy & Student Protection Commitment:</span> Only information that the individual formally consented to publish or that the university publicly mandates is displayed. Personal phone numbers are never harvested.
        </div>
      </div>

      {/* Controls: Section Tabs, Search & Department */}
      <div className="bg-white dark:bg-[#20181D] p-4 rounded-3xl border border-[#FFCED8] dark:border-[#422C36] shadow-sm space-y-3">
        {/* Section Tabs */}
        <div className="flex p-1 bg-[#FFF4DE] dark:bg-[#2A1F26] rounded-2xl max-w-md border border-[#FFE8C4]">
          <button
            onClick={() => setActiveSection('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSection === 'all'
                ? 'bg-[#D94A6E] text-white shadow-sm'
                : 'text-[#7A616B] dark:text-[#BFA5AF]'
            }`}
          >
            All Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveSection('faculty')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSection === 'faculty'
                ? 'bg-[#D94A6E] text-white shadow-sm'
                : 'text-[#7A616B] dark:text-[#BFA5AF]'
            }`}
          >
            Faculty ({contacts.filter((c) => c.type === 'faculty').length})
          </button>
          <button
            onClick={() => setActiveSection('student_lead')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSection === 'student_lead'
                ? 'bg-[#D94A6E] text-white shadow-sm'
                : 'text-[#7A616B] dark:text-[#BFA5AF]'
            }`}
          >
            Student Leads ({contacts.filter((c) => c.type === 'student_lead').length})
          </button>
        </div>

        {/* Search & Department row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#C45E12] dark:text-[#FFE8C4] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or area of assistance (e.g. hackathons, course waivers, counseling)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FFFDF9] dark:bg-[#1A1217] border border-[#FFCED8] dark:border-[#4A2D39] text-[#2D1F25] dark:text-[#FFF4DE] placeholder:text-[#A8929B] focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F7580] hover:text-[#2D1F25] text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-[#FFFDF9] dark:bg-[#1E171C] border border-[#FFCED8] dark:border-[#422C36] text-[#2D1F25] dark:text-[#FFF4DE] focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid with Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const isFaculty = contact.type === 'faculty';
          const isHighlighted = contact.id === selectedContactId;

          return (
            <div
              key={contact.id}
              className={`rounded-3xl border p-5 transition flex flex-col justify-between gap-4 shadow-sm hover:shadow-md ${
                isHighlighted
                  ? 'border-[#D94A6E] ring-2 ring-[#D94A6E]/20 bg-[#FFDDDD]/40 dark:bg-[#3D1E28]/40'
                  : 'bg-white dark:bg-[#20181D] border-[#FFCED8]/70 dark:border-[#422C36]'
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm ${
                        isFaculty
                          ? 'bg-gradient-to-tr from-[#A62443] to-[#D94A6E]'
                          : 'bg-gradient-to-tr from-[#D94A6E] to-[#F59E38]'
                      }`}
                    >
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#2D1F25] dark:text-[#FFF4DE]">
                        {contact.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isFaculty
                            ? 'bg-[#FFDDDD] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#FFCED8]'
                            : 'bg-[#FFE8C4] text-[#7A3A00] dark:bg-[#382618] dark:text-[#FFE8C4]'
                        }`}
                      >
                        {isFaculty ? 'Faculty Member' : 'Student Lead'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openReportModal('contact', contact.id, contact.name)}
                    className="p-1 text-[#8F7580] hover:text-[#D94A6E] transition"
                    title="Report outdated contact"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>

                {/* Role and Department */}
                <div className="text-xs space-y-0.5">
                  <div className="font-semibold text-[#2D1F25] dark:text-[#FFF4DE]">{contact.role}</div>
                  <div className="text-[#D94A6E] dark:text-[#FFCED8] font-medium">{contact.department}</div>
                </div>

                {/* What they can help with */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A616B] dark:text-[#BFA5AF]">
                    Can Help You With:
                  </div>
                  <ul className="space-y-1">
                    {contact.helpsWith.map((item, idx) => (
                      <li key={idx} className="text-xs text-[#5C454F] dark:text-[#D9C4CC] flex items-start gap-1.5">
                        <span className="text-[#D94A6E] font-bold">•</span>
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Approved Contact Details */}
                <div className="space-y-1.5 pt-2 border-t border-[#FFCED8]/40 dark:border-[#38202A] text-xs">
                  <div className="flex items-start gap-1.5 text-[#5C454F] dark:text-[#C7B0BA]">
                    <Mail className="w-3.5 h-3.5 text-[#D94A6E] shrink-0 mt-0.5" />
                    <span className="leading-snug">{contact.contactMethod}</span>
                  </div>

                  {contact.officeLocation && (
                    <div className="flex items-center gap-1.5 text-[#5C454F] dark:text-[#C7B0BA]">
                      <MapPin className="w-3.5 h-3.5 text-[#C45E12] shrink-0" />
                      <span>{contact.officeLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons (WhatsApp, Source) */}
              <div className="pt-3 border-t border-[#FFCED8]/40 dark:border-[#38202A] flex items-center justify-between text-xs">
                {contact.permissionGiven && contact.whatsappUrl ? (
                  <a
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2A9D8F] hover:bg-[#21867A] transition shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Lead</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8F7580] italic">
                    Office hours / Email only
                  </span>
                )}

                <div className="text-[10px] text-[#8F7580] text-right">
                  <div>Verified: {contact.lastVerified}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8] dark:border-[#422C36] space-y-2">
          <Users className="w-10 h-10 text-[#FFCED8] mx-auto" />
          <h3 className="font-bold text-[#2D1F25] dark:text-[#FFF4DE] text-sm">
            No contacts found
          </h3>
          <p className="text-xs text-[#7A616B]">
            Try adjusting your search query or department filter.
          </p>
        </div>
      )}
    </div>
  );
};
