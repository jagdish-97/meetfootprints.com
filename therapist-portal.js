const portalElements = {
  refreshButton: document.querySelector("#portal-refresh"),
  signoutButton: document.querySelector("#portal-signout"),
  loginForm: document.querySelector("#portal-login-form"),
  portalEmail: document.querySelector("#portal-email"),
  portalPassword: document.querySelector("#portal-password"),
  authCopy: document.querySelector("#portal-auth-copy"),
  authStatusBadge: document.querySelector("#auth-status-badge"),
  accountCard: document.querySelector("#portal-account-card"),
  accountEmail: document.querySelector("#portal-account-email"),
  accountRole: document.querySelector("#portal-account-role"),
  accountTherapist: document.querySelector("#portal-account-therapist"),
  editorForm: document.querySelector("#therapist-editor-form"),
  editorHeading: document.querySelector("#editor-heading"),
  editorModeBadge: document.querySelector("#editor-mode-badge"),
  editorStatus: document.querySelector("#editor-status"),
  createNewTherapist: document.querySelector("#create-new-therapist"),
  deleteTherapist: document.querySelector("#delete-therapist"),
  adminPanel: document.querySelector("#admin-panel"),
  adminAddTherapist: document.querySelector("#admin-add-therapist"),
  adminTherapistSearch: document.querySelector("#admin-therapist-search"),
  adminTherapistList: document.querySelector("#admin-therapist-list"),
  fields: {
    id: document.querySelector("#therapist-id"),
    name: document.querySelector("#therapist-name"),
    email: document.querySelector("#therapist-login-email"),
    password: document.querySelector("#therapist-password"),
    title: document.querySelector("#therapist-title"),
    location: document.querySelector("#therapist-location"),
    image: document.querySelector("#therapist-image"),
    price: document.querySelector("#therapist-price"),
    availability: document.querySelector("#therapist-availability"),
    summary: document.querySelector("#therapist-summary"),
    specialties: document.querySelector("#therapist-specialties"),
    languages: document.querySelector("#therapist-languages"),
    therapyTypes: document.querySelector("#therapist-therapy-types")
  }
};

const portalState = {
  session: null,
  access: null,
  therapists: [],
  selectedTherapistId: null,
  adminSearchTerm: ""
};

function portalIsAdmin() {
  return portalState.access && portalState.access.role === "admin";
}

function portalCanEdit() {
  return Boolean(portalState.access && (portalState.access.role === "admin" || portalState.access.role === "therapist"));
}

async function initTherapistPortal() {
  attachPortalEventListeners();
  initPasswordToggles(document);
  await refreshPortalState();
}

