import PostDetail from '../Components/PostDetail';
import { useParams } from 'react-router';

const PostPage = () => {
    const { id } = useParams();
    return (
        <div className="w-full">
            <PostDetail postId={id} />
        </div>
    );
};

export default PostPage;
