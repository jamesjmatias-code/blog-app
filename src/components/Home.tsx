import React from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout, selectUser } from "../features/userSlice";
import { supabase } from "../features/supabase";
import homeCSS from "../stylings/home.module.css";
import { Link, useNavigate } from "react-router-dom";

interface Content {
    id: string;
    title: string;
    image_url: string;
    short_description: string;
    content: string;
    author_id: string;
    author_name: string;
    created_at: string;
    updated_at?: string | null;
}

export default function Home() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const [contents, setContents] = React.useState<Content[]>([]);
    const navigate = useNavigate();
    const pageLimit = 5;
    const [page, setPage] = React.useState(1);
    const [totalCount, setTotalCount] = React.useState(0);

    const FetchContent = async () => {
        const from = (page - 1) * pageLimit;
        const to = from + pageLimit - 1;

        const { error, data, count } = await supabase
            .from("blog_content")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error(error);
            return;
        }

        setContents(data as Content[]);
        setTotalCount(count || 0);
    };


    async function handleDelete(blogId: string) {
        const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from("blog_content")
            .delete()
            .eq("id", blogId);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Blog deleted successfully!");
        FetchContent();
        navigate("/");
    }

    React.useEffect(() => {
        FetchContent();
    }, [page]);


    async function logOut() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            dispatch(logout());
        }
    }

    return (
        <div className={homeCSS.container}>
            <header className={homeCSS.header}>
                <div>
                    <h1>Blog Dashboard</h1>
                    <p>Welcome, {user?.user_metadata?.name || user?.email}!</p>
                </div>

                <div className={homeCSS.headerBtn}>
                    <Link to="/create" >
                        <button className={homeCSS.newBlogBtn}>+ New Blog</button>
                    </Link>
                    <button className={homeCSS.logoutBtn} onClick={logOut}>
                        Logout
                    </button>
                </div>
            </header>

            <div className={homeCSS.content_class}>
                <header>Recent Blogs</header>

                <div className={homeCSS.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>

                    <span>
                        Page {page} of {Math.ceil(totalCount / pageLimit)}
                    </span>

                    <button
                        disabled={page >= Math.ceil(totalCount / pageLimit)}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>

                {contents.map((blog) => (
                    <div key={blog.id} className={homeCSS.card}>
                        <div
                            className={`${homeCSS.cardTop} ${
                                blog.author_id !== user?.id ? homeCSS.noActions : ""
                            }`}
                        >

                            <Link to={`/post/${blog.id}`} className={homeCSS.postLink}>
                                <h2 className={`${homeCSS.title} ${homeCSS.clampTitle}`}>
                                    {blog.title}
                                </h2>
                            </Link>

                            {blog.author_id === user?.id && (
                                <div className={homeCSS.headerActions}>
                                    <Link to={`/edit/${blog.id}`} >
                                        <i className="bi bi-pencil-square" />
                                    </Link>
                                    <i className="bi bi-trash" onClick={() => handleDelete(blog.id)}/>
                                </div>
                            )}
                        </div>

                        <div className={homeCSS.cardBody}>
                            <div className={homeCSS.cardText}>
                                <p className={homeCSS.userData}>
                                    By {blog.author_name} • {" "}
                                    {blog.updated_at
                                    ? `Updated ${new Date(blog.updated_at).toLocaleString()}`
                                    : `Published ${new Date(blog.created_at).toLocaleString()}`}
                                </p>

                                <p className={`${homeCSS.shortDescription} ${homeCSS.clampShort}`}>
                                    {blog.short_description}
                                </p>
                                <p className={`${homeCSS.content} ${homeCSS.clampContent}`}>
                                    {blog.content}
                                </p>
                            </div>

                            {blog.image_url && (
                                <div className={homeCSS.imageWrapper}>
                                    <img className={homeCSS.cardImage} src={blog.image_url} alt={blog.title} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div className={homeCSS.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>

                    <span>
                        Page {page} of {Math.ceil(totalCount / pageLimit)}
                    </span>

                    <button
                        disabled={page >= Math.ceil(totalCount / pageLimit)}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
