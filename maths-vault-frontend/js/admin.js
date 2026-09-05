// ===============================
// ENGGITEA - ADMIN JAVASCRIPT
// ===============================

function getAdminUser() {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        return null;
    }
}


// ===============================
// ADMIN ACCESS CHECK
// ===============================

async function checkAdminAccess() {
    const token = getAuthToken();

    if (!token) {
        window.location.href = "../login.html";
        return false;
    }

    try {
        const user = await getCurrentUser();

        if (user?.data) {
            localStorage.setItem("user", JSON.stringify(user.data));
        } else if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }

        const currentUser = user?.data || user;

        if (currentUser?.role !== "admin") {
            alert("Access denied. Admin access required.");
            window.location.href = "../dashboard.html";
            return false;
        }

        return true;

    } catch (error) {
        console.error("Admin access error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../login.html";
        return false;
    }
}


// ===============================
// LOAD PENDING RESOURCES
// ===============================

async function loadPendingResources() {

    const loading = document.getElementById("pendingLoading");
    const errorBox = document.getElementById("pendingError");
    const emptyBox = document.getElementById("pendingEmpty");
    const section = document.getElementById("pendingSection");
    const container = document.getElementById("pendingResourcesContainer");
    const count = document.getElementById("pendingResultsCount");

    if (!container) {
        return;
    }

    if (loading) loading.style.display = "block";
    if (errorBox) errorBox.style.display = "none";
    if (emptyBox) emptyBox.style.display = "none";
    if (section) section.style.display = "none";

    try {

        const data = await getPendingResources();
        const resources = extractAdminResources(data);

        if (loading) loading.style.display = "none";

        if (count) {
            count.textContent = `${resources.length} pending resource${resources.length !== 1 ? "s" : ""}`;
        }

        if (resources.length === 0) {
            if (emptyBox) emptyBox.style.display = "block";
            return;
        }

        container.innerHTML = "";

        resources.forEach(resource => {
            container.appendChild(createPendingResourceCard(resource));
        });

        if (section) section.style.display = "block";

    } catch (error) {

        console.error("Pending resources error:", error);

        if (loading) loading.style.display = "none";

        if (errorBox) {
            errorBox.style.display = "block";
        }
    }
}


// ===============================
// EXTRACT ADMIN RESOURCES
// ===============================

function extractAdminResources(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.resources)) {
        return data.resources;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.data?.resources)) {
        return data.data.resources;
    }

    return [];
}


// ===============================
// RESOURCE CARD
// ===============================

