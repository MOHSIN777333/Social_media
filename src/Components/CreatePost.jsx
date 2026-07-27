import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { supabase } from '../supabase';



const createPost = async ({ title, content, image }) => {
    try {
        // Validate inputs
        if (!title || !content || !image) {
            throw new Error('Title, content, and image are required');
        }

        // Upload the image to Supabase Storage
        const filePath = `${title}-${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, image);

        // Check for upload errors
        if (uploadError) {
            throw new Error(`Error uploading image: ${uploadError.message}`);
        }

        // Get the public URL of the uploaded image
        const { data: getPublicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);


        // Insert the post data into the 'posts' table
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .insert([{ title, content, image: getPublicUrlData.publicUrl }])
            .select();

        // Check for insertion errors
        if (postError) {
            throw new Error(`Error creating post: ${postError.message}`);
        }

        return postData[0]; // Return the created post
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);

    const { mutate: createPostMutation, isPending, error } = useMutation({
        mutationFn: createPost,
    })
    const handleSubmit = (e) => {
        e.preventDefault();
        createPostMutation({ title, content, image });
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col  max-w-2xl mx-auto p-6  bg-gray-800 rounded shadow-md '>
            <div className="text-red-500 mb-4">
                {error && <p>{error.message}</p>}
            </div>
            <div className='mb-4'>
                <label htmlFor='title' className='block text-white font-bold mb-2'>
                    Title
                </label>
                <input
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    type='text'
                    id='title'
                    className='bg-gray-700 text-white placeholder:text-gray-500 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter post title'
                />
            </div>
            <div className='mb-4'>
                <label htmlFor='content' className='block text-white font-bold mb-2'>
                    Content
                </label>
                <textarea
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                    id='content'
                    rows={5}
                    className='bg-gray-700 text-white placeholder:text-gray-500 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter post content'
                ></textarea>
            </div>

            <div className="mb-4">
                <label htmlFor='image' className='block text-white font-bold mb-2'>

                    Image
                </label>
                <input
                    onChange={(e) => setImage(e.target.files[0])}
                    accept='image/*'
                    required
                    type='file'
                    id='image'
                    className='bg-gray-700 text-white placeholder:text-gray-500 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>
            <button
                type='submit'
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
                {isPending ? 'Creating...' : 'Create Post'}
            </button>
        </form>
    )
}

export default CreatePost
