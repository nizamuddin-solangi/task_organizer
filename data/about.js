function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("active");
  const modal = document.getElementById("proModal");
}
let prevScroll = window.scrollY;
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > prevScroll) {
    header.style.top = "-80px";
  } else {
    header.style.top = "0";
  }
  prevScroll = window.scrollY;
});
document.addEventListener("DOMContentLoaded", () => {
  // Modal elements
  const modal = document.getElementById("proModal");
  const btn = document.getElementById("proBtn");
  const span = modal.querySelector(".close");
  const form = document.getElementById("checkoutForm");
  const successMsg = document.getElementById("successMsg");

  // Open modal
  btn.onclick = () => (modal.style.display = "block");

  // Close modal
  span.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
  };

  // Validation functions
  function validateName() {
    const input = document.getElementById("cardholder");
    const error = document.getElementById("nameError");
    if (!/^[A-Za-z ]{3,}$/.test(input.value.trim())) {
      error.textContent = "Name must be at least 3 letters (no numbers).";
      return false;
    }
    error.textContent = "";
    return true;
  }

  function validateCard() {
    const input = document.getElementById("cardnumber");
    const error = document.getElementById("cardError");
    if (!/^\d{16}$/.test(input.value.trim())) {
      error.textContent = "Card number must be 16 digits.";
      return false;
    }
    error.textContent = "";
    return true;
  }

  function validateExpiry() {
    const input = document.getElementById("expiry");
    const error = document.getElementById("expiryError");
    // allow any numbers on both sides of "/"
    if (!/^\d+\/\d+$/.test(input.value.trim())) {
      error.textContent = "Enter valid Expiry in MM/YY  ";
      return false;
    }
    error.textContent = "";
    return true;
  }

  function validateCvc() {
    const input = document.getElementById("cvc");
    const error = document.getElementById("cvcError");
    if (!/^\d{3,}$/.test(input.value.trim())) {
      error.textContent = "CVC must be at least 3 digits.";
      return false;
    }
    error.textContent = "";
    return true;
  }

  // Attach live validation
  document.getElementById("cardholder").addEventListener("input", validateName);
  document.getElementById("cardnumber").addEventListener("input", validateCard);
  document.getElementById("expiry").addEventListener("input", validateExpiry);
  document.getElementById("cvc").addEventListener("input", validateCvc);

  // Submit validation
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid =
      validateName() & validateCard() & validateExpiry() & validateCvc();
    if (valid) {
      form.style.display = "none";
      successMsg.style.display = "block";
    }
  });
});
document.querySelectorAll("#faq details").forEach((detail) => {
    detail.addEventListener("toggle", function () {
      if (this.open) {
        document.querySelectorAll("#faq details").forEach((other) => {
          if (other !== this) {
            other.removeAttribute("open");
          }
        });
      }
    });
  });