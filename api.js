// ===========================================
// EDUNEST - UNIFIED API MODULE
// Handles fallback to LocalStorage if server is offline
// ===========================================

const API_BASE = 'http://localhost:5000/api';
const ADMIN_PIN = '1696';

// Helper: Simulate delay for local storage operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Get data from storage
const getStorage = (key) => JSON.parse(localStorage.getItem(`edunest_${key}`) || '[]');

// Helper: Save data to storage
const setStorage = (key, data) => localStorage.setItem(`edunest_${key}`, JSON.stringify(data));

// =======================
// EXPORTED API FUNCTIONS
// =======================

export const api = {
    // Check Status
    async checkStatus() {
        try {
            const res = await fetch(`${API_BASE}/status`);
            return res.ok;
        } catch (e) {
            return false;
        }
    },

    // Submit Inquiry
    async submitInquiry(data) {
        try {
            const response = await fetch(`${API_BASE}/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Server error');
            return await response.json();
        } catch (err) {
            console.warn('Server offline, saving to LocalStorage...');
            await delay(800); // Simulate network delay

            const inquiries = getStorage('inquiries');
            const newInquiry = {
                id: Date.now(),
                ...data,
                created_at: new Date().toISOString()
            };
            inquiries.push(newInquiry);
            setStorage('inquiries', inquiries);

            return { success: true, message: 'Inquiry received (Offline Mode)' };
        }
    },

    // Submit Admission
    async submitAdmission(data) {
        try {
            const response = await fetch(`${API_BASE}/admission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Server error');
            return await response.json();
        } catch (err) {
            console.warn('Server offline, saving to LocalStorage...');
            await delay(1000);

            const admissions = getStorage('admissions');
            const newAdmission = {
                id: Date.now(),
                ...data,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            admissions.push(newAdmission);
            setStorage('admissions', admissions);

            return { success: true, message: 'Application submitted (Offline Mode)' };
        }
    },

    // Admin: Login (Mock verification)
    async verifyPin(pin) {
        // In real app, server verifies. Here we just return the local PIN to match the UI logic.
        // If server is online, we could check a protected route.
        try {
            const response = await fetch(`${API_BASE}/admin/admissions`, { headers: { 'x-admin-pin': pin } });
            if (response.ok) return true;
        } catch (e) {
            // Offline fallback
        }
        return pin === ADMIN_PIN;
    },

    // Admin: Get Inquiries
    async getInquiries(pin) {
        try {
            const response = await fetch(`${API_BASE}/admin/inquiries`, { headers: { 'x-admin-pin': pin } });
            if (!response.ok) throw new Error('Auth failed');
            return await response.json();
        } catch (err) {
            if (pin !== ADMIN_PIN) throw new Error('Invalid PIN');
            const inquiries = getStorage('inquiries');
            // Sort desc
            return inquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    // Admin: Get Admissions
    async getAdmissions(pin) {
        try {
            const response = await fetch(`${API_BASE}/admin/admissions`, { headers: { 'x-admin-pin': pin } });
            if (!response.ok) throw new Error('Auth failed');
            return await response.json();
        } catch (err) {
            if (pin !== ADMIN_PIN) throw new Error('Invalid PIN');
            const admissions = getStorage('admissions');
            return admissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    // Admin: Update Status
    async updateAdmissionStatus(id, status, pin) {
        try {
            await fetch(`${API_BASE}/admin/admission/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
                body: JSON.stringify({ status })
            });
        } catch (err) {
            const admissions = getStorage('admissions');
            const index = admissions.findIndex(a => a.id === id);
            if (index !== -1) {
                admissions[index].status = status;
                setStorage('admissions', admissions);
            }
        }
    },

    // Admin: Delete Inquiry
    async deleteInquiry(id, pin) {
        try {
            await fetch(`${API_BASE}/admin/inquiry/${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-pin': pin }
            });
        } catch (err) {
            let inquiries = getStorage('inquiries');
            inquiries = inquiries.filter(i => i.id !== id);
            setStorage('inquiries', inquiries);
        }
    }
};
