'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import LocationPicker from '@/components/LocationPicker';
import BoxCard from '@/components/ui/BoxCard';
import BoxInput from '@/components/ui/BoxInput';
import Skeleton from '@/components/ui/Skeleton';
import { Building2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditHousePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [addressText, setAddressText] = useState('');
  const [coords, setCoords] = useState({ lat: 23.8759, lng: 90.3980 });
  const [rentAmount, setRentAmount] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [sizeSqft, setSizeSqft] = useState('1250');
  const [floor, setFloor] = useState('3rd');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    if (!id) return;

    api.get(`/houses/${id}`)
      .then((res) => {
        if (res?.success && res.data) {
          const h = res.data;
          setTitle(h.title || '');
          setAddressText(h.address_text || '');
          setCoords({
            lat: h.coordinates?.lat || 23.8759,
            lng: h.coordinates?.lng || 90.3980,
          });
          setRentAmount(h.rent_amount || '');
          setSecurityDeposit(h.security_deposit || '');
          setBedrooms(String(h.bedrooms || 1));
          setBathrooms(String(h.bathrooms || 1));
          setSizeSqft(String(h.size_sqft || 500));
          setFloor(h.floor || '3rd');
          setDescription(h.description || '');
          setRules(h.rules || '');
          setCoverImage(h.cover_image || '');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load house');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title,
        address_text: addressText,
        lat: coords.lat,
        lng: coords.lng,
        rent_amount: parseFloat(rentAmount),
        security_deposit: parseFloat(securityDeposit) || 0,
        bedrooms: parseInt(bedrooms, 10),
        bathrooms: parseInt(bathrooms, 10),
        size_sqft: parseInt(sizeSqft, 10),
        floor,
        description,
        rules,
        cover_image: coverImage,
      };

      const res = await api.put(`/houses/${id}`, payload);
      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/host');
        }, 1500);
      } else {
        setError(res?.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to update house');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-1/3 h-8 rounded-xl" />
        <Skeleton className="w-full h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <Link href="/host" className="flex items-center gap-1.5 text-xs font-semibold text-text hover:text-[#57BA29] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Host Portal</span>
        </Link>
        <span className="text-xs font-semibold text-text-muted">Edit House #{id}</span>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#57BA29]" />
          <span>House updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <BoxCard className="p-6 space-y-4 rounded-2xl shadow-sm">
          <BoxInput
            label="House Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <BoxInput
            label="Address Text"
            required
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
          />
        </BoxCard>

        <BoxCard className="p-6 space-y-4 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-text border-b border-border pb-2.5">
            Update Location Pin
          </h3>
          <LocationPicker value={coords} onChange={setCoords} />
        </BoxCard>

        <BoxCard className="p-6 space-y-4 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInput
              label="Monthly Rent (৳)"
              type="number"
              required
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
            <BoxInput
              label="Security Deposit (৳)"
              type="number"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BoxInput label="Bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
            <BoxInput label="Bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
            <BoxInput label="Size (sqft)" type="number" value={sizeSqft} onChange={(e) => setSizeSqft(e.target.value)} />
            <BoxInput label="Floor" value={floor} onChange={(e) => setFloor(e.target.value)} />
          </div>

          <BoxInput
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted block">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-border text-text p-3 text-xs rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm"
            />
          </div>

          <BoxInput
            label="Rules"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
        </BoxCard>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Saving Changes...' : 'Save & Update Listing'}
        </button>
      </form>
    </div>
  );
}
