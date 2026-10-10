import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { WasteCategory } from '../../types';
import {
  Tags,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Recycle,
} from 'lucide-react';

export const AdminWasteCategories: React.FC = () => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WasteCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Recycle',
    color: 'emerald',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await categoryService.getCategories(true);
      if (res.data) setCategories(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Recycle',
      color: 'emerald',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: WasteCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Recycle',
      color: cat.color || 'emerald',
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Category name is required', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
        showToast(`Category "${formData.name}" updated`, 'success');
      } else {
        await categoryService.createCategory(formData);
        showToast(`Category "${formData.name}" created`, 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: WasteCategory) => {
    try {
      await categoryService.updateCategory(cat._id, { isActive: !cat.isActive });
      showToast(`Category ${!cat.isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to update category status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(deleteTargetId);
      showToast('Waste category deleted', 'success');
      setDeleteTargetId(null);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Stream Categories
          </h1>
          <p className="text-xs text-slate-500">
            Define segregated recyclable waste types, handling descriptions, and active status
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading categories..." className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No waste categories"
          description="Add initial recyclable categories to let citizens submit collection requests."
          actionText="Add Category"
          onAction={handleOpenAdd}
          icon={Tags}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className={`rounded-3xl p-6 border transition-all bg-white shadow-sm space-y-4 ${
                !cat.isActive ? 'opacity-60 bg-slate-50' : 'hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Recycle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(cat._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                {cat.description || 'No description provided.'}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`text-xs font-semibold px-3 py-1 rounded-xl transition-colors ${
                    cat.isActive
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {cat.isActive ? 'Deactivate Category' : 'Activate Category'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category - ${editingCategory.name}` : 'Create Waste Category'}
        subtitle="Manage available municipal recycling streams"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Hazardous E-Waste, Textile Recycling"
              required
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Description & Guidelines *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what items are accepted and handling instructions..."
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="catActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="catActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Active (Visible in citizen pickup form)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Waste Category"
        message="Are you sure you want to delete this category? Existing requests under this category will retain their history."
        confirmText="Yes, Delete Category"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
