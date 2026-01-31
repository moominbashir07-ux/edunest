import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // For development simplicity with Vite
}));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Initialization
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Inquiries Table
        db.run(`CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Admissions Table
        db.run(`CREATE TABLE IF NOT EXISTS admissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            child_name TEXT NOT NULL,
            child_dob DATE NOT NULL,
            program TEXT NOT NULL,
            parent_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Routes
app.get('/api/status', (req, res) => {
    res.json({ status: 'EduNest Server is running properly.' });
});

// Submit Inquiry
app.post('/api/inquiry', (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }

    const sql = `INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, phone, message], function (err) {
        if (err) {
            console.error('Inquiry insertion error:', err.message);
            return res.status(500).json({ error: 'Failed to submit inquiry.' });
        }
        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully!',
            id: this.lastID
        });
    });
});

// Submit Admission
app.post('/api/admission', (req, res) => {
    const { child_name, child_dob, program, parent_name, email, phone, address } = req.body;

    if (!child_name || !child_dob || !program || !parent_name || !email || !phone) {
        return res.status(400).json({ error: 'All primary fields are required.' });
    }

    const sql = `INSERT INTO admissions (child_name, child_dob, program, parent_name, email, phone, address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [child_name, child_dob, program, parent_name, email, phone, address], function (err) {
        if (err) {
            console.error('Admission insertion error:', err.message);
            return res.status(500).json({ error: 'Failed to submit admission application.' });
        }
        res.status(201).json({
            success: true,
            message: 'Admission application submitted successfully!',
            id: this.lastID
        });
    });
});

// --- ADMIN MANAGEMENT ROUTES ---

// Simple PIN Authorization Middleware
const ADMIN_PIN = "1696"; // Updated PIN for user
const authMiddleware = (req, res, next) => {
    const pin = req.headers['x-admin-pin'];
    if (pin === ADMIN_PIN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized access. Invalid Admin PIN.' });
    }
};

// Fetch all inquiries
app.get('/api/admin/inquiries', authMiddleware, (req, res) => {
    db.all(`SELECT * FROM inquiries ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Fetch all admissions
app.get('/api/admin/admissions', authMiddleware, (req, res) => {
    db.all(`SELECT * FROM admissions ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update Admission Status
app.put('/api/admin/admission/:id', authMiddleware, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const sql = `UPDATE admissions SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: `Status updated to ${status}` });
    });
});

// Delete Inquiry
app.delete('/api/admin/inquiry/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM inquiries WHERE id = ?`, id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Inquiry deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
