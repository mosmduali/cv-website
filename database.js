const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const { encrypt, decrypt } = require('./encryption');

const db = new Database(path.join(__dirname, 'cv-data.db'));

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Profile table
    db.exec(`
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT,
            bio TEXT,
            profile_image TEXT,
            phone TEXT,
            email TEXT,
            location TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Skills table
    db.exec(`
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            proficiency INTEGER NOT NULL,
            icon TEXT,
            sort_order INTEGER DEFAULT 0
        )
    `);

    // Experience table
    db.exec(`
        CREATE TABLE IF NOT EXISTS experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            current BOOLEAN DEFAULT 0,
            description TEXT,
            achievements TEXT,
            logo TEXT,
            sort_order INTEGER DEFAULT 0
        )
    `);

    // Education table
    db.exec(`
        CREATE TABLE IF NOT EXISTS education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            institution TEXT NOT NULL,
            degree TEXT NOT NULL,
            field TEXT,
            start_date TEXT NOT NULL,
            end_date TEXT,
            description TEXT,
            logo TEXT,
            sort_order INTEGER DEFAULT 0
        )
    `);

    // Projects table
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            image TEXT,
            technologies TEXT,
            live_url TEXT,
            github_url TEXT,
            featured BOOLEAN DEFAULT 0,
            sort_order INTEGER DEFAULT 0
        )
    `);

    // Achievements table
    db.exec(`
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT,
            icon TEXT,
            sort_order INTEGER DEFAULT 0
        )
    `);

    // Testimonials table
    db.exec(`
        CREATE TABLE IF NOT EXISTS testimonials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT,
            company TEXT,
            quote TEXT NOT NULL,
            photo TEXT,
            sort_order INTEGER DEFAULT 0
        )
    `);

    // Settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT
        )
    `);

    // Check if admin user exists, if not create one
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (!user) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
            'admin',
            'admin@example.com',
            hashedPassword
        );
        console.log('✓ Default admin user created (username: admin, password: admin123)');
    }

    // Add sample data if tables are empty
    const profileCount = db.prepare('SELECT COUNT(*) as count FROM profile').get().count;
    if (profileCount === 0) {
        // Sample profile
        db.prepare(`INSERT INTO profile (name, title, bio, email, phone, location) VALUES (?, ?, ?, ?, ?, ?)`).run(
            'Your Name',
            'Full-Stack Developer | UI/UX Designer',
            'Passionate developer with expertise in creating beautiful and functional web applications.',
            'your.email@example.com',
            '+90 555 123 4567',
            'Istanbul, Turkey'
        );

        // Sample skills
        const skillsData = [
            ['HTML/CSS', 'Frontend', 95],
            ['JavaScript', 'Frontend', 90],
            ['React', 'Frontend', 85],
            ['Node.js', 'Backend', 80],
            ['Express', 'Backend', 85],
            ['SQL', 'Backend', 75],
            ['Git', 'Tools', 90],
            ['Problem Solving', 'Soft Skills', 95]
        ];
        const insertSkill = db.prepare('INSERT INTO skills (name, category, proficiency) VALUES (?, ?, ?)');
        skillsData.forEach(skill => insertSkill.run(...skill));

        // Sample experience
        db.prepare(`INSERT INTO experience (company, position, start_date, end_date, current, description, achievements) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
            'Tech Company',
            'Senior Developer',
            '2022-01',
            null,
            1,
            'Leading development of web applications',
            JSON.stringify(['Improved performance by 40%', 'Led team of 5 developers', 'Implemented CI/CD pipeline'])
        );

        // Sample project
        db.prepare(`INSERT INTO projects (title, description, technologies, featured) VALUES (?, ?, ?, ?)`).run(
            'E-Commerce Platform',
            'Full-featured online shopping platform with payment integration',
            JSON.stringify(['React', 'Node.js', 'MongoDB', 'Stripe']),
            1
        );

        // Sample settings
        const settingsData = [
            ['linkedin_url', 'https://linkedin.com/in/yourprofile'],
            ['github_url', 'https://github.com/yourusername'],
            ['twitter_url', 'https://twitter.com/yourhandle'],
            ['theme_color', '#6366f1']
        ];
        const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
        settingsData.forEach(setting => insertSetting.run(...setting));

        console.log('✓ Sample data created');
    }
}

