import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TicketDetail from '../../src/pages/user/TicketDetail';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            userId: 'u-1',
            fullName: 'John Doe',
            universityEmailAddress: 'john@uni.com',
            role: 'USER',
        },
    }),
}));

const mockGetTicket = vi.fn();
vi.mock('../../src/api/tickets', () => ({
    getTicket: (...args) => mockGetTicket(...args),
}));

const mockGetCommentsByTicket = vi.fn();
const mockAddComment = vi.fn();
const mockDeleteComment = vi.fn();
vi.mock('../../src/api/comments', () => ({
    getCommentsByTicket: (...args) => mockGetCommentsByTicket(...args),
    addComment: (...args) => mockAddComment(...args),
    deleteComment: (...args) => mockDeleteComment(...args),
}));

const mockGetAttachmentsByTicket = vi.fn();
const mockUploadAttachment = vi.fn();
const mockDeleteAttachment = vi.fn();
vi.mock('../../src/api/attachments', () => ({
    getAttachmentsByTicket: (...args) => mockGetAttachmentsByTicket(...args),
    uploadAttachment: (...args) => mockUploadAttachment(...args),
    deleteAttachment: (...args) => mockDeleteAttachment(...args),
}));

const mockGetTechnicianUpdates = vi.fn();
vi.mock('../../src/api/updates', () => ({
    getTechnicianUpdates: (...args) => mockGetTechnicianUpdates(...args),
}));

function renderTicketDetail() {
    return render(
        <MemoryRouter initialEntries={['/portal/tickets/t-1']}>
            <Routes>
                <Route path="/portal/tickets/:id" element={<TicketDetail />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('TicketDetail attachment integration', () => {
    beforeEach(() => {
        mockGetTicket.mockReset();
        mockGetCommentsByTicket.mockReset();
        mockGetAttachmentsByTicket.mockReset();
        mockGetTechnicianUpdates.mockReset();
        mockUploadAttachment.mockReset();
        mockDeleteAttachment.mockReset();

        mockGetTicket.mockResolvedValue({
            data: {
                data: {
                    id: 't-1',
                    ticketCode: 'INC-001',
                    ticketTitle: 'Projector issue',
                    description: 'Projector is not working in room A1',
                    incidentCategory: 'HARDWARE_ISSUE',
                    priorityLevel: 'MEDIUM',
                    status: 'OPEN',
                    createdAt: '2026-04-06T00:00:00Z',
                    createdByName: 'John Doe',
                },
            },
        });

        mockGetCommentsByTicket.mockResolvedValue({ data: { data: [] } });
        mockGetTechnicianUpdates.mockResolvedValue({ data: { data: [] } });
    });

    it('shows preview link when backend returns fileUrl (fallback)', async () => {
        mockGetAttachmentsByTicket.mockResolvedValue({
            data: {
                data: [
                    {
                        id: 'a-1',
                        fileName: 'evidence.jpg',
                        fileUrl: 'https://example.com/evidence.jpg',
                        uploadedByName: 'John Doe',
                        uploadedAt: '2026-04-06T01:00:00Z',
                    },
                ],
            },
        });

        renderTicketDetail();

        await waitFor(() => {
            expect(screen.getByText('Projector issue')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByRole('button', { name: /attachments/i }));

        const viewLink = await screen.findByRole('link', { name: /view/i });
        expect(viewLink).toHaveAttribute('href', 'https://example.com/evidence.jpg');
    });

    it('shows error message when add attachment fails', async () => {
        mockGetAttachmentsByTicket.mockResolvedValue({ data: { data: [] } });
        mockUploadAttachment.mockRejectedValue({
            response: { data: { message: 'Attachment upload failed' } },
        });

        renderTicketDetail();

        await waitFor(() => {
            expect(screen.getByText('Projector issue')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByRole('button', { name: /attachments/i }));

        await userEvent.type(screen.getByPlaceholderText(/issue-photo.jpg/i), 'proof.png');
        await userEvent.type(screen.getByPlaceholderText(/https:\/\//i), 'https://example.com/proof.png');
        await userEvent.click(screen.getByRole('button', { name: /add attachment/i }));

        expect(await screen.findByText('Attachment upload failed')).toBeInTheDocument();
    });
});
