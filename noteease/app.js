// Main application script for NoteEase

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const menuButton = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  const closeSidebarButton = document.getElementById('closeSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const addCategoryButton = document.getElementById('addCategoryButton');
  const categoryList = document.getElementById('categoryList');
  const searchInput = document.getElementById('searchInput');
  const noteList = document.getElementById('noteList');
  const addNoteButton = document.getElementById('addNoteButton');
  const emptyStateCreateBtn = document.getElementById('emptyStateCreateBtn');
  
  // Note Editor Elements
  const noteEditorModal = document.getElementById('noteEditorModal');
  const editorTitle = document.getElementById('editorTitle');
  const noteForm = document.getElementById('noteForm');
  const noteIdInput = document.getElementById('noteId');
  const noteTitleInput = document.getElementById('noteTitle');
  const noteCategorySelect = document.getElementById('noteCategory');
  const noteContentInput = document.getElementById('noteContent');
  const closeEditorButton = document.getElementById('closeEditor');
  const cancelButton = document.getElementById('cancelButton');
  const saveButton = document.getElementById('saveButton');
  
  // Note Viewer Elements
  const noteViewerModal = document.getElementById('noteViewerModal');
  const viewerTitle = document.getElementById('viewerTitle');
  const viewerCategory = document.getElementById('viewerCategory');
  const viewerDate = document.getElementById('viewerDate');
  const viewerContent = document.getElementById('viewerContent');
  const closeViewerButton = document.getElementById('closeViewer');
  const closeViewerBtn = document.getElementById('closeViewerBtn');
  const editFromViewerBtn = document.getElementById('editFromViewerBtn');
  
  // Track current note ID being viewed/edited
  let currentNoteId = null;
  
  // Initialize the application
  function initialize() {
    renderCategories();
    renderNotes();
    setupEventListeners();
  }

  // Format date helper
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  // Format date with time helper
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  // Render categories in sidebar
  function renderCategories() {
    // Clear existing categories except "All Notes"
    categoryList.innerHTML = `
      <li class="category-item">
        <button class="category-button ${!notesStore.activeCategory ? 'active' : ''}" data-category="">All Notes</button>
      </li>
    `;
    
    // Add each category
    notesStore.getCategories().forEach(category => {
      const li = document.createElement('li');
      li.className = 'category-item';
      
      const button = document.createElement('button');
      button.className = `category-button ${notesStore.activeCategory === category ? 'active' : ''}`;
      button.dataset.category = category;
      button.textContent = category;
      
      li.appendChild(button);
      categoryList.appendChild(li);
    });
    
    // Populate category select in editor
    noteCategorySelect.innerHTML = '';
    notesStore.getCategories().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      noteCategorySelect.appendChild(option);
    });
  }
  
  // Render notes based on current filters
  function renderNotes() {
    const notes = notesStore.getNotes();
    
    // Clear current list
    noteList.innerHTML = '';
    
    if (notes.length > 0) {
      // Create and append note cards
      notes.forEach(note => {
        noteList.appendChild(createNoteCard(note));
      });
    } else {
      // Show empty state
      noteList.innerHTML = `
        <div class="empty-state">
          <span class="material-icons empty-icon">note_add</span>
          <p>No notes found</p>
          <button class="btn btn-primary create-note-btn" id="emptyStateCreateBtn">
            Create your first note
          </button>
        </div>
      `;
      
      // Add event listener to new button
      document.getElementById('emptyStateCreateBtn')?.addEventListener('click', () => {
        showNoteEditor();
      });
    }
  }
  
  // Create a note card element
  function createNoteCard(note) {
    // Get a preview of the content
    const contentPreview = note.content.length > 100 
      ? note.content.substring(0, 100) + '...' 
      : note.content;
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'card note-card';
    card.dataset.noteId = note.id;
    
    card.innerHTML = `
      <div class="note-header">
        <h3 class="note-title">${note.title}</h3>
        <div class="note-actions">
          <button class="note-action edit-note" aria-label="Edit note">
            <span class="material-icons">edit</span>
          </button>
          <button class="note-action delete-note" aria-label="Delete note">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
      
      <div class="note-content">${contentPreview}</div>
      
      <div class="note-footer">
        <span class="note-category">${note.category}</span>
        <span class="note-date">${formatDate(note.updatedAt)}</span>
      </div>
    `;
    
    // Add event listeners
    card.addEventListener('click', (e) => {
      // Prevent triggering when clicking on action buttons
      if (!e.target.closest('.note-action')) {
        showNoteViewer(note.id);
      }
    });
    
    // Edit button
    card.querySelector('.edit-note').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      showNoteEditor(true, note.id);
    });
    
    // Delete button
    card.querySelector('.delete-note').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      
      if (confirm('Are you sure you want to delete this note?')) {
        notesStore.deleteNote(note.id);
        renderNotes();
      }
    });
    
    return card;
  }
  
  // Toggle sidebar visibility
  function toggleSidebar() {
    sidebar.classList.toggle('visible');
  }
  
  // Show note editor modal
  function showNoteEditor(isEdit = false, noteId = null) {
    // Reset form
    noteForm.reset();
    noteIdInput.value = '';
    
    if (isEdit && noteId) {
      // Edit existing note
      const note = notesStore.getNoteById(parseInt(noteId));
      
      if (note) {
        currentNoteId = note.id;
        editorTitle.textContent = 'Edit Note';
        noteIdInput.value = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        
        // Set category
        const categoryOption = Array.from(noteCategorySelect.options).find(
          option => option.value === note.category
        );
        
        if (categoryOption) {
          noteCategorySelect.selectedIndex = categoryOption.index;
        }
      }
    } else {
      // New note
      currentNoteId = null;
      editorTitle.textContent = 'New Note';
    }
    
    // Show modal
    noteEditorModal.classList.add('visible');
  }
  
  // Hide note editor modal
  function hideNoteEditor() {
    noteEditorModal.classList.remove('visible');
    currentNoteId = null;
  }
  
  // Show note viewer modal
  function showNoteViewer(noteId) {
    const note = notesStore.getNoteById(parseInt(noteId));
    
    if (note) {
      currentNoteId = note.id;
      
      // Set note details
      viewerTitle.textContent = note.title;
      viewerCategory.textContent = note.category;
      viewerDate.textContent = `Updated: ${formatDateTime(note.updatedAt)}`;
      viewerContent.textContent = note.content;
      
      // Show modal
      noteViewerModal.classList.add('visible');
    }
  }
  
  // Hide note viewer modal
  function hideNoteViewer() {
    noteViewerModal.classList.remove('visible');
    currentNoteId = null;
  }
  
  // Save current note
  function saveNote() {
    // Form validation
    if (!noteTitleInput.value.trim()) {
      alert('Please enter a title for your note');
      return;
    }
    
    const noteData = {
      title: noteTitleInput.value.trim(),
      content: noteContentInput.value.trim(),
      category: noteCategorySelect.value
    };
    
    const noteId = noteIdInput.value ? parseInt(noteIdInput.value) : null;
    
    if (noteId) {
      // Update existing note
      notesStore.updateNote(noteId, noteData);
    } else {
      // Create new note
      notesStore.createNote(noteData);
    }
    
    // Hide modal
    hideNoteEditor();
    
    // Refresh notes
    renderNotes();
  }
  
  // Set up all event listeners
  function setupEventListeners() {
    // Sidebar events
    menuButton.addEventListener('click', toggleSidebar);
    closeSidebarButton.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);
    
    // Category events
    addCategoryButton.addEventListener('click', () => {
      const newCategory = prompt('Enter new category name:');
      
      if (newCategory && newCategory.trim()) {
        const added = notesStore.addCategory(newCategory.trim());
        
        if (added) {
          renderCategories();
        } else {
          alert('Category already exists!');
        }
      }
    });
    
    // Set up event delegation for category buttons
    categoryList.addEventListener('click', (e) => {
      const categoryButton = e.target.closest('.category-button');
      
      if (categoryButton) {
        // Remove active class from all buttons
        document.querySelectorAll('.category-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        categoryButton.classList.add('active');
        
        // Set active category in store
        const category = categoryButton.dataset.category || null;
        notesStore.setActiveCategory(category);
        
        // Refresh notes
        renderNotes();
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
          toggleSidebar();
        }
      }
    });
    
    // Search event
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      notesStore.setSearchQuery(query);
      renderNotes();
    });
    
    // Add note button
    addNoteButton.addEventListener('click', () => {
      showNoteEditor();
    });
    
    // Note editor events
    closeEditorButton.addEventListener('click', hideNoteEditor);
    cancelButton.addEventListener('click', hideNoteEditor);
    saveButton.addEventListener('click', saveNote);
    
    // Click outside modal to close
    noteEditorModal.addEventListener('click', (e) => {
      if (e.target === noteEditorModal) {
        hideNoteEditor();
      }
    });
    
    // Note viewer events
    closeViewerButton.addEventListener('click', hideNoteViewer);
    closeViewerBtn.addEventListener('click', hideNoteViewer);
    
    editFromViewerBtn.addEventListener('click', () => {
      if (currentNoteId) {
        // Hide viewer modal
        hideNoteViewer();
        
        // Show editor with the note
        showNoteEditor(true, currentNoteId);
      }
    });
    
    // Click outside modal to close
    noteViewerModal.addEventListener('click', (e) => {
      if (e.target === noteViewerModal) {
        hideNoteViewer();
      }
    });
  }
  
  // Initialize the application
  initialize();
});
