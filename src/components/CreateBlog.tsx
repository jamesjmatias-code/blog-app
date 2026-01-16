import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { supabase } from "../features/supabase";
import { Link, useNavigate } from "react-router-dom";
import createCSS from "../stylings/create.module.css"

export default function CreateBlog() {
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);


    const [form, setForm] = React.useState({
        title: "",
        image_url: "",
        short_description: "",
        content: "",
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm,[name]: value, }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        let imageUrl = "";

        if (selectedFile) {
            const fileExt = selectedFile.name.split(".").pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
            .from("blog-images")
            .upload(filePath, selectedFile);

            if (uploadError) {
                alert(uploadError.message);
                return;
            }

            const { data } = supabase.storage
            .from("blog-images")
            .getPublicUrl(filePath);

            imageUrl = data.publicUrl;
        }

        const { error } = await supabase.from("blog_content").insert([
            {
            title: form.title,
            image_url: imageUrl,
            short_description: form.short_description,
            content: form.content,
            author_id: user.id,
            author_name: user.user_metadata?.name || user.email,
            },
        ]);

        if (error) {
            alert(error.message);
            return;
        }

        setForm({
            title: "",
            image_url: "",
            short_description: "",
            content: "",
        });

        setSelectedFile(null);
        navigate("/");
    }

    return (
        <div className={createCSS.container}>
            <header className={createCSS.header}>
                <Link to="/" >
                    <i className="bi bi-arrow-left"></i>
                </Link>
                <h1>Create Blog</h1>
            </header>

            <form className={createCSS.contentInput} onSubmit={handleSubmit}>
                <label>
                    Title
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Image
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setSelectedFile(file);
                        }}
                    />
                </label>

                <label>
                    Short Description
                    <textarea
                        name="short_description"
                        value={form.short_description}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                </label>

                <label>
                    Content
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={6}
                        required
                    />
                </label>

                <button type="submit">Publish Blog</button>
            </form>
        </div>
    );
}
