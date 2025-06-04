// Store for managing notes data
class NotesStore {
  constructor() {
    // Default data
    this.notes = [];
    this.categories = ["Personal", "Work", "Ideas"];
    this.activeCategory = null;
    this.searchQuery = "";
    this.nextId = 1;
    
    // Load data if available
    this.loadFromStorage();
  }

  /**
   * Load notes data from localStorage
   */
  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedNotes = localStorage.getItem('noteease_notes');
        const savedCategories = localStorage.getItem('noteease_categories');
        const savedNextId = localStorage.getItem('noteease_nextId');
        
        if (savedNotes) this.notes = JSON.parse(savedNotes);
        if (savedCategories) this.categories = JSON.parse(savedCategories);
        if (savedNextId) this.nextId = parseInt(savedNextId);
      } catch (error) {
        console.error('Failed to load notes from storage:', error);
      }
    }
  }

  /**
   * Save current notes data to localStorage
   */
  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('noteease_notes', JSON.stringify(this.notes));
        localStorage.setItem('noteease_categories', JSON.stringify(this.categories));
        localStorage.setItem('noteease_nextId', this.nextId.toString());
      } catch (error) {
        console.error('Failed to save notes to storage:', error);
      }
    }
  }

  /**
   * Get all notes, optionally filtered by category and/or search query
   * @returns {Array} Filtered notes
   */
  getNotes() {
    return this.notes
      .filter(note => !this.activeCategory || note.category === this.activeCategory)
      .filter(note => !this.searchQuery || 
        note.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
  }

  /**
   * Get a note by its ID
   * @param {number} id Note ID
   * @returns {Object|null} The note object or null if not found
   */
  getNoteById(id) {
    return this.notes.find(note => note.id === id) || null;
  }

  /**
   * Create a new note
   * @param {Object} noteData Note data (title, content, category)
   * @returns {Object} The created note
   */
  createNote(noteData) {
    const newNote = {
      id: this.nextId++,
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      category: noteData.category || this.categories[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.notes.push(newNote);
    this.saveToStorage();
    return newNote;
  }

  /**
   * Update an existing note
   * @param {number} id Note ID to update
   * @param {Object} updateData New note data
   * @returns {Object|null} Updated note or null if not found
   */
  updateNote(id, updateData) {
    const noteIndex = this.notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) return null;
    
    const updatedNote = {
      ...this.notes[noteIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.notes[noteIndex] = updatedNote;
    this.saveToStorage();
    return updatedNote;
  }

  /**
   * Delete a note by ID
   * @param {number} id Note ID to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deleteNote(id) {
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(note => note.id !== id);
    
    if (this.notes.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Set active category filter
   * @param {string|null} category Category name or null to show all
   */
  setActiveCategory(category) {
    this.activeCategory = category;
  }

  /**
   * Set search query for filtering notes
   * @param {string} query Search query
   */
  setSearchQuery(query) {
    this.searchQuery = query;
  }

  /**
   * Get all available categories
   * @returns {Array} List of categories
   */
  getCategories() {
    return [...this.categories];
  }

  /**
   * Add a new category
   * @param {string} category New category name
   * @returns {boolean} True if added, false if already exists
   */
  addCategory(category) {
    if (!category || this.categories.includes(category)) {
      return false;
    }
    
    this.categories.push(category);
    this.saveToStorage();
    return true;
  }
}

// Create singleton instance
const notesStore = new NotesStore();
