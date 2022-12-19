
var currentYear = new Date().getFullYear();
var images = [
  'bern10.jpg',
  'bern11.jpg',
  'bhs1.jpg',
  'ee-award.jpg',
  'emergingArtistFest.jpg',
  'friends10.jpg',
  'IMG_0108.jpg',
  'IMG_0264.jpg',
  'IMG_0265.jpg',
  'IMG_0280.jpg',
  'IMG_04172.jpg',
  'IMG_4675.jpg',
  'IMG_5472.jpg',
  'katie-bg.jpg',
  'katie1.jpg',
  'katie2.jpg',
  'keys10.jpg',
  'kw-alto1.jpg',
  'kw9.jpg',
  'mjf1.jpg',
  'mjf2.jpg',
  'monterey1.jpg',
  'royalroom.jpg',
  'sketch1.jpg',
  'sketch2.jpg',
  'sketch3.jpg',
  'sketch10.jpg',
  'sketch11.jpg',
  'vermont1.jpg',
  'vermont2.jpg'
];

var random = _.shuffle(images);

$(function () {
  $('section').hide();
  $('#homeSection').show();

  $('.nav-link').on('click', function (evt) {
    evt.preventDefault();
    var activeSection = $(this).attr('data-id');
    $('section').hide();
    $('.nav-item').removeClass('active');
    $(this).parent('li').addClass('active');
    $('#' + activeSection).show();

    setTimeout(function () {
      $('#primaryNavToggler').removeClass('show')
    }, 200);

    if (activeSection === 'gallerySection') {
      $grid.masonry('layout');
    }
  });

  let markup = '';
  for (let i = 0; i < random.length; i++) {
    if (i % 6 === 0) {
      markup += `<div class="grid-item grid-item--width2">
      <img id="item-${i}" src="images/${random[i]}" alt="..." />
    </div>`;
    } else {
      markup += `<div class="grid-item">
        <img id="item-${i}" src="images/${random[i]}" alt="..." />
      </div>`;

    }
  }

  $('.grid').html(markup);
  $('footer .year').text(currentYear);

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

});


