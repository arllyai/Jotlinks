const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navLinkItems = document.querySelectorAll(".nav-links a");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinkItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const skillMeters = document.querySelectorAll(".skill-meter");
skillMeters.forEach((meter) => {
  const level = meter.dataset.level;
  if (level) {
    requestAnimationFrame(() => {
      meter.style.width = level;
    });
  }
});

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const emailLoginButton = document.getElementById("email-login");
const emailSignupButton = document.getElementById("email-signup");
const googleLoginButton = document.getElementById("google-login");
const microsoftLoginButton = document.getElementById("microsoft-login");
const signOutButton = document.getElementById("signout");
const authMessage = document.getElementById("auth-message");
const authStatus = document.getElementById("auth-status");
const profileForm = document.getElementById("profile-form");
const profileCard = document.getElementById("profile-card");
const profileNameInput = document.getElementById("profile-name");
const profileRoleInput = document.getElementById("profile-role");
const profileLocationInput = document.getElementById("profile-location");

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};

const firebaseAvailable =
  typeof window.firebase !== "undefined" &&
  typeof window.firebase.initializeApp === "function";
const configValues = Object.values(firebaseConfig);
const firebaseConfigured = configValues.every(
  (value) => value && !value.includes("YOUR_") && !value.includes("REPLACE")
);

const authButtons = [
  emailLoginButton,
  emailSignupButton,
  googleLoginButton,
  microsoftLoginButton,
];

const setAuthMessage = (message, state = "") => {
  if (!authMessage) {
    return;
  }
  authMessage.textContent = message;
  if (state) {
    authMessage.dataset.state = state;
  } else {
    delete authMessage.dataset.state;
  }
};

const setAuthStatus = (message, state = "") => {
  if (!authStatus) {
    return;
  }
  authStatus.textContent = message;
  if (state) {
    authStatus.dataset.state = state;
  } else {
    delete authStatus.dataset.state;
  }
};

const setProfileEnabled = (enabled) => {
  const profileInputs = [
    profileNameInput,
    profileRoleInput,
    profileLocationInput,
  ];
  profileInputs.forEach((input) => {
    if (input) {
      input.disabled = !enabled;
    }
  });
  if (profileForm) {
    const submitButton = profileForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = !enabled;
    }
  }
  if (profileCard) {
    profileCard.classList.toggle("disabled", !enabled);
  }
  if (signOutButton) {
    signOutButton.disabled = !enabled;
  }
};

const setAuthControlsEnabled = (enabled) => {
  authButtons.forEach((button) => {
    if (button) {
      button.disabled = !enabled;
    }
  });
  if (authEmailInput) {
    authEmailInput.disabled = !enabled;
  }
  if (authPasswordInput) {
    authPasswordInput.disabled = !enabled;
  }
};

if (!firebaseAvailable) {
  setAuthControlsEnabled(false);
  setProfileEnabled(false);
  setAuthStatus("Authentication unavailable", "signed-out");
  setAuthMessage("Firebase scripts failed to load.", "error");
} else if (!firebaseConfigured) {
  setAuthControlsEnabled(false);
  setProfileEnabled(false);
  setAuthStatus("Authentication not configured", "signed-out");
  setAuthMessage("Add your Firebase config in script.js to enable login.", "error");
} else {
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth(app);
  const db = firebase.firestore(app);
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const microsoftProvider = new firebase.auth.OAuthProvider("microsoft.com");

  setAuthControlsEnabled(true);
  setAuthMessage("Authentication ready. Sign in to continue.", "success");

  const handleEmailAuth = async (mode) => {
    const email = authEmailInput ? authEmailInput.value.trim() : "";
    const password = authPasswordInput ? authPasswordInput.value.trim() : "";
    if (!email || !password) {
      setAuthMessage("Enter both email and password.", "error");
      return;
    }

    try {
      if (mode === "signup") {
        await auth.createUserWithEmailAndPassword(email, password);
        setAuthMessage("Account created successfully.", "success");
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        setAuthMessage("Signed in successfully.", "success");
      }
    } catch (error) {
      setAuthMessage(error.message || "Authentication failed.", "error");
    }
  };

  if (emailSignupButton) {
    emailSignupButton.addEventListener("click", () =>
      handleEmailAuth("signup")
    );
  }

  if (emailLoginButton) {
    emailLoginButton.addEventListener("click", () =>
      handleEmailAuth("login")
    );
  }

  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", async () => {
      try {
        await auth.signInWithPopup(googleProvider);
        setAuthMessage("Signed in with Google.", "success");
      } catch (error) {
        setAuthMessage(error.message || "Google sign in failed.", "error");
      }
    });
  }

  if (microsoftLoginButton) {
    microsoftLoginButton.addEventListener("click", async () => {
      try {
        await auth.signInWithPopup(microsoftProvider);
        setAuthMessage("Signed in with Microsoft.", "success");
      } catch (error) {
        setAuthMessage(error.message || "Microsoft sign in failed.", "error");
      }
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener("click", async () => {
      try {
        await auth.signOut();
        setAuthMessage("Signed out successfully.", "success");
      } catch (error) {
        setAuthMessage(error.message || "Sign out failed.", "error");
      }
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        setAuthMessage("Sign in to save your profile.", "error");
        return;
      }
      const payload = {
        displayName: profileNameInput ? profileNameInput.value.trim() : "",
        role: profileRoleInput ? profileRoleInput.value.trim() : "",
        location: profileLocationInput ? profileLocationInput.value.trim() : "",
        email: user.email || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      try {
        await db.collection("userProfiles").doc(user.uid).set(payload, {
          merge: true,
        });
        setAuthMessage("Profile saved.", "success");
      } catch (error) {
        setAuthMessage(error.message || "Unable to save profile.", "error");
      }
    });
  }

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      setAuthStatus("Not signed in", "signed-out");
      setProfileEnabled(false);
      if (profileNameInput) {
        profileNameInput.value = "";
      }
      if (profileRoleInput) {
        profileRoleInput.value = "";
      }
      if (profileLocationInput) {
        profileLocationInput.value = "";
      }
      return;
    }

    const name = user.displayName || user.email || "User";
    setAuthStatus(`Signed in as ${name}`, "signed-in");
    setProfileEnabled(true);

    try {
      const doc = await db.collection("userProfiles").doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data() || {};
        if (profileNameInput) {
          profileNameInput.value = data.displayName || user.displayName || "";
        }
        if (profileRoleInput) {
          profileRoleInput.value = data.role || "";
        }
        if (profileLocationInput) {
          profileLocationInput.value = data.location || "";
        }
      } else if (profileNameInput && user.displayName) {
        profileNameInput.value = user.displayName;
      }
    } catch (error) {
      setAuthMessage(
        error.message || "Unable to load profile information.",
        "error"
      );
    }
  });
}
