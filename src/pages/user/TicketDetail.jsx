import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTicket } from "../../api/tickets";
import {
  getCommentsByTicket,
  addComment,
  deleteComment,
} from "../../api/comments";
import {
  getAttachmentsByTicket,
  uploadAttachment,
  deleteAttachment,
} from "../../api/attachments";
import { getTechnicianUpdates } from "../../api/updates";
import {
  getStatusBadge,
  getPriorityBadge,
  getCategoryLabel,
  formatDate,
} from "../../utils/constants";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Input from "../../components/common/Input";
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Clock,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("comments");
  const [uploading, setUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const [deletingAttachmentId, setDeletingAttachmentId] = useState("");
  const [attachmentForm, setAttachmentForm] = useState({
    fileName: "",
    fileType: "",
    fileUrl: "",
  });

  const load = async () => {
    try {
      const [tRes, cRes, aRes, uRes] = await Promise.all([
        getTicket(id),
        getCommentsByTicket(id).catch(() => ({ data: { data: [] } })),
        getAttachmentsByTicket(id).catch(() => ({ data: { data: [] } })),
        getTechnicianUpdates(id).catch(() => ({ data: { data: [] } })),
      ]);
      setTicket(tRes.data.data);
      setComments(cRes.data.data || []);
      setAttachments(aRes.data.data || []);
      setUpdates(uRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await addComment(id, user.userId, { commentText: newComment });
      setNewComment("");
      const cRes = await getCommentsByTicket(id);
      setComments(cRes.data.data || []);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {}
  };

  const handleAttachmentFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentForm((prev) => ({
      ...prev,
      fileName: prev.fileName || file.name,
      fileType: prev.fileType || file.type || "application/octet-stream",
    }));
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    setAttachmentError("");

    if (!attachmentForm.fileName.trim() || !attachmentForm.fileUrl.trim()) {
      setAttachmentError("Attachment name and URL are required.");
      return;
    }

    setUploading(true);
    try {
      await uploadAttachment(
        id,
        attachmentForm.fileName.trim(),
        (attachmentForm.fileType || "application/octet-stream").trim(),
        attachmentForm.fileUrl.trim(),
        user.userId,
      );
      const aRes = await getAttachmentsByTicket(id);
      setAttachments(aRes.data.data || []);
      setAttachmentForm({ fileName: "", fileType: "", fileUrl: "" });
    } catch (err) {
      setAttachmentError(
        err.response?.data?.message || "Failed to add attachment",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    setDeletingAttachmentId(attachmentId);
    try {
      await deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      setAttachmentError("Failed to delete attachment");
    } finally {
      setDeletingAttachmentId("");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  if (!ticket)
    return (
      <p className="text-center py-20 text-text-muted">Ticket not found</p>
    );

  const s = getStatusBadge(ticket.status || ticket.currentStatus);
  const p = getPriorityBadge(ticket.priorityLevel);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <Card className="mb-4">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">
                {ticket.ticketCode || ticket.ticketReferenceNumber}
              </p>
              <h1 className="text-lg font-semibold">{ticket.ticketTitle}</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge className={p.color}>{p.label}</Badge>
              <Badge className={s.color}>{s.label}</Badge>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-3 leading-relaxed">
            {ticket.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mt-5 text-xs">
            <div>
              <span className="text-text-muted">Category</span>
              <p className="font-medium mt-0.5">
                {getCategoryLabel(ticket.incidentCategory)}
              </p>
            </div>
            <div>
              <span className="text-text-muted">Reported by</span>
              <p className="font-medium mt-0.5">
                {ticket.createdByName || ticket.reportedByName}
              </p>
            </div>
            <div>
              <span className="text-text-muted">Created</span>
              <p className="font-medium mt-0.5">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
            {ticket.assignedTechnicianName && (
              <div>
                <span className="text-text-muted">Assigned to</span>
                <p className="font-medium mt-0.5">
                  {ticket.assignedTechnicianName}
                </p>
              </div>
            )}
            {ticket.resolutionNotes && (
              <div className="col-span-2">
                <span className="text-text-muted">Resolution</span>
                <p className="font-medium mt-0.5">{ticket.resolutionNotes}</p>
              </div>
            )}
            {ticket.rejectionReason && (
              <div className="col-span-2">
                <span className="text-text-muted">Rejection Reason</span>
                <p className="font-medium mt-0.5 text-danger">
                  {ticket.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {[
          {
            key: "comments",
            label: "Comments",
            icon: MessageSquare,
            count: comments.length,
          },
          {
            key: "attachments",
            label: "Attachments",
            icon: Paperclip,
            count: attachments.length,
          },
          {
            key: "updates",
            label: "Updates",
            icon: Clock,
            count: updates.length,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? "border-primary-600 text-primary-700" : "border-transparent text-text-muted hover:text-text-secondary"}`}
          >
            <t.icon size={14} /> {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "comments" && (
        <Card>
          <div className="divide-y divide-border">
            {comments.length === 0 && (
              <p className="p-6 text-center text-sm text-text-muted">
                No comments yet
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {c.commentOwnerName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-alt text-text-muted">
                      {c.commentOwnerRole}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatDate(c.createdAt)}
                    </span>
                    {c.edited && (
                      <span className="text-[10px] text-text-muted italic">
                        (edited)
                      </span>
                    )}
                  </div>
                  {c.commentOwnerUserId === user.userId && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="p-1 text-text-muted hover:text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  {c.commentText}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={sending || !newComment.trim()}
            >
              <Send size={14} />
            </Button>
          </div>
        </Card>
      )}

      {tab === "attachments" && (
        <Card>
          <form
            onSubmit={handleAddAttachment}
            className="p-4 border-b border-border space-y-3"
          >
            {attachmentError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">
                {attachmentError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="File Name"
                value={attachmentForm.fileName}
                onChange={(e) =>
                  setAttachmentForm((prev) => ({
                    ...prev,
                    fileName: e.target.value,
                  }))
                }
                placeholder="e.g. issue-photo.jpg"
                required
              />
              <Input
                label="File Type"
                value={attachmentForm.fileType}
                onChange={(e) =>
                  setAttachmentForm((prev) => ({
                    ...prev,
                    fileType: e.target.value,
                  }))
                }
                placeholder="e.g. image/jpeg"
              />
              <div className="flex items-end">
                <label className="w-full">
                  <span className="block text-sm font-medium text-text-secondary mb-1">
                    Pick File (optional)
                  </span>
                  <input
                    type="file"
                    onChange={handleAttachmentFilePick}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <Input
                className="flex-1"
                label="File URL"
                value={attachmentForm.fileUrl}
                onChange={(e) =>
                  setAttachmentForm((prev) => ({
                    ...prev,
                    fileUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
                required
              />
              <Button type="submit" disabled={uploading}>
                <Upload size={14} className="mr-1" />
                {uploading ? "Adding..." : "Add Attachment"}
              </Button>
            </div>
          </form>

          {attachments.length === 0 ? (
            <p className="p-6 text-center text-sm text-text-muted">
              No attachments
            </p>
          ) : (
            <div className="divide-y divide-border">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {a.originalFileName || a.fileName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {a.uploadedByName} · {formatDate(a.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(a.fileAccessUrl || a.fileUrl) && (
                      <a
                        href={a.fileAccessUrl || a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteAttachment(a.id)}
                      disabled={deletingAttachmentId === a.id}
                      className="p-1 text-text-muted hover:text-danger disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "updates" && (
        <Card>
          {updates.length === 0 ? (
            <p className="p-6 text-center text-sm text-text-muted">
              No technician updates
            </p>
          ) : (
            <div className="divide-y divide-border">
              {updates.map((u) => (
                <div key={u.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {u.technicianName}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatDate(u.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className={getStatusBadge(u.previousStatus).color}>
                      {getStatusBadge(u.previousStatus).label}
                    </Badge>
                    <span className="text-xs text-text-muted">→</span>
                    <Badge className={getStatusBadge(u.newStatus).color}>
                      {getStatusBadge(u.newStatus).label}
                    </Badge>
                  </div>
                  {u.updateMessage && (
                    <p className="text-sm text-text-secondary mt-1.5">
                      {u.updateMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
