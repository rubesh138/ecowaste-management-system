import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { requestService } from '../../services/requestService';
import { categoryService } from '../../services/categoryService';
import { WasteCategory } from '../../types';
import {
  PackagePlus,
  Calendar,
  MapPin,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Leaf,
} from 'lucide-react';

export const CreateRequest: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [wasteType, setWasteType] = useState('Plastic');
  const [quantity, setQuantity] = useState('10 kg (2 bags)');

  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const [address, setAddress] = useState(
    user?.address || ''
  );

  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res =
          await categoryService.getCategories();

        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setWasteType(res.data[0].name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCats();
  }, []);

  // =====================================================
  // DEFAULT CATEGORIES
  // =====================================================

  const defaultCategories = [
    {
      _id: '1',
      name: 'Organic',
      description:
        'Food waste, yard trimmings, bio-waste',
      icon: 'Leaf',
      color: 'emerald',
      isActive: true,
    },
    {
      _id: '2',
      name: 'Plastic',
      description:
        'Bottles, packaging, HDPE/PET materials',
      icon: 'Package',
      color: 'blue',
      isActive: true,
    },
    {
      _id: '3',
      name: 'Paper',
      description:
        'Cardboard boxes, newsprint, office paper',
      icon: 'FileText',
      color: 'amber',
      isActive: true,
    },
    {
      _id: '4',
      name: 'Glass',
      description:
        'Bottles, jars, clean cullet',
      icon: 'Wine',
      color: 'cyan',
      isActive: true,
    },
    {
      _id: '5',
      name: 'Metal',
      description:
        'Aluminum cans, scrap metal, tins',
      icon: 'Hammer',
      color: 'slate',
      isActive: true,
    },
    {
      _id: '6',
      name: 'E-Waste',
      description:
        'Electronics, batteries, cables',
      icon: 'Cpu',
      color: 'violet',
      isActive: true,
    },
    {
      _id: '7',
      name: 'Mixed Waste',
      description:
        'Non-hazardous mixed recyclables',
      icon: 'Recycle',
      color: 'teal',
      isActive: true,
    },
  ];

  const displayCategories: WasteCategory[] =
    categories.length > 0
      ? categories
      : defaultCategories;

  // =====================================================
  // ADDRESS VALIDATION
  // =====================================================

  const validateAddress = (value: string) => {
    const trimmedAddress = value.trim();

    if (!trimmedAddress) {
      return 'Please provide a collection address.';
    }

    if (trimmedAddress.length < 5) {
      return 'Address must be at least 5 characters.';
    }

    // Must contain at least one letter
    if (!/[A-Za-z]/.test(trimmedAddress)) {
      return 'Please enter a valid address containing letters.';
    }

    // Must contain at least one letter or number
    if (!/[A-Za-z0-9]/.test(trimmedAddress)) {
      return 'Please enter a valid address.';
    }

    return '';
  };

  // =====================================================
  // IMAGE
  // =====================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(
          'Image size should be under 2MB',
          'warning'
        );
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  // =====================================================
  // SUBMIT REQUEST
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMessage('');

    const trimmedAddress = address.trim();

    if (
      !wasteType ||
      !quantity ||
      !preferredDate ||
      !trimmedAddress
    ) {
      setErrorMessage(
        'Please fill in all required fields.'
      );
      return;
    }

    // Validate address before submitting
    const addressError =
      validateAddress(trimmedAddress);

    if (addressError) {
      setErrorMessage(addressError);
      showToast(addressError, 'warning');
      return;
    }

    try {
      setIsSubmitting(true);

      await requestService.createRequest({
        wasteType,
        quantity,
        preferredDate,
        address: trimmedAddress,
        description,
        image,
      });

      showToast(
        'Your waste collection request has been submitted successfully.',
        'success'
      );

      navigate('/citizen/requests');
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to submit request.'
      );

      showToast(
        err.message || 'Submission failed',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Schedule Waste Collection
          </h1>

          <p className="text-xs text-slate-500">
            Submit your recyclable waste for municipal pickup and processing
          </p>

        </div>

      </div>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 p-4 text-xs text-rose-700 border border-rose-200 font-medium">
          {errorMessage}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
      >

        {/* =====================================================
            CATEGORY
        ===================================================== */}

        <div className="space-y-3">

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Select Waste Category *
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

            {displayCategories.map((cat) => {

              const isSelected =
                wasteType === cat.name;

              return (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() =>
                    setWasteType(cat.name)
                  }
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold">
                      {cat.name}
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}

                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {cat.description}
                  </p>

                </button>
              );
            })}

          </div>
        </div>

        {/* =====================================================
            QUANTITY + DATE
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">

          {/* QUANTITY */}

          <div className="space-y-1.5">

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Quantity / Volume *
            </label>

            <div className="relative">

              <input
                type="text"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="e.g. 15 kg (3 bags) or 4 boxes"
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

            </div>

            <p className="text-[11px] text-slate-400">
              Mention approximate weight in kg or number of containers/sacks.
            </p>

          </div>

          {/* DATE */}

          <div className="space-y-1.5">

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Preferred Collection Date *
            </label>

            <div className="relative">

              <input
                type="date"
                value={preferredDate}
                min={
                  new Date()
                    .toISOString()
                    .split('T')[0]
                }
                onChange={(e) =>
                  setPreferredDate(e.target.value)
                }
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

            </div>

            <p className="text-[11px] text-slate-400">
              Municipal teams service residential sectors Monday through Saturday.
            </p>

          </div>

        </div>

        {/* =====================================================
            COLLECTION ADDRESS
        ===================================================== */}

        <div className="space-y-1.5 pt-2 border-t border-slate-100">

          <div className="flex items-center justify-between">

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Collection Pickup Address *
            </label>

            {user?.address && (
              <button
                type="button"
                onClick={() =>
                  setAddress(user.address)
                }
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Use My Registered Address
              </button>
            )}

          </div>

          <div className="relative">

            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              onBlur={() => {
                const error =
                  validateAddress(address);

                if (error) {
                  setErrorMessage(error);
                } else {
                  setErrorMessage('');
                }
              }}
              placeholder="150 Sathy Road, Erode"
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

          </div>

          <p className="text-[11px] text-slate-400">
            Example: 150 Sathy Road, Erode
          </p>

        </div>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <div className="space-y-1.5 pt-2 border-t border-slate-100">

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            5. Additional Description / Handling Instructions (Optional)
          </label>

          <div className="relative">

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="e.g. Stored in blue recycling bins beside the garage driveway. Contains clean rinsed milk jugs."
              className="block w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

          </div>

        </div>

        {/* =====================================================
            IMAGE
        ===================================================== */}

        <div className="space-y-2 pt-2 border-t border-slate-100">

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            6. Photo Attachment (Optional)
          </label>

          <div className="flex items-center gap-4">

            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-slate-300 px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors">

              <Upload className="w-4 h-4 text-slate-400" />

              <span>
                Choose Photo
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

            {image && (
              <div className="flex items-center gap-2">

                <img
                  src={image}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border"
                />

                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Remove
                </button>

              </div>
            )}

          </div>

        </div>

        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              navigate('/citizen/dashboard')
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >

            <PackagePlus className="w-4 h-4" />

            <span>
              {isSubmitting
                ? 'Submitting...'
                : 'Submit Request'}
            </span>

          </button>

        </div>

      </form>
    </div>
  );
};

export default CreateRequest;