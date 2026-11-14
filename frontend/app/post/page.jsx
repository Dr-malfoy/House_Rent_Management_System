'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import LocationPicker from '@/components/LocationPicker';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxInput from '@/components/ui/BoxInput';
import { BD_LOCATIONS } from '@/lib/locations-data';
import {
  Building2,
  ShieldCheck,
  X,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export default function PostHousePage() {
  const router = useRouter();
  const { user, isNidVerified, isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [areaName, setAreaName] = useState('Uttara Sector 10');
  const [addressText, setAddressText] = useState('');
  const [coords, setCoords] = useState({ lat: 23.8759, lng: 90.3980 });
  const [rentAmount, setRentAmount] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [sizeSqft, setSizeSqft] = useState('1250');
  const [floor, setFloor] = useState('3rd');
  const [propertyTypeId, setPropertyTypeId] = useState('1');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([1, 2, 4, 7]);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800');
  const [otherImages, setOtherImages] = useState([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [amenitiesList, setAmenitiesList] = useState([]);
  const [propertyTypesList, setPropertyTypesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/admin/lookups')
      .then((res) => {
        if (res?.success && res.data) {
          setAmenitiesList(res.data.amenities || []);
          setPropertyTypesList(res.data.property_types || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/post');
    }
  }, [user, authLoading, router]);

  const handleToggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAddOtherImage = () => {
    if (newImageUrl.trim()) {
      setOtherImages([...otherImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveOtherImage = (index) => {
    setOtherImages(otherImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !addressText || !rentAmount) {
      setError('Please fill in all required fields (title, address, and rent amount).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title,
        address_text: addressText,
        division,
        district,
        area_name: areaName,
        city: district,
        lat: coords.lat,
        lng: coords.lng,
        rent_amount: parseFloat(rentAmount),
        security_deposit: parseFloat(securityDeposit) || 0,
        bedrooms: parseInt(bedrooms, 10),
        bathrooms: parseInt(bathrooms, 10),
        size_sqft: parseInt(sizeSqft, 10),
        floor,
        property_type_id: parseInt(propertyTypeId, 10),
        description,
        rules,
        availability_date: availabilityDate || null,
        amenities: selectedAmenities,
        cover_image: coverImage,
        images: otherImages,
      };

      const res = await api.post('/houses', payload);
      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/host');
        }, 2000);
      } else {
        setError(res?.message || 'Posting failed');
      }
    } catch (err) {
      setError(err.message || 'Error creating post');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  // NID Gate Check
  if (!isNidVerified) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
          <ShieldCheck className="w-8 h-8 stroke-[2]" />
        </div>
        <h2 className="text-xl font-bold text-text">NID Verification Required</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          To ensure tenant safety and eliminate fraudulent postings, all property owners must be NID verified before posting a house.
        </p>
        <div className="p-3.5 bg-surface border border-border rounded-2xl text-xs font-medium text-text">
          Status: <span className="font-semibold text-amber-500 capitalize">{user?.nid_status || 'Not Submitted'}</span>
        </div>
        <div className="pt-2">
          <Link href="/nid">
            <button
              type="button"
              className="bg-[#57BA29] hover:bg-[#479E1F] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Submit NID Verification
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text">House Post Submitted!</h2>
        <p className="text-xs text-text-muted">
          Your listing has been submitted for admin approval and will go live shortly.
        </p>
        <p className="text-xs font-semibold text-primary animate-pulse">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2">
          <Building2 className="w-7 h-7 text-[#57BA29]" />
          <span>Post a New House Listing</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Provide accurate flat details, photos, and drop a precision GPS pin on the map.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-medium text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <BoxCard className="space-y-4 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
            1. Property Overview
          </h3>

          <BoxInput
            label="House / Flat Name"
            placeholder="e.g. Modern Lakeview 3BHK Apartment in Uttara Sector 10"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-text block mb-1">Division</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none focus:border-[#57BA29] cursor-pointer"
              >
                {Object.keys(BD_LOCATIONS).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none focus:border-[#57BA29] cursor-pointer"
              >
                {Object.keys(BD_LOCATIONS[division] || {}).map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Area / Thana</label>
              <select
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none focus:border-[#57BA29] cursor-pointer"
              >
                {(BD_LOCATIONS[division]?.[district] || []).map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <BoxInput
            label="Street Address / House & Road Number"
            placeholder="e.g. House 14, Road 5, Sector 10, Uttara, Dhaka"
            required
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
          />
        </BoxCard>

        {/* Section 2: Precision Location Pin Dropping (Leaflet Map) */}
        <BoxCard className="space-y-4 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
            2. Drop Map Pin (Exact GPS Location)
          </h3>
          <LocationPicker
            value={coords}
            onChange={setCoords}
            defaultAreaName={`${areaName}, ${district}`}
          />
        </BoxCard>

        {/* Section 3: Pricing & Specifications */}
        <BoxCard className="space-y-4 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
            3. Pricing & Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInput
              label="Monthly Rent (৳ BDT)"
              type="number"
              placeholder="e.g. 28000"
              required
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />

            <BoxInput
              label="Security Deposit (৳ BDT)"
              type="number"
              placeholder="e.g. 56000"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BoxInput
              label="Bedrooms"
              type="number"
              min="1"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
            <BoxInput
              label="Bathrooms"
              type="number"
              min="1"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
            <BoxInput
              label="Size (sqft)"
              type="number"
              value={sizeSqft}
              onChange={(e) => setSizeSqft(e.target.value)}
            />
            <BoxInput
              label="Floor Level"
              placeholder="e.g. 4th"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text block mb-1">Property Type</label>
            <select
              value={propertyTypeId}
              onChange={(e) => setPropertyTypeId(e.target.value)}
              className="w-full bg-surface border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none focus:border-[#57BA29] cursor-pointer"
            >
              {propertyTypesList.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>
        </BoxCard>

        {/* Section 4: Photos & Gallery */}
        <BoxCard className="space-y-4 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
            4. Property Photos & Gallery
          </h3>

          <BoxInput
            label="Cover Picture URL (Main Image)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            helperText="Enter a direct image URL (Unsplash or image link)"
          />

          {coverImage && (
            <div className="relative w-48 h-28 rounded-2xl overflow-hidden bg-zinc-950 border border-border">
              <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
            </div>
          )}

          {/* Additional Photos List */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-text block">
              Additional Room / Balcony Photos ({otherImages.length})
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste other photo URL (room, kitchen, bath)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-surface border border-border text-text px-3.5 py-2 text-xs font-normal rounded-xl outline-none focus:border-[#57BA29]"
              />
              <button
                type="button"
                onClick={handleAddOtherImage}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-surface-alt transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-primary" /> Add Photo
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {otherImages.map((img, idx) => (
                <div key={idx} className="relative w-28 h-20 rounded-xl border border-border overflow-hidden group">
                  <Image src={img} alt="Gallery" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveOtherImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </BoxCard>

        {/* Section 5: Facilities, Rules & Description */}
        <BoxCard className="space-y-4 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
            5. Facilities & Rules
          </h3>

          <div>
            <label className="text-xs font-semibold text-text block mb-2">Select Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenitiesList.map((a) => {
                const isSelected = selectedAmenities.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleToggleAmenity(a.id)}
                    className={`flex items-center gap-2 p-2.5 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#57BA29] bg-[#E6F5DD] dark:bg-[#1E3314] text-[#57BA29]'
                        : 'border-border bg-surface text-text hover:bg-surface-alt'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#57BA29]' : 'text-text-muted'}`} />
                    <span>{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text block">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe ventilation, road width, nearby markets, metro access..."
              className="w-full bg-surface border border-border text-text p-3.5 text-xs rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm"
            />
          </div>

          <BoxInput
            label="House Rules"
            placeholder="e.g. Family tenants only, no loud noise after 11 PM"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />

          <BoxInput
            label="Availability Date"
            type="date"
            value={availabilityDate}
            onChange={(e) => setAvailabilityDate(e.target.value)}
          />
        </BoxCard>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Submitting House Post...' : 'Publish House Listing'}
        </button>
      </form>
    </div>
  );
}
