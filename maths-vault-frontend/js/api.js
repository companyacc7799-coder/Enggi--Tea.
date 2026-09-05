/* =========================================
   ENGGITEA - SUPABASE API
========================================= */

async function registerUser(name, email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            }
        }
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}


async function loginUser(email, password) {
    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}


async function getCurrentUser() {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        throw new Error(error.message);
    }

    return user;
}


async function logoutUser() {
    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}


async function getResources() {
    const { data, error } =
        await supabaseClient
            .from("resources")
            .select("*")
            .eq("status", "approved")
            .order("created_at", {
                ascending: false
            });

    if (error) {
        throw new Error(error.message);
    }

    return {
        success: true,
        data
    };
}


async function searchResources(query) {
    const search = query.trim();

    if (!search) {
        return getResources();
    }

    const { data, error } =
        await supabaseClient
            .from("resources")
            .select("*")
            .eq("status", "approved")
            .or(
                `title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%,unit.ilike.%${search}%,topic.ilike.%${search}%`
            )
            .order("created_at", {
                ascending: false
            });

    if (error) {
        throw new Error(error.message);
    }

    return {
        success: true,
        data
    };
}


async function getResourceById(id) {
    const { data, error } =
        await supabaseClient
            .from("resources")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {
        throw new Error(
            error.code === "PGRST116"
                ? "Resource not found."
                : error.message
        );
    }

    return {
        success: true,
        data
    };
}


async function getMyResources() {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        throw new Error("Please login first.");
    }

    const { data, error } =
        await supabaseClient
            .from("resources")
            .select("*")
            .eq("uploaded_by", user.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {
        throw new Error(error.message);
    }

    return {
        success: true,
        data
    };
}


async function createResource(resourceData) {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        throw new Error("Please login first.");
    }

    const { data, error } =
        await supabaseClient
            .from("resources")
            .insert({
                ...resourceData,
                uploaded_by: user.id,
                status: "pending"
            })
            .select()
            .single();

    if (error) {
        throw new Error(error.message);
    }

    return {
        success: true,
        data
    };
}


async function deleteResource(id) {
    const { error } =
        await supabaseClient
            .from("resources")
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        success: true
    };
}