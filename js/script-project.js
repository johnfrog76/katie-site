
var renderProject = (projects) => {
  const href = location.href;
  const start = href.indexOf('=') + 1;
  const end = href.length;
  const id = href.slice(start, end);

  const template = projects.find((project) => project.id === id);

  const card = `
    <div class="card-item">
      <div class="top">
        <img src="images/{0}" alt="..." />
      </div>
      <div class="body">
        <span class="caption">{1}</span>
      </div>
    </div>
  `;

  const videoTemplate = `<iframe src="https://www.youtube.com/embed/{0}"
      frameborder="0"
      allow="autoplay;
      encrypted-media"
      allowfullscreen></iframe>
  `;
  
  const markup = `
    <div>
      <div class="info">
        <h3>${template.title}</h3>
        <div>${template.location} &bull; ${template.date}</div>
      </div>
      <div class="details">${template.description}</div>
      <div class="card">
        ${template.photos.map((item) => {
          return card.replace('{0}', item.img).replace('{1}', item.caption);
        }).join('')}
      </div>
      <div>
      <div class="video-content">
        ${template.youtube.map((item) => {
          return videoTemplate.replace('{0}', item);
        }).join('')}
      </div>
    </div>`;
  
  
  $('.project-content-details').html(markup);
};

$(function () {
  
  $.ajax( {
    dataType: 'json',
    url: "data/data.json",
    success: function(data) {
      const { projects } = data;
      renderProject(projects);    
    },
    error: function (err) {
      console.error(err)
    },
    cache: false
  })
  
});