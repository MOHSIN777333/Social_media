import React from 'react'
import PostDetail from '../Components/PostDetail'
import { useParams } from 'react-router'

const PostPage = () => {
    const { id } = useParams()
    return (
        <main className="h-full dark:text-white dark:bg-[#09090B]  bg-slate-500/10 text-white">
            <PostDetail postId={id} />
        </main>
    )
}

export default PostPage