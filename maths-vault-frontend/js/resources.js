/* =========================================
   ENGGITEA RESOURCES
========================================= */


/* =========================================
   RESOURCE TYPE DETAILS
========================================= */

function getResourceTypeInfo(type) {

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

        "question-paper": {
            label: "Question Paper",
            icon: "?"
        }

    };

    return types[type] || {
        label: "Resource",
        icon: "•"
    };

}


/* =========================================
   GET RESOURCE ARRAY
========================================= */

function extractResources(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.resources)) {
        return data.resources;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];

}


/* =========================================
   RESOURCE CARD
========================================= */

function createResourceCard(resource) {

    const card =
        document.createElement("article");

    card.className =
        "resource-result-card";


    const typeInfo =
        getResourceTypeInfo(
            resource.type ||
            resource.resource_type
        );


    const id =
        resource.id ||
        resource._id;


    const title =
        resource.title ||
        resource.name ||
        "Untitled Resource";


    const description =
        resource.description ||
        "No description available.";


    const semester =
        resource.semester ||
        "-";


    const subject =
        resource.subject ||
        "-";


    const unit =
        resource.unit ||
        "-";


    card.innerHTML = `

        <div class="resource-card-top">

            <span class="resource-type">
                ${typeInfo.label}
            </span>

            <span class="resource-semester">
                Semester ${semester}
            </span>

        </div>


        <div class="resource-result-icon">
            ${typeInfo.icon}
        </div>


        <h3>
            ${escapeHtml(title)}
        </h3>


        <p>
            ${escapeHtml(description)}
        </p>


        <div class="resource-card-footer">

            <span>
                ${escapeHtml(subject)}
                · Unit ${escapeHtml(String(unit))}
            </span>

            <a
                href="resource.html?id=${encodeURIComponent(id)}">
                View →
            </a>

        </div>

    `;


    return card;

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   SEARCH PAGE
========================================= */

const resourceSearchForm =
    document.getElementById(
        "resourceSearchForm"
    );





async function initializeSearchPage() {

    const input =
        document.getElementById(
            "resourceSearchInput"
        );


    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("q") || "";


    const type =
        params.get("type") || "all";


    if (input) {

        input.value = query;

    }


    setActiveResourceFilter(type);


    await loadSearchResources(
        query,
        type
    );

}


/* =========================================
   SEARCH FORM SUBMIT
========================================= */

if (resourceSearchForm) {

    resourceSearchForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const input =
                document.getElementById(
                    "resourceSearchInput"
                );


            const query =
                input.value.trim();


            const activeFilter =
                document.querySelector(
                    ".filter-btn.active-filter"
                );


            const type =
                activeFilter?.dataset.type ||
                "all";


            const url =
                new URL(
                    window.location.href
                );


            if (query) {

                url.searchParams.set(
                    "q",
                    query
                );

            } else {

                url.searchParams.delete("q");

            }


            if (type !== "all") {

                url.searchParams.set(
                    "type",
                    type
                );

            } else {

                url.searchParams.delete("type");

            }


            window.history.replaceState(
                {},
                "",
                url
            );


            await loadSearchResources(
                query,
                type
            );

        }
    );

}


/* =========================================
   RESOURCE FILTERS
========================================= */

const resourceFilterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


resourceFilterButtons.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            const type =
                button.dataset.type ||
                "all";


            const input =
                document.getElementById(
                    "resourceSearchInput"
                );


            const query =
                input?.value.trim() || "";


            setActiveResourceFilter(type);


            const url =
                new URL(
                    window.location.href
                );


            if (query) {

                url.searchParams.set(
                    "q",
                    query
                );

            } else {

                url.searchParams.delete("q");

            }


            if (type !== "all") {

                url.searchParams.set(
                    "type",
                    type
                );

            } else {

                url.searchParams.delete("type");

            }


            window.history.replaceState(
                {},
                "",
                url
            );


            await loadSearchResources(
                query,
                type
            );

        }
    );

});
document.addEventListener("DOMContentLoaded", () => {
    if (resourceSearchForm) {
        initializeSearchPage();
    }
});


