var currentYear = new Date().getFullYear();
var eventsFetched = false;

var renderContent = (images, youtubes, soundclouds) => {
  var random = _.shuffle(images);
  var videoCollection = youtubes.map((embedCode) => {
    return `<iframe class="youtube-item" data-embed="${embedCode}"
      frameborder="0"
      allow="autoplay;
      encrypted-media"
      allowfullscreen></iframe>`
    });
  var soundcloudCollection = soundclouds.map((trackId) => {
    return `<iframe class="soundcloud-item" data-track="${trackId}" frameborder="0"></iframe>`
  });
  var galleryCollection = random.map((image, idx) => {
    const cssClass = idx % 6 === 0 ? 'grid-item--width2' : '';
    return `<div class="grid-item ${cssClass}">
              <img id="item-${idx}" src="images/${image}" alt="..." />
            </div>`;
  });
  
  $('.video-content').html(videoCollection.join(''));
  $('.soundcloud-content').html(soundcloudCollection.join(''));
  $('.grid').html(galleryCollection.join(''));

  $('.nav-link').on('click', function (evt) {
    evt.preventDefault();
    var activeSection = $(this).attr('data-id');
    $('section').hide();
    $('.nav-item').removeClass('active');
    $(this).parent('li').addClass('active');
    $('#' + activeSection).show();

    // Fetch events only once on first click
    if (activeSection === 'eventsSection' && !eventsFetched) {
      renderEvents();
      eventsFetched = true;
    }

    if (activeSection === 'mediaSection') {  
      setTimeout(function() {
        // Initialize YouTube videos on first load
        $('.youtube-item').each(function(idx, element) {
          const $iframe = $(this);
          if (!$iframe.attr('src')) {
            const embedCode = $iframe.attr('data-embed');
            $iframe.attr('src', `https://www.youtube.com/embed/${embedCode}`);
          }
        });
        
        // Initialize SoundCloud players on first load
        $('.soundcloud-item').each(function(idx, element) {
          const $iframe = $(this);
          if (!$iframe.attr('src')) {
            const trackId = $iframe.attr('data-track');
            const template =`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
            $iframe.attr('src', template);
          }
        });
        
        // Trigger resize event for embeds to render properly
        window.dispatchEvent(new Event('resize'));
      }, 500);    
    }

    // replace manual removeClass('show') with proper Bootstrap collapse API
    var $collapse = $('#primaryNavToggler');
    var $toggler = $('.navbar-toggler');

    if ($collapse.length) {
      // request collapse hide (Bootstrap will animate)
      $collapse.collapse('hide');

      // when fully hidden ensure toggler returns to collapsed state / aria
      $collapse.one('hidden.bs.collapse', function () {
        $toggler.addClass('collapsed').attr('aria-expanded', 'false');
      });

      // as a safety fallback, force collapsed state shortly after click
      setTimeout(function () {
        $toggler.addClass('collapsed').attr('aria-expanded', 'false');
        $collapse.removeClass('show');
      }, 350);
    }

    if (activeSection === 'gallerySection') {
      $grid.masonry('layout');
    }
  });

  $('.grid').on('click', function (evt) {
    evt.preventDefault();
    
    if (evt.target.tagName === 'IMG') {
      $('.pic-modal').css('display', 'flex');
      $('body').addClass('modal-open');
      $('.opacity-layer').show();
      let str = evt.target.id.replace('item-', '');
      let idx = parseInt(str);
      let template = `<img alt="..." src="images/${random[idx]}" />`;
      $('.pic-modal-inner').html(template);
      $('#prev, #next').attr('data-index', str);
    }
  });

  $('.close, .opacity-layer').on('click', function () {
    $('.pic-modal, .opacity-layer').hide();
    $('body').removeClass('modal-open');
  });

  $('#prev, #next').on('click', function () {
    var myAttr = $(this).attr('data-index');
    var type = $(this).attr('id');
    var idx = type === 'next' ? parseInt(myAttr) + 1 : parseInt(myAttr) - 1;

    if (idx === random.length) {
      idx = 0;
    }

    if (idx < 0) {
      idx = random.length - 1;
    }

    let template = `<img alt="..." src="images/${random[idx]}" />`;
    $('.pic-modal-inner').html(template);
    $('#prev, #next').attr('data-index', idx);
  })

  setTimeout(() => {
    $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      columnWidth: 200,
      gutter: 10,
      isFitWidth: false
    });
  });

};

var renderEvents = () => {
  const appId = '817663ab377e14aae6be7b2c61a3bfd8';
  const artistId = '15626560';
  const apiUrl = `https://rest.bandsintown.com/artists/id_${artistId}/events?app_id=${appId}&date=upcoming`;

  $.ajax({
    dataType: 'json',
    url: apiUrl,
    crossDomain: true,
    success: function(events) {
      if (events && events.length > 0) {
        var eventsCollection = events.map((event) => {
          const eventDate = new Date(event.datetime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const eventDateObj = new Date(event.starts_at);
          const startTime = eventDateObj.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true
          });
          // Compute EST or EDT based on the event date
          const tzString = eventDateObj.toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            timeZoneName: 'short'
          });
          const tzName = tzString.split(' ').pop();
          // same as event.title
          // const venueName = event.venue.name;
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
        });
        $('.events-content').html(eventsCollection.join(''));
      } else {
        $('.events-content').html('<p>No upcoming events at this time.</p>');
      }
    },
    error: function(err) {
      console.error('Error fetching events:', err);
      $('.events-content').html('<p>Unable to load events. Please try again later.</p>');
    },
    cache: false
  });
};

$(function () {
  $('section').hide();
  $('#homeSection').show();
  
  $.ajax( {
    dataType: 'json',
    url: "data/data.json",
    success: function(data) {
      const { images, youtubes, soundclouds } = data;
      renderContent(images, youtubes, soundclouds);
    },
    error: function (err) {
      console.error(err)
    },
    cache: false
  })

  $('footer .year').text(currentYear);
});