function attachPortalEventListeners() {
  portalElements.loginForm.addEventListener("submit", handlePortalLogin);
  portalElements.signoutButton.addEventListener("click", handlePortalSignout);
  portalElements.refreshButton.addEventListener("click", handlePortalRefresh);
  portalElements.editorForm.addEventListener("submit", handleProfileSave);
  portalElements.createNewTherapist.addEventListener("click", showBlankTherapistForm);
  portalElements.deleteTherapist.addEventListener("click", handleProfileDelete);
  portalElements.adminAddTherapist.addEventListener("click", () => {
    showBlankTherapistForm();
    portalElements.editorForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  portalElements.adminTherapistSearch.addEventListener("input", handleAdminSearchInput);
  portalElements.adminTherapistList.addEventListener("click", handleAdminListClick);
}

async function refreshPortalState() {
  const { session, access, error } = await window.therapistDataApi.getCurrentUserAccess();
  portalState.session = session;
  portalState.access = access;

  if (access) {
    const portalResult = await window.therapistDataApi.loadPortalTherapists();
    portalState.therapists = portalResult.error ? [] : portalResult.data;
    if (portalResult.error) {
      portalElements.authCopy.textContent = `Access lookup failed: ${portalResult.error.message}`;
    }
  } else {
    portalState.therapists = [];
  }

  if (error) {
    portalElements.authCopy.textContent = `Session lookup failed: ${error.message}`;
  }

  renderPortal();
}

function renderPortal() {
  const isSignedIn = Boolean(portalState.session && portalState.access);
  const access = portalState.access;
  const linkedTherapist = access && access.therapist_id
    ? portalState.therapists.find((therapist) => therapist.id === access.therapist_id)
    : null;

  portalElements.authStatusBadge.textContent = isSignedIn ? "Signed in" : "Signed out";
  portalElements.signoutButton.classList.toggle("hidden", !isSignedIn);
  portalElements.accountCard.classList.toggle("hidden", !isSignedIn);
  portalElements.editorForm.classList.toggle("hidden", !portalCanEdit());
  portalElements.adminPanel.classList.toggle("hidden", !portalIsAdmin());
  portalElements.createNewTherapist.classList.toggle("hidden", !portalIsAdmin());
  portalElements.deleteTherapist.classList.toggle("hidden", !portalIsAdmin());
  portalElements.editorModeBadge.classList.toggle("hidden", !portalCanEdit());

  if (!isSignedIn) {
    portalElements.authCopy.textContent = "Use the email and password or PIN linked to your therapist or admin account.";
    portalElements.editorStatus.textContent = "Sign in to edit therapist information.";
    portalElements.editorModeBadge.textContent = "Signed out";
    portalElements.editorHeading.textContent = "Therapist profile";
    return;
  }

  portalElements.accountEmail.textContent = access.email || "-";
  portalElements.accountRole.textContent = access.role || "-";
  portalElements.accountTherapist.textContent = linkedTherapist ? linkedTherapist.name : "Not linked";
  portalElements.editorModeBadge.textContent = portalIsAdmin() ? "Admin access" : "Therapist access";

  if (portalIsAdmin()) {
    renderAdminList();
    const requestedTherapistId = new URLSearchParams(window.location.search).get("therapist");
    const selectedTherapist = portalState.therapists.find((therapist) => therapist.id === (portalState.selectedTherapistId || requestedTherapistId))
      || portalState.therapists[0]
      || window.therapistDataApi.EMPTY_THERAPIST;
    portalState.selectedTherapistId = selectedTherapist.id || null;
    populateTherapistForm(selectedTherapist);
    portalElements.editorHeading.textContent = selectedTherapist.id ? `Editing ${selectedTherapist.name}` : "Create therapist profile";
    portalElements.editorStatus.textContent = "Admin access is active. You can add, update, delete, or reset therapist passwords/PINs from this form.";
    return;
  }

  const therapist = linkedTherapist || window.therapistDataApi.EMPTY_THERAPIST;
  portalState.selectedTherapistId = therapist.id || null;
  populateTherapistForm(therapist);
  portalElements.fields.email.readOnly = true;
  portalElements.editorHeading.textContent = therapist.id ? `Editing ${therapist.name}` : "Linked therapist profile not found";
  portalElements.editorStatus.textContent = therapist.id
    ? "Update your profile details and save to publish changes. Fill the password/PIN field only if you want to change it."
    : "Your account is signed in, but no therapist profile is linked yet.";
}

function renderAdminList() {
  const searchTerm = portalState.adminSearchTerm.trim().toLowerCase();
  const visibleTherapists = portalState.therapists.filter((therapist) => {
    if (!searchTerm) {
      return true;
    }

    return (therapist.name || "").toLowerCase().includes(searchTerm);
  });
  const fragment = document.createDocumentFragment();

  if (!visibleTherapists.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "portal-helper";
    emptyState.textContent = "No therapist profiles match that name.";
    portalElements.adminTherapistList.replaceChildren(emptyState);
    return;
  }

  visibleTherapists.forEach((therapist) => {
    const row = document.createElement("article");
    row.className = "portal-list-item";
    row.innerHTML = `
      <div>
        <h3>${therapist.name || "Untitled therapist"}</h3>
        <p>${therapist.title || "No title"} | ${therapist.location || "No location"} | ${therapist.email || "No login email"}</p>
      </div>
      <div class="portal-list-actions">
        <button type="button" class="secondary-button" data-edit-therapist="${therapist.id}">Edit</button>
      </div>
    `;
    fragment.appendChild(row);
  });

  portalElements.adminTherapistList.replaceChildren(fragment);
}

function handleAdminSearchInput(event) {
  portalState.adminSearchTerm = event.target.value;
  renderAdminList();
}

function populateTherapistForm(therapist) {
  const normalized = window.therapistDataApi.normalizeTherapist(therapist);
  portalElements.fields.id.value = normalized.id;
  portalElements.fields.name.value = normalized.name;
  portalElements.fields.email.value = normalized.email;
  portalElements.fields.password.value = "";
  portalElements.fields.title.value = normalized.title;
  portalElements.fields.location.value = normalized.location;
  portalElements.fields.image.value = normalized.image === "data/portraits/portrait.svg" ? "" : normalized.image;
  portalElements.fields.price.value = normalized.price == null ? "" : String(normalized.price);
  portalElements.fields.availability.value = normalized.availability;
  portalElements.fields.summary.value = normalized.summary;
  portalElements.fields.specialties.value = normalized.specialties.join(", ");
  portalElements.fields.languages.value = normalized.languages.join(", ");
  portalElements.fields.therapyTypes.value = normalized.therapyTypes.join(", ");
  portalElements.fields.email.readOnly = !portalIsAdmin();
}

function showBlankTherapistForm() {
  portalState.selectedTherapistId = null;
  populateTherapistForm(window.therapistDataApi.EMPTY_THERAPIST);
  portalElements.editorHeading.textContent = "Create therapist profile";
  portalElements.editorStatus.textContent = "Fill out the fields and save to add a new therapist. Add a password or PIN if this therapist should be able to log in.";
}

function readTherapistForm() {
  return {
    therapist: {
      id: portalElements.fields.id.value.trim(),
      name: portalElements.fields.name.value.trim(),
      email: portalElements.fields.email.value.trim().toLowerCase(),
      title: portalElements.fields.title.value.trim(),
      location: portalElements.fields.location.value.trim(),
      image: portalElements.fields.image.value.trim(),
      price: portalElements.fields.price.value.trim(),
      availability: portalElements.fields.availability.value,
      summary: portalElements.fields.summary.value.trim(),
      specialties: portalElements.fields.specialties.value,
      languages: portalElements.fields.languages.value,
      therapyTypes: portalElements.fields.therapyTypes.value
    },
    password: portalElements.fields.password.value.trim()
  };
}

async function handlePortalLogin(event) {
  event.preventDefault();
  portalElements.authCopy.textContent = "Signing in...";

  const result = await window.therapistDataApi.loginWithPassword(
    portalElements.portalEmail.value,
    portalElements.portalPassword.value
  );

  if (result.error) {
    portalElements.authCopy.textContent = result.error.message;
    return;
  }

  portalElements.portalPassword.value = "";
  portalElements.authCopy.textContent = "Sign-in successful.";
  await refreshPortalState();
}

async function handlePortalSignout() {
  const result = await window.therapistDataApi.signOut();
  if (result.error) {
    portalElements.authCopy.textContent = result.error.message;
    return;
  }

  portalState.session = null;
  portalState.access = null;
  portalState.therapists = [];
  renderPortal();
}

function handlePortalRefresh() {
  window.location.reload();
}

async function handleProfileSave(event) {
  event.preventDefault();

  if (!portalCanEdit()) {
    portalElements.editorStatus.textContent = "You do not have permission to save profiles.";
    return;
  }

  const formData = readTherapistForm();
  portalElements.editorStatus.textContent = "Saving profile...";
  const result = await window.therapistDataApi.saveTherapistProfile(formData.therapist, formData.password);

  if (result.error) {
    portalElements.editorStatus.textContent = `Save failed: ${result.error.message}`;
    return;
  }

  portalState.selectedTherapistId = result.data.id;
  portalElements.editorStatus.textContent = "Profile saved successfully.";
  await refreshPortalState();
}

async function handleProfileDelete() {
  if (!portalIsAdmin()) {
    portalElements.editorStatus.textContent = "Only admins can delete profiles.";
    return;
  }

  const therapistId = portalElements.fields.id.value.trim();
  if (!therapistId) {
    portalElements.editorStatus.textContent = "Select a therapist profile first.";
    return;
  }

  const confirmed = window.confirm("Delete this therapist profile?");
  if (!confirmed) {
    return;
  }

  portalElements.editorStatus.textContent = "Deleting profile...";
  const result = await window.therapistDataApi.deleteTherapistProfile(therapistId);

  if (result.error) {
    portalElements.editorStatus.textContent = `Delete failed: ${result.error.message}`;
    return;
  }

  portalState.selectedTherapistId = null;
  portalElements.editorStatus.textContent = "Profile deleted successfully.";
  await refreshPortalState();
}

function handleAdminListClick(event) {
  const button = event.target.closest("[data-edit-therapist]");
  if (!button) {
    return;
  }

  const therapistId = button.dataset.editTherapist;
  const therapist = portalState.therapists.find((item) => item.id === therapistId);
  if (!therapist) {
    return;
  }

  portalState.selectedTherapistId = therapist.id;
  populateTherapistForm(therapist);
  portalElements.editorHeading.textContent = `Editing ${therapist.name}`;
  portalElements.editorStatus.textContent = "Profile loaded. To reset this therapist password or PIN, enter a new one in the password field and save. Leave it blank to keep the current one.";
  portalElements.editorForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initPasswordToggles(scope) {
  scope.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) {
        return;
      }

      const shouldShow = target.type === "password";
      target.type = shouldShow ? "text" : "password";
      button.textContent = shouldShow ? "Hide" : "Show";
      button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    });
  });
}

initTherapistPortal();
