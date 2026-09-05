/* =========================================
   ENGGITEA DASHBOARD
========================================= */


/* =========================================
   LOAD USER NAME
========================================= */

async function loadDashboardUser() {

    const userNameElement =
        document.getElementById("userName");

    if (!userNameElement) {
        return;
    }


    try {

        let user = null;

        const savedUser =
            localStorage.getItem("user");


        if (savedUser) {

            try {

                user = JSON.parse(savedUser);

            } catch (error) {

                localStorage.removeItem("user");

            }

        }


        if (!user) {

            user = await loadCurrentUser();

        }


        if (user) {

            const name =
                user.name ||
                user.full_name ||
                user.username ||
                "";


            if (name) {

                userNameElement.textContent =
                    `, ${name}`;

            }

        }

    } catch (error) {

        console.error(
            "Dashboard user loading failed:",
            error
        );

    }

}


/* =========================================
   DASHBOARD SEARCH
========================================= */

const dashboardSearchForm =
    document.getElementById(
        "dashboardSearchForm"
    );


if (dashboardSearchForm) {

    dashboardSearchForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const searchInput =
                document.getElementById(
                    "dashboardSearchInput"
                );


            const query =
                searchInput.value.trim();


            if (!query) {

                window.location.href =
                    "search.html";

                return;

            }


            window.location.href =
                `search.html?q=${encodeURIComponent(query)}`;

        }
    );

}


/* =========================================
   SEMESTER URL HANDLING
========================================= */

function handleSemesterSelection() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const semester =
        params.get("semester");


    if (!semester) {
        return;
    }


    const validSemesters =
        ["1", "2", "3", "4"];


    if (
        validSemesters.includes(semester)
    ) {

        const semesterCard =
            document.querySelector(
                `.dashboard-semester-card[href*="semester=${semester}"]`
            );


        if (semesterCard) {

            semesterCard.classList.add(
                "selected-semester"
            );

        }

    }

}


/* =========================================
   INITIALIZE DASHBOARD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboardUser();

        handleSemesterSelection();

    }
);