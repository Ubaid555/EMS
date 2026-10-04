import React, { useState, useEffect } from 'react';
import {
  DataTable,
  FormModal,
  Button,
  Badge,
  Alert,
} from '@/components/common';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await employeeService.getContacts();
      setContacts(data || []);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (contact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this contact record?')) return;
    try {
      await employeeService.deleteContact(id);
      setSuccessMsg('Contact record removed successfully.');
      fetchContacts();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    }
  };

  // Declarative Form Fields for Reusable FormModal
  const contactFields = [
    {
      name: 'category',
      label: 'Contact Category',
      type: 'select',
      required: true,
      options: [
        { value: 'PHONE', label: 'Phone / Mobile Device' },
        { value: 'EMERGENCY', label: 'Emergency Contact Person' },
        { value: 'SOCIAL_MEDIA', label: 'Social Media / Email' },
      ],
      helperText: 'Select contact type to reveal specific communication fields.',
    },
    // Branch 1: Phone fields
    {
      name: 'phoneType',
      label: 'Phone Type',
      type: 'select',
      required: true,
      options: [
        { value: 'MOBILE', label: 'Mobile Phone' },
        { value: 'PTCL', label: 'PTCL Landline' },
        { value: 'VPTCL', label: 'VPTCL Wireless' },
      ],
      condition: (vals) => vals.category === 'PHONE' || !vals.category,
    },
    {
      name: 'contactNumber',
      label: 'Phone / Contact Number',
      type: 'text',
      placeholder: '0300-1234567 or 042-35712345',
      required: true,
      condition: (vals) => vals.category === 'PHONE' || !vals.category,
    },
    {
      name: 'mobileSetName',
      label: 'Mobile Handset Make / Model (Required for Mobile)',
      type: 'text',
      placeholder: 'e.g. Samsung Galaxy S23 or iPhone 15',
      required: true,
      condition: (vals) => (vals.category === 'PHONE' || !vals.category) && vals.phoneType === 'MOBILE',
      helperText: 'Hardware device name registered with university/department.',
    },
    {
      name: 'mobileImei',
      label: 'IMEI Number (15 Digits)',
      type: 'text',
      placeholder: '352012345678901',
      required: true,
      condition: (vals) => (vals.category === 'PHONE' || !vals.category) && vals.phoneType === 'MOBILE',
    },
    // Branch 2: Emergency Contact fields
    {
      name: 'emergencyPerson',
      label: 'Contact Person Name',
      type: 'alpha',
      placeholder: 'e.g. Muhammad Aslam',
      required: true,
      condition: (vals) => vals.category === 'EMERGENCY',
    },
    {
      name: 'emergencyRelation',
      label: 'Relationship to Employee',
      type: 'text',
      placeholder: 'e.g. Brother, Father, Spouse',
      required: true,
      condition: (vals) => vals.category === 'EMERGENCY',
    },
    {
      name: 'emergencyMobile',
      label: 'Emergency Contact Mobile',
      type: 'text',
      placeholder: '0300-9876543',
      required: true,
      condition: (vals) => vals.category === 'EMERGENCY',
    },
    // Branch 3: Social Media fields
    {
      name: 'socialPlatform',
      label: 'Platform / Channel',
      type: 'select',
      required: true,
      options: [
        { value: 'EMAIL', label: 'Email Address' },
        { value: 'WHATSAPP', label: 'WhatsApp' },
        { value: 'LINKEDIN', label: 'LinkedIn Profile' },
        { value: 'FACEBOOK', label: 'Facebook' },
      ],
      condition: (vals) => vals.category === 'SOCIAL_MEDIA',
    },
    {
      name: 'socialValue',
      label: 'Email / Handle / Profile URL',
      type: 'text',
      placeholder: 'e.g. name@university.edu.pk or +923001234567',
      required: true,
      condition: (vals) => vals.category === 'SOCIAL_MEDIA',
    },
    // General Notes
    {
      name: 'notes',
      label: 'Audit Remarks / Notes',
      type: 'textarea',
      placeholder: 'Any additional remarks or authorization references...',
      rows: 2,
    },
  ];

  // Map initial values when editing an existing contact
  const initialFormValues = editingContact
    ? {
        category: editingContact.category || 'PHONE',
        phoneType: editingContact.phone?.phoneType || 'MOBILE',
        contactNumber: editingContact.phone?.contactNumber || '',
        mobileSetName: editingContact.phone?.mobileDevice?.setName || '',
        mobileImei: editingContact.phone?.mobileDevice?.imeiNumber || '',
        emergencyPerson: editingContact.emergency?.contactPersonName || '',
        emergencyRelation: editingContact.emergency?.relation || '',
        emergencyMobile: editingContact.emergency?.mobileNumber || '',
        socialPlatform: editingContact.socialMedia?.platform || 'EMAIL',
        socialValue: editingContact.socialMedia?.value || '',
        notes: editingContact.notes || '',
      }
    : {
        category: 'PHONE',
        phoneType: 'MOBILE',
      };

  const handleModalSubmit = async (formData) => {
    const category = formData.category || 'PHONE';
    let payload = { category, notes: formData.notes };

    if (category === 'PHONE') {
      payload.phone = {
        contactNumber: formData.contactNumber,
        phoneType: formData.phoneType || 'MOBILE',
        isOfficial: true,
        isActive: true,
      };
      if (payload.phone.phoneType === 'MOBILE') {
        payload.phone.mobileDevice = {
          setName: formData.mobileSetName,
          imeiNumber: formData.mobileImei,
        };
      }
    } else if (category === 'EMERGENCY') {
      payload.emergency = {
        contactPersonName: formData.emergencyPerson,
        relation: formData.emergencyRelation,
        mobileNumber: formData.emergencyMobile,
      };
    } else if (category === 'SOCIAL_MEDIA') {
      payload.socialMedia = {
        platform: formData.socialPlatform || 'EMAIL',
        value: formData.socialValue,
      };
    }

    if (editingContact?._id) {
      await employeeService.updateContact(editingContact._id, payload);
      setSuccessMsg('Contact record updated successfully.');
    } else {
      await employeeService.createContact(payload);
      setSuccessMsg('New contact record created successfully.');
    }

    fetchContacts();
  };

  const columns = [
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <Badge
          variant={val === 'PHONE' ? 'primary' : val === 'EMERGENCY' ? 'danger' : 'info'}
          size="sm"
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'details',
      label: 'Contact Details / Destination',
      sortable: true,
      render: (_, row) => {
        if (row.category === 'PHONE') {
          return (
            <div>
              <span className="font-bold text-slate-900">{row.phone?.contactNumber}</span>
              <span className="text-xs text-slate-500 block">
                Type: {row.phone?.phoneType} {row.phone?.mobileDevice?.setName ? `• ${row.phone.mobileDevice.setName}` : ''}
              </span>
            </div>
          );
        }
        if (row.category === 'EMERGENCY') {
          return (
            <div>
              <span className="font-bold text-slate-900">{row.emergency?.contactPersonName}</span>
              <span className="text-xs text-slate-500 block">
                {row.emergency?.relation ? `Relation: ${row.emergency.relation} • ` : ''}
                {row.emergency?.mobileNumber}
              </span>
            </div>
          );
        }
        if (row.category === 'SOCIAL_MEDIA') {
          return (
            <div>
              <span className="font-bold text-slate-900">{row.socialMedia?.value}</span>
              <span className="text-xs text-slate-500 block">
                Platform: {row.socialMedia?.platform}
              </span>
            </div>
          );
        }
        return '—';
      },
    },
    {
      key: 'notes',
      label: 'Audit Notes',
      render: (val) => val || '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-2xs"
            title="Edit contact"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
            title="Delete contact"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Employee Contact Channels
            </h1>
            <Badge variant="primary">Section 05</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official telephone numbers, mobile devices, emergency family contacts, and official email addresses.
          </p>
        </div>
      </div>

      {successMsg && (
        <Alert
          type="success"
          title="Operation Succeeded"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {errorMsg && (
        <Alert
          type="error"
          title="Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      {/* Multiple Data Table */}
      <DataTable
        columns={columns}
        data={contacts}
        loading={loading}
        searchPlaceholder="Search phone numbers, contacts..."
        pageSizeOptions={[10, 25, 50, 100]}
        headerRight={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add New Contact
          </Button>
        }
      />

      {/* Reusable FormModal Popup */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingContact ? 'Edit Contact Record' : 'Add New Contact Record'}
        subtitle="Select category (Phone, Emergency, Social Media) and enter details."
        fields={contactFields}
        initialValues={initialFormValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingContact ? 'Update Contact' : 'Save Contact'}
      />
    </div>
  );
}
