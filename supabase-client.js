/**
 * Supabase Client & Backend API Integration
 * Mizpah Ministries Church Portal
 */

const SUPABASE_URL = 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';

// Initialize Supabase Client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// =========================================================================
// 1. AUTHENTICATION
// =========================================================================
async function signInAdmin(email, password) {
  if (!supabase) return { error: { message: 'Supabase library not loaded' } };
  return await supabase.auth.signInWithPassword({ email, password });
}

async function signOutAdmin() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

async function getAdminSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// =========================================================================
// 2. CHURCH SETTINGS & HERO & PASTOR
// =========================================================================
async function getChurchSettings() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('church_settings')
    .select('*')
    .limit(1)
    .single();
  if (error) {
    console.warn('Error fetching settings:', error);
    return null;
  }
  return data;
}

async function updateChurchSettings(settingsId, updates) {
  if (!supabase) return { error: 'Supabase not initialized' };
  updates.updated_at = new Date().toISOString();
  return await supabase
    .from('church_settings')
    .update(updates)
    .eq('id', settingsId)
    .select()
    .single();
}

// =========================================================================
// 3. PATHWAY CARDS (CRUD)
// =========================================================================
async function getPathwayCards() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('pathway_cards')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('Error fetching pathway cards:', error);
    return [];
  }
  return data || [];
}

async function savePathwayCard(card) {
  if (!supabase) return { error: 'Supabase not initialized' };
  if (card.id) {
    return await supabase
      .from('pathway_cards')
      .update(card)
      .eq('id', card.id)
      .select()
      .single();
  } else {
    return await supabase
      .from('pathway_cards')
      .insert(card)
      .select()
      .single();
  }
}

async function deletePathwayCard(id) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('pathway_cards')
    .delete()
    .eq('id', id);
}

// =========================================================================
// 4. SERMONS (CRUD)
// =========================================================================
async function getSermons() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('Error fetching sermons:', error);
    return [];
  }
  return data || [];
}

async function saveSermon(sermon) {
  if (!supabase) return { error: 'Supabase not initialized' };
  if (sermon.id) {
    return await supabase
      .from('sermons')
      .update(sermon)
      .eq('id', sermon.id)
      .select()
      .single();
  } else {
    return await supabase
      .from('sermons')
      .insert(sermon)
      .select()
      .single();
  }
}

async function deleteSermon(id) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('sermons')
    .delete()
    .eq('id', id);
}

// =========================================================================
// 5. GALLERY ITEMS (CRUD)
// =========================================================================
async function getGalleryItems() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('Error fetching gallery items:', error);
    return [];
  }
  return data || [];
}

async function saveGalleryItem(item) {
  if (!supabase) return { error: 'Supabase not initialized' };
  if (item.id) {
    return await supabase
      .from('gallery_items')
      .update(item)
      .eq('id', item.id)
      .select()
      .single();
  } else {
    return await supabase
      .from('gallery_items')
      .insert(item)
      .select()
      .single();
  }
}

async function deleteGalleryItem(id) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id);
}

// =========================================================================
// 6. TESTIMONIALS (CRUD)
// =========================================================================
async function getTestimonials() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('Error fetching testimonials:', error);
    return [];
  }
  return data || [];
}

async function saveTestimonial(item) {
  if (!supabase) return { error: 'Supabase not initialized' };
  if (item.id) {
    return await supabase
      .from('testimonials')
      .update(item)
      .eq('id', item.id)
      .select()
      .single();
  } else {
    return await supabase
      .from('testimonials')
      .insert(item)
      .select()
      .single();
  }
}

async function deleteTestimonial(id) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);
}

// =========================================================================
// 7. CONTACT SUBMISSIONS (CRUD & REAL-TIME REFLECTION)
// =========================================================================
async function submitContactMessage(submission) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('contact_submissions')
    .insert([
      {
        full_name: submission.fullName,
        email: submission.email,
        phone: submission.phone || '',
        subject: submission.subject || 'General Inquiry',
        message: submission.message,
        is_read: false
      }
    ]);
}

async function getContactSubmissions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Error fetching contact submissions:', error);
    return [];
  }
  return data || [];
}

async function markContactSubmissionRead(id, isRead = true) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('contact_submissions')
    .update({ is_read: isRead })
    .eq('id', id);
}

async function deleteContactSubmission(id) {
  if (!supabase) return { error: 'Supabase not initialized' };
  return await supabase
    .from('contact_submissions')
    .delete()
    .eq('id', id);
}

// =========================================================================
// 8. STORAGE IMAGE UPLOAD
// =========================================================================
async function uploadMediaFile(file, prefix = 'media') {
  if (!supabase) return { error: 'Supabase not initialized' };
  const ext = file.name.split('.').pop();
  const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from('church-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Storage upload error:', error);
    return { error };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('church-media')
    .getPublicUrl(filePath);

  return { publicUrl: urlData.publicUrl, path: filePath };
}

// Export functions to window
window.ChurchAPI = {
  supabase,
  signInAdmin,
  signOutAdmin,
  getAdminSession,
  getChurchSettings,
  updateChurchSettings,
  getPathwayCards,
  savePathwayCard,
  deletePathwayCard,
  getSermons,
  saveSermon,
  deleteSermon,
  getGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  submitContactMessage,
  getContactSubmissions,
  markContactSubmissionRead,
  deleteContactSubmission,
  uploadMediaFile
};
