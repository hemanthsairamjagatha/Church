/**
 * Mizpah Ministries Church Administration Portal Logic
 * Connected to Supabase Database & Storage
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check if ChurchAPI exists
  if (!window.ChurchAPI) {
    console.error('ChurchAPI (supabase-client.js) not found.');
    return;
  }

  // =========================================================================
  // 1. AUTHENTICATION GUARD
  // =========================================================================
  const session = await window.ChurchAPI.getAdminSession();
  if (!session || !session.user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate user profile in sidebar
  const adminEmail = session.user.email || 'admin@mizpahministries.org';
  const adminUserEmailEl = document.getElementById('adminUserEmail');
  const adminAvatarLetterEl = document.getElementById('adminAvatarLetter');
  if (adminUserEmailEl) adminUserEmailEl.textContent = adminEmail;
  if (adminAvatarLetterEl) adminAvatarLetterEl.textContent = adminEmail.charAt(0).toUpperCase();

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await window.ChurchAPI.signOutAdmin();
      window.location.href = 'login.html';
    });
  }

  // Mobile menu toggle & backdrop
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarClose = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  const openSidebar = () => {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // =========================================================================
  // 2. TOAST NOTIFICATIONS
  // =========================================================================
  const toastContainer = document.getElementById('adminToastContainer');
  function showToast(message, isSuccess = true) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast-admin ${isSuccess ? 'success' : 'error'}`;
    toast.innerHTML = `
      <i class="${isSuccess ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}" style="color: ${isSuccess ? '#10B981' : '#EF4444'}; font-size: 18px;"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 3. TAB NAVIGATION
  // =========================================================================
  const tabBtns = document.querySelectorAll('.sidebar-nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const topbarTitle = document.getElementById('topbarTitle');

  const tabTitles = {
    'inquiries': 'Contact Inquiries',
    'hero': 'Hero Section Customization',
    'pathway': 'Pathway Cards',
    'pastor': 'Our Pastor',
    'sermons': 'Sermons Archive',
    'gallery': 'Photo Gallery',
    'testimonials': 'Member Testimonies',
    'settings': 'Church Information & Settings'
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`pane-${targetTab}`);
      if (pane) pane.classList.add('active');

      if (topbarTitle && tabTitles[targetTab]) {
        topbarTitle.textContent = tabTitles[targetTab];
      }

      // Close mobile sidebar on selection
      closeSidebar();
    });
  });

  // =========================================================================
  // 4. MODALS MANAGER
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close modal when clicking outside backdrop
  document.querySelectorAll('.modal-backdrop-admin').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  // =========================================================================
  // 5. CONTACT INQUIRIES (REAL-TIME REFLECTION & CRUD)
  // =========================================================================
  const inquiriesTableBody = document.getElementById('inquiriesTableBody');
  const unreadBadge = document.getElementById('unreadBadge');
  const refreshInquiriesBtn = document.getElementById('refreshInquiriesBtn');
  let currentInquiries = [];

  async function loadInquiries() {
    try {
      const submissions = await window.ChurchAPI.getContactSubmissions();
      currentInquiries = submissions || [];
      renderInquiries();
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    }
  }

  function renderInquiries() {
    if (!inquiriesTableBody) return;

    const unreadCount = currentInquiries.filter(i => !i.is_read).length;
    if (unreadBadge) {
      if (unreadCount > 0) {
        unreadBadge.textContent = unreadCount;
        unreadBadge.style.display = 'inline-block';
      } else {
        unreadBadge.style.display = 'none';
      }
    }

    if (currentInquiries.length === 0) {
      inquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-dim);">
            <i class="fa-regular fa-folder-open" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
            No contact submissions received yet.
          </td>
        </tr>
      `;
      return;
    }

    inquiriesTableBody.innerHTML = currentInquiries.map(item => {
      const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr class="${item.is_read ? '' : 'unread-row'}">
          <td>
            <span class="${item.is_read ? 'badge-read' : 'badge-unread'}">
              ${item.is_read ? 'Read' : 'New'}
            </span>
          </td>
          <td style="color: var(--text-muted); font-size: 12.5px;">${dateStr}</td>
          <td><strong>${escapeHtml(item.full_name)}</strong></td>
          <td><a href="mailto:${escapeHtml(item.email)}" style="color: #60A5FA; text-decoration: none;">${escapeHtml(item.email)}</a></td>
          <td style="color: var(--text-muted);">${escapeHtml(item.phone || '—')}</td>
          <td><span style="font-weight: 500;">${escapeHtml(item.subject || 'General Inquiry')}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon-action view-inquiry-btn" data-id="${item.id}" title="View Details">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-icon-action toggle-read-btn" data-id="${item.id}" data-read="${item.is_read}" title="${item.is_read ? 'Mark as Unread' : 'Mark as Read'}">
                <i class="${item.is_read ? 'fa-regular fa-envelope' : 'fa-regular fa-envelope-open'}"></i>
              </button>
              <button class="btn-icon-action btn-icon-delete delete-inquiry-btn" data-id="${item.id}" title="Delete Message">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    inquiriesTableBody.querySelectorAll('.view-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = currentInquiries.find(i => i.id == id);
        if (item) viewInquiryDetails(item);
      });
    });

    inquiriesTableBody.querySelectorAll('.toggle-read-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const isRead = btn.getAttribute('data-read') === 'true';
        await window.ChurchAPI.markContactSubmissionRead(id, !isRead);
        showToast(isRead ? 'Marked as unread' : 'Marked as read');
        loadInquiries();
      });
    });

    inquiriesTableBody.querySelectorAll('.delete-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this message?')) {
          await window.ChurchAPI.deleteContactSubmission(id);
          showToast('Message deleted');
          loadInquiries();
        }
      });
    });
  }

  function viewInquiryDetails(item) {
    document.getElementById('modalInquiryDate').textContent = new Date(item.created_at).toLocaleString();
    document.getElementById('modalInquiryName').textContent = item.full_name;
    document.getElementById('modalInquiryEmail').textContent = item.email;
    document.getElementById('modalInquiryPhone').textContent = item.phone || 'None provided';
    document.getElementById('modalInquirySubject').textContent = item.subject || 'General Inquiry';
    document.getElementById('modalInquiryMessage').textContent = item.message;

    const replyBtn = document.getElementById('modalReplyBtn');
    if (replyBtn) {
      replyBtn.href = `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent('Re: ' + (item.subject || 'Church Inquiry'))}`;
    }

    // Auto mark as read if not already read
    if (!item.is_read) {
      window.ChurchAPI.markContactSubmissionRead(item.id, true).then(() => {
        item.is_read = true;
        renderInquiries();
      });
    }

    openModal('inquiryDetailModal');
  }

  if (refreshInquiriesBtn) {
    refreshInquiriesBtn.addEventListener('click', () => {
      refreshInquiriesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Checking...</span>';
      loadInquiries().then(() => {
        refreshInquiriesBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> <span>Refresh</span>';
        showToast('Inquiries refreshed');
      });
    });
  }

  // Periodic Auto-Refresh: Checks for new form submissions every 8 seconds
  setInterval(loadInquiries, 8000);

  // =========================================================================
  // 6. CHURCH SETTINGS (HERO, PASTOR & GENERAL)
  // =========================================================================
  let currentSettings = null;

  async function loadSettings() {
    currentSettings = await window.ChurchAPI.getChurchSettings();
    if (!currentSettings) return;

    // Populate Hero Section
    setInputValue('heroSubtitle', currentSettings.hero_subtitle);
    setInputValue('heroTitle', currentSettings.hero_title);
    setInputValue('heroDesc', currentSettings.hero_description);
    setInputValue('heroBtn1Text', currentSettings.hero_btn_text);
    setInputValue('heroBtn1Link', currentSettings.hero_btn_link);
    setInputValue('heroBtn2Text', currentSettings.hero_btn2_text);
    setInputValue('heroBtn2Link', currentSettings.hero_btn2_link);
    setInputValue('heroImageUrl', currentSettings.hero_bg_image);
    if (currentSettings.hero_bg_image) {
      document.getElementById('heroImagePreview').src = currentSettings.hero_bg_image;
    }

    // Populate Pastor Section
    setInputValue('pastorEyebrow', currentSettings.pastor_eyebrow);
    setInputValue('pastorName', currentSettings.pastor_name);
    setInputValue('pastorQuote', currentSettings.pastor_quote);
    setInputValue('pastorImageUrl', currentSettings.pastor_image);
    if (currentSettings.pastor_image) {
      document.getElementById('pastorImagePreview').src = currentSettings.pastor_image;
    }

    // Populate General Settings
    setInputValue('settingChurchName', currentSettings.church_name);
    setInputValue('settingPhone', currentSettings.phone);
    setInputValue('settingEmail', currentSettings.email);
    setInputValue('settingAddress', currentSettings.address);
    setInputValue('settingServiceTimes', currentSettings.service_times);
    setInputValue('settingFacebook', currentSettings.social_facebook);
    setInputValue('settingYoutube', currentSettings.social_youtube);
  }

  // Save Hero Section
  const saveHeroBtn = document.getElementById('saveHeroBtn');
  if (saveHeroBtn) {
    saveHeroBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentSettings) return;
      saveHeroBtn.disabled = true;
      saveHeroBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const updates = {
        hero_subtitle: document.getElementById('heroSubtitle').value,
        hero_title: document.getElementById('heroTitle').value,
        hero_description: document.getElementById('heroDesc').value,
        hero_btn_text: document.getElementById('heroBtn1Text').value,
        hero_btn_link: document.getElementById('heroBtn1Link').value,
        hero_btn2_text: document.getElementById('heroBtn2Text').value,
        hero_btn2_link: document.getElementById('heroBtn2Link').value,
        hero_bg_image: document.getElementById('heroImageUrl').value
      };

      const { data, error } = await window.ChurchAPI.updateChurchSettings(currentSettings.id, updates);
      saveHeroBtn.disabled = false;
      saveHeroBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Save Hero Changes</span>';

      if (error) {
        showToast('Error saving hero: ' + error.message, false);
      } else {
        showToast('Hero section updated successfully!');
      }
    });
  }

  // Hero Image Upload Handler
  const heroFileInput = document.getElementById('heroImageFileInput');
  if (heroFileInput) {
    heroFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showToast('Uploading hero image to Supabase...');
      const res = await window.ChurchAPI.uploadMediaFile(file, 'hero');
      if (res.error) {
        showToast('Failed to upload image: ' + res.error.message, false);
      } else {
        document.getElementById('heroImageUrl').value = res.publicUrl;
        document.getElementById('heroImagePreview').src = res.publicUrl;
        showToast('Image uploaded! Click Save to apply.');
      }
    });
  }

  // Save Pastor Section
  const savePastorBtn = document.getElementById('savePastorBtn');
  if (savePastorBtn) {
    savePastorBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentSettings) return;
      savePastorBtn.disabled = true;
      savePastorBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const updates = {
        pastor_eyebrow: document.getElementById('pastorEyebrow').value,
        pastor_name: document.getElementById('pastorName').value,
        pastor_quote: document.getElementById('pastorQuote').value,
        pastor_image: document.getElementById('pastorImageUrl').value
      };

      const { data, error } = await window.ChurchAPI.updateChurchSettings(currentSettings.id, updates);
      savePastorBtn.disabled = false;
      savePastorBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Save Pastor Details</span>';

      if (error) {
        showToast('Error saving pastor: ' + error.message, false);
      } else {
        showToast('Pastor details updated successfully!');
      }
    });
  }

  // Pastor Photo Upload Handler
  const pastorFileInput = document.getElementById('pastorImageFileInput');
  if (pastorFileInput) {
    pastorFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showToast('Uploading pastor photo to Supabase...');
      const res = await window.ChurchAPI.uploadMediaFile(file, 'pastor');
      if (res.error) {
        showToast('Failed to upload image: ' + res.error.message, false);
      } else {
        document.getElementById('pastorImageUrl').value = res.publicUrl;
        document.getElementById('pastorImagePreview').src = res.publicUrl;
        showToast('Photo uploaded! Click Save to apply.');
      }
    });
  }

  // Save General Church Settings
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentSettings) return;
      saveSettingsBtn.disabled = true;
      saveSettingsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const updates = {
        church_name: document.getElementById('settingChurchName').value,
        phone: document.getElementById('settingPhone').value,
        email: document.getElementById('settingEmail').value,
        address: document.getElementById('settingAddress').value,
        service_times: document.getElementById('settingServiceTimes').value,
        social_facebook: document.getElementById('settingFacebook').value,
        social_youtube: document.getElementById('settingYoutube').value
      };

      const { data, error } = await window.ChurchAPI.updateChurchSettings(currentSettings.id, updates);
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Save Settings</span>';

      if (error) {
        showToast('Error saving settings: ' + error.message, false);
      } else {
        showToast('Church settings saved successfully!');
      }
    });
  }

  // =========================================================================
  // 7. PATHWAY CARDS CRUD
  // =========================================================================
  const pathwayCardsGrid = document.getElementById('pathwayCardsGrid');
  let currentPathwayCards = [];

  async function loadPathwayCards() {
    currentPathwayCards = await window.ChurchAPI.getPathwayCards();
    renderPathwayCards();
  }

  function renderPathwayCards() {
    if (!pathwayCardsGrid) return;

    if (currentPathwayCards.length === 0) {
      pathwayCardsGrid.innerHTML = '<p style="color: var(--text-dim); grid-column: 1/-1;">No pathway cards yet. Click "Add Pathway Card" to create one.</p>';
      return;
    }

    pathwayCardsGrid.innerHTML = currentPathwayCards.map(card => `
      <div class="admin-item-card">
        <img src="${escapeHtml(card.image_url)}" class="card-item-img" alt="${escapeHtml(card.title)}" onerror="this.src='images/know-god.jpg'">
        <div class="card-item-body">
          <div class="card-item-category">Sort: #${card.sort_order || 1}</div>
          <h4 class="card-item-title">${escapeHtml(card.title)}</h4>
          <p class="card-item-desc">${escapeHtml(card.description)}</p>
          <div class="card-item-footer">
            <span style="font-size: 12px; color: var(--text-dim);">${escapeHtml(card.link_url || '#')}</span>
            <div class="action-btn-group">
              <button class="btn-icon-action edit-pathway-btn" data-id="${card.id}" title="Edit Card">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-action btn-icon-delete delete-pathway-btn" data-id="${card.id}" title="Delete Card">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    pathwayCardsGrid.querySelectorAll('.edit-pathway-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = currentPathwayCards.find(c => c.id == btn.getAttribute('data-id'));
        if (card) editPathwayCard(card);
      });
    });

    pathwayCardsGrid.querySelectorAll('.delete-pathway-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this pathway card?')) {
          await window.ChurchAPI.deletePathwayCard(id);
          showToast('Pathway card deleted');
          loadPathwayCards();
        }
      });
    });
  }

  function editPathwayCard(card = null) {
    document.getElementById('pathwayModalTitle').textContent = card ? 'Edit Pathway Card' : 'Add Pathway Card';
    document.getElementById('pathwayCardId').value = card ? card.id : '';
    document.getElementById('pathwayTitle').value = card ? card.title : '';
    document.getElementById('pathwayDesc').value = card ? card.description : '';
    document.getElementById('pathwayLink').value = card ? card.link_url : '#contact';
    document.getElementById('pathwaySortOrder').value = card ? card.sort_order : (currentPathwayCards.length + 1);
    document.getElementById('pathwayImageUrl').value = card ? card.image_url : 'images/know-god.jpg';
    document.getElementById('pathwayPreviewThumb').src = card ? card.image_url : 'images/know-god.jpg';

    openModal('pathwayModal');
  }

  document.getElementById('addPathwayCardBtn')?.addEventListener('click', () => editPathwayCard(null));

  // Pathway card file upload
  document.getElementById('pathwayFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Uploading card image...');
    const res = await window.ChurchAPI.uploadMediaFile(file, 'pathway');
    if (res.error) {
      showToast('Upload failed: ' + res.error.message, false);
    } else {
      document.getElementById('pathwayImageUrl').value = res.publicUrl;
      document.getElementById('pathwayPreviewThumb').src = res.publicUrl;
      showToast('Image ready!');
    }
  });

  // Pathway card save
  document.getElementById('savePathwaySubmitBtn')?.addEventListener('click', async () => {
    const id = document.getElementById('pathwayCardId').value;
    const title = document.getElementById('pathwayTitle').value.trim();
    const description = document.getElementById('pathwayDesc').value.trim();
    const link_url = document.getElementById('pathwayLink').value.trim();
    const sort_order = parseInt(document.getElementById('pathwaySortOrder').value, 10) || 1;
    const image_url = document.getElementById('pathwayImageUrl').value.trim();

    if (!title || !description) {
      alert('Please fill out card title and description.');
      return;
    }

    const payload = { title, description, link_url, sort_order, image_url };
    if (id) payload.id = id;

    const { error } = await window.ChurchAPI.savePathwayCard(payload);
    if (error) {
      showToast('Error saving card: ' + error.message, false);
    } else {
      closeModal('pathwayModal');
      showToast('Pathway card saved!');
      loadPathwayCards();
    }
  });

  // =========================================================================
  // 8. SERMONS CRUD
  // =========================================================================
  const sermonsTableBody = document.getElementById('sermonsTableBody');
  let currentSermons = [];

  async function loadSermons() {
    currentSermons = await window.ChurchAPI.getSermons();
    renderSermons();
  }

  function renderSermons() {
    if (!sermonsTableBody) return;

    if (currentSermons.length === 0) {
      sermonsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-dim);">No sermons found. Click "Add New Sermon" to create one.</td></tr>';
      return;
    }

    sermonsTableBody.innerHTML = currentSermons.map(sermon => `
      <tr>
        <td style="color: var(--accent-gold); font-weight: 600;">${escapeHtml(sermon.series || 'Sunday Message')}</td>
        <td><strong>${escapeHtml(sermon.title)}</strong></td>
        <td>${escapeHtml(sermon.preacher || 'Dr. Ronald E. Williams')}</td>
        <td style="color: var(--text-muted);">${escapeHtml(sermon.date || '—')}</td>
        <td style="color: #93C5FD;">${escapeHtml(sermon.scripture || '—')}</td>
        <td>${sermon.is_featured ? '<span class="badge-read">Featured</span>' : '<span style="color: var(--text-dim);">Archive</span>'}</td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon-action edit-sermon-btn" data-id="${sermon.id}" title="Edit Sermon">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-action btn-icon-delete delete-sermon-btn" data-id="${sermon.id}" title="Delete Sermon">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    sermonsTableBody.querySelectorAll('.edit-sermon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sermon = currentSermons.find(s => s.id == btn.getAttribute('data-id'));
        if (sermon) editSermon(sermon);
      });
    });

    sermonsTableBody.querySelectorAll('.delete-sermon-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this sermon?')) {
          await window.ChurchAPI.deleteSermon(id);
          showToast('Sermon deleted');
          loadSermons();
        }
      });
    });
  }

  function editSermon(sermon = null) {
    document.getElementById('sermonModalTitle').textContent = sermon ? 'Edit Sermon' : 'Add New Sermon';
    document.getElementById('sermonId').value = sermon ? sermon.id : '';
    document.getElementById('sermonSeries').value = sermon ? sermon.series : 'Walking in Grace';
    document.getElementById('sermonTitle').value = sermon ? sermon.title : '';
    document.getElementById('sermonPreacher').value = sermon ? sermon.preacher : 'Dr. Ronald E. Williams';
    document.getElementById('sermonDate').value = sermon ? sermon.date : new Date().toISOString().split('T')[0];
    document.getElementById('sermonScripture').value = sermon ? sermon.scripture : '';
    document.getElementById('sermonDesc').value = sermon ? sermon.description : '';
    document.getElementById('sermonVideoUrl').value = sermon ? sermon.video_url : '';
    document.getElementById('sermonThumbUrl').value = sermon ? sermon.thumbnail_url : '';

    openModal('sermonModal');
  }

  document.getElementById('addSermonBtn')?.addEventListener('click', () => editSermon(null));

  document.getElementById('saveSermonSubmitBtn')?.addEventListener('click', async () => {
    const id = document.getElementById('sermonId').value;
    const series = document.getElementById('sermonSeries').value.trim();
    const title = document.getElementById('sermonTitle').value.trim();
    const preacher = document.getElementById('sermonPreacher').value.trim();
    const date = document.getElementById('sermonDate').value;
    const scripture = document.getElementById('sermonScripture').value.trim();
    const description = document.getElementById('sermonDesc').value.trim();
    const video_url = document.getElementById('sermonVideoUrl').value.trim();
    const thumbnail_url = document.getElementById('sermonThumbUrl').value.trim();

    if (!title) {
      alert('Please enter sermon title.');
      return;
    }

    const payload = { series, title, preacher, date, scripture, description, video_url, thumbnail_url };
    if (id) payload.id = id;

    const { error } = await window.ChurchAPI.saveSermon(payload);
    if (error) {
      showToast('Error saving sermon: ' + error.message, false);
    } else {
      closeModal('sermonModal');
      showToast('Sermon saved!');
      loadSermons();
    }
  });

  // =========================================================================
  // 9. GALLERY CRUD
  // =========================================================================
  const galleryGrid = document.getElementById('galleryGrid');
  let currentGallery = [];

  async function loadGallery() {
    currentGallery = await window.ChurchAPI.getGalleryItems();
    renderGallery();
  }

  function renderGallery() {
    if (!galleryGrid) return;

    if (currentGallery.length === 0) {
      galleryGrid.innerHTML = '<p style="color: var(--text-dim); grid-column: 1/-1;">No photos in gallery yet. Click "Upload New Photo" to add one.</p>';
      return;
    }

    galleryGrid.innerHTML = currentGallery.map(item => `
      <div class="admin-item-card">
        <img src="${escapeHtml(item.image_url)}" class="card-item-img" alt="${escapeHtml(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=800&q=80'">
        <div class="card-item-body">
          <div class="card-item-category">${escapeHtml(item.category)}</div>
          <h4 class="card-item-title">${escapeHtml(item.title)}</h4>
          <div class="card-item-footer">
            <span style="font-size: 12px; color: var(--text-dim);">Sort: #${item.sort_order || 1}</span>
            <button class="btn-icon-action btn-icon-delete delete-gallery-btn" data-id="${item.id}" title="Delete Photo">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    galleryGrid.querySelectorAll('.delete-gallery-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this photo from gallery?')) {
          await window.ChurchAPI.deleteGalleryItem(id);
          showToast('Photo removed from gallery');
          loadGallery();
        }
      });
    });
  }

  document.getElementById('addGalleryBtn')?.addEventListener('click', () => {
    document.getElementById('galleryTitle').value = '';
    document.getElementById('galleryCategory').value = 'worship';
    document.getElementById('gallerySortOrder').value = currentGallery.length + 1;
    document.getElementById('galleryImageUrl').value = '';
    openModal('galleryModal');
  });

  // Gallery photo upload
  document.getElementById('galleryFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Uploading photo to Supabase...');
    const res = await window.ChurchAPI.uploadMediaFile(file, 'gallery');
    if (res.error) {
      showToast('Upload failed: ' + res.error.message, false);
    } else {
      document.getElementById('galleryImageUrl').value = res.publicUrl;
      document.getElementById('galleryPreviewThumb').src = res.publicUrl;
      showToast('Photo uploaded!');
    }
  });

  document.getElementById('saveGallerySubmitBtn')?.addEventListener('click', async () => {
    const title = document.getElementById('galleryTitle').value.trim();
    const category = document.getElementById('galleryCategory').value;
    const sort_order = parseInt(document.getElementById('gallerySortOrder').value, 10) || 1;
    const image_url = document.getElementById('galleryImageUrl').value.trim();

    if (!title || !image_url) {
      alert('Please provide both photo title and an image.');
      return;
    }

    const { error } = await window.ChurchAPI.saveGalleryItem({ title, category, sort_order, image_url });
    if (error) {
      showToast('Error saving gallery item: ' + error.message, false);
    } else {
      closeModal('galleryModal');
      showToast('Photo added to gallery!');
      loadGallery();
    }
  });

  // =========================================================================
  // 10. TESTIMONIALS CRUD
  // =========================================================================
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  let currentTestimonials = [];

  async function loadTestimonials() {
    currentTestimonials = await window.ChurchAPI.getTestimonials();
    renderTestimonials();
  }

  function renderTestimonials() {
    if (!testimonialsGrid) return;

    if (currentTestimonials.length === 0) {
      testimonialsGrid.innerHTML = '<p style="color: var(--text-dim); grid-column: 1/-1;">No testimonials yet.</p>';
      return;
    }

    testimonialsGrid.innerHTML = currentTestimonials.map(t => `
      <div class="admin-item-card">
        <div class="card-item-body">
          <div class="card-item-category"><i class="fa-solid fa-quote-left"></i> Testimony</div>
          <h4 class="card-item-title">${escapeHtml(t.author_name)}</h4>
          <span style="font-size: 12.5px; color: var(--accent-gold); margin-bottom: 8px; display: block;">${escapeHtml(t.author_role || 'Member')}</span>
          <p class="card-item-desc" style="font-style: italic;">“${escapeHtml(t.quote)}”</p>
          <div class="card-item-footer">
            <span style="font-size: 12px; color: var(--text-dim);">Sort: #${t.sort_order || 1}</span>
            <div class="action-btn-group">
              <button class="btn-icon-action edit-testimonial-btn" data-id="${t.id}" title="Edit Testimonial">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-action btn-icon-delete delete-testimonial-btn" data-id="${t.id}" title="Delete Testimonial">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    testimonialsGrid.querySelectorAll('.edit-testimonial-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = currentTestimonials.find(item => item.id == btn.getAttribute('data-id'));
        if (t) editTestimonial(t);
      });
    });

    testimonialsGrid.querySelectorAll('.delete-testimonial-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this testimonial?')) {
          await window.ChurchAPI.deleteTestimonial(id);
          showToast('Testimonial deleted');
          loadTestimonials();
        }
      });
    });
  }

  function editTestimonial(t = null) {
    document.getElementById('testimonialModalTitle').textContent = t ? 'Edit Testimonial' : 'Add Testimonial';
    document.getElementById('testimonialId').value = t ? t.id : '';
    document.getElementById('testimonialAuthor').value = t ? t.author_name : '';
    document.getElementById('testimonialRole').value = t ? t.author_role : 'Member';
    document.getElementById('testimonialQuote').value = t ? t.quote : '';
    document.getElementById('testimonialAvatarUrl').value = t ? t.avatar_url : '';

    openModal('testimonialModal');
  }

  document.getElementById('addTestimonialBtn')?.addEventListener('click', () => editTestimonial(null));

  document.getElementById('saveTestimonialSubmitBtn')?.addEventListener('click', async () => {
    const id = document.getElementById('testimonialId').value;
    const author_name = document.getElementById('testimonialAuthor').value.trim();
    const author_role = document.getElementById('testimonialRole').value.trim();
    const quote = document.getElementById('testimonialQuote').value.trim();
    const avatar_url = document.getElementById('testimonialAvatarUrl').value.trim();

    if (!author_name || !quote) {
      alert('Please provide member name and quote.');
      return;
    }

    const payload = { author_name, author_role, quote, avatar_url };
    if (id) payload.id = id;

    const { error } = await window.ChurchAPI.saveTestimonial(payload);
    if (error) {
      showToast('Error saving testimonial: ' + error.message, false);
    } else {
      closeModal('testimonialModal');
      showToast('Testimonial saved!');
      loadTestimonials();
    }
  });

  // =========================================================================
  // UTILITIES
  // =========================================================================
  function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) {
      el.value = val;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Load of all sections
  loadInquiries();
  loadSettings();
  loadPathwayCards();
  loadSermons();
  loadGallery();
  loadTestimonials();
});
