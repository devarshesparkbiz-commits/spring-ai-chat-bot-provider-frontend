import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FaqTable from '../components/faq/FaqTable';
import FaqModal from '../components/faq/FaqModal';
import FaqDetailModal from '../components/faq/FaqDetailModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { useFaqs } from '../hooks/useFaqs';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';
import type { Faq, FaqFormData } from '../types/faq';

const FaqPage: React.FC = () => {
  const { companyId: companyIdParam } = useParams<{ companyId?: string }>();
  const navigate = useNavigate();
  const { userRole, companyId: authCompanyId } = useAuth();

  // SUPER_ADMIN arrives via /companies/:companyId/faqs
  // COMPANY_ADMIN arrives via /faqs (no param — uses their JWT companyId)
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const companyId: number | null = isSuperAdmin
    ? Number(companyIdParam)
    : null;

  const [companyName, setCompanyName] = useState('');

  // Fetch company name for the heading
  useEffect(() => {
    const idToFetch = isSuperAdmin ? Number(companyIdParam) : authCompanyId;
    if (!idToFetch) return;
    companyService
      .getById(idToFetch)
      .then(c => setCompanyName(c.companyName))
      .catch(() => setCompanyName(''));
  }, [companyIdParam, authCompanyId, isSuperAdmin]);

  const {
    faqs,
    pageNumber,
    pageSize,
    totalElements,
    loading,
    error,
    setPageNumber,
    createFaq,
    updateFaq,
  } = useFaqs(companyId);

  const [showModal, setShowModal] = useState(false);
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [viewFaq, setViewFaq] = useState<Faq | null>(null);

  const openAdd = () => { setEditFaq(null); setShowModal(true); };
  const openEdit = (faq: Faq) => { setEditFaq(faq); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditFaq(null); };

  const handleSave = async (data: FaqFormData) => {
    if (editFaq) {
      await updateFaq(editFaq.faqId, data);
    } else {
      await createFaq(data);
    }
    closeModal();
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          {isSuperAdmin && (
            <button className="back-btn" onClick={() => navigate('/companies')}>
              ← Companies
            </button>
          )}
          <h1>
            FAQs
            {companyName && <span className="page-header-sub"> — {companyName}</span>}
          </h1>
        </div>
        <Button onClick={openAdd}>+ Add FAQ</Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FaqTable
          faqs={faqs}
          onView={setViewFaq}
          onEdit={openEdit}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={setPageNumber}
        />
      )}

      <FaqModal
        open={showModal}
        companyId={companyId}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editFaq}
      />

      <FaqDetailModal faq={viewFaq} onClose={() => setViewFaq(null)} />
    </Layout>
  );
};

export default FaqPage;
