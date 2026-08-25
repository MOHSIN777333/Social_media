import React from 'react'
import { Link } from 'react-router'

const PostList = ({ post }) => {
    return (
        <article className="max-w-sm bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 p-4">
            <Link to={`/post/${post.id}`} className="">
                <div className="h-13  w-13  rounded-full p-2 mb-2">
                    <img src={post.avatar_url} alt="User Avatar" height={`300`} width={`300`} className='h-full rounded-full object-cover' />
                </div>
                <div className="h-64 w-full mb-2 overflow-hidden rounded-lg ">
                    <img src={post.image} alt={post.title} className="max-w-full h-auto " />
                </div>
                <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                <p className="text-gray-600">{post.content}</p>
            </Link>
        </article>
    )
}

export default PostList