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


    console.log(data);

    if (isLoading) {
        return <div>Loading Posts...</div>
    };

    if (error) {
        return <div>Error:{error.message}</div>
    };

    return (
        <section>
            <h3>Recent Posts</h3>
            <div className="">
                {data && data.map((post) => (
                    <PostList post={post} key={post.id} />
                ))}
            </div>
        </section>
    )
}

export default PostItem