// ============================================
// Site Controller - Centralized state & logic
// ============================================

const SiteController = {
  // Configuration constants
  CONFIG: {
    BANDSINTOWN_APP_ID: '817663ab377e14aae6be7b2c61a3bfd8',
    BANDSINTOWN_ARTIST_ID: '15626560',
    BANDSINTOWN_ENDPOINT: 'https://rest.bandsintown.com/artists',
    SOUNDCLOUD_PLAYER_URL: 'https://w.soundcloud.com/player/',
    YOUTUBE_CDN: 'https://www.youtube.com/embed/',
    TIMEOUTS: {
      MEDIA_INIT: 500,
      MASONRY_INIT: 100,
      NAVBAR_COLLAPSE: 350,
      RESIZE_DEBOUNCE: 250
    },
    MASONRY_OPTIONS: {
      itemSelector: '.grid-item',
      columnWidth: 200,
      gutter: 10,
      isFitWidth: false
    },
    HASH_MAP: {
      'home': 'homeSection',
      'about': 'aboutSection',
      'media': 'mediaSection',
      'gallery': 'gallerySection',
      'events': 'eventsSection'
    },
    SECTION_HASH_MAP: {
      'homeSection': 'home',
      'aboutSection': 'about',
      'mediaSection': 'media',
      'gallerySection': 'gallery',
      'eventsSection': 'events'
    },
    // Feature flags
    FEATURES: {
      EMAIL_SIGNUP_ENABLED: false
    }
  },

  // State management
  state: {
    currentYear: new Date().getFullYear(),
    eventsFetched: false,
    $grid: null,
    imageData: null,
    resizeTimer: null
  },

  // ============================================
  // Initialization
  // ============================================

  init: function() {
    this.setupInitialView();
    this.loadContentData();
    this.setupEventListeners();
    this.updateFooterYear();
  },

  setupInitialView: function() {
    $('section').hide();
    
    if (window.location.hash) {
      this.handleHashNavigation();
    } else {
      this.showSection('homeSection');
    }
  },

  loadContentData: function() {
    $.ajax({
      dataType: 'json',
      url: 'data/data.json',
      success: (data) => {
        this.state.imageData = data;
        this.renderContent(data.images, data.youtubes, data.soundclouds);
      },
      error: (err) => console.error('Error loading content data:', err),
      cache: false
    });
  },

  // ============================================
  // Event Listeners Setup
  // ============================================

  setupEventListeners: function() {
    // Navigation links
    $(document).on('click', '.nav-link', (evt) => {
      evt.preventDefault();
      const sectionId = $(evt.currentTarget).attr('data-id');
      const hash = this.CONFIG.SECTION_HASH_MAP[sectionId] || 'home';
      window.location.hash = hash;
      this.navigateToSection(sectionId);
    });

    // Hash change
    $(window).on('hashchange', () => this.handleHashNavigation());

    // Gallery image clicks
    $(document).on('click', '.grid img', (evt) => this.handleGalleryImageClick(evt));

    // Modal close
    $(document).on('click', '.close, .opacity-layer', () => this.closeModal());

    // Modal navigation
    $(document).on('click', '#prev, #next', (evt) => this.handleModalNavigation(evt));

    // Scroll to top
    $(document).on('click', '.link-scroll-top', () => this.scrollToTop());

    // Window resize
    $(window).on('resize', () => this.handleWindowResize());

    // Mailing list signup (only if enabled)
    if (this.CONFIG.FEATURES.EMAIL_SIGNUP_ENABLED) {
      $('.mailing-signup').removeClass('hidden');
      $(document).on('click', '#ck-submit', () => this.handleMailingListSignup());
    } else {
      // Hide the signup form if disabled
      $('.mailing-signup').addClass('hidden');
    }
  },

  // ============================================
  // Navigation & Section Management
  // ============================================

  navigateToSection: function(sectionId) {
    this.showSection(sectionId);
    this.closeNavbar();

    // Section-specific logic
    if (sectionId === 'eventsSection' && !this.state.eventsFetched) {
      this.loadEvents();
      this.state.eventsFetched = true;
    }

    if (sectionId === 'mediaSection') {
      this.initializeMedia();
    }

    if (sectionId === 'gallerySection') {
      this.layoutMasonry();
    }
  },

  handleHashNavigation: function() {
    const hash = window.location.hash.slice(1);
    const sectionId = this.CONFIG.HASH_MAP[hash] || 'homeSection';
    this.navigateToSection(sectionId);
  },

  showSection: function(sectionId) {
    $('section').hide();
    $('.nav-item').removeClass('active');
    $(`[data-id="${sectionId}"]`).parent('li').addClass('active');
    $(`#${sectionId}`).show();
  },

  closeNavbar: function() {
    const $collapse = $('#primaryNavToggler');
    const $toggler = $('.navbar-toggler');

    if ($collapse.length) {
      $collapse.collapse('hide');
      $collapse.one('hidden.bs.collapse', () => {
        $toggler.addClass('collapsed').attr('aria-expanded', 'false');
      });

      setTimeout(() => {
        $toggler.addClass('collapsed').attr('aria-expanded', 'false');
        $collapse.removeClass('show');
      }, this.CONFIG.TIMEOUTS.NAVBAR_COLLAPSE);
    }
  },

  // ============================================
  // Content Rendering
  // ============================================

  renderContent: function(images, youtubes, soundclouds) {
    const shuffledImages = _.shuffle(images);
    this.state.imageData = { images: shuffledImages, youtubes, soundclouds };

    // Render videos
    const videoHtml = youtubes.map((embedCode) => 
      `<iframe class="youtube-item" data-embed="${embedCode}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    ).join('');
    $('.video-content').html(videoHtml);

    // Render SoundCloud
    const soundcloudHtml = soundclouds.map((trackId) =>
      `<iframe class="soundcloud-item" data-track="${trackId}" frameborder="0"></iframe>`
    ).join('');
    $('.soundcloud-content').html(soundcloudHtml);

    // Render gallery
    const galleryHtml = shuffledImages.map((image, idx) => {
      const cssClass = idx % 6 === 0 ? 'grid-item--width2' : '';
      return `<div class="grid-item ${cssClass}">
                <img id="item-${idx}" src="images/${image}" alt="..." />
              </div>`;
    }).join('');
    $('.grid').html(galleryHtml);

    // Initialize Masonry
    setTimeout(() => this.initMasonry(), this.CONFIG.TIMEOUTS.MASONRY_INIT);
  },

  // ============================================
  // Media Section
  // ============================================

  initializeMedia: function() {
    setTimeout(() => {
      this.loadYouTubeIframes();
      this.loadSoundCloudIframes();
      window.dispatchEvent(new Event('resize'));
    }, this.CONFIG.TIMEOUTS.MEDIA_INIT);
  },

  loadYouTubeIframes: function() {
    $('.youtube-item').each((idx, element) => {
      const $iframe = $(element);
      if (!$iframe.attr('src')) {
        const embedCode = $iframe.attr('data-embed');
        $iframe.attr('src', `${this.CONFIG.YOUTUBE_CDN}${embedCode}`);
      }
    });
  },

  loadSoundCloudIframes: function() {
    $('.soundcloud-item').each((idx, element) => {
      const $iframe = $(element);
      if (!$iframe.attr('src')) {
        const trackId = $iframe.attr('data-track');
        const src = `${this.CONFIG.SOUNDCLOUD_PLAYER_URL}?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
        $iframe.attr('src', src);
      }
    });
  },

  // ============================================
  // Gallery & Modal
  // ============================================

  initMasonry: function() {
    if (!this.state.$grid) {
      this.state.$grid = $('.grid').masonry(this.CONFIG.MASONRY_OPTIONS);
    } else {
      this.state.$grid.masonry('layout');
    }
  },

  layoutMasonry: function() {
    setTimeout(() => this.initMasonry(), this.CONFIG.TIMEOUTS.MASONRY_INIT);
  },

  handleGalleryImageClick: function(evt) {
    const shuffledImages = this.state.imageData.images;
    let str = evt.currentTarget.id.replace('item-', '');
    let idx = parseInt(str);
    
    $('.pic-modal').css('display', 'flex');
    $('body').addClass('modal-open');
    $('.opacity-layer').show();
    
    const template = `<img alt="..." src="images/${shuffledImages[idx]}" />`;
    $('.pic-modal-inner').html(template);
    $('#prev, #next').attr('data-index', str);
  },

  handleModalNavigation: function(evt) {
    const shuffledImages = this.state.imageData.images;
    let myAttr = $(evt.currentTarget).attr('data-index');
    let type = $(evt.currentTarget).attr('id');
    let idx = type === 'next' ? parseInt(myAttr) + 1 : parseInt(myAttr) - 1;

    // Wrap around
    if (idx === shuffledImages.length) idx = 0;
    if (idx < 0) idx = shuffledImages.length - 1;

    const template = `<img alt="..." src="images/${shuffledImages[idx]}" />`;
    $('.pic-modal-inner').html(template);
    $('#prev, #next').attr('data-index', idx);
  },

  closeModal: function() {
    $('.pic-modal, .opacity-layer').hide();
    $('body').removeClass('modal-open');
  },

  // ============================================
  // Events Section
  // ============================================

  loadEvents: function() {
    const apiUrl = `${this.CONFIG.BANDSINTOWN_ENDPOINT}/id_${this.CONFIG.BANDSINTOWN_ARTIST_ID}/events?app_id=${this.CONFIG.BANDSINTOWN_APP_ID}&date=upcoming`;

    $.ajax({
      dataType: 'json',
      url: apiUrl,
      crossDomain: true,
      success: (events) => this.renderEvents(events),
      error: (err) => {
        console.error('Error fetching events:', err);
        $('.events-content').html('<p>Unable to load events. Please try again later.</p>');
      },
      cache: false
    });
  },

  renderEvents: function(events) {
    if (!events || events.length === 0) {
      $('.events-content').html('<p>No upcoming events at this time.</p>');
      return;
    }

    const eventsHtml = events.map((event) => this.formatEventItem(event)).join('');
    $('.events-content').html(eventsHtml);
  },

  formatEventItem: function(event) {
    const eventDate = new Date(event.datetime).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const eventDateObj = new Date(event.starts_at);
    const startTime = eventDateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const tzString = eventDateObj.toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });
    const tzName = tzString.split(' ').pop();

    const city = event.venue.city;
    const region = event.venue.region ? `, ${event.venue.region}` : '';
    const address = event.venue.street_address || '';

    return `<div class="event-item">
              <p>
                <strong>${event.title}</strong><br>
                <span>${eventDate} at ${startTime} ${tzName}</span><br>
                ${address ? `<span>${address} - ${city}${region}</span><br>` : ''}
                ${event.description ? `<span>${event.description}</span><br>` : ''}
                <a href="${event.url}" target="_blank" rel="noopener noreferrer">View on Bandsintown</a>
              </p>
            </div>`;
  },

  // ============================================
  // Utility Functions
  // ============================================

  scrollToTop: function() {
    $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
  },

  handleWindowResize: function() {
    clearTimeout(this.state.resizeTimer);
    this.state.resizeTimer = setTimeout(() => {
      if (this.state.$grid && this.state.$grid.masonry) {
        this.state.$grid.masonry('layout');
      }
    }, this.CONFIG.TIMEOUTS.RESIZE_DEBOUNCE);
  },

  updateFooterYear: function() {
    $('footer .year').text(this.state.currentYear);
  },

  handleMailingListSignup: function() {
    const email = $('#ck-email').val().trim();
    const $msg = $('#ck-message');
    const $submit = $('#ck-submit');

    if (!email || !email.includes('@')) {
      $msg.text('Please enter a valid email address').css('color', 'var(--error-color)');
      return;
    }

    $submit.prop('disabled', true).text('...');

    $.ajax({
      url: 'https://app.kit.com/forms/9264676/subscriptions',
      method: 'POST',
      data: { email_address: email },
      success: () => {
        $msg.text("Thanks — I'll keep you posted.").css('color', 'var(--main-hyperlink-color)');
        $('#ck-email').val('');
      },
      error: () => {
        $msg.text('Something went wrong. Please try again.').css('color', 'var(--error-color)');
      },
      complete: () => {
        $submit.prop('disabled', false).text('Sign Up');
      }
    });
  }
};

// Initialize when DOM is ready
$(function() {
  SiteController.init();
});