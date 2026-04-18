// ============================================
// Site Controller - Centralized state & logic
// ============================================

const SiteController = {
  CONFIG: {
    DEFAULT_PAGE_TITLE: 'Katie Webster | Alto Saxophone',
    BANDSINTOWN_APP_ID: '817663ab377e14aae6be7b2c61a3bfd8',
    BANDSINTOWN_ARTIST_ID: '15626560',
    BANDSINTOWN_ENDPOINT: 'https://rest.bandsintown.com/artists',
    SOUNDCLOUD_PLAYER_URL: 'https://w.soundcloud.com/player/',
    YOUTUBE_CDN: 'https://www.youtube.com/embed/',
    KIT_FORM_ENDPOINT: 'https://app.kit.com/forms/9264676/subscriptions',
    TIMEOUTS: {
      MEDIA_INIT: 800,
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
    SECTION_TITLES: {
      'homeSection': 'Katie Webster | Alto Saxophone',
      'aboutSection': 'Katie Webster | About',
      'mediaSection': 'Katie Webster | Media',
      'gallerySection': 'Katie Webster | Gallery',
      'eventsSection': 'Katie Webster | Events'
    },
    // Feature flags
    FEATURES: {
      EMAIL_SIGNUP_ENABLED: true,
      BANDSINTOWN_API_ENABLED: true,
      ANALYTICS_ENABLED: true
    },
    // DOM Selectors & Classes
    STRINGS: {
      // Section IDs
      SECTION_TAG: 'section',
      HOME_SECTION: 'homeSection',
      ABOUT_SECTION: 'aboutSection',
      MEDIA_SECTION: 'mediaSection',
      GALLERY_SECTION: 'gallerySection',
      EVENTS_SECTION: 'eventsSection',
      
      // Navigation selectors
      NAV_LINK: '.nav-link',
      NAV_ITEM: '.nav-item',
      NAVBAR_TOGGLER: '.navbar-toggler',
      PRIMARY_NAV_TOGGLER: '#primaryNavToggler',
      
      // Gallery & modal selectors
      GRID: '.grid',
      GRID_ITEM: '.grid-item',
      GRID_ITEM_WIDE: 'grid-item--width2',
      GALLERY_IMG: '.grid img',
      IMAGE_PREFIX: 'item-',
      IMAGES_PATH: 'images/',
      PIC_MODAL: '.pic-modal',
      PIC_MODAL_INNER: '.pic-modal-inner',
      OPACITY_LAYER: '.opacity-layer',
      MODAL_PREV: '#prev',
      MODAL_NEXT: '#next',
      
      // Media selectors
      YOUTUBE_ITEM: '.youtube-item',
      SOUNDCLOUD_ITEM: '.soundcloud-item',
      VIDEO_CONTENT: '.video-content',
      SOUNDCLOUD_CONTENT: '.soundcloud-content',
      
      // Events selectors
      EVENTS_CONTENT: '.events-content',
      
      // Mailing list selectors
      MAILING_SIGNUP: '.mailing-signup',
      CK_EMAIL: '#ck-email',
      CK_MESSAGE: '#ck-message',
      CK_SUBMIT: '#ck-submit',
      
      // Utility selectors
      FOOTER_YEAR: 'footer .year',
      SCROLL_TOP_LINK: '.link-scroll-top',
      BODY: 'body',
      HTML_BODY: 'html, body',
      
      // CSS Classes
      CLASS_ACTIVE: 'active',
      CLASS_HIDDEN: 'hidden',
      CLASS_COLLAPSED: 'collapsed',
      CLASS_SHOW: 'show',
      CLASS_MODAL_OPEN: 'modal-open',
      
      // HTML Attributes & Events
      ATTR_DATA_ID: 'data-id',
      ATTR_DATA_INDEX: 'data-index',
      ATTR_DATA_EMBED: 'data-embed',
      ATTR_DATA_TRACK: 'data-track',
      ATTR_ARIA_EXPANDED: 'aria-expanded',
      ATTR_FALSE: 'false',
      
      // Events
      EVENT_HASHCHANGE: 'hashchange',
      EVENT_RESIZE: 'resize',
      EVENT_HIDDEN_COLLAPSE: 'hidden.bs.collapse',
      EVENT_PAGE_VIEW: 'page_view',
      EVENT_EMAIL_SIGNUP_SUCCESS: 'email_signup_success',
      EVENT_EMAIL_SIGNUP_ERROR: 'email_signup_error',
      
      // Animation
      ANIMATION_SWING: 'swing',
      DEFAULT_HASH: 'home',
      
      // Data & API
      DATA_URL: 'data/data.json',
      DATA_TYPE: 'json',
      
      // Error messages
      ERROR_LOADING_DATA: 'Error loading content data:',
      ERROR_LOADING_EVENTS: 'Unable to load events. Please try again later.',
      NO_UPCOMING_EVENTS: 'No upcoming events at this time.',
      EMAIL_SIGNUP_SUCCESS: `Thanks — I'll keep you posted.`,
      EMAIL_SIGNUP_ERROR: 'Unable to process signup. Please try again or contact directly.',
      EMAIL_INVALID: 'Please enter a valid email address',
      
      // CSS Variables
      CSS_ERROR_COLOR: 'var(--error-color)',
      CSS_SUCCESS_COLOR: 'var(--main-hyperlink-color)',
      
      // Localization
      LOCALE: 'en-US',
      TIMEZONE_NY: 'America/New_York'
    }
  },

  // State management
  state: {
    currentYear: new Date().getFullYear(),
    eventsFetched: false,
    $grid: null,
    imageData: null,
    resizeTimer: null,
    resizeAnimationId: null
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
    $(this.CONFIG.STRINGS.SECTION_TAG).hide();
    
    if (window.location.hash) {
      this.handleHashNavigation();
    } else {
      this.showSection(this.CONFIG.STRINGS.HOME_SECTION);
    }
  },

  loadContentData: function() {
    $.ajax({
      dataType: this.CONFIG.STRINGS.DATA_TYPE,
      url: this.CONFIG.STRINGS.DATA_URL,
      success: (data) => {
        // Shuffle images once on load, store permanently
        const shuffledImages = _.shuffle(data.images);
        this.state.imageData = {
          images: shuffledImages,
          youtubes: data.youtubes,
          soundclouds: data.soundclouds
        };
        this.renderContent(shuffledImages, data.youtubes, data.soundclouds);
        this.initMasonry();
      },
      error: (err) => console.error(this.CONFIG.STRINGS.ERROR_LOADING_DATA, err),
      cache: false
    });
  },

  // ============================================
  // Event Listeners Setup
  // ============================================

  setupEventListeners: function() {
    // Navigation links
    $(document).on('click', this.CONFIG.STRINGS.NAV_LINK, (evt) => {
      evt.preventDefault();
      const sectionId = $(evt.currentTarget).attr(this.CONFIG.STRINGS.ATTR_DATA_ID);
      const hash = this.CONFIG.SECTION_HASH_MAP[sectionId] || this.CONFIG.STRINGS.DEFAULT_HASH;
      window.location.hash = hash;
    });

    // Hash change
    $(window).on(this.CONFIG.STRINGS.EVENT_HASHCHANGE, () => this.handleHashNavigation());

    // Gallery image clicks
    $(document).on('click', this.CONFIG.STRINGS.GALLERY_IMG, (evt) => this.handleGalleryImageClick(evt));

    // Modal close
    $(document).on('click', `.close, ${this.CONFIG.STRINGS.OPACITY_LAYER}`, () => this.closeModal());

    // Modal navigation
    $(document).on('click', `${this.CONFIG.STRINGS.MODAL_PREV}, ${this.CONFIG.STRINGS.MODAL_NEXT}`, (evt) => this.handleModalNavigation(evt));

    // Scroll to top
    $(document).on('click', this.CONFIG.STRINGS.SCROLL_TOP_LINK, () => this.scrollToTop());

    // Window resize
    $(window).on(this.CONFIG.STRINGS.EVENT_RESIZE, () => this.handleWindowResize());

    // Mailing list signup (only if enabled)
    if (this.CONFIG.FEATURES.EMAIL_SIGNUP_ENABLED) {
      $(this.CONFIG.STRINGS.MAILING_SIGNUP).removeClass(this.CONFIG.STRINGS.CLASS_HIDDEN);
      $(document).on('click', this.CONFIG.STRINGS.CK_SUBMIT, () => this.handleMailingListSignup());
    } else {
      // Hide the signup form if disabled
      $(this.CONFIG.STRINGS.MAILING_SIGNUP).addClass(this.CONFIG.STRINGS.CLASS_HIDDEN);
    }
  },

  // ============================================
  // Navigation & Section Management
  // ============================================

  navigateToSection: function(sectionId) {
    this.showSection(sectionId);
    this.updatePageTitle(sectionId);
    this.closeNavbar();

    const sectionHash = this.CONFIG.SECTION_HASH_MAP[sectionId] || this.CONFIG.STRINGS.DEFAULT_HASH;
    const pageTitle = this.CONFIG.SECTION_TITLES[sectionId] || this.CONFIG.DEFAULT_PAGE_TITLE;
    gtag('event', this.CONFIG.STRINGS.EVENT_PAGE_VIEW, {
      'page_path': `/#${sectionHash}`,
      'page_title': pageTitle
    });

    // Section-specific logic
    if (sectionId === this.CONFIG.STRINGS.EVENTS_SECTION && !this.state.eventsFetched) {
      this.loadEvents();
      this.state.eventsFetched = true;
    }

    if (sectionId === this.CONFIG.STRINGS.MEDIA_SECTION) {
      this.initializeMedia();
    }

    if (sectionId === this.CONFIG.STRINGS.GALLERY_SECTION) {
      this.layoutMasonry();
    }
  },

  handleHashNavigation: function() {
    const hash = window.location.hash.slice(1);
    const sectionId = this.CONFIG.HASH_MAP[hash] || this.CONFIG.STRINGS.HOME_SECTION;
    this.navigateToSection(sectionId);
  },

  showSection: function(sectionId) {
    $(this.CONFIG.STRINGS.SECTION_TAG).hide();
    $(this.CONFIG.STRINGS.NAV_ITEM).removeClass(this.CONFIG.STRINGS.CLASS_ACTIVE);
    $(`[${this.CONFIG.STRINGS.ATTR_DATA_ID}="${sectionId}"]`).parent('li').addClass(this.CONFIG.STRINGS.CLASS_ACTIVE);
    $(`#${sectionId}`).show();
  },

  closeNavbar: function() {
    const $collapse = $(this.CONFIG.STRINGS.PRIMARY_NAV_TOGGLER);
    const $toggler = $(this.CONFIG.STRINGS.NAVBAR_TOGGLER);

    if ($collapse.length) {
      $collapse.collapse('hide');
      $collapse.one(this.CONFIG.STRINGS.EVENT_HIDDEN_COLLAPSE, () => {
        $toggler.addClass(this.CONFIG.STRINGS.CLASS_COLLAPSED).attr(this.CONFIG.STRINGS.ATTR_ARIA_EXPANDED, this.CONFIG.STRINGS.ATTR_FALSE);
      });

      setTimeout(() => {
        $toggler.addClass(this.CONFIG.STRINGS.CLASS_COLLAPSED).attr(this.CONFIG.STRINGS.ATTR_ARIA_EXPANDED, this.CONFIG.STRINGS.ATTR_FALSE);
        $collapse.removeClass(this.CONFIG.STRINGS.CLASS_SHOW);
      }, this.CONFIG.TIMEOUTS.NAVBAR_COLLAPSE);
    }
  },

  // ============================================
  // Content Rendering
  // ============================================

  renderContent: function(images, youtubes, soundclouds) {
    // Use pre-shuffled images (shuffled in loadContentData)

    // Render videos
    const videoHtml = youtubes.map((embedCode) => 
      `<iframe class="${this.CONFIG.STRINGS.YOUTUBE_ITEM.slice(1)}" ${this.CONFIG.STRINGS.ATTR_DATA_EMBED}="${embedCode}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`
    ).join('');
    $(this.CONFIG.STRINGS.VIDEO_CONTENT).html(videoHtml);

    // Render SoundCloud
    const soundcloudHtml = soundclouds.map((trackId) =>
      `<iframe class="${this.CONFIG.STRINGS.SOUNDCLOUD_ITEM.slice(1)}" ${this.CONFIG.STRINGS.ATTR_DATA_TRACK}="${trackId}" frameborder="0"></iframe>`
    ).join('');
    $(this.CONFIG.STRINGS.SOUNDCLOUD_CONTENT).html(soundcloudHtml);

    // Render gallery with error handling
    const galleryHtml = images.map((image, idx) => {
      const cssClass = idx % 6 === 0 ? this.CONFIG.STRINGS.GRID_ITEM_WIDE : '';
      return `
        <div class="grid-item ${cssClass}">
          <img
            id="${this.CONFIG.STRINGS.IMAGE_PREFIX}${idx}"
            src="${this.CONFIG.STRINGS.IMAGES_PATH}${image}"
            alt="..."
            onerror="this.style.opacity='0.5'; this.style.cursor='not-allowed'; this.title='Image failed to load';"
          />
        </div>`;
    }).join('');
    $(this.CONFIG.STRINGS.GRID).html(galleryHtml);
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
    $(this.CONFIG.STRINGS.YOUTUBE_ITEM).each((idx, element) => {
      const $iframe = $(element);
      if (!$iframe.attr('src')) {
        const embedCode = $iframe.attr(this.CONFIG.STRINGS.ATTR_DATA_EMBED);
        $iframe.attr('src', `${this.CONFIG.YOUTUBE_CDN}${embedCode}`);
      }
    });
  },

  loadSoundCloudIframes: function() {
    $(this.CONFIG.STRINGS.SOUNDCLOUD_ITEM).each((idx, element) => {
      const $iframe = $(element);
      if (!$iframe.attr('src')) {
        const trackId = $iframe.attr(this.CONFIG.STRINGS.ATTR_DATA_TRACK);
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
    } else if (this.state.$grid && this.state.$grid.masonry) {
      this.state.$grid.masonry('layout');
    }
  },

  layoutMasonry: function() {
    setTimeout(() => this.initMasonry(), this.CONFIG.TIMEOUTS.MASONRY_INIT);
  },

  handleGalleryImageClick: function(evt) {
    const shuffledImages = this.state.imageData.images;
    let str = evt.currentTarget.id.replace(this.CONFIG.STRINGS.IMAGE_PREFIX, '');
    let idx = parseInt(str);
    
    $(this.CONFIG.STRINGS.PIC_MODAL).css('display', 'flex');
    $(this.CONFIG.STRINGS.BODY).addClass(this.CONFIG.STRINGS.CLASS_MODAL_OPEN);
    $(this.CONFIG.STRINGS.OPACITY_LAYER).show();
    
    const template = `<img alt="..." src="${this.CONFIG.STRINGS.IMAGES_PATH}${shuffledImages[idx]}" />`;
    $(this.CONFIG.STRINGS.PIC_MODAL_INNER).html(template);
    $(`${this.CONFIG.STRINGS.MODAL_PREV}, ${this.CONFIG.STRINGS.MODAL_NEXT}`).attr(this.CONFIG.STRINGS.ATTR_DATA_INDEX, str);
  },

  handleModalNavigation: function(evt) {
    const shuffledImages = this.state.imageData?.images;
    if (!shuffledImages || !shuffledImages.length) return;
    
    let myAttr = $(evt.currentTarget).attr(this.CONFIG.STRINGS.ATTR_DATA_INDEX);
    let type = $(evt.currentTarget).attr('id');
    let idx = parseInt(myAttr);
    
    if (isNaN(idx)) idx = 0;
    idx = type === this.CONFIG.STRINGS.MODAL_NEXT.slice(1) ? idx + 1 : idx - 1;

    // Wrap around
    if (idx === shuffledImages.length) idx = 0;
    if (idx < 0) idx = shuffledImages.length - 1;

    const template = `<img alt="..." src="${this.CONFIG.STRINGS.IMAGES_PATH}${shuffledImages[idx]}" />`;
    $(this.CONFIG.STRINGS.PIC_MODAL_INNER).html(template);
    $(`${this.CONFIG.STRINGS.MODAL_PREV}, ${this.CONFIG.STRINGS.MODAL_NEXT}`).attr(this.CONFIG.STRINGS.ATTR_DATA_INDEX, idx);
  },

  closeModal: function() {
    $(`${this.CONFIG.STRINGS.PIC_MODAL}, ${this.CONFIG.STRINGS.OPACITY_LAYER}`).hide();
    $(this.CONFIG.STRINGS.BODY).removeClass(this.CONFIG.STRINGS.CLASS_MODAL_OPEN);
  },

  // ============================================
  // Events Section
  // ============================================

  loadEvents: function() {
    const apiUrl = `${this.CONFIG.BANDSINTOWN_ENDPOINT}/id_${this.CONFIG.BANDSINTOWN_ARTIST_ID}/events?app_id=${this.CONFIG.BANDSINTOWN_APP_ID}&date=upcoming`;

    $.ajax({
      dataType: this.CONFIG.STRINGS.DATA_TYPE,
      url: apiUrl,
      crossDomain: true,
      success: (events) => this.renderEvents(events),
      error: () => {
        $(this.CONFIG.STRINGS.EVENTS_CONTENT).html(`<p>${this.CONFIG.STRINGS.ERROR_LOADING_EVENTS}</p>`);
      },
      cache: false
    });
  },

  renderEvents: function(events) {
    if (!events || events.length === 0) {
      $(this.CONFIG.STRINGS.EVENTS_CONTENT).html(`<p>${this.CONFIG.STRINGS.NO_UPCOMING_EVENTS}</p>`);
      return;
    }

    const eventsHtml = events.map((event) => this.formatEventItem(event)).join('');
    $(this.CONFIG.STRINGS.EVENTS_CONTENT).html(eventsHtml);
  },

  formatEventItem: function(event) {
    const eventDate = new Date(event.datetime).toLocaleDateString(this.CONFIG.STRINGS.LOCALE, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const eventDateObj = new Date(event.starts_at);
    const startTime = eventDateObj.toLocaleTimeString(this.CONFIG.STRINGS.LOCALE, { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const tzString = eventDateObj.toLocaleString(this.CONFIG.STRINGS.LOCALE, { 
      timeZone: this.CONFIG.STRINGS.TIMEZONE_NY,
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
    $(this.CONFIG.STRINGS.HTML_BODY).animate({ scrollTop: 0 }, 600, this.CONFIG.STRINGS.ANIMATION_SWING);
  },

  handleWindowResize: function() {
    // Cancel previous resize animation
    if (this.state.resizeAnimationId) {
      cancelAnimationFrame(this.state.resizeAnimationId);
    }

    this.state.resizeAnimationId = requestAnimationFrame(() => {
      if (this.state.$grid?.masonry) {
        this.state.$grid.masonry('layout');
      }
    });
  },

  updateFooterYear: function() {
    $(this.CONFIG.STRINGS.FOOTER_YEAR).text(this.state.currentYear);
  },

  updatePageTitle: function(sectionId) {
    const title = this.CONFIG.SECTION_TITLES[sectionId] || this.CONFIG.DEFAULT_PAGE_TITLE;
    document.title = title;
  },

  handleMailingListSignup: function() {
    const email = $(this.CONFIG.STRINGS.CK_EMAIL).val().trim();
    const $msg = $(this.CONFIG.STRINGS.CK_MESSAGE);
    const $submit = $(this.CONFIG.STRINGS.CK_SUBMIT);

    if (!email || !email.includes('@')) {
      $msg.text(this.CONFIG.STRINGS.EMAIL_INVALID).css('color', this.CONFIG.STRINGS.CSS_ERROR_COLOR);
      return;
    }

    $submit.prop('disabled', true).text('...');

    $.ajax({
      url: this.CONFIG.KIT_FORM_ENDPOINT,
      method: 'POST',
      data: { email_address: email },
      success: () => {
        gtag('event', this.CONFIG.STRINGS.EVENT_EMAIL_SIGNUP_SUCCESS, {
          'engagement_type': 'email_signup'
        });
        $msg.text(this.CONFIG.STRINGS.EMAIL_SIGNUP_SUCCESS).css('color', this.CONFIG.STRINGS.CSS_SUCCESS_COLOR);
        $(this.CONFIG.STRINGS.CK_EMAIL).val('');
      },
      error: (xhr, status, error) => {
        console.error('Email signup error:', status, error);
        gtag('event', this.CONFIG.STRINGS.EVENT_EMAIL_SIGNUP_ERROR, {
          'error_type': status,
          'error_message': error,
          'engagement_type': 'email_signup'
        });
        $msg.text(this.CONFIG.STRINGS.EMAIL_SIGNUP_ERROR).css('color', this.CONFIG.STRINGS.CSS_ERROR_COLOR);
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