import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { supabase } from '../supabase'
import PostList from './PostList'

const fetchPost = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) throw new Error("error in fetchPost", error);
    return data

};
const PostItem = () => {

    const { data, error, isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPost });



    if (isLoading) {
        return <div>Loading Posts...</div>
    };

    if (error) {
        return <div>Error:{error.message}</div>
    };

    return (
        // responsive grid layout for posts
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold tracking-tight dark:text-white">Recent Posts</h2>
            <article className="mt-6 space-y-4">
                {data && data.map((post) => (
                    <PostList post={post} key={post.id} />
                ))}
            </article>
        </section>
    )
}

export default PostItem