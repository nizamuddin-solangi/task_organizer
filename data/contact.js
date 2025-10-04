 function toggleMenu() {
        document.getElementById("navLinks").classList.toggle("active");
      }
  const form = document.getElementById("contactForm");
  const successBox = document.createElement("div");
  successBox.id = "successMessage";
  successBox.style.color = "green";
  form.appendChild(successBox);

  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const subjectField = document.getElementById("subject");
  const messageField = document.getElementById("message");

  function validateName() {
    const name = nameField.value.trim();
    if (!/^[a-zA-Z\s]{3,}$/.test(name)) {
      document.getElementById("nameError").innerText =
        "Name can only contain letters and spaces (min 3 letters).";
      return false;
    }
    document.getElementById("nameError").innerText = "";
    return true;
  }

  function validateEmail() {
    const email = emailField.value.trim();
    if (!/^[a-zA-Z]{3,}[^@\s]*@[^@\s]+\.[^@\s]+$/.test(email)) {
      document.getElementById("emailError").innerText =
        "Enter a valid email with at least 3 letters before '@'.";
      return false;
    }
    document.getElementById("emailError").innerText = "";
    return true;
  }

  function validateSubject() {
    const subject = subjectField.value.trim();
    if (!/^[a-zA-Z\s]+$/.test(subject)) {
      document.getElementById("subjectError").innerText =
        "Subject can only contain letters and spaces.";
      return false;
    }
    document.getElementById("subjectError").innerText = "";
    return true;
  }

  function validateMessage() {
    const message = messageField.value.trim();
    if (!/^[a-zA-Z0-9\s.,!?'-]{10,}$/.test(message)) {
      document.getElementById("messageError").innerText =
        "Message must be at least 10 characters and no special symbols.";
      return false;
    }
    document.getElementById("messageError").innerText = "";
    return true;
  }

  // Live validation
  nameField.addEventListener("input", validateName);
  emailField.addEventListener("input", validateEmail);
  subjectField.addEventListener("input", validateSubject);
  messageField.addEventListener("input", validateMessage);

  // Prevent form submission if validation fails
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop form by default

    const valid =
      validateName() &&
      validateEmail() &&
      validateSubject() &&
      validateMessage();

    if (valid) {
      successBox.innerText = "✅ Message sent successfully!";
      // Here you can handle actual sending (AJAX, API, backend call, etc.)
      form.reset();
    } else {
      successBox.innerText = "";
    }
  });
