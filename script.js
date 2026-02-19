// ========== STATE ==========
let profile = {};
let settings = {};

// ========== THEME TOGGLE ==========
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-theme');
}

themeToggle?.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const theme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);

    // Immediately update navbar background
    const currentScroll = window.pageYOffset;
    const isLight = theme === 'light';

    if (currentScroll > 100) {
        navbar.style.background = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.background = isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)';
    }
});

// ========== MOBILE MENU ==========
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Only apply smooth scroll if href still starts with # (internal link)
        if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const isLight = body.classList.contains('light-theme');

    if (currentScroll > 100) {
        navbar.style.background = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ========== SCROLL TO TOP BUTTON ==========
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========== TYPEWRITER EFFECT ==========
const typedTextElement = document.getElementById('typedText');
const texts = ['Full-Stack Developer', 'UI/UX Designer', 'Problem Solver', 'Creative Thinker'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentText = texts[textIndex];

    if (!isDeleting && charIndex < currentText.length) {
        typedTextElement.textContent += currentText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 100);
    } else if (isDeleting && charIndex > 0) {
        typedTextElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(typeWriter, 50);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            textIndex = (textIndex + 1) % texts.length;
        }
        setTimeout(typeWriter, isDeleting ? 500 : 2000);
    }
}

setTimeout(typeWriter, 1000);

// ========== INTERSECTION OBSERVER ==========
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate skill bars
            if (entry.target.classList.contains('skill-item')) {
                const progressBar = entry.target.querySelector('.skill-progress');
                const percentage = entry.target.dataset.percentage;
                if (progressBar && percentage) {
                    setTimeout(() => {
                        progressBar.style.width = percentage + '%';
                    }, 200);
                }
            }
        }
    });
}, observerOptions);

// ========== API CALLS ==========