function createPendingResourceCard(resource) {

    const card = document.createElement("div");
    card.className = "pending-resource-card";

    const typeInfo = getAdminResourceTypeInfo(resource.type);

    const title = escapeAdminHtml(resource.title || "Untitled Resource");
    const description = escapeAdminHtml(
        resource.description || "No description available."
    );

    const subject = escapeAdminHtml(resource.subject || "Not specified");

    const semester = resource.semester
        ? `Semester ${resource.semester}`
        : "Semester not specified";

    const unit = resource.unit
        ? `Unit ${resource.unit}`
        : "Unit not specified";

    const uploader = escapeAdminHtml(
        resource.user?.name ||
        resource.uploader_name ||
        resource.uploaded_by_name ||
        "Unknown user"
    );

    card.innerHTML = `
        <div class="pending-resource-icon">
            ${typeInfo.icon}
        </div>

        <div class="pending-resource-content">

            <div class="pending-resource-top">
                <span class="resource-type">
                    ${typeInfo.label}
                </span>

                <span class="resource-semester">
                    ${semester}
                </span>
            </div>

            <h3>${title}</h3>

            <p>${description}</p>

            <div class="pending-resource-meta">
                <span>${subject}</span>
                <span>${unit}</span>
                <span>Uploaded by: ${uploader}</span>
            </div>

            <div class="pending-resource-actions">

                <a
                    href="../resource.html?id=${encodeURIComponent(resource.id)}"
                    class="secondary-btn"
                    target="_blank"
                >
                    View
                </a>

                <button
                    class="approve-btn"
                    data-id="${resource.id}"
                >
                    Approve
                </button>

                <button
                    class="reject-btn"
                    data-id="${resource.id}"
                >
                    Reject
                </button>

                <button
                    class="delete-resource-btn"
                    data-id="${resource.id}"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

    const approveButton = card.querySelector(".approve-btn");
    const rejectButton = card.querySelector(".reject-btn");
    const deleteButton = card.querySelector(".delete-resource-btn");

    approveButton.addEventListener("click", () => {
        handleApproveResource(resource.id);
    });

    rejectButton.addEventListener("click", () => {
        handleRejectResource(resource.id);
    });

    deleteButton.addEventListener("click", () => {
        handleAdminDeleteResource(resource.id);
    });

    return card;
}


// ===============================
// RESOURCE TYPE INFO
// ===============================

function getAdminResourceTypeInfo(type) {

    const normalizedType = String(type || "").toLowerCase();

    const types = {

        video: {
            label: "Video",
            icon: "▶"
        },

        playlist: {
            label: "Playlist",
            icon: "▤"
        },

        formula: {
            label: "Formula Sheet",
            icon: "ƒ"
        },

        "formula-sheet": {
            label: "Formula Sheet",
            icon: "ƒ"
        },

        "question-paper": {
            label: "Question Paper",
            icon: "?"
        },

        question: {
            label: "Question Paper",
            icon: "?"
        }

    };

    return types[normalizedType] || {
        label: "Resource",
        icon: "•"
    };
}


// ===============================
// APPROVE RESOURCE
// ===============================

async function handleApproveResource(id) {

    const confirmed = confirm(
        "Are you sure you want to approve this resource?"
    );

    if (!confirmed) {
        return;
    }

    try {

        await approveResource(id);

        showAdminMessage(
            "Resource approved successfully.",
            "success"
        );

        await loadPendingResources();

        await loadAdminStats();

    } catch (error) {

        console.error("Approve error:", error);

        showAdminMessage(
            error.message || "Failed to approve resource.",
            "error"
        );
    }
}


// ===============================
// REJECT RESOURCE
// ===============================

async function handleRejectResource(id) {

    const confirmed = confirm(
        "Are you sure you want to reject this resource?"
    );

    if (!confirmed) {
        return;
    }

    try {

        await rejectResource(id);

        showAdminMessage(
            "Resource rejected successfully.",
            "success"
        );

        await loadPendingResources();

        await loadAdminStats();

    } catch (error) {

        console.error("Reject error:", error);

        showAdminMessage(
            error.message || "Failed to reject resource.",
            "error"
        );
    }
}


// ===============================
// DELETE RESOURCE
// ===============================

async function handleAdminDeleteResource(id) {

    const confirmed = confirm(
        "Are you sure you want to permanently delete this resource?"
    );

    if (!confirmed) {
        return;
    }

    try {

        await adminDeleteResource(id);

        showAdminMessage(
            "Resource deleted successfully.",
            "success"
        );

        await loadPendingResources();

        await loadAdminStats();

    } catch (error) {

        console.error("Delete error:", error);

        showAdminMessage(
            error.message || "Failed to delete resource.",
            "error"
        );
    }
}


// ===============================
// ADMIN DASHBOARD STATS
// ===============================

async function loadAdminStats() {

    const pendingCount = document.getElementById("pendingCount");
    const approvedCount = document.getElementById("approvedCount");
    const totalCount = document.getElementById("totalCount");

    if (!pendingCount && !approvedCount && !totalCount) {
        return;
    }

    try {

        const data = await getResources();
        const resources = extractAdminResources(data);

        const pending = resources.filter(
            resource =>
                String(resource.status || "").toLowerCase() === "pending"
        );

        const approved = resources.filter(
            resource =>
                String(resource.status || "").toLowerCase() === "approved"
        );

        if (pendingCount) {
            pendingCount.textContent = pending.length;
        }

        if (approvedCount) {
            approvedCount.textContent = approved.length;
        }

        if (totalCount) {
            totalCount.textContent = resources.length;
        }

    } catch (error) {

        console.error("Admin stats error:", error);

        if (pendingCount) pendingCount.textContent = "—";
        if (approvedCount) approvedCount.textContent = "—";
        if (totalCount) totalCount.textContent = "—";
    }
}


// ===============================
// ADMIN MESSAGE
// ===============================

function showAdminMessage(message, type = "success") {

    const messageBox =
        document.getElementById("adminMessage") ||
        document.getElementById("adminResourceMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.style.display = "block";

    messageBox.className = "form-message";

    if (type === "error") {
        messageBox.classList.add("error");
    } else {
        messageBox.classList.add("success");
    }

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 4000);
}


// ===============================
// HTML ESCAPE
// ===============================

function escapeAdminHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// INITIALIZE ADMIN PAGE
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    const isAdminPage =
        window.location.pathname.includes("/admin/") ||
        window.location.pathname.includes("\\admin\\");

    if (!isAdminPage) {
        return;
    }

    const hasAccess = await checkAdminAccess();

    if (!hasAccess) {
        return;
    }

    await loadAdminStats();
    await loadPendingResources();
});