/* =========================================
   ACTIVE FILTER
========================================= */

function setActiveResourceFilter(type) {

    resourceFilterButtons.forEach(button => {

        button.classList.toggle(
            "active-filter",
            button.dataset.type === type
        );

    });

}


/* =========================================
   LOAD SEARCH RESOURCES
========================================= */

async function loadSearchResources(
    query = "",
    type = "all"
) {

    const loading =
        document.getElementById(
            "resourceLoading"
        );

    const empty =
        document.getElementById(
            "resourceEmpty"
        );

    const error =
        document.getElementById(
            "resourceError"
        );

    const results =
        document.getElementById(
            "resourceResults"
        );

    const count =
        document.getElementById(
            "resultsCount"
        );


    if (!results) {
        return;
    }


    loading.hidden = false;
    empty.hidden = true;
    error.hidden = true;
    results.innerHTML = "";


    try {

        let data;


        if (query) {

            data =
                await searchResources(query);

        } else {

            data =
                await getResources();

        }


        let resources =
            extractResources(data);


        /*
         * Backend search may return all types.
         * Apply selected type on frontend.
         */

        if (type !== "all") {

            resources =
                resources.filter(resource => {

                    const resourceType =
                        resource.type ||
                        resource.resource_type;

                    return resourceType === type;

                });

        }


        loading.hidden = true;


        if (count) {

            count.textContent =
                `${resources.length} resource${resources.length === 1 ? "" : "s"}`;

        }


        if (!resources.length) {

            empty.hidden = false;

            return;

        }


        resources.forEach(resource => {

            results.appendChild(
                createResourceCard(resource)
            );

        });


    } catch (errorObject) {

        console.error(
            "Resource loading failed:",
            errorObject
        );


        loading.hidden = true;
        error.hidden = false;

    }

}


/* =========================================
   RETRY SEARCH
========================================= */

const retryResourcesButton =
    document.getElementById(
        "retryResourcesBtn"
    );


if (retryResourcesButton) {

    retryResourcesButton.addEventListener(
        "click",
        async () => {

            const input =
                document.getElementById(
                    "resourceSearchInput"
                );


            const query =
                input?.value.trim() || "";


            const activeFilter =
                document.querySelector(
                    ".filter-btn.active-filter"
                );


            const type =
                activeFilter?.dataset.type ||
                "all";


            await loadSearchResources(
                query,
                type
            );

        }
    );

}


/* =========================================
   RESOURCE DETAILS PAGE
========================================= */

const resourceDetailCard =
    document.getElementById(
        "resourceDetailCard"
    );


if (resourceDetailCard) {

    initializeResourceDetails();

}


async function initializeResourceDetails() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const resourceId =
        params.get("id");


    const loading =
        document.getElementById(
            "resourceDetailLoading"
        );

    const error =
        document.getElementById(
            "resourceDetailError"
        );


    if (!resourceId) {

        loading.hidden = true;
        error.hidden = false;

        return;

    }


    try {

        const data =
            await getResourceById(
                resourceId
            );


        const resource =
            data?.resource ||
            data?.data ||
            data;


        if (!resource) {
            throw new Error(
                "Resource not found."
            );
        }


        populateResourceDetails(
            resource
        );


        loading.hidden = true;
        error.hidden = true;
        resourceDetailCard.hidden = false;


    } catch (errorObject) {

        console.error(
            "Resource details loading failed:",
            errorObject
        );


        loading.hidden = true;
        error.hidden = false;

    }

}


/* =========================================
   POPULATE RESOURCE DETAILS
========================================= */

