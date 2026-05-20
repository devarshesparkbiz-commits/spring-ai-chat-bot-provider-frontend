import React from 'react';
import type { Faq } from '../../types/faq';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import TableToolbar from '../common/TableToolbar';
import SortIcon from '../common/SortIcon';
import { useTableControls } from '../../hooks/useTableControls';

interface FaqTableProps {
  faqs: Faq[];
  onView: (faq: Faq) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Flatten for search — include plain-text answer
function flattenFaq(f: Faq): Record<string, unknown> {
  return { ...f, answerText: stripHtml(f.answer) };
}

const SEARCH_KEYS = ['question', 'answerText'];

const FaqTable: React.FC<FaqTableProps> = ({
  faqs,
  onView,
  onEdit,
  onDelete,
  pageNumber,
  pageSize,
  totalElements,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);

  const flatFaqs = faqs.map(flattenFaq);
  const { search, setSearch, sort, toggleSort, processed } =
    useTableControls(flatFaqs, SEARCH_KEYS);

  const faqMap = new Map(faqs.map(f => [f.faqId, f]));
  const rows = processed
    .map(f => faqMap.get(f.faqId as number))
    .filter((f): f is Faq => f !== undefined);

  return (
    <div className="table-wrapper">
      <TableToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search by question or answer…"
        resultCount={rows.length}
        totalCount={faqs.length}
      />

      <table className="data-table">
        <thead>
          <tr>
            <th className="th-sortable th-narrow" onClick={() => toggleSort('faqId')}>
              # <SortIcon columnKey="faqId" sort={sort} />
            </th>
            <th className="th-sortable" onClick={() => toggleSort('question')}>
              Question <SortIcon columnKey="question" sort={sort} />
            </th>
            <th>Answer Preview</th>
            <th className="th-sortable" onClick={() => toggleSort('active')}>
              Status <SortIcon columnKey="active" sort={sort} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="table-empty">
                {search ? `No results for "${search}"` : 'No FAQs found for this company.'}
              </td>
            </tr>
          ) : (
            rows.map((faq, idx) => {
              const plain = stripHtml(faq.answer);
              return (
                <tr key={faq.faqId}>
                  <td>{pageNumber * pageSize + idx + 1}</td>
                  <td className="faq-question-cell">{faq.question}</td>
                  <td className="faq-preview-cell">
                    {plain.slice(0, 80)}{plain.length > 80 ? '…' : ''}
                  </td>
                  <td><Badge active={faq.active} /></td>
                  <td className="table-actions">
                    <Button size="sm" variant="secondary" onClick={() => onView(faq)}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => onEdit(faq)}>
                      Edit
                    </Button>
                    {faq.active && (
                      <Button size="sm" variant="danger" onClick={() => onDelete(faq)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default FaqTable;