async function fetchProfile() {
    try {
        const response = await fetch('/api/profile');
        profile = await response.json();
        updateProfileUI();
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

async function fetchSettings() {
    try {
        const response = await fetch('/api/settings');
        settings = await response.json();
        updateSettingsUI();
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
}

async function fetchSkills() {
    try {
        const response = await fetch('/api/skills');
        const skills = await response.json();
        renderSkills(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
    }
}

async function fetchExperience() {
    try {
        const response = await fetch('/api/experience');
        const experience = await response.json();
        renderExperience(experience);
    } catch (error) {
        console.error('Error fetching experience:', error);
    }
}

async function fetchEducation() {
    try {
        const response = await fetch('/api/education');
        const education = await response.json();
        renderEducation(education);
    } catch (error) {
        console.error('Error fetching education:', error);
    }
}

async function fetchProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

async function fetchAchievements() {
    try {
        const response = await fetch('/api/achievements');
        const achievements = await response.json();
        renderAchievements(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
    }
}

async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        updateStatsUI(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// ========== UI UPDATE FUNCTIONS ==========

function updateProfileUI() {
    if (!profile) return;

    document.getElementById('profileName').textContent = profile.name || 'Your Name';
    document.getElementById('heroBio').textContent = profile.bio || '';
    document.getElementById('aboutBio').textContent = profile.bio || '';
    document.getElementById('contactEmail').textContent = profile.email || '';
    document.getElementById('contactPhone').textContent = profile.phone || '';
    document.getElementById('contactLocation').textContent = profile.location || '';
    document.getElementById('footerName').textContent = profile.name || 'Your Name';

    if (profile.profile_image) {
        document.getElementById('profileImage').src = profile.profile_image;
    }

    if (profile.title) {
        const titles = profile.title.split('|').map(t => t.trim());
        if (titles.length > 0) {
            texts.length = 0;
            texts.push(...titles);
        }
    }
}

function updateSettingsUI() {
    if (!settings) return;

    // Update site title
    if (settings.site_title) {
        document.title = settings.site_title;
    }

    // Update site logo
    if (settings.site_logo) {
        const logoEl = document.querySelector('.logo');
        if (logoEl) {
            logoEl.textContent = settings.site_logo;
        }
    }

    // Helper to update or hide links
    const updateLink = (selector, url) => {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
            if (url && url.trim() !== '') {
                link.href = url;
                link.style.display = '';
                link.removeAttribute('onclick'); // Remove any inline click handler
                // Remove event listener if exists
                link.onclick = null;
            } else {
                link.href = '#';
                link.style.display = 'none';
            }
        });
    };

    updateLink('#linkedinLink', settings.linkedin_url);
    updateLink('#githubLink', settings.github_url);
    updateLink('#twitterLink', settings.twitter_url);
    updateLink('#youtubeLink', settings.youtube_url);
    updateLink('#instagramLink', settings.instagram_url);

    if (settings.theme_color) {
        document.documentElement.style.setProperty('--primary', settings.theme_color);
    }
}

function updateStatsUI(stats) {
    if (!stats) return;

    const experienceYearsEl = document.getElementById('experienceYears');
    const projectCountEl = document.getElementById('projectCount');
    const achievementCountEl = document.getElementById('achievementCount');

    if (experienceYearsEl) {
        experienceYearsEl.textContent = `${stats.experienceYears}+`;
    }

    if (projectCountEl) {
        projectCountEl.textContent = `${stats.projectCount}+`;
    }

    if (achievementCountEl) {
        achievementCountEl.textContent = `${stats.achievementCount}+`;
    }
}

function renderSkills(skills) {
    const skillsGrid = document.getElementById('skillsGrid');
    skillsGrid.innerHTML = '';

    // Group by category
    const grouped = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {});

    Object.keys(grouped).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'skill-category';

        categoryDiv.innerHTML = `
            <h3 class="skill-category-title">${category}</h3>
            <div class="skill-items">
                ${grouped[category].map(skill => `
                    <div class="skill-item" data-percentage="${skill.proficiency}">
                        <div class="skill-header">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-percentage">${skill.proficiency}%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        skillsGrid.appendChild(categoryDiv);
    });

    // Observe skill items
    document.querySelectorAll('.skill-item').forEach(item => observer.observe(item));
}

function renderExperience(experience) {
    const timeline = document.getElementById('experienceTimeline');
    timeline.innerHTML = '';

    experience.forEach(exp => {
        const achievements = exp.achievements ? JSON.parse(exp.achievements) : [];
        const endDate = exp.current ? 'Halen' : exp.end_date || '';

        const item = document.createElement('div');
        item.className = 'timeline-item';

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <h3 class="timeline-position">${exp.position}</h3>
                    <div class="timeline-company">${exp.company}</div>
                    <div class="timeline-date">${exp.start_date} - ${endDate}</div>
                </div>
                ${exp.description ? `<p class="timeline-description">${exp.description}</p>` : ''}
                ${achievements.length > 0 ? `
                    <ul class="timeline-achievements">
                        ${achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;

        timeline.appendChild(item);
        observer.observe(item);
    });
}

function renderEducation(education) {
    const timeline = document.getElementById('educationTimeline');
    timeline.innerHTML = '';

    education.forEach(edu => {
        const endDate = edu.end_date || 'Halen';

        const item = document.createElement('div');
        item.className = 'timeline-item';

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <h3 class="timeline-position">${edu.degree}</h3>
                    <div class="timeline-company">${edu.institution}</div>
                    <div class="timeline-date">${edu.start_date} - ${endDate}</div>
                </div>
                ${edu.field ? `<p class="timeline-description">Alan: ${edu.field}</p>` : ''}
                ${edu.description ? `<p class="timeline-description">${edu.description}</p>` : ''}
            </div>
        `;

        timeline.appendChild(item);
        observer.observe(item);
    });
}

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    projects.forEach((project, index) => {
        const technologies = project.technologies ? JSON.parse(project.technologies) : [];

        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.transitionDelay = `${index * 100}ms`;

        card.innerHTML = `
            ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-image">` : '<div class="project-image"></div>'}
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                ${technologies.length > 0 ? `
                    <div class="project-technologies">
                        ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-links">
                    ${project.live_url ? `
                        <a href="${project.live_url}" target="_blank" rel="noopener" class="project-link" onclick="event.stopPropagation()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Demo
                        </a>
                    ` : ''}
                    ${project.github_url ? `
                        <a href="${project.github_url}" target="_blank" rel="noopener" class="project-link" onclick="event.stopPropagation()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        card.addEventListener('click', () => showProjectModal(project));
        grid.appendChild(card);
        observer.observe(card);
    });
}

function renderAchievements(achievements) {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';

    achievements.forEach((achievement, index) => {
        const card = document.createElement('div');
        card.className = 'achievement-card';
        card.style.transitionDelay = `${index * 100}ms`;

        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon || '🏆'}</div>
            <h3 class="achievement-title">${achievement.title}</h3>
            ${achievement.description ? `<p class="achievement-description">${achievement.description}</p>` : ''}
            ${achievement.date ? `<div class="achievement-date">${achievement.date}</div>` : ''}
        `;

        grid.appendChild(card);
        observer.observe(card);
    });
}

// ========== PROJECT MODAL ==========

function showProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const technologies = project.technologies ? JSON.parse(project.technologies) : [];

    modalBody.innerHTML = `
        ${project.image ? `<img src="${project.image}" alt="${project.title}" style="width: 100%; border-radius: 1rem; margin-bottom: 1.5rem;">` : ''}
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">${project.title}</h2>
        ${project.description ? `<p style="color: var(--text-secondary); font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.5rem;">${project.description}</p>` : ''}
        ${technologies.length > 0 ? `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.75rem;">Teknolojiler:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            ${project.live_url ? `
                <a href="${project.live_url}" target="_blank" rel="noopener" class="btn btn-primary">
                    <span>Demo'yu Görüntüle</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            ` : ''}
            ${project.github_url ? `
                <a href="${project.github_url}" target="_blank" rel="noopener" class="btn btn-secondary">
                    <span>GitHub'da Görüntüle</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
}

document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('projectModal').classList.remove('active');
});

document.getElementById('projectModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        e.target.classList.remove('active');
    }
});

// ========== CONTACT FORM ==========

document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    // In a real application, you would send this to your backend
    alert('Mesajınız için teşekkürler! En kısa sürede geri dönüş yapacağım.');
    e.target.reset();
});

// ========== INIT ==========

async function init() {
    await Promise.all([
        fetchProfile(),
        fetchSettings(),
        fetchSkills(),
        fetchExperience(),
        fetchEducation(),
        fetchProjects(),
        fetchAchievements(),
        fetchStats()
    ]);
}

// Load data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
