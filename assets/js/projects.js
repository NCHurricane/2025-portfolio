fetch("data/projects.json")
  .then(res => res.json())
  .then(projects => {
    const container = document.getElementById("project-grid");
    projects.forEach(project => {
      container.innerHTML += `
        <div class="col-md-6 col-lg-3 mb-4">
          <a href="video-detail.html?id=${project.id}" class="text-decoration-none">
            <div class="video-card">
              <img src="${project.thumbnail}" alt="${project.title}" loading="lazy" class="img-fluid" />
              <i class="fa-regular fa-circle-play play-icon"></i>
            </div></a>
            <h5 class="mt-2 text-light"><strong>${project.title}</strong></h5>
            <hr>
            <h6><span style="color: aqua;">CLIENT:</span>&nbsp;${project.client}<br /><span style="color: aqua;">MAIN SOFTWARE:</span>&nbsp;${project.primaryTool}<br /><span style="color: aqua;">DELIVER DATE:</span>&nbsp;<em>${project.mdyDate}</em></h6>
        </div>
      `;
    });
  })
  .catch(err => {
    console.error("Error loading projects:", err);
    document.getElementById("project-grid").innerHTML =
      "<p class='text-danger'>Unable to load video projects.</p>";
  });
