fetch("data/gallery.json")
  .then(res => res.json())
  .then(images => {
    const container = document.getElementById("galleryGrid");
    images.forEach(img => {
      const col = document.createElement("div");
      col.className = "col-6 col-md-4 col-lg-3 mb-4 gallery-item";

      const fullCaption =
        `<h5>${img.caption}</h5>` +
        `<p class="lb-caption">${img.impDate || img.date} &bull; ` +
        `${img.location} &bull; ` +
        `${img.camera}</p>`;

      const escapedCaption = fullCaption.replace(/"/g, '&quot;');

      col.innerHTML = `
        <a href="${img.full}"
           data-lightbox="gallery"
           data-title="${escapedCaption}">
           <div class="gallery-pic">
          <img src="${img.thumb}"
               alt="${img.caption}"
               loading="lazy"
               class="img-fluid rounded shadow-sm" />
               </div>
        </a>
        <h5 class="mt-2"><strong><strong>${img.caption}</strong><div></h5>
        <hr>
      `;

      container.appendChild(col);
    });
  })
  .catch(err => {
    console.error("Failed to load gallery:", err);
    document.getElementById("galleryGrid")
      .innerHTML = "<p class='text-danger'>Unable to load photo gallery.</p>";
  });
