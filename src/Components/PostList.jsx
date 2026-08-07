import React from 'react'
import { Link } from 'react-router'

const PostList = ({ post }) => {
    return (
        <Link to={`/post/${post.id}`} className="post-list">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 p-4">
                {/* there add user avatar */}
                <div className=" h-13  w-13  rounded-full p-2 mb-2">
                    {/* full  cover */}
                    <img src={post.avatar_url} alt="User Avatar" className='h-full rounded-full object-cover' />
                </div>
                <div className="">
                    <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg" />
                </div>
                <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                <p className="text-gray-600">{post.content}</p>
            </div>
        </Link>
    )
}

export default PostList