// Export database functions
module.exports = {
    db,
    initializeDatabase,

    // Profile
    getProfile: () => {
        const profile = db.prepare('SELECT * FROM profile LIMIT 1').get();
        if (profile) {
            // Decrypt sensitive fields
            profile.email = decrypt(profile.email);
            profile.phone = decrypt(profile.phone);
        }
        return profile;
    },
    updateProfile: (data) => {
        // Encrypt sensitive fields before saving
        const encryptedEmail = encrypt(data.email);
        const encryptedPhone = encrypt(data.phone);

        const stmt = db.prepare(`
            UPDATE profile SET 
            name = ?, title = ?, bio = ?, email = ?, phone = ?, location = ?, profile_image = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT MIN(id) FROM profile)
        `);
        return stmt.run(data.name, data.title, data.bio, encryptedEmail, encryptedPhone, data.location, data.profile_image);
    },

    // Skills
    getAllSkills: () => db.prepare('SELECT * FROM skills ORDER BY sort_order, category, name').all(),
    getSkill: (id) => db.prepare('SELECT * FROM skills WHERE id = ?').get(id),
    createSkill: (data) => db.prepare('INSERT INTO skills (name, category, proficiency, icon) VALUES (?, ?, ?, ?)').run(data.name, data.category, data.proficiency, data.icon),
    updateSkill: (id, data) => db.prepare('UPDATE skills SET name = ?, category = ?, proficiency = ?, icon = ? WHERE id = ?').run(data.name, data.category, data.proficiency, data.icon, id),
    deleteSkill: (id) => db.prepare('DELETE FROM skills WHERE id = ?').run(id),

    // Experience
    getAllExperience: () => db.prepare('SELECT * FROM experience ORDER BY current DESC, start_date DESC').all(),
    getExperience: (id) => db.prepare('SELECT * FROM experience WHERE id = ?').get(id),
    createExperience: (data) => db.prepare('INSERT INTO experience (company, position, start_date, end_date, current, description, achievements, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(data.company, data.position, data.start_date, data.end_date, data.current, data.description, data.achievements, data.logo),
    updateExperience: (id, data) => db.prepare('UPDATE experience SET company = ?, position = ?, start_date = ?, end_date = ?, current = ?, description = ?, achievements = ?, logo = ? WHERE id = ?').run(data.company, data.position, data.start_date, data.end_date, data.current, data.description, data.achievements, data.logo, id),
    deleteExperience: (id) => db.prepare('DELETE FROM experience WHERE id = ?').run(id),

    // Education
    getAllEducation: () => db.prepare('SELECT * FROM education ORDER BY start_date DESC').all(),
    getEducation: (id) => db.prepare('SELECT * FROM education WHERE id = ?').get(id),
    createEducation: (data) => db.prepare('INSERT INTO education (institution, degree, field, start_date, end_date, description, logo) VALUES (?, ?, ?, ?, ?, ?, ?)').run(data.institution, data.degree, data.field, data.start_date, data.end_date, data.description, data.logo),
    updateEducation: (id, data) => db.prepare('UPDATE education SET institution = ?, degree = ?, field = ?, start_date = ?, end_date = ?, description = ?, logo = ? WHERE id = ?').run(data.institution, data.degree, data.field, data.start_date, data.end_date, data.description, data.logo, id),
    deleteEducation: (id) => db.prepare('DELETE FROM education WHERE id = ?').run(id),

    // Projects
    getAllProjects: () => db.prepare('SELECT * FROM projects ORDER BY featured DESC, sort_order').all(),
    getProject: (id) => db.prepare('SELECT * FROM projects WHERE id = ?').get(id),
    createProject: (data) => db.prepare('INSERT INTO projects (title, description, image, technologies, live_url, github_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(data.title, data.description, data.image, data.technologies, data.live_url, data.github_url, data.featured),
    updateProject: (id, data) => db.prepare('UPDATE projects SET title = ?, description = ?, image = ?, technologies = ?, live_url = ?, github_url = ?, featured = ? WHERE id = ?').run(data.title, data.description, data.image, data.technologies, data.live_url, data.github_url, data.featured, id),
    deleteProject: (id) => db.prepare('DELETE FROM projects WHERE id = ?').run(id),

    // Achievements
    getAllAchievements: () => db.prepare('SELECT * FROM achievements ORDER BY date DESC').all(),
    getAchievement: (id) => db.prepare('SELECT * FROM achievements WHERE id = ?').get(id),
    createAchievement: (data) => db.prepare('INSERT INTO achievements (title, description, date, icon) VALUES (?, ?, ?, ?)').run(data.title, data.description, data.date, data.icon),
    updateAchievement: (id, data) => db.prepare('UPDATE achievements SET title = ?, description = ?, date = ?, icon = ? WHERE id = ?').run(data.title, data.description, data.date, data.icon, id),
    deleteAchievement: (id) => db.prepare('DELETE FROM achievements WHERE id = ?').run(id),

    // Testimonials
    getAllTestimonials: () => db.prepare('SELECT * FROM testimonials ORDER BY sort_order').all(),
    getTestimonial: (id) => db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id),
    createTestimonial: (data) => db.prepare('INSERT INTO testimonials (name, position, company, quote, photo) VALUES (?, ?, ?, ?, ?)').run(data.name, data.position, data.company, data.quote, data.photo),
    updateTestimonial: (id, data) => db.prepare('UPDATE testimonials SET name = ?, position = ?, company = ?, quote = ?, photo = ? WHERE id = ?').run(data.name, data.position, data.company, data.quote, data.photo, id),
    deleteTestimonial: (id) => db.prepare('DELETE FROM testimonials WHERE id = ?').run(id),

    // Settings
    getAllSettings: () => {
        const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        if (!row) {
            // Initialize if empty
            db.prepare('INSERT INTO settings (id) VALUES (1)').run();
            return {};
        }
        // Remove id from returned object
        const { id, ...settings } = row;
        return settings;
    },
    updateSettings: (data) => {
        const fields = [];
        const values = [];

        Object.keys(data).forEach(key => {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) return;

        const query = `UPDATE settings SET ${fields.join(', ')} WHERE id = 1`;
        db.prepare(query).run(...values);
    },

    // Stats
    getProjectCount: () => db.prepare('SELECT COUNT(*) as count FROM projects').get().count,
    getAchievementCount: () => db.prepare('SELECT COUNT(*) as count FROM achievements').get().count,

    // Authentication
    findUserByUsername: (username) => db.prepare('SELECT * FROM users WHERE username = ?').get(username),
    findUserByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
    verifyPassword: (password, hash) => bcrypt.compareSync(password, hash),

    // User Account Management
    updateUser: (id, data) => {
        const stmt = db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?');
        return stmt.run(data.username, data.email, id);
    },
    updateUserPassword: (id, password) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        return stmt.run(hashedPassword, id);
    },
    getUserById: (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id)
};
