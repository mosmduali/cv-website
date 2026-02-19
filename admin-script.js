// ========== STATE ==========
let currentUser = null;
let currentSection = 'profile';

// ========== AUTH ==========

async function login(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.username;
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'flex';
            loadAllData();
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (data.authenticated) {
            currentUser = data.username;
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'flex';
            loadAllData();
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// ========== EVENT LISTENERS ==========

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    const success = await login(username, password);
    if (!success) {
        errorEl.textContent = 'Geçersiz kullanıcı adı veya şifre';
        errorEl.classList.add('show');
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        switchSection(section);
    });
});

function switchSection(section) {
    currentSection = section;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`section-${section}`).classList.add('active');

    // Update title
    const titles = {
        profile: 'Profil Yönetimi',
        skills: 'Beceri Yönetimi',
        experience: 'Deneyim Yönetimi',
        education: 'Eğitim Yönetimi',
        projects: 'Proje Yönetimi',
        achievements: 'Başarı Yönetimi',
        settings: 'Site Ayarları'
    };
    document.getElementById('sectionTitle').textContent = titles[section] || section;
}

// ========== NOTIFICATIONS ==========

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠'
    };

    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.success}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 300ms ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== MODAL ==========

function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
});

// ========== PROFILE ==========

async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        const profile = await response.json();

        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileTitle').value = profile.title || '';
        document.getElementById('profileBio').value = profile.bio || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileLocation').value = profile.location || '';

        if (profile.profile_image) {
            const preview = document.getElementById('profileImagePreview');
            const deleteBtn = document.getElementById('deleteProfileImage');
            preview.innerHTML = `<img src="${profile.profile_image}" alt="Preview">`;
            preview.classList.add('show');
            deleteBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            showNotification('Profil başarıyla güncellendi!');
        } else {
            showNotification('Profil güncellenirken hata oluştu', 'error');
        }
    } catch (error) {
        showNotification('Bir hata oluştu', 'error');
    }
});

