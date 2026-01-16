import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { supabase } from "../features/supabase";
import { Link, useNavigate, useParams } from "react-router-dom";
import createCSS from "../stylings/create.module.css";

export default function EditBlog() {
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);


    const [form, setForm] = React.useState({
        title: "",
        image_url: "",
        short_description: "",
        content: "",
    });

    React.useEffect(() => {
        if (!id) return;

        supabase
        .from("blog_content")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
            if (error) return alert(error.message);
            if (data)
            setForm({
                title: data.title,
                image_url: data.image_url || "",
                short_description: data.short_description,
                content: data.content,
            });
        });
    }, [id]);

    function handleChange (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !id) return;

        let imageUrl = form.image_url;

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

        const { error } = await supabase
            .from("blog_content")
            .update({
            title: form.title,
            image_url: imageUrl,
            short_description: form.short_description,
            content: form.content,
            updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            alert(error.message);
            return;
        }

        setSelectedFile(null);
        navigate("/");
    }


    return (
        <div className={createCSS.container}>
            <header className={createCSS.header}>
                <Link to="/">
                <i className="bi bi-arrow-left"></i>
                </Link>
                <h1>Edit Blog</h1>
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
                    Replace Image (optional)
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        }}
                    />
                </label>

                {selectedFile && (
                    <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                        New image selected
                    </p>
                )}


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

                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}
