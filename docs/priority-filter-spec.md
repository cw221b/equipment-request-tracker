# Priority Filtering and Sorting Specification

## Goal

Help managers quickly focus on equipment requests that need attention by filtering and sorting using the existing priority information.

## User Need

As a manager, I need to view one priority at a time and order requests by priority so I can identify urgent equipment needs, then return to the complete list without changing or losing requests.

## Functional Rules

1. Provide a visibly labeled priority filter with All, Low, Normal, and High choices. Only one choice can be active at a time.
2. Initially show all requests. Refreshing the page resets the filter to All; the selection is not persisted.
3. Provide a visibly labeled sort control supporting newest first and priority order. Filtering and sorting work together.
4. Treat an existing request without a saved priority as Low for display, filtering, and sorting. Do not write this fallback into the stored record.
5. When a selected priority has no matching requests, show exactly "No matching requests." Preserve the existing empty-state message when All is selected and no requests exist.
6. Selecting All restores every saved request, using the active sort order.
7. Filtering and sorting change only the displayed list; they must not edit, delete, duplicate, or reorder stored records.
8. Preserve the existing request creation behavior: new requests default to Normal, and selected Low, Normal, or High values remain saved.

The following sorting details are proposed assumptions, not explicit answers from the user. Confirm them before implementation:

- Default to newest first, preserving the existing initial order.
- Priority order is High, then Normal, then Low.
- Within the same priority, order requests newest first. Preserve their existing relative order when submission timestamps are equal.
- Refreshing resets sorting to newest first.

## Constraints

- Work without a login, database, or external service.
- Continue using browser localStorage and preserve all existing requests and their saved values.
- Use plain HTML, CSS, and JavaScript modules; add no frameworks, build tools, or production dependencies.
- Keep business and storage logic in src/request-store.js and browser interaction and rendering in src/app.js.
- Keep controls keyboard accessible with visible labels and focus indicators.
- Render user-provided content using textContent or equivalent safe DOM APIs.
- Limit changes to the specified feature and necessary verification.

## Acceptance Criteria

Sorting criteria below depend on confirmation of the proposed sorting assumptions.

1. Given saved Low, Normal, and High requests, opening or refreshing the application shows all requests with the filter set to All and the sort set to newest first.
2. Selecting each priority shows only requests with that effective priority. Selecting another priority replaces the previous filter rather than combining selections.
3. Selecting All after filtering restores every saved request without duplicates.
4. Selecting priority sorting displays High requests before Normal requests and Normal requests before Low requests. Requests of the same priority appear newest first; equal timestamps retain their relative order.
5. With any priority filter active, changing the sort keeps that filter active and orders only the matching requests. Changing the filter retains the active sort.
6. A saved request with no priority displays Low, appears when Low is selected, and is excluded when Normal or High is selected. Its stored record remains unchanged.
7. Selecting a priority with zero matches displays exactly "No matching requests." Selecting All with zero saved requests retains the existing empty-state message.
8. After selecting a filter and priority sorting, refreshing restores All and newest first while retaining every saved request.
9. Comparing stored request data before and after filtering, sorting, and refreshing shows no changes to records or their stored order.
10. Adding a request still defaults to Normal, allows Low or High, and retains the selected priority after reload. The displayed list continues to honor the active filter and sort.
11. All behavior works without authentication, a database, or an external service, and the controls can be operated by keyboard.

## Out of Scope

- Logins, accounts, manager roles, databases, or synchronization between browsers.
- Multiple simultaneous priority selections or remembering filter/sort selections after refresh.
- Editing existing request priorities or migrating missing priorities into saved records.
- Changing the Normal default for newly created requests.
- Search, department/date filters, approval workflows, notifications, or request status tracking.
- Deleting requests, redesigning the interface, or changing unrelated application behavior.
