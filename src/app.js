import {
  RequestValidationError,
  appendRequest,
  createRequest,
  effectivePriority,
  selectRequests,
  loadRequests,
  saveRequests,
} from "./request-store.js";

const form = document.querySelector("#request-form");
const message = document.querySelector("#form-message");
const neededByInput = document.querySelector("#needed-by");
const count = document.querySelector("#request-count");
const emptyState = document.querySelector("#empty-state");
const tableWrapper = document.querySelector("#request-table-wrapper");
const tableBody = document.querySelector("#request-table-body");

const priorityFilter = document.querySelector("#priority-filter");
const requestSort = document.querySelector("#request-sort");
const noMatches = document.querySelector("#no-matches");

let requests = loadRequests();

// View choices are intentionally not persisted.
priorityFilter.value = "All";
requestSort.value = "newest";
priorityFilter.addEventListener("change", renderRequests);
requestSort.addEventListener("change", renderRequests);

neededByInput.min = new Date().toISOString().slice(0, 10);
renderRequests();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFieldErrors();
  setMessage("");

  const input = Object.fromEntries(new FormData(form).entries());

  try {
    const request = createRequest(input);
    requests = appendRequest(requests, request);
    saveRequests(requests);
    form.reset();
    neededByInput.min = new Date().toISOString().slice(0, 10);
    setMessage("Request added.");
    renderRequests();
    document.querySelector("#requester").focus();
  } catch (error) {
    if (error instanceof RequestValidationError) {
      showFieldErrors(error.errors);
      setMessage("Complete all required fields.", true);
      return;
    }

    setMessage("The request could not be saved. Try again.", true);
    console.error(error);
  }
});

function renderRequests() {
  const visibleRequests = selectRequests(requests, priorityFilter.value, requestSort.value);
  const hasRequests = visibleRequests.length > 0;
  count.textContent = `${requests.length} ${requests.length === 1 ? "request" : "requests"}`;
  emptyState.hidden = hasRequests || priorityFilter.value !== "All";
  noMatches.hidden = hasRequests || priorityFilter.value === "All";
  tableWrapper.hidden = !hasRequests;
  tableBody.replaceChildren(...visibleRequests.map(createRequestRow));
}

function createRequestRow(request) {
  const row = document.createElement("tr");
  const values = [
    request.requester,
    request.department,
    request.equipment,
    effectivePriority(request),
    formatDate(request.neededBy),
    request.reason,
    formatDateTime(request.createdAt),
  ];

  for (const value of values) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  }

  return row;
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function showFieldErrors(errors) {
  const firstInvalidField = Object.keys(errors)[0];

  for (const fieldName of Object.keys(errors)) {
    form.elements[fieldName]?.setAttribute("aria-invalid", "true");
  }

  form.elements[firstInvalidField]?.focus();
}

function clearFieldErrors() {
  for (const element of form.elements) {
    element.removeAttribute?.("aria-invalid");
  }
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}