function populateResourceDetails(resource) {

    const type =
        resource.type ||
        resource.resource_type ||
        "resource";


    const typeInfo =
        getResourceTypeInfo(type);


    const title =
        resource.title ||
        resource.name ||
        "Untitled Resource";


    const description =
        resource.description ||
        "No description available.";


    const semester =
        resource.semester ||
        "-";


    const subject =
        resource.subject ||
        "-";


    const unit =
        resource.unit ||
        "-";


    const uploader =
        resource.uploader_name ||
        resource.uploader?.name ||
        resource.user?.name ||
        resource.uploaded_by ||
        "Student";


    const resourceUrl =
        resource.youtube_url ||
        resource.file_url ||
        resource.resource_url ||
        resource.url ||
        "#";
        
        


    const createdAt =
        resource.created_at ||
        resource.createdAt ||
        "";


    const typeElement =
        document.getElementById(
            "resourceType"
        );


    const semesterElement =
        document.getElementById(
            "resourceSemester"
        );


    const iconElement =
        document.getElementById(
            "resourceIcon"
        );


    const titleElement =
        document.getElementById(
            "resourceTitle"
        );


    const descriptionElement =
        document.getElementById(
            "resourceDescription"
        );


    const subjectElement =
        document.getElementById(
            "resourceSubject"
        );


    const unitElement =
        document.getElementById(
            "resourceUnit"
        );


    const uploaderElement =
        document.getElementById(
            "resourceUploader"
        );


    const openButton =
        document.getElementById(
            "resourceOpenBtn"
        );


    const dateElement =
        document.getElementById(
            "resourceDate"
        );


    if (typeElement) {
        typeElement.textContent =
            typeInfo.label;
    }


    if (semesterElement) {
        semesterElement.textContent =
            `Semester ${semester}`;
    }


    if (iconElement) {
        iconElement.textContent =
            typeInfo.icon;
    }


    if (titleElement) {
        titleElement.textContent =
            title;
    }


    if (descriptionElement) {
        descriptionElement.textContent =
            description;
    }


    if (subjectElement) {
        subjectElement.textContent =
            subject;
    }


    if (unitElement) {
        unitElement.textContent =
            `Unit ${unit}`;
    }


    if (uploaderElement) {
        uploaderElement.textContent =
            uploader;
    }


    if (openButton) {

        openButton.href =
            resourceUrl;

        openButton.target =
            "_blank";

        openButton.rel =
            "noopener noreferrer";

    }


    if (dateElement) {

        dateElement.textContent =
            formatResourceDate(createdAt);

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function formatResourceDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   MY RESOURCES PAGE
========================================= */

const myResourcesResults =
    document.getElementById(
        "myResourcesResults"
    );


if (myResourcesResults) {

    initializeMyResources();

}


async function initializeMyResources() {

    const loading =
        document.getElementById(
            "myResourcesLoading"
        );

    const empty =
        document.getElementById(
            "myResourcesEmpty"
        );

    const error =
        document.getElementById(
            "myResourcesError"
        );

    const section =
        document.getElementById(
            "myResourcesSection"
        );


    try {

        const data =
            await getMyResources();


        const resources =
            extractResources(data);


        loading.hidden = true;


        if (!resources.length) {

            empty.hidden = false;
            section.hidden = true;

            updateMyResourcesCount(0);

            return;

        }


        empty.hidden = true;
        error.hidden = true;
        section.hidden = false;


        renderMyResources(
            resources
        );


        updateMyResourcesCount(
            resources.length
        );


    } catch (errorObject) {

        console.error(
            "My resources loading failed:",
            errorObject
        );


        loading.hidden = true;
        error.hidden = false;
        section.hidden = true;

    }

}


/* =========================================
   RENDER MY RESOURCES
========================================= */

function renderMyResources(resources) {

    myResourcesResults.innerHTML = "";


    resources.forEach(resource => {

        const card =
            createResourceCard(resource);


        const id =
            resource.id ||
            resource._id;


        const deleteButton =
            document.createElement("button");


        deleteButton.type =
            "button";

        deleteButton.className =
            "delete-my-resource-btn";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            () => deleteMyResource(
                id,
                card
            )
        );


        card.appendChild(
            deleteButton
        );


        myResourcesResults.appendChild(
            card
        );

    });

}


/* =========================================
   UPDATE MY RESOURCE COUNT
========================================= */

function updateMyResourcesCount(count) {

    const element =
        document.getElementById(
            "myResourcesCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${count} resource${count === 1 ? "" : "s"}`;

}


/* =========================================
   DELETE MY RESOURCE
========================================= */

async function deleteMyResource(
    id,
    card
) {

    if (!id) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this resource?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteResource(id);


        card.remove();


        const remainingCards =
            document.querySelectorAll(
                "#myResourcesResults .resource-result-card"
            );


        updateMyResourcesCount(
            remainingCards.length
        );


        if (!remainingCards.length) {

            document.getElementById(
                "myResourcesSection"
            ).hidden = true;


            document.getElementById(
                "myResourcesEmpty"
            ).hidden = false;

        }


    } catch (errorObject) {

        alert(
            errorObject.message ||
            "Unable to delete resource."
        );

    }

}


/* =========================================
   RETRY MY RESOURCES
========================================= */

const retryMyResourcesButton =
    document.getElementById(
        "retryMyResourcesBtn"
    );


if (retryMyResourcesButton) {

    retryMyResourcesButton.addEventListener(
        "click",
        async () => {

            const loading =
                document.getElementById(
                    "myResourcesLoading"
                );

            const error =
                document.getElementById(
                    "myResourcesError"
                );


            error.hidden = true;
            loading.hidden = false;


            await initializeMyResources();

        }
    );

}


/* =========================================
   UPLOAD RESOURCE
========================================= */

const uploadForm =
    document.getElementById(
        "uploadForm"
    );


if (uploadForm) {

    uploadForm.addEventListener(
        "submit",
        handleResourceUpload
    );

}


async function handleResourceUpload(event) {

    event.preventDefault();


    const title =
        document.getElementById(
            "resourceTitleInput"
        ).value.trim();


    const type =
        document.getElementById(
            "resourceTypeInput"
        ).value;


    const semester =
        document.getElementById(
            "semesterInput"
        ).value;


    const subject =
        document.getElementById(
            "subjectInput"
        ).value.trim();


    const unit =
        document.getElementById(
            "unitInput"
        ).value;


    const description =
        document.getElementById(
            "descriptionInput"
        ).value.trim();


    const resourceUrl =
        document.getElementById(
            "resourceUrlInput"
        ).value.trim();


    const message =
        document.getElementById(
            "uploadMessage"
        );


    const submitButton =
        document.getElementById(
            "uploadSubmitBtn"
        );


    message.textContent = "";
    message.className = "form-message";


    if (
        !title ||
        !type ||
        !semester ||
        !subject ||
        !unit ||
        !description ||
        !resourceUrl
    ) {

        message.textContent =
            "Please fill in all fields.";

        message.classList.add(
            "error-message"
        );

        return;

    }


    submitButton.disabled = true;
    submitButton.textContent =
        "Uploading...";


    try {

        const resourceData = {

            title,

            type,

            semester: Number(semester),

            subject,

            unit: Number(unit),

            description

        };


        /*
         * Backend expects:
         * youtube_url for videos/playlists
         * file_url for PDFs
         */

        if (
            type === "video" ||
            type === "playlist"
        ) {

            resourceData.youtube_url =
                resourceUrl;

        } else {

            resourceData.file_url =
                resourceUrl;

        }


        await createResource(
            resourceData
        );


        message.textContent =
            "Resource uploaded successfully!";

        message.classList.add(
            "success-message"
        );


        uploadForm.reset();


        setTimeout(() => {

            window.location.href =
                "my-resources.html";

        }, 1000);


    } catch (errorObject) {

        console.error(
            "Resource upload failed:",
            errorObject
        );


        message.textContent =
            errorObject.message ||
            "Unable to upload resource.";

        message.classList.add(
            "error-message"
        );


    } finally {

        submitButton.disabled = false;
        submitButton.textContent =
            "Upload Resource";

    }

}