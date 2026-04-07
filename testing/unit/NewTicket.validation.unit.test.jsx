import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewTicket from '../../src/pages/user/NewTicket';

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

const mockCreateTicket = vi.fn();
vi.mock('../../src/api/tickets', () => ({
    createTicket: (...args) => mockCreateTicket(...args),
}));

describe('NewTicket backend validation handling', () => {
    beforeEach(() => {
        mockCreateTicket.mockReset();
    });

    it('renders backend validation errors when API returns validationErrors', async () => {
        mockCreateTicket.mockRejectedValue({
            response: {
                data: {
                    message: 'Validation failed',
                    validationErrors: [
                        'ticketTitle: Title must be between 5 and 120 characters',
                        'description: Description must be between 15 and 2000 characters',
                        'preferredContactPhoneNumber: Invalid phone number',
                    ],
                },
            },
        });

        render(
            <MemoryRouter>
                <NewTicket />
            </MemoryRouter>
        );

        const selects = screen.getAllByRole('combobox');
        await userEvent.selectOptions(selects[0], 'HARDWARE_ISSUE');
        await userEvent.type(screen.getByPlaceholderText(/brief description of the issue/i), 'bad');
        await userEvent.type(screen.getByPlaceholderText(/provide detailed information/i), 'too short');
        await userEvent.type(screen.getByPlaceholderText('+94771234567'), 'abc');

        await userEvent.click(screen.getByRole('button', { name: /submit ticket/i }));

        await waitFor(() => {
            expect(screen.getByText('Validation failed')).toBeInTheDocument();
        });

        expect(screen.getByText(/ticketTitle: Title must be between 5 and 120 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/description: Description must be between 15 and 2000 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/preferredContactPhoneNumber: Invalid phone number/i)).toBeInTheDocument();
    });
});