document.getElementById('profileImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('profileImagePreview');
            const deleteBtn = document.getElementById('deleteProfileImage');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('show');
            deleteBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Delete profile image handler
document.getElementById('deleteProfileImage')?.addEventListener('click', async () => {
    if (!confirm('Profil resmini silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch('/api/profile/image', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const preview = document.getElementById('profileImagePreview');
            const deleteBtn = document.getElementById('deleteProfileImage');
            preview.innerHTML = '';
            preview.classList.remove('show');
            deleteBtn.style.display = 'none';
            document.getElementById('profileImage').value = '';
            showNotification('Profil resmi silindi', 'success');
        }
    } catch (error) {
        showNotification('Resim silinirken hata oluştu', 'error');
    }
});

// ========== SKILLS ==========

async function loadSkills() {
    try {
        const response = await fetch('/api/skills');
        const skills = await response.json();
        renderSkillsTable(skills);
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

function renderSkillsTable(skills) {
    const tbody = document.querySelector('#skillsTable tbody');
    tbody.innerHTML = '';

    skills.forEach(skill => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${skill.name}</td>
            <td><span class="badge badge-primary">${skill.category}</span></td>
            <td>${skill.proficiency}%</td>
            <td class="table-actions">
                <button class="btn btn-small btn-secondary" onclick="editSkill(${skill.id})">Düzenle</button>
                <button class="btn btn-small btn-danger" onclick="deleteSkill(${skill.id})">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('addSkillBtn')?.addEventListener('click', () => {
    showModal('Yeni Beceri Ekle', `
        <form id="skillForm">
            <div class="form-group">
                <label>Beceri Adı</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Kategori</label>
                <select name="category" required>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Tools">Tools</option>
                    <option value="Soft Skills">Soft Skills</option>
                </select>
            </div>
            <div class="form-group">
                <label>Seviye (%)</label>
                <input type="number" name="proficiency" min="0" max="100" required>
            </div>
            <button type="submit" class="btn btn-primary">Kaydet</button>
        </form>
    `);

    document.getElementById('skillForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification('Beceri eklendi!');
                closeModal();
                loadSkills();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    });
});

window.editSkill = async (id) => {
    console.log('editSkill called with id:', id);
    try {
        const response = await fetch(`/api/skills/${id}`);
        console.log('Fetch response:', response.status);

        if (!response.ok) {
            showNotification('Beceri yüklenirken hata oluştu', 'error');
            return;
        }

        const skill = await response.json();
        console.log('Skill data:', skill);

        showModal('Beceriyi Düzenle', `
            <form id="skillEditForm">
                <div class="form-group">
                    <label>Beceri Adı</label>
                    <input type="text" name="name" value="${skill.name}" required>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <select name="category" required>
                        <option value="Frontend" ${skill.category === 'Frontend' ? 'selected' : ''}>Frontend</option>
                        <option value="Backend" ${skill.category === 'Backend' ? 'selected' : ''}>Backend</option>
                        <option value="Tools" ${skill.category === 'Tools' ? 'selected' : ''}>Tools</option>
                        <option value="Soft Skills" ${skill.category === 'Soft Skills' ? 'selected' : ''}>Soft Skills</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Seviye (%)</label>
                    <input type="number" name="proficiency" value="${skill.proficiency}" min="0" max="100" required>
                </div>
                <button type="submit" class="btn btn-primary">Güncelle</button>
            </form>
        `);

        document.getElementById('skillEditForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch(`/api/skills/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showNotification('Beceri güncellendi!');
                    closeModal();
                    loadSkills();
                } else {
                    showNotification('Güncelleme başarısız', 'error');
                }
            } catch (error) {
                console.error('Update error:', error);
                showNotification('Bir hata oluştu', 'error');
            }
        });
    } catch (error) {
        console.error('Error editing skill:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
};

window.deleteSkill = async (id) => {
    if (confirm('Bu beceriyi silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Beceri silindi!');
                loadSkills();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    }
};

// ========== EXPERIENCE ==========

async function loadExperience() {
    try {
        const response = await fetch('/api/experience');
        const experiences = await response.json();
        renderExperienceGrid(experiences);
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

function renderExperienceGrid(experiences) {
    const grid = document.getElementById('experienceGrid');
    grid.innerHTML = '';

    experiences.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const achievements = exp.achievements ? JSON.parse(exp.achievements) : [];
        const endDate = exp.current ? 'Halen' : exp.end_date || '';

        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <h4>${exp.position}</h4>
                    <div class="meta">${exp.company} • ${exp.start_date} - ${endDate}</div>
                </div>
                ${exp.current ? '<span class="badge badge-success">Mevcut</span>' : ''}
            </div>
            ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
            ${achievements.length > 0 ? `<div class="description">${achievements.length} başarı</div>` : ''}
            <div class="item-card-actions">
                <button class="btn btn-small btn-secondary" onclick="editExperience(${exp.id})">Düzenle</button>
                <button class="btn btn-small btn-danger" onclick="deleteExperience(${exp.id})">Sil</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

document.getElementById('addExperienceBtn')?.addEventListener('click', () => {
    showExperienceModal();
});

function showExperienceModal(experience = null) {
    const isEdit = experience !== null;
    const title = isEdit ? 'Deneyimi Düzenle' : 'Yeni Deneyim Ekle';

    showModal(title, `
        <form id="experienceForm">
            <div class="form-group">
                <label>Şirket</label>
                <input type="text" name="company" value="${experience?.company || ''}" required>
            </div>
            <div class="form-group">
                <label>Pozisyon</label>
                <input type="text" name="position" value="${experience?.position || ''}" required>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Başlangıç Tarihi</label>
                    <input type="text" name="start_date" value="${experience?.start_date || ''}" placeholder="2022-01" required>
                </div>
                <div class="form-group">
                    <label>Bitiş Tarihi</label>
                    <input type="text" name="end_date" value="${experience?.end_date || ''}" placeholder="2023-12">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="current" ${experience?.current ? 'checked' : ''}>
                    Halen burada çalışıyorum
                </label>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea name="description" rows="3">${experience?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Başarılar (her satır bir başarı)</label>
                <textarea name="achievements" rows="5" placeholder="Performansı %40 artırdım&#10;5 kişilik bir ekibe liderlik ettim">${experience?.achievements ? JSON.parse(experience.achievements).join('\n') : ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
        </form>
    `);

    document.getElementById('experienceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Convert achievements to JSON
        if (data.achievements) {
            const achievements = data.achievements.split('\n').filter(a => a.trim());
            data.achievements = JSON.stringify(achievements);
        }

        data.current = formData.has('current') ? 1 : 0;

        try {
            const url = isEdit ? `/api/experience/${experience.id}` : '/api/experience';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification(isEdit ? 'Deneyim güncellendi!' : 'Deneyim eklendi!');
                closeModal();
                loadExperience();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    });
}

window.editExperience = async (id) => {
    console.log('editExperience called with id:', id);
    try {
        const response = await fetch(`/api/experience/${id}`);
        console.log('Fetch response:', response.status);

        if (!response.ok) {
            showNotification('Deneyim yüklenirken hata oluştu', 'error');
            return;
        }

        const experience = await response.json();
        console.log('Experience data:', experience);
        showExperienceModal(experience);
    } catch (error) {
        console.error('Error editing experience:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
};

window.deleteExperience = async (id) => {
    if (confirm('Bu deneyimi silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Deneyim silindi!');
                loadExperience();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    }
};

// ========== EDUCATION, PROJECTS, ACHIEVEMENTS (Similar patterns) ==========

// For brevity, I'll create simplified versions. You can expand these following the same pattern as Experience

// ========== EDUCATION ==========

async function loadEducation() {
    try {
        const response = await fetch('/api/education');
        const education = await response.json();
        renderEducationGrid(education);
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

function renderEducationGrid(education) {
    const grid = document.getElementById('educationGrid');
    grid.innerHTML = '';

    education.forEach(edu => {
        const card = document.createElement('div');
        card.className = 'item-card';

        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <h4>${edu.degree} - ${edu.institution}</h4>
                    <div class="meta">${edu.start_date} - ${edu.end_date || 'Halen'}</div>
                </div>
            </div>
            ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
            ${edu.field ? `<div class="meta">Alan: ${edu.field}</div>` : ''}
            <div class="item-card-actions">
                <button class="btn btn-small btn-secondary" onclick="editEducation(${edu.id})">Düzenle</button>
                <button class="btn btn-small btn-danger" onclick="deleteEducation(${edu.id})">Sil</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

document.getElementById('addEducationBtn')?.addEventListener('click', () => {
    showEducationModal();
});

function showEducationModal(education = null) {
    const isEdit = education !== null;
    const title = isEdit ? 'Eğitimi Düzenle' : 'Yeni Eğitim Ekle';

    showModal(title, `
        <form id="educationForm">
            <div class="form-group">
                <label>Kurum</label>
                <input type="text" name="institution" value="${education?.institution || ''}" required>
            </div>
            <div class="form-group">
                <label>Derece/Diploma</label>
                <input type="text" name="degree" value="${education?.degree || ''}" required>
            </div>
            <div class="form-group">
                <label>Alan</label>
                <input type="text" name="field" value="${education?.field || ''}">
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Başlangıç Tarihi</label>
                    <input type="text" name="start_date" value="${education?.start_date || ''}" placeholder="2018-09" required>
                </div>
                <div class="form-group">
                    <label>Bitiş Tarihi</label>
                    <input type="text" name="end_date" value="${education?.end_date || ''}" placeholder="2022-06">
                </div>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea name="description" rows="3">${education?.description || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
        </form>
    `);

    document.getElementById('educationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const url = isEdit ? `/api/education/${education.id}` : '/api/education';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification(isEdit ? 'Eğitim güncellendi!' : 'Eğitim eklendi!');
                closeModal();
                loadEducation();
            } else {
                showNotification('İşlem başarısız', 'error');
            }
        } catch (error) {
            console.error('Education save error:', error);
            showNotification('Bir hata oluştu', 'error');
        }
    });
}

window.editEducation = async (id) => {
    console.log('editEducation called with id:', id);
    try {
        const response = await fetch(`/api/education/${id}`);
        if (!response.ok) {
            showNotification('Eğitim yüklenirken hata oluştu', 'error');
            return;
        }
        const education = await response.json();
        showEducationModal(education);
    } catch (error) {
        console.error('Error editing education:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
};

window.deleteEducation = async (id) => {
    if (confirm('Bu eğitimi silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`/api/education/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Eğitim silindi!');
                loadEducation();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    }
};


// ========== PROJECTS ==========

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        renderProjectsGrid(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjectsGrid(projects) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const technologies = project.technologies ? JSON.parse(project.technologies) : [];

        card.innerHTML = `
            ${project.image ? `
                <div style="width: 100%; height: 150px; overflow: hidden; border-radius: var(--radius-sm) var(--radius-sm) 0 0; margin: -1rem -1rem 1rem -1rem;">
                    <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            ` : ''}
            <div class="item-card-header">
                <div>
                    <h4>${project.title}</h4>
                    ${project.featured ? '<span class="badge badge-success">Öne Çıkan</span>' : ''}
                </div>
            </div>
            ${project.description ? `<p class="description">${project.description}</p>` : ''}
            ${technologies.length > 0 ? `<div class="meta">${technologies.join(', ')}</div>` : ''}
            <div class="item-card-actions">
                <button class="btn btn-small btn-secondary" onclick="editProject(${project.id})">Düzenle</button>
                <button class="btn btn-small btn-danger" onclick="deleteProject(${project.id})">Sil</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

document.getElementById('addProjectBtn')?.addEventListener('click', () => {
    showProjectModal();
});

document.getElementById('importGithubBtn')?.addEventListener('click', async () => {
    const username = prompt('GitHub kullanıcı adınızı girin:', '');
    if (!username) return;

    try {
        showNotification('GitHub projeleri çekiliyor...', 'warning');

        const response = await fetch(`/api/github/repos/${username}`);
        if (!response.ok) {
            showNotification('GitHub API hatası', 'error');
            return;
        }

        const repos = await response.json();

        if (repos.length === 0) {
            showNotification('GitHub hesabında proje bulunamadı', 'warning');
            return;
        }

        // Show selection modal
        showModal('GitHub Projelerini Seç', `
            <p>Eklemek istediğiniz projeleri seçin (${repos.length} proje bulundu):</p>
            <form id="githubSelectForm">
                <div style="max-height: 400px; overflow-y: auto;">
                    ${repos.map((repo, index) => `
                        <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 1rem;">
                            <label style="display: flex; align-items: start; gap: 1rem; cursor: pointer;">
                                <input type="checkbox" name="repo_${index}" checked style="margin-top: 0.25rem;">
                                ${repo.image ? `
                                    <div style="flex-shrink: 0;">
                                        <img src="${repo.image}" alt="${repo.title}" style="width: 60px; height: 60px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-color);">
                                    </div>
                                ` : `
                                    <div style="flex-shrink: 0; width: 60px; height: 60px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.75rem;">
                                        No Image
                                    </div>
                                `}
                                <div style="flex: 1;">
                                    <strong>${repo.title}</strong>
                                    <p style="margin: 0.5rem 0; color: var(--text-secondary); font-size: 0.875rem;">${repo.description || 'Açıklama yok'}</p>
                                    ${repo.technologies !== '[]' ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${JSON.parse(repo.technologies).join(', ')}</div>` : ''}
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Seçilenleri Ekle</button>
            </form>
        `);

        document.getElementById('githubSelectForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const selectedRepos = [];

            repos.forEach((repo, index) => {
                if (formData.has(`repo_${index}`)) {
                    selectedRepos.push(repo);
                }
            });

            if (selectedRepos.length === 0) {
                showNotification('Hiç proje seçilmedi', 'warning');
                return;
            }

            // Import selected repos
            let successCount = 0;
            for (const repo of selectedRepos) {
                try {
                    const response = await fetch('/api/projects', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(repo)
                    });
                    if (response.ok) successCount++;
                } catch (error) {
                    console.error('Error importing repo:', error);
                }
            }

            closeModal();
            showNotification(`${successCount}/${selectedRepos.length} proje başarıyla eklendi!`);
            loadProjects();
        });

    } catch (error) {
        console.error('GitHub import error:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
});


function showProjectModal(project = null) {
    const isEdit = project !== null;
    const title = isEdit ? 'Projeyi Düzenle' : 'Yeni Proje Ekle';

    showModal(title, `
        <form id="projectForm">
            <div class="form-group">
                <label>Proje Başlığı</label>
                <input type="text" name="title" value="${project?.title || ''}" required>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea name="description" rows="3">${project?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Proje Resmi</label>
                <input type="file" name="image" id="projectImageInput" accept="image/*">
                <div class="image-preview-container">
                    <div class="image-preview" id="projectImagePreview">${project?.image ? `<img src="${project.image}" alt="Project">` : ''}</div>
                    ${project?.image ? `<button type="button" id="deleteProjectImage" class="btn-icon btn-danger" title="Resmi sil">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>` : ''}
                </div>
                <small style="color: var(--text-muted);">PNG, JPG veya WebP formatında</small>
            </div>
            <div class="form-group">
                <label>Teknolojiler (virgülle ayırın)</label>
                <input type="text" name="technologies" value="${project?.technologies ? JSON.parse(project.technologies).join(', ') : ''}" placeholder="React, Node.js, MongoDB">
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Canlı Demo URL</label>
                    <input type="url" name="live_url" value="${project?.live_url || ''}">
                </div>
                <div class="form-group">
                    <label>GitHub URL</label>
                    <input type="url" name="github_url" value="${project?.github_url || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="featured" ${project?.featured ? 'checked' : ''}>
                    Öne çıkan proje
                </label>
            </div>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
        </form>
    `);

    // Image preview handler
    const imageInput = document.getElementById('projectImageInput');
    const preview = document.getElementById('projectImagePreview');

    imageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Delete image handler
    document.getElementById('deleteProjectImage')?.addEventListener('click', () => {
        preview.innerHTML = '';
        imageInput.value = '';
        // Mark for deletion in edit mode
        if (isEdit) {
            document.getElementById('projectForm').dataset.deleteImage = 'true';
        }
    });

    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Convert technologies to JSON
        const techValue = formData.get('technologies');
        if (techValue) {
            const technologies = techValue.split(',').map(t => t.trim()).filter(t => t);
            formData.set('technologies', JSON.stringify(technologies));
        }

        // Set featured value
        formData.set('featured', formData.has('featured') ? '1' : '0');

        // If no new file selected but has existing image, preserve it
        if (!formData.get('image').size && project?.image) {
            formData.set('image', project.image);
        }

        try {
            const url = isEdit ? `/api/projects/${project.id}` : '/api/projects';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData  // Send as FormData, not JSON
            });

            if (response.ok) {
                showNotification(isEdit ? 'Proje güncellendi!' : 'Proje eklendi!');
                closeModal();
                loadProjects();
            } else {
                showNotification('İşlem başarısız', 'error');
            }
        } catch (error) {
            console.error('Project save error:', error);
            showNotification('Bir hata oluştu', 'error');
        }
    });
}

window.editProject = async (id) => {
    console.log('editProject called with id:', id);
    try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
            showNotification('Proje yüklenirken hata oluştu', 'error');
            return;
        }
        const project = await response.json();
        showProjectModal(project);
    } catch (error) {
        console.error('Error editing project:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
};

window.deleteProject = async (id) => {
    if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Proje silindi!');
                loadProjects();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    }
};


// ========== ACHIEVEMENTS ==========

async function loadAchievements() {
    try {
        const response = await fetch('/api/achievements');
        const achievements = await response.json();
        renderAchievementsGrid(achievements);
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

function renderAchievementsGrid(achievements) {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';

    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = 'item-card';

        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <h4>${achievement.title}</h4>
                    ${achievement.date ? `<div class="meta">${achievement.date}</div>` : ''}
                </div>
            </div>
            ${achievement.description ? `<p class="description">${achievement.description}</p>` : ''}
            <div class="item-card-actions">
                <button class="btn btn-small btn-secondary" onclick="editAchievement(${achievement.id})">Düzenle</button>
                <button class="btn btn-small btn-danger" onclick="deleteAchievement(${achievement.id})">Sil</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

document.getElementById('addAchievementBtn')?.addEventListener('click', () => {
    showAchievementModal();
});

function showAchievementModal(achievement = null) {
    const isEdit = achievement !== null;
    const title = isEdit ? 'Başarıyı Düzenle' : 'Yeni Başarı Ekle';

    showModal(title, `
        <form id="achievementForm">
            <div class="form-group">
                <label>Başlık</label>
                <input type="text" name="title" value="${achievement?.title || ''}" required>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea name="description" rows="3">${achievement?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Tarih</label>
                <input type="text" name="date" value="${achievement?.date || ''}" placeholder="2023">
            </div>
            <div class="form-group">
                <label>Icon (emoji veya text)</label>
                <input type="text" name="icon" value="${achievement?.icon || ''}" placeholder="🏆">
            </div>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
        </form>
    `);

    document.getElementById('achievementForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const url = isEdit ? `/api/achievements/${achievement.id}` : '/api/achievements';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification(isEdit ? 'Başarı güncellendi!' : 'Başarı eklendi!');
                closeModal();
                loadAchievements();
            } else {
                showNotification('İşlem başarısız', 'error');
            }
        } catch (error) {
            console.error('Achievement save error:', error);
            showNotification('Bir hata oluştu', 'error');
        }
    });
}

window.editAchievement = async (id) => {
    console.log('editAchievement called with id:', id);
    try {
        const response = await fetch(`/api/achievements/${id}`);
        if (!response.ok) {
            showNotification('Başarı yüklenirken hata oluştu', 'error');
            return;
        }
        const achievement = await response.json();
        showAchievementModal(achievement);
    } catch (error) {
        console.error('Error editing achievement:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
};

window.deleteAchievement = async (id) => {
    if (confirm('Bu başarıyı silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Başarı silindi!');
                loadAchievements();
            }
        } catch (error) {
            showNotification('Bir hata oluştu', 'error');
        }
    }
};


// ========== SETTINGS ==========

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        document.getElementById('siteTitle').value = settings.site_title || '';
        document.getElementById('siteLogo').value = settings.site_logo || '';
        document.getElementById('experienceYears').value = settings.experience_years || '';
        document.getElementById('linkedinUrl').value = settings.linkedin_url || '';
        document.getElementById('githubUrl').value = settings.github_url || '';
        document.getElementById('twitterUrl').value = settings.twitter_url || '';
        document.getElementById('youtubeUrl').value = settings.youtube_url || '';
        document.getElementById('instagramUrl').value = settings.instagram_url || '';
        document.getElementById('themeColor').value = settings.theme_color || '#6366f1';
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Ayarlar kaydedildi!');
        } else {
            showNotification('Ayarlar kaydedilirken hata oluştu', 'error');
        }
    } catch (error) {
        showNotification('Bir hata oluştu', 'error');
    }
});

// ========== ACCOUNT MANAGEMENT ==========

// Change username
document.getElementById('changeUsernameBtn')?.addEventListener('click', async () => {
    const newUsername = document.getElementById('newUsername').value.trim();
    const currentPassword = document.getElementById('currentPasswordForUsername').value;

    if (!newUsername) {
        showNotification('Lütfen yeni kullanıcı adını girin', 'error');
        return;
    }

    if (!currentPassword) {
        showNotification('Lütfen mevcut şifrenizi girin', 'error');
        return;
    }

    try {
        const response = await fetch('/api/user/account', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: newUsername,
                email: '', // Not changing email for now
                currentPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Kullanıcı adı başarıyla güncellendi!');
            document.getElementById('newUsername').value = '';
            document.getElementById('currentPasswordForUsername').value = '';
            currentUser = newUsername;
        } else {
            showNotification(data.error || 'Kullanıcı adı güncellenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Username update error:', error);
        showNotification('Bir hata oluştu', 'error');
    }
});

// Change password
document.getElementById('changePasswordBtn')?.addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentPasswordForPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validation
    if (!currentPassword) {
        showNotification('Lütfen mevcut şifrenizi girin', 'error');
        return;
    }

    if (!newPassword) {
        showNotification('Lütfen yeni şifrenizi girin', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Yeni şifre en az 8 karakter olmalıdır', 'error');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showNotification('Yeni şifreler eşleşmiyor', 'error');
        return;
    }

    if (!confirm('Şifrenizi değiştirmek istediğinizden emin misiniz? Otomatik olarak çıkış yapılacak ve yeniden giriş yapmanız gereكecektir.')) {
        return;
    }

    try {
        const response = await fetch('/api/user/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Şifre başarıyla güncellendi! Yeniden giriş yapmanız gerekiyor...');
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            showNotification(data.error || 'Şifre güncellenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        showNotification('Bir hata oluştu', 'error');
    }
});

// ========== INIT ==========

async function loadAllData() {
    await loadProfile();
    await loadSkills();
    await loadExperience();
    await loadEducation();
    await loadProjects();
    await loadAchievements();
    await loadSettings();
}

// Check auth on page load
checkAuth();
