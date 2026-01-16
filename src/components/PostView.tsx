import React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../features/supabase";
import postCSS from "../stylings/postView.module.css";

interface Post {
    id: string;
    title: string;
    image_url: string | null;
    short_description: string;
    content: string;
    author_name: string;
    created_at: string;
    updated_at?: string | null;
}

export default function PostView() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = React.useState<Post | null>(null);

    React.useEffect(() => {
        if (!id) return;

        supabase
        .from("blog_content")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
            if (error) {
            alert(error.message);
            return;
            }
            setPost(data as Post);
        });
    }, [id]);

    if (!post) return null;

    return (
    <div className={postCSS.page}>
        <div className={postCSS.card}>
            <Link to="/" className={postCSS.back}>
                ← Back
            </Link>

            <div className={postCSS.cardTop}>
                <h1 className={postCSS.title}>{post.title}</h1>
            </div>

            <p className={postCSS.userData}>
                By {post.author_name} •{" "}
                {post.updated_at
                ? `Updated ${new Date(post.updated_at).toLocaleString()}`
                : `Published ${new Date(post.created_at).toLocaleString()}`}
            </p>

            {post.image_url && (
                <div className={postCSS.imageWrapper}>
                <img
                    className={postCSS.cardImage}
                    src={post.image_url}
                    alt={post.title}
                />
                </div>
            )}

            {post.short_description && (
                <p className={postCSS.shortDescription}>
                {post.short_description}
                </p>
            )}

            <div className={postCSS.content}>{post.content}</div>
        </div>
    </div>
);
}
