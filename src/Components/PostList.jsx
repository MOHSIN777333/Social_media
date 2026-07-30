import React from 'react'

const PostList = ({ post }) => {
    return (
        <article>
            <img src={post.image} alt="" />
        </article>
    )
}

export default PostList