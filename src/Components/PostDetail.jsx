import React from 'react'
import { supabase } from '../supabase'
import { useQuery } from '@tanstack/react-query';

const fetchPostById = async (id) => {
    const { data, error } = await supabase.from("posts").select("*").eq("id", id)
    if (error) {
        throw new Error("fetchpostById Error::", error);

    }

    return data
}

const PostDetail = ({ postId }) => {
    const { data, error, isLoading } = useQuery({ queryKey: ["post", postId], queryFn: () => fetchPostById(postId) })
    console.log("data", data)
    if (isLoading) {
        return <div>Loading Posts...</div>
    };

    if (error) {
        return <div>Error:{error.message}</div>
    };

    return (
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {data && data.map((post) => (
                <div key={post.id}>

                    <h2 className="text-3xl mb-5 font-bold">{post.title}</h2>
                    <div className="w-full  rounded-lg shadow-md  p-4">
                        <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg" />
                    </div>
                    <div className="">
                        <p className="text-gray-600">{post.content}</p>
                        <span className="text-sm text-gray-500">Posted by  {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </article>
    )
}

export default PostDetail