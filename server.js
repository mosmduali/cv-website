require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
db.initializeDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = db.findUserByUsername(username) || db.findUserByEmail(username);

    if (user && db.verifyPassword(password, user.password)) {
        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ success: true, username: user.username });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check auth status
app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// ==================== PROFILE ROUTES ====================

app.get('/api/profile', (req, res) => {
    try {
        const profile = db.getProfile();
        res.json(profile || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/profile', requireAuth, upload.single('profile_image'), (req, res) => {
    try {
        const data = {
            ...req.body,
            profile_image: req.file ? `/uploads/${req.file.filename}` : req.body.profile_image
        };
        db.updateProfile(data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/profile/image', requireAuth, (req, res) => {
    try {
        const profile = db.getProfile();
        if (profile && profile.photo) {
            // Delete file from uploads folder
            const fs = require('fs');
            const filePath = path.join(__dirname, 'public', profile.photo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Clear photo field in database  
            db.updateProfile({ ...profile, photo: null });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SKILLS ROUTES ====================

app.get('/api/skills', (req, res) => {
    try {
        const skills = db.getAllSkills();
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/skills/:id', requireAuth, (req, res) => {
    try {
        const skill = db.getSkill(req.params.id);
        if (skill) {
            res.json(skill);
        } else {
            res.status(404).json({ error: 'Skill not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/skills', requireAuth, (req, res) => {
    try {
        const result = db.createSkill(req.body);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/skills/:id', requireAuth, (req, res) => {
    try {
        db.updateSkill(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/skills/:id', requireAuth, (req, res) => {
    try {
        db.deleteSkill(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EXPERIENCE ROUTES ====================

app.get('/api/experience', (req, res) => {
    try {
        const experience = db.getAllExperience();
        res.json(experience);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/experience/:id', requireAuth, (req, res) => {
    try {
        const experience = db.getExperience(req.params.id);
        if (experience) {
            res.json(experience);
        } else {
            res.status(404).json({ error: 'Experience not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/experience', requireAuth, upload.single('logo'), (req, res) => {
    try {
        const data = {
            ...req.body,
            logo: req.file ? `/uploads/${req.file.filename}` : req.body.logo,
            current: req.body.current === 'true' || req.body.current === true ? 1 : 0
        };
        const result = db.createExperience(data);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/experience/:id', requireAuth, upload.single('logo'), (req, res) => {
    try {
        const data = {
            ...req.body,
            logo: req.file ? `/uploads/${req.file.filename}` : req.body.logo,
            current: req.body.current === 'true' || req.body.current === true ? 1 : 0
        };
        db.updateExperience(req.params.id, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/experience/:id', requireAuth, (req, res) => {
    try {
        db.deleteExperience(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EDUCATION ROUTES ====================

app.get('/api/education', (req, res) => {
    try {
        const education = db.getAllEducation();
        res.json(education);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/education/:id', requireAuth, (req, res) => {
    try {
        const education = db.getEducation(req.params.id);
        if (education) {
            res.json(education);
        } else {
            res.status(404).json({ error: 'Education not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/education', requireAuth, upload.single('logo'), (req, res) => {
    try {
        const data = {
            ...req.body,
            logo: req.file ? `/uploads/${req.file.filename}` : req.body.logo
        };
        const result = db.createEducation(data);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/education/:id', requireAuth, upload.single('logo'), (req, res) => {
    try {
        const data = {
            ...req.body,
            logo: req.file ? `/uploads/${req.file.filename}` : req.body.logo
        };
        db.updateEducation(req.params.id, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/education/:id', requireAuth, (req, res) => {
    try {
        db.deleteEducation(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PROJECTS ROUTES ====================

app.get('/api/projects', (req, res) => {
    try {
        const projects = db.getAllProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects/:id', requireAuth, (req, res) => {
    try {
        const project = db.getProject(req.params.id);
        if (project) {
            res.json(project);
        } else {
            res.status(404).json({ error: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/projects', requireAuth, upload.single('image'), (req, res) => {
    try {
        const data = {
            ...req.body,
            image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
            featured: req.body.featured === 'true' || req.body.featured === true ? 1 : 0
        };
        const result = db.createProject(data);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/projects/:id', requireAuth, upload.single('image'), (req, res) => {
    try {
        const data = {
            ...req.body,
            image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
            featured: req.body.featured === 'true' || req.body.featured === true ? 1 : 0
        };
        db.updateProject(req.params.id, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/projects/:id', requireAuth, (req, res) => {
    try {
        db.deleteProject(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ACHIEVEMENTS ROUTES ====================

app.get('/api/achievements', (req, res) => {
    try {
        const achievements = db.getAllAchievements();
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/achievements/:id', requireAuth, (req, res) => {
    try {
        const achievement = db.getAchievement(req.params.id);
        if (achievement) {
            res.json(achievement);
        } else {
            res.status(404).json({ error: 'Achievement not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/achievements', requireAuth, (req, res) => {
    try {
        const result = db.createAchievement(req.body);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/achievements/:id', requireAuth, (req, res) => {
    try {
        db.updateAchievement(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/achievements/:id', requireAuth, (req, res) => {
    try {
        db.deleteAchievement(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TESTIMONIALS ROUTES ====================

app.get('/api/testimonials', (req, res) => {
    try {
        const testimonials = db.getAllTestimonials();
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/testimonials/:id', requireAuth, (req, res) => {
    try {
        const testimonial = db.getTestimonial(req.params.id);
        if (testimonial) {
            res.json(testimonial);
        } else {
            res.status(404).json({ error: 'Testimonial not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/testimonials', requireAuth, upload.single('photo'), (req, res) => {
    try {
        const data = {
            ...req.body,
            photo: req.file ? `/uploads/${req.file.filename}` : req.body.photo
        };
        const result = db.createTestimonial(data);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/testimonials/:id', requireAuth, upload.single('photo'), (req, res) => {
    try {
        const data = {
            ...req.body,
            photo: req.file ? `/uploads/${req.file.filename}` : req.body.photo
        };
        db.updateTestimonial(req.params.id, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/testimonials/:id', requireAuth, (req, res) => {
    try {
        db.deleteTestimonial(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== GITHUB ROUTES ====================

app.get('/api/github/repos/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, {
            headers: {
                'User-Agent': 'CV-Website-App',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'GitHub API error' });
        }

        const repos = await response.json();

        // Filter and format repos with images
        const formattedRepos = await Promise.all(
            repos
                .filter(repo => !repo.fork && !repo.archived)
                .map(async (repo) => {
                    let imageUrl = '';

                    try {
                        // Try to get repository social preview image (Open Graph image)
                        const repoResponse = await fetch(repo.url, {
                            headers: {
                                'User-Agent': 'CV-Website-App',
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });

                        if (repoResponse.ok) {
                            const repoData = await repoResponse.json();
                            // GitHub provides social preview URL in the repository data
                            // We'll use the owner's avatar as fallback since social preview isn't directly available via API
                            imageUrl = repo.owner?.avatar_url || '';
                        }
                    } catch (error) {
                        console.error(`Error fetching image for ${repo.name}:`, error);
                        // Fallback to owner avatar
                        imageUrl = repo.owner?.avatar_url || '';
                    }

                    return {
                        title: repo.name,
                        description: repo.description || '',
                        image: imageUrl,
                        technologies: JSON.stringify(repo.topics || []),
                        github_url: repo.html_url,
                        live_url: repo.homepage || '',
                        featured: 0,
                        source: 'github'
                    };
                })
        );

        res.json(formattedRepos);
    } catch (error) {
        console.error('GitHub API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== SETTINGS ROUTES ====================


app.get('/api/settings', (req, res) => {
    try {
        const settings = db.getAllSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/settings', requireAuth, (req, res) => {
    try {
        db.updateSettings(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== USER ACCOUNT MANAGEMENT ====================

// Update username and email
app.put('/api/user/account', requireAuth, (req, res) => {
    try {
        const { username, email, currentPassword } = req.body;
        const userId = req.session.userId;

        // Get current user
        const user = db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        if (!db.verifyPassword(currentPassword, user.password)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Check if new username is already taken (by another user)
        if (username !== user.username) {
            const existingUser = db.findUserByUsername(username);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        // Update user
        db.updateUser(userId, { username, email });

        // Update session
        req.session.username = username;

        res.json({ success: true, message: 'Account updated successfully' });
    } catch (error) {
        console.error('Account update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update password
app.put('/api/user/password', requireAuth, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        // Validate new password
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        // Get current user
        const user = db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        if (!db.verifyPassword(currentPassword, user.password)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        db.updateUserPassword(userId, newPassword);

        // Destroy session to force re-login
        req.session.destroy();

        res.json({ success: true, message: 'Password updated successfully. Please login again.' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== STATS ROUTES ====================

app.get('/api/stats', (req, res) => {
    try {
        const settings = db.getAllSettings();
        const stats = {
            projectCount: db.getProjectCount(),
            achievementCount: db.getAchievementCount(),
            experienceYears: settings.experience_years || '5'
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 CV Website Server Running            ║
╠════════════════════════════════════════════╣
║   📍 Main Site: http://localhost:${PORT}     
║   🔧 Admin Panel: http://localhost:${PORT}/admin.html
║   👤 Default Login:                        ║
║      Username: admin                       ║
║      Password: admin123                    ║
╚════════════════════════════════════════════╝
    `);
});
