
var currentYear = new Date().getFullYear();

var renderContent = (images, youtubes, soundclouds, projects) => {

  const href = location.href;
  const start = href.indexOf('=') + 1;
  const end = href.length;
  const sectionId = href.slice(start, end);

  var random = _.shuffle(images);
  var videoCollection = youtubes.map((embedCode) => {
    return `<iframe src="https://www.youtube.com/embed/${embedCode}"
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
  var projectCollection = projects.map((project) => {
    return `<li>
      <div class="info">
        <h4><a href="/project.html?id=${project.id}">${project.title}</a></h4>
        <div>${project.date} &bull; ${project.location}</div>
        <div class="summary">${project.summary}</div>
        <a href="/project.html?id=${project.id}">View details »</a>
      </div>
      <div class="thumb">
        <img src="images/${project.thumbnail}" alt="..." />
      </div>
    </li>`;
  })
  
  $('.video-content').html(videoCollection.join(''));
  $('.soundcloud-content').html(soundcloudCollection.join(''));
  $('.project-content').html(projectCollection.join(''));
  $('.grid').html(galleryCollection.join(''));

  $('.nav-link').on('click', function (evt) {
    evt.preventDefault();
    var activeSection = $(this).attr('data-id');
    $('section').hide();
    $('.nav-item').removeClass('active');
    $(this).parent('li').addClass('active');
    $('#' + activeSection).show();

    if (activeSection === 'mediaSection') {  
      setTimeout(function() {
        $('.soundcloud-item').each(function(idx, element) {
          const trackId = $(element).attr('data-track');
          const template =`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
          $(this).attr('src', template);
        });
      }, 500);    
    }

    setTimeout(function () {
      $('#primaryNavToggler').removeClass('show')
    }, 200);

    if (activeSection === 'gallerySection') {
      $grid.masonry('layout');
    }
  });

  if (sectionId === 'media') {
    $('.nav-link').each((idx, item) => {
        const isMediaSection = $(item).attr('data-id') === 'mediaSection';
        if (isMediaSection) {
          $(item).trigger('click');
          window.history.pushState(null, null, '/')
        }
    })
  }

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

  $('.close, .opacity-layer').click(function () {
    $('.pic-modal, .opacity-layer').hide();
    $('body').removeClass('modal-open');
  });

  $('#prev, #next').click(function () {
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
      isFitWidth: true
    });
  });

};

$(function () {
  $('section').hide();
  $('#homeSection').show();
  
  $.ajax( {
    dataType: 'json',
    url: "data/data.json",
    success: function(data) {
      const { images, youtubes, soundclouds, projects } = data;
      renderContent(images, youtubes, soundclouds, projects);    
    },
    error: function (err) {
      console.error(err)
    },
    cache: false
  })

  
  $('footer .year').text(currentYear);
});