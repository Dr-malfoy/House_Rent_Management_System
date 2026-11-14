'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNav from '@/components/AdminNav';
import BoxCard from '@/components/ui/BoxCard';
import BoxBadge from '@/components/ui/BoxBadge';
import BoxModal from '@/components/ui/BoxModal';
import Skeleton from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Send, CheckCircle2, Clock, MessageCircle } from 'lucide-react';

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback/admin');
      if (res?.success && res.data) {
        setFeedbackList(res.data.feedback || []);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    setIsSending(true);
    try {
      await api.post(`/feedback/admin/${selectedItem.id}/respond`, {
        response: responseText.trim(),
        status: 'resolved',
      });
      setReplyModalOpen(false);
      setResponseText('');
      fetchFeedback();
    } catch (err) {
      alert('Failed to send response: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen pb-16">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-[#57BA29]" />
              <span>Feedback & Grievance Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Review tenancy feedback and complaints. Admin responses are delivered directly to the user's notification center.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : feedbackList.length === 0 ? (
            <BoxCard className="p-12 text-center space-y-3 bg-surface-alt/40 border-dashed rounded-2xl">
              <MessageCircle className="w-12 h-12 text-text-muted mx-auto" />
              <h3 className="text-base font-bold text-text">No Feedback Records Found</h3>
            </BoxCard>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((item) => (
                <BoxCard key={item.id} className="p-5 sm:p-6 space-y-3 rounded-2xl shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <BoxBadge
                        size="sm"
                        variant={
                          item.category === 'Complaint'
                            ? 'danger'
                            : item.category === 'Suggestion'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {item.category}
                      </BoxBadge>
                      <BoxBadge
                        size="sm"
                        variant={item.status === 'resolved' ? 'success' : 'neutral'}
                      >
                        {item.status}
                      </BoxBadge>
                      <h3 className="text-sm sm:text-base font-bold text-text">{item.subject}</h3>
                    </div>

                    <span className="text-xs font-medium text-text-muted">{formatDate(item.created_at)}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-muted whitespace-pre-line font-normal leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs font-medium text-text-muted">
                    <div>
                      From: <strong className="text-text">{item.sender_name}</strong> ({item.sender_email})
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(item);
                        setResponseText(item.admin_response || '');
                        setReplyModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#57BA29] hover:bg-[#479E1F] text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{item.admin_response ? 'Edit Response' : 'Reply & Notify'}</span>
                    </button>
                  </div>

                  {item.admin_response && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1 text-xs">
                      <span className="text-xs font-bold text-[#57BA29] block">
                        Admin Reply (Delivered to User Notification):
                      </span>
                      <p className="font-medium text-text">{item.admin_response}</p>
                    </div>
                  )}
                </BoxCard>
              ))}
            </div>
          )}

          {/* Reply Modal */}
          {replyModalOpen && selectedItem && (
            <BoxModal
              isOpen={replyModalOpen}
              onClose={() => setReplyModalOpen(false)}
              title={`Respond to Feedback: ${selectedItem.subject}`}
              maxWidth="max-w-xl"
            >
              <form onSubmit={handleSendResponse} className="space-y-4">
                <div className="p-3.5 bg-surface-alt border border-border rounded-xl text-xs space-y-1">
                  <p><strong>From:</strong> {selectedItem.sender_name} ({selectedItem.sender_email})</p>
                  <p><strong>Original Message:</strong> {selectedItem.message}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted block">
                    Your Response (Will notify user)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write an official response to the user..."
                    className="w-full bg-surface border border-border text-text p-3 text-xs rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSending ? 'Sending Response...' : 'Send Response & Notify User'}
                </button>
              </form>
            </BoxModal>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
