import React, { useState } from 'react';
import Layout from '../components/Layout';
import CompanyTable from '../components/company/CompanyTable';
import CompanyModal from '../components/company/CompanyModal';
import CompanyDetailModal from '../components/company/CompanyDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { useCompanies } from '../hooks/useCompanies';
import type { Company } from '../types/company';

const CompaniesPage: React.FC = () => {
  const {
    companies, pageNumber, pageSize, totalElements,
    loading, error, setPageNumber,
    createCompany, updateCompany, softDeleteCompany,
  } = useCompanies();

  const [showModal, setShowModal] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [viewCompany, setViewCompany] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setEditCompany(null); setShowModal(true); };
  const openEdit = (c: Company) => { setEditCompany(c); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditCompany(null); };

  const handleSave = async (data: Omit<Company, 'companyId'>) => {
    if (editCompany) await updateCompany(editCompany.companyId, data);
    else await createCompany(data);
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await softDeleteCompany(deleteTarget.companyId);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Companies</h1>
        <Button onClick={openAdd}>+ Add Company</Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? <LoadingSpinner /> : (
        <CompanyTable
          companies={companies}
          onView={setViewCompany}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={setPageNumber}
        />
      )}

      <CompanyModal open={showModal} onClose={closeModal} onSave={handleSave} initialData={editCompany} />
      <CompanyDetailModal company={viewCompany} onClose={() => setViewCompany(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate Company"
        message={<>Are you sure you want to deactivate <strong>{deleteTarget?.companyName}</strong>? It will be marked inactive but not permanently removed.</>}
        confirmLabel="Deactivate"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  );
};

export default CompaniesPage;
