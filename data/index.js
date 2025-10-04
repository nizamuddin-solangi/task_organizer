 
        function toggleMenu() {
          document.getElementById("navLinks").classList.toggle("active");
          
        }
          const emailInput = document.getElementById("emailInput");
  const subBtn = document.getElementById("sub");
  const message = document.getElementById("message");

  subBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length < 1) {
      message.style.display = "block";
      message.style.color = "red";
      message.textContent = "❌ Please enter a email address.";
      return;
    }

    if (!emailPattern.test(email)) {
      message.style.display = "block";
      message.style.color = "red";
      message.textContent = "❌ Please enter a valid email address.";
      return;
    }

    message.style.display = "block";
    message.style.color = "green";
    message.textContent = "✅ Thank you for subscribing!";
    emailInput.value = "";
  });

    const modal = document.getElementById("premiumModal");
    const btn = document.getElementById("premiumBtn");
    const span = document.querySelector(".close");
    const form = document.getElementById("checkoutForm");
    const successMsg = document.getElementById("successMsg");

    // Open modal
    btn.onclick = () => {
      modal.style.display = "block";
    };

    // Close modal
    span.onclick = () => closeModal();
    window.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    function closeModal() {
      modal.style.display = "none";
      form.reset();
      successMsg.style.display = "none";
      form.querySelectorAll(".error-msg").forEach(el => el.remove());
    }

    // Validation functions
    function validateName(input) {
      return /^[A-Za-z ]{3,}$/.test(input.value.trim());
    }
    function validateCard(input) {
      return /^\d{16}$/.test(input.value.trim());
    }
    function validateExpiry(input) {
      return /^\d{2}\/\d{2}$/.test(input.value.trim());
    }
    function validateCVC(input) {
      return /^\d{3,}$/.test(input.value.trim());
    }

    // Show error message
    function showError(input, message) {
      removeError(input);
      input.style.border = "1px solid red";
      const error = document.createElement("small");
      error.className = "error-msg";
      error.style.color = "red";
      error.textContent = message;
      input.insertAdjacentElement("afterend", error);
    }

    // Remove error
    function removeError(input) {
      input.style.border = "1px solid #ccc";
      const next = input.nextElementSibling;
      if (next && next.classList.contains("error-msg")) {
        next.remove();
      }
    }

    // Real-time validation
    const [name, card, expiry, cvc] = form.querySelectorAll("input");

    name.addEventListener("input", () => {
      validateName(name) ? removeError(name) : showError(name, "Only letters, min 3 chars");
    });

    card.addEventListener("input", () => {
      validateCard(card) ? removeError(card) : showError(card, "Card number must be 16 digits");
    });

    expiry.addEventListener("input", () => {
      validateExpiry(expiry) ? removeError(expiry) : showError(expiry, "Format: MM/YY");
    });

    cvc.addEventListener("input", () => {
      validateCVC(cvc) ? removeError(cvc) : showError(cvc, "CVC must be at least 3 digits");
    });

    // Final check on submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      if (!validateName(name)) { showError(name, "Only letters, min 3 chars"); valid = false; }
      if (!validateCard(card)) { showError(card, "Card number must be 16 digits"); valid = false; }
      if (!validateExpiry(expiry)) { showError(expiry, "Format: MM/YY"); valid = false; }
      if (!validateCVC(cvc)) { showError(cvc, "CVC must be at least 3 digits"); valid = false; }

      if (valid) {
        successMsg.style.display = "block";
        form.reset();
        form.querySelectorAll(".error-msg").forEach(el => el.remove());
      }
    });

document.querySelectorAll(".faq details").forEach((detail) => {
    detail.addEventListener("toggle", function () {
      if (this.open) {
        document.querySelectorAll(".faq details").forEach((other) => {
          if (other !== this) {
            other.removeAttribute("open");
          }
        });
      }
    });
  });




  