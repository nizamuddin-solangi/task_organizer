var navbar = document.getElementById("header")
navbar.innerHTML=`
<header id="header">
      <div class="nav-custom container">
        <div class="brand">
          <img src="img/logo.png" alt="" class="logo">
          <div>Task Organizer</div>
        </div>
        <button class="mobile-menu-toggle" onclick="toggleMenu()">☰</button>
        <nav class="links" id="navLinks">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="features.html">Features</a>
          <a href="contact.html">Contact Us</a>
          <button class="btn-primary-custom"><a href="smart task organizer.html">Tasks</a></button>
        </nav>
      </div>
    </header>
`